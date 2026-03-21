export function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 2v3 M12 19v3 M2 12h3 M19 12h3" />
      <path d="m8 12 3 3 7-7" strokeWidth="2.5" />
    </svg>
  );
}
