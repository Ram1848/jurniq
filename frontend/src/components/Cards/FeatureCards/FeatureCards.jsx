import { motion } from 'motion/react';
import { useInView } from 'react-intersection-observer';
import {
  HiOutlineMapPin,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineClock,
  HiOutlineCalculator,
  HiOutlineSignal,
} from 'react-icons/hi2';

const features = [
  { icon: HiOutlineMapPin, title: 'Real Time Tracking', desc: 'Track your ride in real time with GPS-powered live location updates.' },
  { icon: HiOutlineShieldCheck, title: 'Secure Payments', desc: 'Multiple payment options with bank-grade encryption and security.' },
  { icon: HiOutlineUserGroup, title: 'Professional Drivers', desc: 'Verified, trained and background-checked professional drivers.' },
  { icon: HiOutlineClock, title: '24×7 Availability', desc: 'Round the clock service, anytime you need a ride — day or night.' },
  { icon: HiOutlineCalculator, title: 'Smart Fare Estimation', desc: 'AI-powered fare calculation so you always know the cost upfront.' },
  { icon: HiOutlineSignal, title: 'Live Ride Status', desc: 'Real-time ride status updates from booking to drop-off.' },
];

const FeatureCards = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">Powerful Features</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Everything you need for a seamless ride experience, powered by cutting-edge technology.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-7 group hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feat.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{feat.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
