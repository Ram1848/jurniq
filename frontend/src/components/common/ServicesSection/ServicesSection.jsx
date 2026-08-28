import { motion } from 'motion/react';
import { HiOutlineUserGroup, HiOutlineSparkles, HiOutlineBriefcase } from 'react-icons/hi2';

const services = [
  {
    icon: HiOutlineUserGroup,
    title: 'Jurniq Economy',
    desc: 'Affordable everyday rides for everyone. Perfect for daily commutes and quick trips across town.',
    price: 'From $5',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    icon: HiOutlineSparkles,
    title: 'Jurniq Premium',
    desc: 'High-end vehicles with top-rated drivers. Ideal for business meetings, date nights, and special occasions.',
    price: 'From $15',
    color: 'from-violet-500 to-purple-400'
  },
  {
    icon: HiOutlineBriefcase,
    title: 'Jurniq XL',
    desc: 'Spacious SUVs and minivans for up to 6 passengers. Great for group outings and airport transfers with luggage.',
    price: 'From $12',
    color: 'from-emerald-500 to-green-400'
  }
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">Our Services</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4">A Ride for Every Occasion</h3>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Choose the ride that fits your needs and budget. All options come with our safety guarantee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="glass-card overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col h-full"
            >
              <div className={`h-2 w-full bg-gradient-to-r ${service.color}`}></div>
              <div className="p-8 flex flex-col flex-1">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-text-primary mb-3">{service.title}</h4>
                <p className="text-text-secondary leading-relaxed mb-6 flex-1">{service.desc}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <span className="text-lg font-bold text-text-primary">{service.price}</span>
                  <a href="/register" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors no-underline flex items-center gap-1">
                    Book Now <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
