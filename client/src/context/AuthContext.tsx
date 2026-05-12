// import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";
// import { apiUrl } from "../config/api";

// const AuthContext = createContext<any>(null);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<null |  any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     axios
//       .get(apiUrl("/api/auth/me"), { withCredentials: true })
//       .then((res) => setUser(res.data.user))
//       .catch(() => setUser(null))
//       .finally(() => setLoading(false));
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, loading, setUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);


import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../config/api";

const AuthContext = createContext<any>(null);

// Helper to get stored token
// eslint-disable-next-line react-refresh/only-export-components
export const getToken = () => localStorage.getItem('auth_token');
// eslint-disable-next-line react-refresh/only-export-components
export const setToken = (token: string) => localStorage.setItem('auth_token', token);
// eslint-disable-next-line react-refresh/only-export-components
export const clearToken = () => localStorage.removeItem('auth_token');

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<null | any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    axios
      .get(apiUrl("/api/auth/me"), {
        headers: { Authorization: `Bearer ${token}` }, // ← header not cookie
      })
      .then((res) => setUser(res.data.user))
      .catch(() => {
        clearToken(); // ← clear invalid token
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);