import { motion } from 'motion/react';
import { HiOutlineChatBubbleLeftEllipsis, HiXMark } from 'react-icons/hi2';

const FloatingChatButton = ({ isOpen, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors ${
        isOpen 
          ? 'bg-white text-text-primary border border-gray-200' 
          : 'bg-gradient-to-r from-primary to-accent text-white shadow-primary/40'
      }`}
    >
      {isOpen ? (
        <HiXMark className="w-6 h-6" />
      ) : (
        <HiOutlineChatBubbleLeftEllipsis className="w-6 h-6" />
      )}
    </motion.button>
  );
};

export default FloatingChatButton;
