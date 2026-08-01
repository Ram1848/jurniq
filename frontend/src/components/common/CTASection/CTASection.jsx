import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const CTASection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-r from-primary to-accent px-8 py-16 sm:px-16 sm:py-20 text-center relative overflow-hidden"
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
              Join millions of riders and drivers on the most trusted ride-sharing platform. Your next ride is just a tap away.
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-text-primary font-semibold px-8 py-3.5 rounded-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 no-underline"
            >
              Start Riding Now
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
