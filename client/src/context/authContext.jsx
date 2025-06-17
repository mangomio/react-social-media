import { createContext, useEffect, useState } from "react";
import axios from "axios";
export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [firstVisit, setFirstVisit] = useState(true); // 控制初次访问跳转

  const login = async (inputs) => {
    const res = await axios.post(
      "http://localhost:8800/api/auth/login",
      inputs,
      {
        withCredentials: true,
      }
    );
    setCurrentUser(res.data);
    setFirstVisit(false); // 登录后关闭首次访问标志
  };

  const updateUser = (updatedFields) => {
    const newUser = { ...currentUser, ...updatedFields };
    setCurrentUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, updateUser, firstVisit }}>
      {children}
    </AuthContext.Provider>
  );
};
