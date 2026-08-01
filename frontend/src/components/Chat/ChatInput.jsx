import { useState } from 'react';
import { HiOutlinePaperAirplane } from 'react-icons/hi2';

const ChatInput = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 flex items-center gap-2 bg-white rounded-b-2xl">
      <input
        type="text"
        placeholder="Type a message..."
        className="flex-1 bg-surface px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={!input.trim() || disabled}
        className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-dark text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <HiOutlinePaperAirplane className="w-4 h-4 -rotate-45 ml-0.5" />
      </button>
    </form>
  );
};

export default ChatInput;
