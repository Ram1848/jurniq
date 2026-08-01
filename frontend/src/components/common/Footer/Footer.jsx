import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => (
  <footer id="contact" className="bg-secondary pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 no-underline mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold text-white">
              Ride<span className="text-primary">Share</span>
            </span>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed mb-5">
            Making urban transportation smarter, safer, and more affordable for everyone.
          </p>
          <div className="flex gap-3">
            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Icon className="w-4 h-4 text-gray-400 hover:text-white" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2.5 list-none p-0">
            {[
              { name: 'Home', href: '/#home' },
              { name: 'About Us', href: '/#about' },
              { name: 'Services', href: '/#services' },
              { name: 'Contact', href: '/contact' }
            ].map((item) => (
              <li key={item.name}>
                {item.href.startsWith('/#') ? (
                  <a href={item.href} className="text-gray-400 text-sm hover:text-primary transition-colors no-underline">
                    {item.name}
                  </a>
                ) : (
                  <Link to={item.href} className="text-gray-400 text-sm hover:text-primary transition-colors no-underline">
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2.5 list-none p-0">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy'].map((item) => (
              <li key={item}>
                <a href="#" className="text-gray-400 text-sm hover:text-primary transition-colors no-underline">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-2.5 list-none p-0 text-gray-400 text-sm">
            <li>support@rideshare.com</li>
            <li>+1 (555) 123-4567</li>
            <li>123 Innovation Drive, San Francisco, CA</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 pt-6 text-center">
        <p className="text-gray-500 text-sm">&copy; 2024 RideShare. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
