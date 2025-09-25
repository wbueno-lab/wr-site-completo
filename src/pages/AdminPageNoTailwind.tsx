import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AdminPageNoTailwind = () => {
  console.log('🚀 AdminPageNoTailwind - Iniciando...');
  
  const { user, profile, isLoading } = useAuth();
  
  console.log('🔍 AdminPageNoTailwind - Dados de auth:');
  console.log('👤 User:', user);
  console.log('👤 Profile:', profile);
  console.log('👤 Is Admin:', profile?.is_admin);
  console.log('⏳ IsLoading:', isLoading);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    },
    content: {
      textAlign: 'center' as const,
      maxWidth: '600px',
      padding: '2rem'
    },
    title: {
      fontSize: '3rem',
      marginBottom: '1rem',
      color: '#00ff00'
    },
    subtitle: {
      fontSize: '1.2rem',
      color: '#ccc',
      marginBottom: '2rem'
    },
    card: {
      marginTop: '2rem',
      padding: '1.5rem',
      backgroundColor: '#333',
      borderRadius: '0.5rem',
      border: '1px solid #555'
    },
    loading: {
      width: '48px',
      height: '48px',
      border: '4px solid #333',
      borderTop: '4px solid #00ff00',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 16px'
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.loading}></div>
          <p>Carregando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={{...styles.title, color: '#ff6b6b'}}>Não Autenticado</h1>
          <p>Você precisa fazer login para acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (!profile?.is_admin) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <h1 style={{...styles.title, color: '#ff6b6b'}}>Acesso Negado</h1>
          <p>Você não tem permissão de administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Admin No Tailwind</h1>
        <p style={styles.subtitle}>Funcionando sem Tailwind CSS!</p>
        <div style={styles.card}>
          <p><strong>Usuário:</strong> {user.email}</p>
          <p><strong>Admin:</strong> {profile?.is_admin ? 'Sim' : 'Não'}</p>
          <p><strong>Nome:</strong> {profile?.full_name || 'Não informado'}</p>
          <p><strong>Status:</strong> ✅ Tudo funcionando!</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPageNoTailwind;

