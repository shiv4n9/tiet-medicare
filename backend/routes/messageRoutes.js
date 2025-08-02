import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/Audit.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @desc    Get or create conversation
// @route   GET /api/messages/conversations/:userId
// @access  Private
router.get('/conversations/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // For doctor-patient communication
  if (req.user.role === 'doctor' && user.role === 'patient') {
    const conversation = await Conversation.findOne({
      isDirectMessage: true,
      $and: [
        { 'participants.userId': req.user._id },
        { 'participants.userId': userId }
      ],
      'participants.2': { $exists: false } // Only 2 participants
    });
    
    if (conversation) {
      return res.json({
        success: true,
        data: await populateConversation(conversation, req.user._id)
      });
    }
    
    // Create new conversation
    const newConversation = new Conversation({
      isDirectMessage: true,
      type: 'direct',
      participants: [
        { userId: req.user._id, role: 'member' },
        { userId, role: 'member' }
      ],
      createdBy: req.user._id,
      doctorId: req.user.role === 'doctor' ? req.user._id : userId,
      patientId: user.role === 'patient' ? user._id : req.user._id,
      settings: {
        isArchived: false,
        isMuted: false,
        notificationSound: 'default'
      },
      metadata: {
        createdBy: req.user._id,
        updatedBy: req.user._id,
        messageCount: 0,
        participantCount: 2
      }
    });
    
    await newConversation.save();
    
    // Log the conversation creation
    await AuditLog.log({
      action: 'create_conversation',
      entity: 'Conversation',
      entityId: newConversation._id,
      userId: req.user._id,
      userRole: req.user.role,
      details: {
        type: 'direct',
        withUser: userId,
        userRole: user.role
      },
      source: 'web'
    });
    
    return res.status(201).json({
      success: true,
      data: await populateConversation(newConversation, req.user._id)
    });
  }
  
  res.status(403);
  throw new Error('Not authorized to start a conversation with this user');
}));

// @desc    Get conversation by ID
// @route   GET /api/messages/conversations/id/:conversationId
// @access  Private
router.get('/conversations/id/:conversationId', asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.conversationId,
    'participants.userId': req.user._id,
    'participants.leftAt': { $exists: false }
  });
  
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }
  
  res.json({
    success: true,
    data: await populateConversation(conversation, req.user._id)
  });
}));

// @desc    Get user's conversations
// @route   GET /api/messages/conversations
// @access  Private
router.get('/conversations', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, isArchived } = req.query;
  
  const query = {
    'participants.userId': req.user._id,
    'participants.leftAt': { $exists: false }
  };
  
  // Apply filters
  if (isArchived !== undefined) {
    query['settings.isArchived'] = isArchived === 'true';
  }
  
  // Apply search
  if (search) {
    query.$text = { $search: search };
  }
  
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { 'lastMessageAt': -1 },
    populate: [
      { 
        path: 'participants.userId', 
        select: 'name email avatar role',
        match: { _id: { $ne: req.user._id } }
      },
      { path: 'lastMessage' },
      { path: 'doctorId', select: 'name email avatar' },
      { path: 'patientId', select: 'name email avatar' }
    ]
  };
  
  const conversations = await Conversation.paginate(query, options);
  
  // Add unread count to each conversation
  const conversationsWithUnread = {
    ...conversations,
    docs: await Promise.all(conversations.docs.map(async conv => {
      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        recipient: req.user._id,
        status: { $ne: 'read' },
        'metadata.isDeleted': { $ne: true }
      });
      
      return {
        ...conv.toObject(),
        unreadCount
      };
    }))
  };
  
  res.json({
    success: true,
    data: conversationsWithUnread
  });
}));

