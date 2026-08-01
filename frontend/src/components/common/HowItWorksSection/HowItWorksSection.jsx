import { motion } from 'motion/react';
import { HiOutlineMapPin, HiOutlineCreditCard, HiOutlineStar } from 'react-icons/hi2';

const steps = [
  {
    icon: HiOutlineMapPin,
    title: '1. Request a Ride',
    desc: 'Enter your destination and choose your preferred ride type. Get instant fare estimates and ETA.',
  },
  {
    icon: HiOutlineCreditCard,
    title: '2. Enjoy the Journey',
    desc: 'Your verified driver will arrive shortly. Track them in real-time and relax during your safe ride.',
  },
  {
    icon: HiOutlineStar,
    title: '3. Pay & Rate',
    desc: 'Payment is seamless and cashless. Rate your driver and leave feedback to help us maintain quality.',
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">Process</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4">How It Works</h3>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Three simple steps is all it takes to get you to your destination safely and comfortably.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="relative text-center group"
              >
                <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-surface z-10 relative mb-6 group-hover:scale-110 group-hover:border-primary/20 transition-all duration-300">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <h4 className="text-xl font-bold text-text-primary mb-3">{step.title}</h4>
                <p className="text-text-secondary leading-relaxed max-w-sm mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
