import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const AdminTest = () => {
  const { user, profile, isLoading, isProfileLoading } = useAuth();
  const [directCheck, setDirectCheck] = useState<any>(null);

  useEffect(() => {
    const checkAdminDirectly = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          setDirectCheck({ data, error });
        } catch (err) {
          setDirectCheck({ error: err });
        }
      }
    };

    checkAdminDirectly();
  }, [user]);

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Teste de Admin</h2>
      
      <div className="space-y-4">
        <div>
          <strong>Loading:</strong> {isLoading ? 'Sim' : 'Não'}
        </div>
        
        <div>
          <strong>Profile Loading:</strong> {isProfileLoading ? 'Sim' : 'Não'}
        </div>
        
        <div>
          <strong>User ID:</strong> {user?.id || 'Nenhum'}
        </div>
        
        <div>
          <strong>User Email:</strong> {user?.email || 'Nenhum'}
        </div>
        
        <div>
          <strong>Profile:</strong> {profile ? 'Carregado' : 'Não carregado'}
        </div>
        
        <div>
          <strong>Is Admin (Profile):</strong> {profile?.is_admin ? 'Sim' : 'Não'}
        </div>
        
        <div>
          <strong>Verificação Direta:</strong>
          {directCheck ? (
            <div className="ml-4 mt-2">
              <div>Erro: {directCheck.error ? 'Sim' : 'Não'}</div>
              {directCheck.error && (
                <div className="text-red-500 text-sm">
                  {JSON.stringify(directCheck.error, null, 2)}
                </div>
              )}
              {directCheck.data && (
                <div>
                  <div>ID: {directCheck.data.id}</div>
                  <div>Email: {directCheck.data.email}</div>
                  <div>Is Admin: {directCheck.data.is_admin ? 'Sim' : 'Não'}</div>
                </div>
              )}
            </div>
          ) : (
            ' Verificando...'
          )}
        </div>
      </div>
    </div>
  );
};

