import { Wifi, WifiOff } from 'lucide-react';

export const DatabaseStatus = ({ connected }) => (
  <div className="flex items-center gap-2 text-sm">
    {connected ? (
      <>
        <Wifi className="h-4 w-4 text-green-500" />
        <span className="text-green-600">Connected to Supabase</span>
      </>
    ) : (
      <>
        <WifiOff className="h-4 w-4 text-red-500" />
        <span className="text-red-600">Database Connection Error</span>
      </>
    )}
  </div>
);