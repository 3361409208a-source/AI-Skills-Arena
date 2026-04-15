export function TypingDots() {
  return (
    <div className="flex items-center gap-1 h-6">
      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

export function PulsingDot() {
  return (
    <span className="relative flex">
      <span className="w-3 h-3 bg-current rounded-full animate-ping" />
    </span>
  );
}

export function GradientLoader() {
  return (
    <div className="flex items-center gap-1">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary via-secondary to-primary animate-spin" style={{ animationDuration: '2s' }} />
    </div>
  );
}

export function DotsLoader() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-primary rounded-full"
          style={{
            animation: 'pulse 1s ease-in-out infinite',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}