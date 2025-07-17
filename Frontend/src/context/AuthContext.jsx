import { createContext, useContext, useState, useEffect } from 'react';

// Create the context
export const AuthContext = createContext();

// Custom hook for convenience
export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from localStorage on app start
  // useEffect(() => {
  //   const storedUser = localStorage.getItem('user');
  //   if (storedUser) {
  //     setUser(JSON.parse(storedUser));
  //   }
  // }, []);

  // Save user to localStorage when it changes
  // useEffect(() => {
  //   if (user) {
  //     localStorage.setItem('user', JSON.stringify(user));
  //   } else {
  //     localStorage.removeItem('user');
  //   }
  // }, [user]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // if using JWT token
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
