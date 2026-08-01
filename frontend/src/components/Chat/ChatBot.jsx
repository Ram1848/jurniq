import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import FloatingChatButton from './FloatingChatButton';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ChatBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Load chat history from localStorage if available
  useEffect(() => {
    if (user) {
      const history = localStorage.getItem(`chatHistory_${user.user_id}`);
      if (history) {
        setMessages(JSON.parse(history));
      }
    }
  }, [user]);

  // Save chat history
  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`chatHistory_${user.user_id}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Send to backend
      const res = await api.post('/chat/message', { message: text });
      
      const botMsg = { role: 'assistant', content: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat Error:', err);
      const errorMsg = { role: 'assistant', content: 'Oops! I am having trouble connecting to the server. Please try again later.' };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <FloatingChatButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold">Ride Assistant</h3>
                <p className="text-xs text-white/80">AI-Powered Support</p>
              </div>
            </div>

            {/* Messages */}
            <ChatWindow messages={messages} isTyping={isTyping} />

            {/* Input */}
            <ChatInput onSend={handleSendMessage} disabled={isTyping} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