// @desc    Get messages in a conversation
// @route   GET /api/messages/conversations/:conversationId/messages
// @access  Private
router.get('/conversations/:conversationId/messages', asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, before } = req.query;
  
  // Check if user is a participant in the conversation
  const conversation = await Conversation.findOne({
    _id: req.params.conversationId,
    'participants.userId': req.user._id,
    'participants.leftAt': { $exists: false }
  });
  
  if (!conversation) {
    res.status(404);
    throw new Error('Conversation not found');
  }
  
  const query = {
    conversationId: conversation._id,
    'metadata.isDeleted': { $ne: true }
  };
  
  // Pagination
  if (before) {
    query._id = { $lt: before };
  }
  
  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10))
    .populate('sender', 'name email avatar role')
    .populate('recipient', 'name email avatar role')
    .populate('metadata.originalMessageId', 'content sender')
    .populate('metadata.replyToMessageId', 'content sender');
  
  // Mark messages as read
  const unreadMessages = messages.filter(
    msg => msg.recipient._id.toString() === req.user._id.toString() && 
           msg.status !== 'read'
  );
  
  if (unreadMessages.length > 0) {
    await Message.updateMany(
      { _id: { $in: unreadMessages.map(m => m._id) } },
      { 
        $set: { status: 'read', readAt: new Date() },
        $addToSet: { 
          readBy: { 
            userId: req.user._id, 
            readAt: new Date() 
          } 
        }
      }
    );
    
    // Update unread counts in conversation
    await Conversation.updateOne(
      { _id: conversation._id, 'unreadCounts.userId': req.user._id },
      { $set: { 'unreadCounts.$.count': 0 } }
    );
  }
  
  res.json({
    success: true,
    data: messages.reverse() // Return in chronological order
  });
}));

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
router.post('/', asyncHandler(async (req, res) => {
  const { 
    conversationId, 
    recipientId, 
    content, 
    messageType = 'text',
    attachments = [],
    metadata = {}
  } = req.body;
  
  if ((!conversationId && !recipientId) || !content) {
    res.status(400);
    throw new Error('Please provide conversationId or recipientId and content');
  }
  
  let conversation;
  
  if (conversationId) {
    // Existing conversation
    conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.userId': req.user._id,
      'participants.leftAt': { $exists: false }
    });
    
    if (!conversation) {
      res.status(404);
      throw new Error('Conversation not found');
    }
  } else {
    // New conversation with recipient
    const recipient = await User.findById(recipientId);
    
    if (!recipient) {
      res.status(404);
      throw new Error('Recipient not found');
    }
    
    // For doctor-patient communication
    if (!((req.user.role === 'doctor' && recipient.role === 'patient') || 
          (req.user.role === 'patient' && recipient.role === 'doctor'))) {
      res.status(403);
      throw new Error('You can only message doctors or patients');
    }
    
    // Check if conversation already exists
    conversation = await Conversation.findOne({
      isDirectMessage: true,
      $and: [
        { 'participants.userId': req.user._id },
        { 'participants.userId': recipientId }
      ],
      'participants.2': { $exists: false } // Only 2 participants
    });
    
    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        isDirectMessage: true,
        type: 'direct',
        participants: [
          { userId: req.user._id, role: 'member' },
          { userId: recipientId, role: 'member' }
        ],
        createdBy: req.user._id,
        doctorId: req.user.role === 'doctor' ? req.user._id : recipientId,
        patientId: recipient.role === 'patient' ? recipient._id : req.user._id,
        settings: {
          isArchived: false,
          isMuted: false,
          notificationSound: 'default'
        },
        metadata: {
          createdBy: req.user._id,
          updatedBy: req.user._id,
          messageCount: 0,
          participantCount: 2
        }
      });
      
      await conversation.save();
      
      // Log the conversation creation
      await AuditLog.log({
        action: 'create_conversation',
        entity: 'Conversation',
        entityId: conversation._id,
        userId: req.user._id,
        userRole: req.user.role,
        details: {
          type: 'direct',
          withUser: recipientId,
          userRole: recipient.role
        },
        source: 'web'
      });
    }
  }
  
  // Create message
  const message = new Message({
    conversationId: conversation._id,
    sender: req.user._id,
    recipient: conversation.participants.find(
      p => p.userId.toString() !== req.user._id.toString()
    )?.userId,
    content,
    messageType,
    attachments,
    status: 'sent',
    metadata: {
      ...metadata,
      isDeleted: false
    }
  });
  
  await message.save();
  
  // Update conversation with last message
  conversation.lastMessage = message._id;
  conversation.lastMessageAt = new Date();
  conversation.lastMessagePreview = content.substring(0, 100);
  conversation.metadata.updatedAt = new Date();
  conversation.metadata.updatedBy = req.user._id;
  conversation.metadata.messageCount += 1;
  
  // Increment unread count for other participants
  conversation.participants.forEach(participant => {
    if (participant.userId.toString() !== req.user._id.toString()) {
      const unreadIndex = conversation.unreadCounts.findIndex(
        uc => uc.userId.toString() === participant.userId.toString()
      );
      
      if (unreadIndex >= 0) {
        conversation.unreadCounts[unreadIndex].count += 1;
      } else {
        conversation.unreadCounts.push({
          userId: participant.userId,
          count: 1
        });
      }
      
      // Send notification
      Notification.create({
        recipient: participant.userId,
        sender: req.user._id,
        type: 'new_message',
        title: 'New Message',
        message: `You have a new message from ${req.user.name}`,
        metadata: {
          conversationId: conversation._id,
          messageId: message._id
        },
        priority: 'high'
      });
    }
  });
  
  await conversation.save();
  
  // Populate message with sender info
  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name email avatar role')
    .populate('recipient', 'name email avatar role');
  
  // Log the message
  await AuditLog.log({
    action: 'send_message',
    entity: 'Message',
    entityId: message._id,
    userId: req.user._id,
    userRole: req.user.role,
    details: {
      conversationId: conversation._id,
      recipientId: message.recipient,
      messageType,
      hasAttachments: attachments.length > 0
    },
    source: 'web'
  });
  
  res.status(201).json({
    success: true,
    data: {
      message: populatedMessage,
      conversation: await populateConversation(conversation, req.user._id)
    }
  });
}));

