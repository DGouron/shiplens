import '../styles/skeleton.css';

type SkeletonCardProps = {
  lines?: number;
};

export function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
  const lineKeys = Array.from({ length: lines }, (_, index) => `line-${index}`);
  return (
    <div className="skeleton-card">
      {lineKeys.map((key) => (
        <div key={key} className="skeleton-line" />
      ))}
    </div>
  );
}
