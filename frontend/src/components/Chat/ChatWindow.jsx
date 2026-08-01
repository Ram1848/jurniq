import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { HiOutlineUser, HiOutlineSparkles } from 'react-icons/hi2';

const ChatWindow = ({ messages, isTyping }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 custom-scrollbar max-h-[400px]">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <HiOutlineSparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-text-primary mb-1">AI Ride Assistant</h3>
          <p className="text-xs text-text-secondary">Ask me about booking rides, history, safety, or account settings!</p>
        </div>
      )}

      {messages.map((msg, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            msg.role === 'user' ? 'bg-primary/10' : 'bg-gradient-to-br from-primary to-accent'
          }`}>
            {msg.role === 'user' ? (
              <HiOutlineUser className="w-4 h-4 text-primary" />
            ) : (
              <HiOutlineSparkles className="w-4 h-4 text-white" />
            )}
          </div>

          {/* Bubble */}
          <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
            msg.role === 'user' 
              ? 'bg-primary text-white rounded-tr-sm' 
              : 'bg-white text-text-primary shadow-sm border border-gray-100 rounded-tl-sm'
          }`}>
            {msg.role === 'assistant' ? (
              <div className="prose prose-sm prose-p:my-1 prose-a:text-primary max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            ) : (
              <p>{msg.content}</p>
            )}
          </div>
        </motion.div>
      ))}

      {isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 flex-row"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary to-accent">
            <HiOutlineSparkles className="w-4 h-4 text-white" />
          </div>
          <div className="px-4 py-3 rounded-2xl bg-white shadow-sm border border-gray-100 rounded-tl-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
