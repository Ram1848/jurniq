import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';

const Contact = () => {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-text-primary mb-4">Contact Us</h1>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Have questions or need support? Our team is here to help. Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Contact Info Cards */}
          <div className="glass-card p-8 text-center hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineMail className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Email Support</h3>
            <p className="text-text-secondary mb-4">We aim to respond within 24 hours.</p>
            <a href="mailto:support@rideshare.com" className="text-primary font-semibold hover:underline">
              support@rideshare.com
            </a>
          </div>

          <div className="glass-card p-8 text-center hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlinePhone className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Phone Support</h3>
            <p className="text-text-secondary mb-4">Mon-Fri from 8am to 5pm.</p>
            <a href="tel:+15551234567" className="text-primary font-semibold hover:underline">
              +1 (555) 123-4567
            </a>
          </div>

          <div className="glass-card p-8 text-center hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineLocationMarker className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Office Location</h3>
            <p className="text-text-secondary mb-4">Come visit our headquarters.</p>
            <p className="text-primary font-semibold">
              123 Innovation Drive<br/>San Francisco, CA
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-3xl mx-auto glass-card p-8 md:p-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">Send us a message</h2>
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
              <label className="block text-sm font-medium text-text-secondary mb-2">Message</label>
              <textarea rows="5" className="input-field resize-none" placeholder="How can we help you?" required></textarea>
            </div>
            <button type="submit" className="btn-primary w-full py-4 text-lg">
              Send Message
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;
