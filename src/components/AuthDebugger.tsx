import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useEffect, useState } from 'react';

export const AuthDebugger = () => {
  const { user, session, profile, isLoading, isProfileLoading } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<string | null>(null);

  useEffect(() => {
    // Only show in development
    if (import.meta.env.MODE !== 'development') return;

    const checkLocalStorage = () => {
      const authData = localStorage.getItem('sb-fflomlvtgaqbzrjnvqaz-auth-token');
      setLocalStorageData(authData ? 'Present' : 'Not found');
    };

    checkLocalStorage();
    const interval = setInterval(checkLocalStorage, 1000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (import.meta.env.MODE !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Profile Loading: {isProfileLoading ? 'Yes' : 'No'}</div>
        <div>User: {user ? user.id : 'None'}</div>
        <div>Session: {session ? 'Active' : 'None'}</div>
        <div>Profile: {profile ? 'Loaded' : 'None'}</div>
        <div>Is Admin: {profile?.is_admin ? 'Yes' : 'No'}</div>
        <div>LocalStorage: {localStorageData}</div>
        <div>Session Expires: {session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}</div>
      </div>
    </div>
  );
};
