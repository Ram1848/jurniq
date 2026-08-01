import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { HiOutlineRocketLaunch, HiOutlineStar } from 'react-icons/hi2';

const HeroSection = () => (
  <section
    id="home"
    className="min-h-screen flex items-center pt-20 pb-16 bg-gradient-to-br from-surface via-white to-blue-50 overflow-hidden"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <HiOutlineRocketLaunch className="w-4 h-4" />
            #1 Ride Sharing Platform
          </motion.div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary leading-tight mb-6">
            Your Smart Ride,{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Anytime, Anywhere
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg text-text-secondary max-w-lg mb-8 leading-relaxed">
            Safe, Fast and Reliable transportation experience. Join thousands of riders who trust us
            for their daily commute.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link to="/register" className="btn-primary text-base !py-3.5 !px-8 no-underline">
              Book a Ride
            </Link>
            <Link to="/register" className="btn-secondary text-base !py-3.5 !px-8 no-underline">
              Become a Driver
            </Link>
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-6 text-sm text-text-secondary"
          >
            <span className="flex items-center gap-1">
              <span className="font-bold text-text-primary">100K+</span> Happy Users
            </span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="flex items-center gap-1">
              <HiOutlineStar className="w-4 h-4 text-warning" />
              <span className="font-bold text-text-primary">4.9</span> Rating
            </span>
          </motion.div>
        </motion.div>

        {/* Right side — SVG Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden lg:block"
        >
          <svg viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            {/* Sky gradient */}
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8F4FD" />
                <stop offset="100%" stopColor="#F5F5F7" />
              </linearGradient>
              <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1C1C1E" />
                <stop offset="100%" stopColor="#3A3A3C" />
              </linearGradient>
              <linearGradient id="carGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0A84FF" />
                <stop offset="100%" stopColor="#5E5CE6" />
              </linearGradient>
            </defs>

            {/* Background circle */}
            <circle cx="300" cy="250" r="200" fill="url(#skyGrad)" />

            {/* City buildings */}
            <rect x="120" y="160" width="40" height="140" rx="4" fill="#D1D5DB" />
            <rect x="170" y="120" width="35" height="180" rx="4" fill="#E5E7EB" />
            <rect x="215" y="150" width="45" height="150" rx="4" fill="#D1D5DB" />
            <rect x="350" y="130" width="38" height="170" rx="4" fill="#E5E7EB" />
            <rect x="398" y="170" width="42" height="130" rx="4" fill="#D1D5DB" />
            <rect x="450" y="140" width="35" height="160" rx="4" fill="#E5E7EB" />

            {/* Building windows */}
            {[130, 180, 225, 360, 408, 460].map((x, i) => (
              <g key={i}>
                <rect x={x} y={170 + (i % 3) * 5} width="8" height="8" rx="1" fill="#0A84FF" opacity="0.3" />
                <rect x={x} y={190 + (i % 3) * 5} width="8" height="8" rx="1" fill="#0A84FF" opacity="0.2" />
                <rect x={x} y={210 + (i % 3) * 5} width="8" height="8" rx="1" fill="#0A84FF" opacity="0.4" />
                <rect x={x + 14} y={175 + (i % 2) * 10} width="8" height="8" rx="1" fill="#5E5CE6" opacity="0.2" />
                <rect x={x + 14} y={200 + (i % 2) * 10} width="8" height="8" rx="1" fill="#5E5CE6" opacity="0.3" />
              </g>
            ))}

            {/* Road */}
            <rect x="60" y="300" width="480" height="50" rx="8" fill="url(#roadGrad)" />
            {/* Road dashes */}
            <rect x="100" y="323" width="40" height="4" rx="2" fill="#9CA3AF" />
            <rect x="180" y="323" width="40" height="4" rx="2" fill="#9CA3AF" />
            <rect x="260" y="323" width="40" height="4" rx="2" fill="#9CA3AF" />
            <rect x="340" y="323" width="40" height="4" rx="2" fill="#9CA3AF" />
            <rect x="420" y="323" width="40" height="4" rx="2" fill="#9CA3AF" />

            {/* Car body */}
            <rect x="220" y="270" width="160" height="45" rx="12" fill="url(#carGrad)" />
            <rect x="240" y="252" width="110" height="25" rx="10" fill="url(#carGrad)" />
            {/* Windows */}
            <rect x="250" y="256" width="40" height="16" rx="4" fill="#E8F4FD" opacity="0.8" />
            <rect x="298" y="256" width="40" height="16" rx="4" fill="#E8F4FD" opacity="0.8" />
            {/* Headlights */}
            <rect x="374" y="283" width="12" height="8" rx="3" fill="#FFD60A" />
            <rect x="216" y="283" width="12" height="8" rx="3" fill="#FF453A" opacity="0.8" />
            {/* Wheels */}
            <circle cx="265" cy="315" r="18" fill="#1C1C1E" />
            <circle cx="265" cy="315" r="10" fill="#6B7280" />
            <circle cx="265" cy="315" r="4" fill="#9CA3AF" />
            <circle cx="345" cy="315" r="18" fill="#1C1C1E" />
            <circle cx="345" cy="315" r="10" fill="#6B7280" />
            <circle cx="345" cy="315" r="4" fill="#9CA3AF" />

            {/* Location pin */}
            <g transform="translate(290, 180)">
              <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="#0A84FF" />
              <circle cx="12" cy="12" r="5" fill="white" />
            </g>

            {/* Decorative dots */}
            <circle cx="150" cy="380" r="4" fill="#0A84FF" opacity="0.2" />
            <circle cx="450" cy="380" r="6" fill="#5E5CE6" opacity="0.15" />
            <circle cx="100" cy="200" r="5" fill="#0A84FF" opacity="0.1" />
            <circle cx="500" cy="220" r="3" fill="#5E5CE6" opacity="0.2" />
          </svg>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
