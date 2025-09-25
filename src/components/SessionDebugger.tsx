import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const SessionDebugger = () => {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [localStorageInfo, setLocalStorageInfo] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        setSessionInfo({
          session: session ? {
            user: session.user ? {
              id: session.user.id,
              email: session.user.email,
              created_at: session.user.created_at
            } : null,
            expires_at: session?.expires_at,
            access_token: session?.access_token ? 'Present' : 'Missing'
          } : null,
          error: error?.message || null
        });

        // Check localStorage
        const authKey = 'sb-fflomlvtgaqbzrjnvqaz-auth-token';
        const authData = localStorage.getItem(authKey);
        
        setLocalStorageInfo({
          key: authKey,
          exists: !!authData,
          data: authData ? 'Present' : 'Missing',
          parsed: authData ? JSON.parse(authData) : null
        });

      } catch (error) {
        console.error('Error checking session:', error);
        setSessionInfo({ error: 'Error checking session' });
      }
    };

    checkSession();
    
    // Check every 2 seconds
    const interval = setInterval(checkSession, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2 text-green-400">Session Debug</h3>
      
      <div className="space-y-2">
        <div>
          <strong className="text-blue-400">Session:</strong>
          {sessionInfo?.session ? (
            <div className="ml-2">
              <div>User ID: {sessionInfo.session.user?.id || 'None'}</div>
              <div>Email: {sessionInfo.session.user?.email || 'None'}</div>
              <div>Expires: {sessionInfo.session.expires_at ? new Date(sessionInfo.session.expires_at * 1000).toLocaleString() : 'N/A'}</div>
              <div>Token: {sessionInfo.session.access_token}</div>
            </div>
          ) : (
            <span className="text-red-400">No session</span>
          )}
        </div>
        
        {sessionInfo?.error && (
          <div className="text-red-400">
            <strong>Error:</strong> {sessionInfo.error}
          </div>
        )}
        
        <div>
          <strong className="text-yellow-400">LocalStorage:</strong>
          <div className="ml-2">
            <div>Key: {localStorageInfo?.key}</div>
            <div>Exists: {localStorageInfo?.exists ? 'Yes' : 'No'}</div>
            <div>Data: {localStorageInfo?.data}</div>
            {localStorageInfo?.parsed && (
              <div>
                <div>Current User: {localStorageInfo.parsed.current_user?.id || 'None'}</div>
                <div>Access Token: {localStorageInfo.parsed.access_token ? 'Present' : 'Missing'}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

