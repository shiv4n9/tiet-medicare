import axios from 'axios';

/**
 * SMS Service using smsmobileapi.com
 * Documentation: https://smsmobileapi.com/doc/
 */

const SMS_API_URL = 'https://api.smsmobileapi.com/sendsms/';

/**
 * Send SMS using SMS Mobile API
 * @param {string} phoneNumber - Recipient phone number (with country code)
 * @param {string} message - SMS message content
 * @returns {Promise<object>} - API response
 */
export const sendSMS = async (phoneNumber, message) => {
  try {
    const apiKey = process.env.SMS_MOBILE_API_KEY;

    if (!apiKey) {
      console.warn('SMS_MOBILE_API_KEY not configured - SMS will not be sent');
      return {
        success: false,
        error: 'SMS_MOBILE_API_KEY not configured',
      };
    }

    console.log(`Sending SMS to ${phoneNumber} with API key: ${apiKey.substring(0, 10)}...`);

    // Create URLSearchParams for the body (as per API docs)
    const params = new URLSearchParams();
    params.append('apikey', apiKey);
    params.append('recipients', phoneNumber);
    params.append('message', message);

    const response = await axios.post(SMS_API_URL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('SMS API Response:', response.data);

    // Check if response indicates success
    if (response.data && (response.data.success !== false && response.status === 200)) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return {
        success: false,
        error: response.data?.message || response.data?.error || 'Unknown error',
        data: response.data,
      };
    }
  } catch (error) {
    console.error('SMS sending failed:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Send emergency SOS SMS to multiple contacts
 * @param {object} params - Emergency parameters
 * @param {string} params.userName - Name of the person in emergency
 * @param {string} params.userPhone - Phone of the person in emergency
 * @param {object} params.location - GPS coordinates {lat, lng}
 * @param {string} params.emergencyType - Type of emergency
 * @param {string[]} params.emergencyContacts - Array of phone numbers to notify
 * @returns {Promise<object>} - Results of SMS sending
 */
export const sendEmergencySOS = async ({ userName, userPhone, location, emergencyType, emergencyContacts }) => {
  const googleMapsLink = location 
    ? `https://maps.google.com/?q=${location.lat},${location.lng}`
    : 'Location unavailable';

  const message = `🚨 EMERGENCY SOS ALERT 🚨

${userName || 'A user'} needs immediate help!

📍 Location: ${googleMapsLink}
📞 Contact: ${userPhone || 'Not provided'}
⚠️ Emergency: ${emergencyType || 'Medical Emergency'}
🕐 Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

This is an automated emergency alert from TIET Medi-Care. Please respond immediately.`;

  const results = [];

  for (const contact of emergencyContacts) {
    const result = await sendSMS(contact, message);
    results.push({
      contact,
      ...result,
    });
  }

  return results;
};

export default {
  sendSMS,
  sendEmergencySOS,
};
