import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const getErrorMessages = (error, fallbackMessage) => {
  const validationErrors = error?.response?.data?.errors;
  if (validationErrors) {
    return Object.values(validationErrors).flat();
  }

  const apiMessage = error?.response?.data?.message;
  return [apiMessage || fallbackMessage];
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .getUser()
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { user: userData, token } = response;

      localStorage.setItem('token', token);
      setUser(userData);

      toast.success('Connexion reussie !');
      return { success: true };
    } catch (error) {
      const messages = getErrorMessages(error, 'Erreur lors de la connexion');
      messages.forEach((message) => toast.error(message));
      return { success: false, error: messages[0] };
    }
  };

  const register = async (name, email, password, passwordConfirmation) => {
    try {
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      const { user: userData, token } = response;

      localStorage.setItem('token', token);
      setUser(userData);

      toast.success('Inscription reussie !');
      return { success: true };
    } catch (error) {
      const messages = getErrorMessages(error, "Erreur lors de l'inscription");
      messages.forEach((message) => toast.error(message));
      return { success: false, error: messages[0] };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout failures and clear local state anyway.
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Deconnexion reussie');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
