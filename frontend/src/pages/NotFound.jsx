import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface px-4">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <h1 className="text-8xl sm:text-9xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
        404
      </h1>
      <h2 className="text-2xl font-bold text-text-primary mb-3">Page Not Found</h2>
      <p className="text-text-secondary mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <Link to="/" className="btn-primary no-underline">Back to Home</Link>
    </motion.div>
  </div>
);

export default NotFound;
