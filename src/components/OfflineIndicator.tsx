import { useSyncExternalStore } from 'react';
import { WifiOff } from 'lucide-react';

function subscribe(cb: () => void) {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

export default function OfflineIndicator() {
  const online = useSyncExternalStore(subscribe, getSnapshot);

  if (online) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[9999] bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 shadow-lg">
      <WifiOff size={16} />
      You are offline — showing cached data
    </div>
  );
}
