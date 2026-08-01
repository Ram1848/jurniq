import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { HiOutlineUsers, HiOutlineTruck, HiOutlineGlobeAlt } from 'react-icons/hi2';

const stats = [
  { icon: HiOutlineUsers, value: 100000, suffix: '+', label: 'Happy Users', display: '100K' },
  { icon: HiOutlineTruck, value: 20000, suffix: '+', label: 'Expert Drivers', display: '20K' },
  { icon: HiOutlineGlobeAlt, value: 1000000, suffix: '+', label: 'Rides Completed', display: '1M' },
];

const AnimatedCounter = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    const num = Math.round(latest);
    if (num >= 1000000) return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
    return num.toString();
  });

  useEffect(() => {
    const controls = animate(count, value, { duration: 2.5, ease: "easeOut" });
    return controls.stop;
  }, [count, value]);

  return <motion.span>{rounded}</motion.span>;
};

const StatsSection = () => {
  return (
    <section id="stats" className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label} 
              className="py-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <stat.icon className="w-10 h-10 text-primary mx-auto mb-4" />
              <div className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
                <AnimatedCounter value={stat.value} />
                <span className="text-primary">{stat.suffix}</span>
              </div>
              <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