// @desc    Update message status
// @route   PUT /api/messages/:messageId/status
// @access  Private
router.put('/:messageId/status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }
  
  const message = await Message.findOne({
    _id: req.params.messageId,
    $or: [
      { sender: req.user._id },
      { recipient: req.user._id }
    ]
  });
  
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }
  
  // Only allow certain status updates
  if (status === 'read' && message.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the recipient can mark a message as read');
  }
  
  // Update status
  message.status = status;
  
  if (status === 'read' && !message.readAt) {
    message.readAt = new Date();
    
    // Add to readBy if not already present
    const hasRead = message.readBy.some(entry => 
      entry.userId.toString() === req.user._id.toString()
    );
    
    if (!hasRead) {
      message.readBy.push({
        userId: req.user._id,
        readAt: message.readAt
      });
    }
    
    // Update unread count in conversation
    await Conversation.updateOne(
      { 
        _id: message.conversationId,
        'unreadCounts.userId': req.user._id 
      },
      { $inc: { 'unreadCounts.$.count': -1 } }
    );
  }
  
  await message.save();
  
  // Log the status update
  await AuditLog.log({
    action: 'update_message_status',
    entity: 'Message',
    entityId: message._id,
    userId: req.user._id,
    userRole: req.user.role,
    details: {
      previousStatus: message.previousStatus,
      newStatus: status,
      conversationId: message.conversationId
    },
    source: 'web'
  });
  
  res.json({
    success: true,
    data: message
  });
}));

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
router.delete('/:messageId', asyncHandler(async (req, res) => {
  const message = await Message.findOne({
    _id: req.params.messageId,
    sender: req.user._id, // Only sender can delete
    'metadata.isDeleted': { $ne: true }
  });
  
  if (!message) {
    res.status(404);
    throw new Error('Message not found or already deleted');
  }
  
  // Soft delete
  message.metadata.isDeleted = true;
  message.metadata.deletedAt = new Date();
  await message.save();
  
  // Log the deletion
  await AuditLog.log({
    action: 'delete_message',
    entity: 'Message',
    entityId: message._id,
    userId: req.user._id,
    userRole: req.user.role,
    details: {
      conversationId: message.conversationId,
      recipient: message.recipient
    },
    source: 'web'
  });
  
  res.json({
    success: true,
    data: {}
  });
}));

// Helper function to populate conversation with additional data
async function populateConversation(conversation, userId) {
  const populated = await Conversation.populate(conversation, [
    { 
      path: 'participants.userId', 
      select: 'name email avatar role',
      match: { _id: { $ne: userId } }
    },
    { 
      path: 'lastMessage',
      populate: [
        { path: 'sender', select: 'name email avatar role' },
        { path: 'recipient', select: 'name email avatar role' }
      ]
    },
    { path: 'doctorId', select: 'name email avatar' },
    { path: 'patientId', select: 'name email avatar' }
  ]);
  
  // Add unread count
  const unreadCount = await Message.countDocuments({
    conversationId: conversation._id,
    recipient: userId,
    status: { $ne: 'read' },
    'metadata.isDeleted': { $ne: true }
  });
  
  return {
    ...populated.toObject(),
    unreadCount
  };
}

export default router;
