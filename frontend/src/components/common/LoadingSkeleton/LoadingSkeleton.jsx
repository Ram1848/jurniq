const LoadingSkeleton = ({ width = '100%', height = '20px', rounded = 'rounded-lg', count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`skeleton-pulse ${rounded}`}
        style={{ width, height, marginBottom: count > 1 ? '0.75rem' : 0 }}
      />
    ))}
  </>
);

export default LoadingSkeleton;
