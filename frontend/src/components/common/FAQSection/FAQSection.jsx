import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HiOutlineChevronDown } from 'react-icons/hi2';

const faqs = [
  {
    question: 'How do I request a ride?',
    answer: 'Simply open the RideShare app or website, enter your destination in the "Where to?" box, select your preferred ride option, and tap "Book Ride". A nearby driver will be matched with you instantly.'
  },
  {
    question: 'Are the fares fixed or estimated?',
    answer: 'We provide an upfront estimated fare before you book. The final price usually matches the estimate, though it may vary slightly if the route changes significantly or if the trip takes much longer due to heavy traffic.'
  },
  {
    question: 'How are drivers vetted?',
    answer: 'Safety is our top priority. All RideShare drivers undergo comprehensive background checks, vehicle inspections, and driving history reviews before they are approved to drive on our platform.'
  },
  {
    question: 'Can I schedule a ride in advance?',
    answer: 'Yes! You can schedule a ride up to 30 days in advance. Just tap the calendar icon next to the "Where to?" destination box to select your desired pickup date and time.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards, Apple Pay, Google Pay, and PayPal. Payment is completely cashless and processed automatically at the end of your ride.'
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">FAQ</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4">Frequently Asked Questions</h3>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Got questions? We've got answers. If you can't find what you're looking for, our support team is always here to help.
          </p>
        </div>

        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
        >
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border transition-all duration-300 rounded-2xl overflow-hidden ${openIndex === index ? 'border-primary shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center bg-white cursor-pointer focus:outline-none"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-semibold text-text-primary pr-4">{faq.question}</span>
                <HiOutlineChevronDown 
                  className={`w-5 h-5 text-text-secondary shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-primary' : ''}`} 
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 pt-1 text-text-secondary leading-relaxed border-t border-gray-100">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
