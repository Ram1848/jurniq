import { motion } from 'motion/react';
import { HiOutlineBolt, HiOutlineCurrencyDollar, HiOutlineShieldCheck } from 'react-icons/hi2';

const cards = [
  {
    icon: HiOutlineBolt,
    title: 'Lightning Fast Pickups',
    desc: 'Average pickup time of just 3 minutes. Our smart algorithm connects you with the nearest driver instantly.',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    icon: HiOutlineCurrencyDollar,
    title: 'Best Price Guarantee',
    desc: 'Most competitive fares in the industry. Transparent pricing with no hidden charges or surge surprises.',
    gradient: 'from-emerald-500 to-green-400',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Safety First',
    desc: 'All drivers are verified with background checks. Real-time ride monitoring and SOS emergency button.',
    gradient: 'from-violet-500 to-purple-400',
  },
];

const WhyChooseUs = () => {
  return (
    <section id="about" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">Why Choose RideShare?</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            We're redefining urban mobility with technology, safety, and affordability at our core.
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
