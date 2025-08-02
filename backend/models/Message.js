import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(value) {
        // Ensure message is not empty or just whitespace
        return value.trim().length > 0;
      },
      message: 'Message content cannot be empty'
    }
  },
  attachments: [{
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number, // in bytes
      required: true
    },
    thumbnailUrl: String
  }],
  messageType: {
    type: String,
    enum: ['text', 'image', 'document', 'audio', 'video', 'location', 'appointment', 'prescription', 'lab_result', 'other'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sending'
  },
  readAt: Date,
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isForwarded: {
      type: Boolean,
      default: false
    },
    originalMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    isReply: {
      type: Boolean,
      default: false
    },
    replyToMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    clientMessageId: String, // For client-side message tracking
    ipAddress: String,
    userAgent: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      },
      address: String
    },
    tags: [String]
  },
  // For system-generated messages
  systemMessage: {
    type: {
      type: String,
      enum: ['appointment_created', 'appointment_updated', 'appointment_cancelled', 
             'prescription_ready', 'lab_result_ready', 'payment_received', 
             'account_verified', 'welcome', 'announcement', 'other']
    },
    data: mongoose.Schema.Types.Mixed
  },
  // For rich content or structured data
  richContent: {
    title: String,
    description: String,
    url: String,
    imageUrl: String,
    preview: String
  },
  // For message reactions
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // For end-to-end encryption
  encryption: {
    isEncrypted: {
      type: Boolean,
      default: false
    },
    keyId: String,
    algorithm: String,
    iv: String,
    authTag: String,
    encryptedKey: String
  },
  // For message expiration
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  },
  // For message scheduling
  scheduledFor: {
    type: Date,
    index: true
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  // For message threads
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    index: true
  },
  isThreadStarter: {
    type: Boolean,
    default: false
  },
  threadReplies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  threadReplyCount: {
    type: Number,
    default: 0
  },
  lastReplyAt: Date
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, status: 1 });
messageSchema.index({ recipient: 1, status: 1, readAt: 1 });
messageSchema.index({ 'metadata.isDeleted': 1 });
messageSchema.index({ 'metadata.isEdited': 1 });
messageSchema.index({ 'metadata.tags': 1 });
messageSchema.index({ 'metadata.location': '2dsphere' });
messageSchema.index({ 'attachments.fileType': 1 });
messageSchema.index({ 'systemMessage.type': 1 });
messageSchema.index({ 'expiresAt': 1 }, { expireAfterSeconds: 0 });

// Text index for search
messageSchema.index({
  'content': 'text',
  'attachments.fileName': 'text',
  'metadata.tags': 'text',
  'richContent.title': 'text',
  'richContent.description': 'text'
});

// Virtual for message URL
messageSchema.virtual('url').get(function() {
  return `/api/messages/${this._id}`;
});

// Pre-save hooks
messageSchema.pre('save', function(next) {
  // Update read status if needed
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
    
    // Add to readBy if not already present
    const hasRead = this.readBy.some(entry => 
      entry.userId.toString() === this.recipient.toString()
    );
    
    if (!hasRead) {
      this.readBy.push({
        userId: this.recipient,
        readAt: this.readAt
      });
    }
  }
  
  // Set expiration if not set and message type is temporary
  if (this.messageType === 'temporary' && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }
  
  next();
});

// Static method to mark messages as read
messageSchema.statics.markAsRead = async function(messageIds, userId) {
  return this.updateMany(
    {
      _id: { $in: messageIds },
      recipient: userId,
      status: { $ne: 'read' }
    },
    {
      $set: { 
        status: 'read',
        readAt: new Date()
      },
      $addToSet: {
        readBy: {
          userId: userId,
          readAt: new Date()
        }
      }
    }
  );
};

// Static method to get unread message count for a user
messageSchema.statics.getUnreadCount = async function(userId, conversationId = null) {
  const match = {
    recipient: userId,
    status: { $ne: 'read' },
    'metadata.isDeleted': { $ne: true }
  };
  
  if (conversationId) {
    match.conversationId = conversationId;
  }
  
  return this.countDocuments(match);
};

// Static method to get message history with pagination
messageSchema.statics.getConversationHistory = async function(conversationId, {
  before = null,
  after = null,
  limit = 50,
  includeDeleted = false,
  includeSystem = true,
  userId = null
} = {}) {
  const query = { conversationId };
  
  // Handle pagination
  if (before) {
    query._id = { $lt: before };
  } else if (after) {
    query._id = { $gt: after };
  }
  
  // Filter deleted messages
  if (!includeDeleted) {
    query.$or = [
      { 'metadata.isDeleted': { $exists: false } },
      { 'metadata.isDeleted': false }
    ];
  }
  
  // Filter system messages
  if (!includeSystem) {
    query['systemMessage.type'] = { $exists: false };
  }
  
  // Get messages
  const messages = await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'name email avatar role')
    .populate('recipient', 'name email avatar role')
    .populate('metadata.originalMessageId', 'content sender')
    .populate('metadata.replyToMessageId', 'content sender')
    .lean();
  
  // Mark messages as read if user is the recipient
  if (userId && messages.length > 0) {
    const unreadMessages = messages.filter(
      msg => msg.recipient._id.toString() === userId.toString() && 
             msg.status !== 'read'
    );
    
    if (unreadMessages.length > 0) {
      await this.updateMany(
        { _id: { $in: unreadMessages.map(m => m._id) } },
        { 
          $set: { 
            status: 'read',
            readAt: new Date()
          },
          $addToSet: {
            readBy: {
              userId: userId,
              readAt: new Date()
            }
          }
        }
      );
      
      // Update the status in the returned messages
      messages.forEach(msg => {
        if (unreadMessages.some(m => m._id.toString() === msg._id.toString())) {
          msg.status = 'read';
          msg.readAt = new Date();
        }
      });
    }
  }
  
  return messages.reverse(); // Return in chronological order
};

// Static method to search messages
messageSchema.statics.searchMessages = async function({
  userId,
  query,
  conversationId = null,
  startDate = null,
  endDate = null,
  messageTypes = [],
  hasAttachments = null,
  page = 1,
  limit = 20
}) {
  const match = {
    $or: [
      { sender: userId },
      { recipient: userId }
    ],
    'metadata.isDeleted': { $ne: true },
    $text: { $search: query }
  };
  
  // Filter by conversation if specified
  if (conversationId) {
    match.conversationId = conversationId;
  }
  
  // Filter by date range
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  
  // Filter by message types
  if (messageTypes.length > 0) {
    match.messageType = { $in: messageTypes };
  }
  
  // Filter by attachments
  if (hasAttachments !== null) {
    if (hasAttachments) {
      match['attachments.0'] = { $exists: true };
    } else {
      match['attachments.0'] = { $exists: false };
    }
  }
  
  const [results, total] = await Promise.all([
    this.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'name email avatar role')
      .populate('recipient', 'name email avatar role')
      .populate('conversationId')
      .lean(),
    this.countDocuments(match)
  ]);
  
  return {
    data: results,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

// Create model
const Message = mongoose.model('Message', messageSchema);

export default Message;
