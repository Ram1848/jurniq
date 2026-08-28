import { motion } from 'motion/react';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">Get in Touch</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4">Contact Us</h3>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Have questions or need support? Our team is here to help. Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Contact Info Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0 }}
            className="glass-card p-8 text-center hover:shadow-xl transition-all"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineMail className="w-7 h-7 text-primary" />
            </div>
            <h4 className="text-xl font-bold text-text-primary mb-2">Email Support</h4>
            <p className="text-text-secondary mb-4">We aim to respond within 24 hours.</p>
            <a href="mailto:support@jurniq.com" className="text-primary font-semibold hover:underline">
              support@jurniq.com
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="glass-card p-8 text-center hover:shadow-xl transition-all"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlinePhone className="w-7 h-7 text-primary" />
            </div>
            <h4 className="text-xl font-bold text-text-primary mb-2">Phone Support</h4>
            <p className="text-text-secondary mb-4">Mon-Fri from 8am to 5pm.</p>
            <a href="tel:+15551234567" className="text-primary font-semibold hover:underline">
              +1 (555) 123-4567
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card p-8 text-center hover:shadow-xl transition-all"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineLocationMarker className="w-7 h-7 text-primary" />
            </div>
            <h4 className="text-xl font-bold text-text-primary mb-2">Office Location</h4>
            <p className="text-text-secondary mb-4">Come visit our headquarters.</p>
            <p className="text-primary font-semibold">
              123 Innovation Drive<br/>San Francisco, CA
            </p>
          </motion.div>
        </div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto glass-card p-8 md:p-12"
        >
          <h4 className="text-2xl font-bold text-text-primary mb-6 text-center">Send us a message</h4>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">First Name</label>
                <input type="text" className="input-field" placeholder="John" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Last Name</label>
                <input type="text" className="input-field" placeholder="Doe" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
              <input type="email" className="input-field" placeholder="john@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Subject</label>
              <input type="text" className="input-field" placeholder="How can we help?" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Message</label>
              <textarea rows="5" className="input-field resize-none" placeholder="Write your message here..." required></textarea>
            </div>
            <button type="submit" className="btn-primary w-full py-4 text-lg">
              Send Message
            </button>
          </form>
        </motion.div>

      </div>
    </section>
  );
};

export default ContactSection;
