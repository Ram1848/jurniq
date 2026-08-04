import { motion } from 'motion/react';
import { HiOutlineLightBulb, HiOutlineGlobeAsiaAustralia, HiOutlineHeart } from 'react-icons/hi2';

const features = [
  {
    icon: HiOutlineLightBulb,
    title: 'Innovation Driven',
    desc: 'We leverage cutting-edge technology to route you faster and safer.'
  },
  {
    icon: HiOutlineGlobeAsiaAustralia,
    title: 'Eco-Friendly Options',
    desc: 'Commitment to reducing carbon footprint with our EV fleet options.'
  },
  {
    icon: HiOutlineHeart,
    title: 'Community First',
    desc: 'Empowering local drivers and ensuring riders feel secure on every trip.'
  }
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Text Content */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">About RideShare</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-6">
              Moving people, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">changing lives.</span>
            </h3>
            <p className="text-lg text-text-secondary mb-8 leading-relaxed">
              Founded with a mission to simplify urban mobility, RideShare connects thousands of passengers with reliable drivers every day. We believe that getting from point A to B should be seamless, affordable, and most importantly, safe.
            </p>
            
            <div className="space-y-6">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-text-primary mb-1">{feature.title}</h4>
                    <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Image/Visual Content */}
          <motion.div 
            className="flex-1 w-full"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-slate-900 flex items-center justify-center group">
               {/* High-Definition Clear Background Image */}
               <img 
                 src="/rides_completed_bg.png" 
                 alt="Professional driver inside vehicle - 5M+ Rides Completed" 
                 className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                 onError={(e) => {
                   // Fallback to high clarity unsplash photo if local image fails
                   e.currentTarget.src = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1200&auto=format&fit=crop";
                 }}
               />
               {/* Subtle contrast gradient overlay */}
               <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-slate-950/20 to-black/40 pointer-events-none"></div>

               {/* Crisp Centered Glassmorphism Card */}
               <div className="relative z-10 glass-card p-6 sm:p-8 max-w-xs text-center border border-white/60 shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 rounded-2xl transform transition-transform duration-300 hover:scale-105">
                 <p className="text-4xl sm:text-5xl font-black text-text-primary mb-1 tracking-tight">5M+</p>
                 <p className="text-sm font-semibold text-text-secondary">Rides Completed Annually</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
