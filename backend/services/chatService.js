const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');

// Initialize Gemini API client if key exists
let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} else {
  logger.warn('GEMINI_API_KEY not found. AI Chat Assistant will run in Fallback Rule-Based mode.');
}

const SYSTEM_PROMPT = `
You are the Ride Sharing Platform AI Assistant. You are friendly, concise, and helpful.
You help users with the following tasks:
- Book a ride
- Show ride history
- Cancel a ride
- Track current ride
- Find the safest or nearest driver
- Explain payment methods
- Help with account settings

Keep your answers short and format them in markdown if needed. 
Do not hallucinate fake system statuses, if asked to perform an action, explain how the user can do it in the app UI.
`;

/**
 * Fallback local rule-based system
 */
const fallbackChat = (message) => {
  const msg = message.toLowerCase();
  
  if (msg.includes('book') || msg.includes('ride')) {
    return "To book a ride, go to your **Rider Dashboard** and click 'Book a Ride'. You can enter your pickup and drop-off locations to see recommended drivers and fares.";
  }
  if (msg.includes('history') || msg.includes('past')) {
    return "You can view all your past rides by navigating to the **Ride History** section from your dashboard menu.";
  }
  if (msg.includes('cancel')) {
    return "If you need to cancel an active ride, go to the **Active Ride** screen and tap the 'Cancel' button. Please note that cancellation fees may apply if the driver is already on their way.";
  }
  if (msg.includes('track') || msg.includes('current')) {
    return "To track your current ride in real-time, tap on **Active Ride** in the navigation menu. You'll see the driver's live GPS location on the map.";
  }
  if (msg.includes('safest') || msg.includes('safety')) {
    return "Our AI recommendation engine automatically suggests the safest drivers! When booking a ride, the **AI Recommended Drivers** list highlights drivers with the highest Safety Scores.";
  }
  if (msg.includes('nearest') || msg.includes('closest')) {
    return "The nearest drivers are automatically calculated when you enter your pickup location during the booking process. We prioritize drivers with the lowest ETA.";
  }
  if (msg.includes('pay') || msg.includes('card') || msg.includes('cash')) {
    return "We accept **Cash, UPI, and Cards**. You can select your preferred payment method right before confirming your booking. You can also view past payments in the **Payment History** section.";
  }
  if (msg.includes('account') || msg.includes('settings') || msg.includes('profile')) {
    return "You can update your name, phone number, and emergency contacts by visiting the **Profile** page.";
  }
  if (msg.includes('sos') || msg.includes('emergency')) {
    return "🚨 **EMERGENCY:** If you are in danger, please use the red **EMERGENCY SOS** button on the Active Ride screen. This will instantly notify your trusted contacts and our admin team with your live location.";
  }
  
  return "Hello! I am your Ride Assistant. I can help you book a ride, check your history, explain payment methods, or guide you through the app. How can I help you today?";
};

/**
 * Main chat handler
 */
const getChatResponse = async (message) => {
  try {
    // Use Fallback if Gemini is not configured
    if (!ai) {
      // Simulate network delay for realistic typing effect
      await new Promise(resolve => setTimeout(resolve, 800));
      return fallbackChat(message);
    }

    // Use Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      }
    });

    return response.text;
  } catch (error) {
    logger.error(`AI Chat Error: ${error.message}`);
    // If Gemini fails (e.g. rate limit), drop to fallback
    return fallbackChat(message);
  }
};

module.exports = {
  getChatResponse
};
