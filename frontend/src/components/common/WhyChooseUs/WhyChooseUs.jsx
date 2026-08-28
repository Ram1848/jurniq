import { motion } from 'motion/react';
import { 
  HiOutlineBolt, 
  HiOutlineCpuChip, 
  HiOutlineShieldCheck, 
  HiOutlineMapPin, 
  HiOutlineMap, 
  HiOutlineCreditCard, 
  HiOutlineExclamationTriangle, 
  HiOutlineCurrencyDollar, 
  HiOutlinePhone, 
  HiOutlineSparkles 
} from 'react-icons/hi2';

const cards = [
  {
    icon: HiOutlineBolt,
    title: 'Lightning Fast Pickups',
    desc: 'Average pickup time of under 3 minutes powered by real-time dispatching.',
    gradient: 'from-blue-600 to-cyan-500',
  },
  {
    icon: HiOutlineCpuChip,
    title: 'AI Driver Recommendation',
    desc: 'Smart AI matching connects you with top-rated drivers suited to your ride preference.',
    gradient: 'from-indigo-600 to-blue-500',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Driver Safety Score',
    desc: 'Comprehensive safety scores monitoring driving habits to keep every trip secure.',
    gradient: 'from-emerald-600 to-green-500',
  },
  {
    icon: HiOutlineMapPin,
    title: 'Live Ride Tracking',
    desc: 'Live GPS location tracking and accurate ETA updates from pickup to dropoff.',
    gradient: 'from-sky-600 to-blue-400',
  },
  {
    icon: HiOutlineMap,
    title: 'Google Maps Navigation',
    desc: 'Integrated turnkey navigation assuring optimal, traffic-aware routing.',
    gradient: 'from-teal-600 to-emerald-400',
  },
  {
    icon: HiOutlineCreditCard,
    title: 'Secure Payments',
    desc: 'Encrypted payments via Stripe, digital wallets, and card processors.',
    gradient: 'from-purple-600 to-violet-500',
  },
  {
    icon: HiOutlineExclamationTriangle,
    title: 'Emergency SOS',
    desc: 'Instant emergency assistance trigger sharing live location with safety personnel.',
    gradient: 'from-red-600 to-rose-400',
  },
  {
    icon: HiOutlineCurrencyDollar,
    title: 'Transparent Pricing',
    desc: 'Clear upfront fare calculation without surge gouging or hidden charges.',
    gradient: 'from-amber-600 to-yellow-400',
  },
  {
    icon: HiOutlinePhone,
    title: '24/7 Support',
    desc: 'Round-the-clock dedicated customer assistance via in-app support chat.',
    gradient: 'from-blue-600 to-indigo-500',
  },
  {
    icon: HiOutlineSparkles,
    title: 'Premium User Experience',
    desc: 'State-of-the-art UI/UX crafted for maximum comfort and effortless navigation.',
    gradient: 'from-primary to-accent',
  },
];

const WhyChooseUs = () => {
  return (
    <section id="about" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">Why Choose Jurniq?</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            We're redefining urban mobility with intelligent technology, safety, and transparency at our core.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mx-auto mb-6`}>
                <card.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">{card.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
