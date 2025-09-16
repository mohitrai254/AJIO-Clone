// frontend/src/context/authContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const USER_KEY = "ajioUser";
const TOKEN_KEY = "accessToken";

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) {
        setUserState(JSON.parse(storedUser));
      } else {
        setUserState(null);
      }
    } catch (err) {
      setUserState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // login accepts { user, token } or a plain user object (backwards compat)
  const login = (payload) => {
    if (
      payload &&
      typeof payload === "object" &&
      ("user" in payload || "token" in payload)
    ) {
      const { user: userObj, token } = payload;
      if (token) localStorage.setItem(TOKEN_KEY, token);
      if (userObj) {
        localStorage.setItem(USER_KEY, JSON.stringify(userObj));
        setUserState(userObj);
      }
      return;
    }
    // fallback: plain user object
    const userObjFallback = payload || null;
    if (userObjFallback) {
      localStorage.setItem(USER_KEY, JSON.stringify(userObjFallback));
      setUserState(userObjFallback);
    } else {
      localStorage.removeItem(USER_KEY);
      setUserState(null);
    }
  };

  // Expose setUser (plain user object) for existing callers
  const setUser = (userObj) => {
    login(userObj);
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem(TOKEN_KEY) || !!user;
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, loading, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
