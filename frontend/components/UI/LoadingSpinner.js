import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <Loader2 className={`${sizes[size]} animate-spin text-orange-500`} />
      {message && (
        <p className="text-text-secondary text-sm">{message}</p>
      )}
    </div>
  );
}