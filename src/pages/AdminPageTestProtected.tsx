import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AdminPageTestProtected = () => {
  console.log('🚀 AdminPageTestProtected - Iniciando...');
  
  const { user, profile, isLoading } = useAuth();
  
  console.log('🔍 AdminPageTestProtected - Dados de auth:');
  console.log('👤 User:', user);
  console.log('👤 Profile:', profile);
  console.log('👤 Is Admin:', profile?.is_admin);
  console.log('⏳ IsLoading:', isLoading);

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #333',
            borderTop: '4px solid #00ff00',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Carregando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ff6b6b' }}>Não Autenticado</h1>
          <p>Você precisa fazer login para acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (!profile?.is_admin) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ff6b6b' }}>Acesso Negado</h1>
          <p>Você não tem permissão de administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Admin Test Protected</h1>
        <p style={{ fontSize: '1.2rem', color: '#ccc' }}>ProtectedRoute funcionando!</p>
        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          backgroundColor: '#333', 
          borderRadius: '0.5rem',
          border: '1px solid #555'
        }}>
          <p>Usuário: {user.email}</p>
          <p>Admin: {profile?.is_admin ? 'Sim' : 'Não'}</p>
          <p>Nome: {profile?.full_name || 'Não informado'}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPageTestProtected;

