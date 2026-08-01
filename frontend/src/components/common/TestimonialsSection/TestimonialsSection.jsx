import { motion } from 'motion/react';
import { HiStar } from 'react-icons/hi2';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Daily Commuter',
    content: 'RideShare has completely transformed my daily commute. The drivers are always punctual, and the app is incredibly intuitive to use. I save so much time every week!',
    rating: 5,
    initials: 'SJ',
    color: 'bg-blue-500'
  },
  {
    name: 'David Chen',
    role: 'Business Traveler',
    content: 'I rely on RideShare Premium for all my business meetings across the city. The vehicles are pristine, and the service is exceptionally professional. Highly recommended.',
    rating: 5,
    initials: 'DC',
    color: 'bg-violet-500'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Weekend Explorer',
    content: 'Whether going to the airport or heading downtown for dinner, RideShare is my go-to. Transparent pricing means no nasty surprises when I check my receipt.',
    rating: 5,
    initials: 'ER',
    color: 'bg-emerald-500'
  }
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">Testimonials</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-4">Loved by Riders Everywhere</h3>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Don't just take our word for it. Here's what our community has to say about their RideShare experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow relative"
            >
              <div className="flex text-warning mb-6 gap-1">
                {[...Array(testimonial.rating)].map((_, idx) => (
                  <HiStar key={idx} className="w-5 h-5" />
                ))}
              </div>
              <p className="text-text-secondary italic mb-8 leading-relaxed relative z-10">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${testimonial.color} flex items-center justify-center text-white font-bold shadow-md`}>
                  {testimonial.initials}
                </div>
                <div>
                  <h4 className="font-bold text-text-primary">{testimonial.name}</h4>
                  <p className="text-sm text-text-secondary">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
