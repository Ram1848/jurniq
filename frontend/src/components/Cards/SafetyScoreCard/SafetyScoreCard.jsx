import { motion } from 'motion/react';
import { HiOutlineShieldCheck, HiOutlineInformationCircle } from 'react-icons/hi2';

const SafetyScoreCard = ({ score, tier }) => {
  // Determine colors based on score
  let colorClass = 'from-danger to-red-400 text-danger';
  let progressColor = 'bg-danger';
  if (score >= 95) {
    colorClass = 'from-success to-emerald-400 text-success';
    progressColor = 'bg-success';
  } else if (score >= 80) {
    colorClass = 'from-primary to-blue-400 text-primary';
    progressColor = 'bg-primary';
  } else if (score >= 60) {
    colorClass = 'from-warning to-yellow-400 text-warning';
    progressColor = 'bg-warning';
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 relative overflow-hidden h-full flex flex-col"
    >
      {/* Background glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl bg-gradient-to-br ${colorClass}`}></div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-gradient-to-br opacity-20 ${colorClass} absolute inset-0 w-10 h-10 m-6`}></div>
          <HiOutlineShieldCheck className={`w-6 h-6 relative z-10 ${colorClass.split(' ')[2]}`} />
          <h3 className="text-lg font-bold text-text-primary relative z-10">Safety Score</h3>
        </div>
        <div className="group relative">
          <HiOutlineInformationCircle className="w-5 h-5 text-text-secondary cursor-help" />
          <div className="absolute right-0 w-48 p-2 bg-text-primary text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 top-full mt-2">
            Score is calculated based on rider ratings, completion rate, cancellations, and complaints.
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative mb-4">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="58"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-surface"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="58"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray="364.4"
              strokeDashoffset={364.4 - (364.4 * score) / 100}
              strokeLinecap="round"
              className={colorClass.split(' ')[2]}
              initial={{ strokeDashoffset: 364.4 }}
              animate={{ strokeDashoffset: 364.4 - (364.4 * score) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-text-primary">{score}</span>
          </div>
        </div>
        
        <div className={`px-4 py-1.5 rounded-full text-sm font-bold bg-opacity-10 border ${colorClass.split(' ')[2]} border-opacity-20`} style={{ backgroundColor: 'var(--color-surface)' }}>
          <span className={colorClass.split(' ')[2]}>{tier}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SafetyScoreCard;
