import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';

const FIRST_LOGIN_KEY = 'wr-capacetes-first-login';

export const useFirstLogin = () => {
  const [isFirstLogin, setIsFirstLogin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  let user = null;
  try {
    const { user: authUser } = useAuth();
    user = authUser;
  } catch (error) {
    // Se o hook useAuth falhar, significa que não estamos dentro do SimpleAuthProvider
    console.log('useFirstLogin: Não está dentro do SimpleAuthProvider');
  }

  useEffect(() => {
    // Se não há usuário logado ou não estamos dentro do SimpleAuthProvider, não mostra loading
    if (!user) {
      setIsFirstLogin(false);
      setIsLoading(false);
      return;
    }

    // Verifica se é o primeiro login deste usuário
    const userFirstLoginKey = `${FIRST_LOGIN_KEY}-${user.id}`;
    const hasLoggedInBefore = localStorage.getItem(userFirstLoginKey);
    
    if (hasLoggedInBefore === null) {
      // Primeiro login - mostra loading
      setIsFirstLogin(true);
      setIsLoading(true);
    } else {
      // Já fez login antes - pula loading
      setIsFirstLogin(false);
      setIsLoading(false);
    }
  }, [user]);

  const markAsLoggedIn = () => {
    if (user) {
      const userFirstLoginKey = `${FIRST_LOGIN_KEY}-${user.id}`;
      localStorage.setItem(userFirstLoginKey, 'true');
      setIsFirstLogin(false);
      setIsLoading(false);
    }
  };

  return {
    isFirstLogin,
    isLoading,
    markAsLoggedIn
  };
};
