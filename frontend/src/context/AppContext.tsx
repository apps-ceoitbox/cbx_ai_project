import { createContext, useContext, useState } from "react";
import axios from "axios";
const AppContext = createContext({});

const apiUrl = window.location.href.includes("localhost") ? "http://localhost" : "https://api.prompt-ai.com";

export const useAxios = (tokenType: "admin" | "user") => {
  const axiosInstance = axios.create({
    baseURL: `${apiUrl}/api`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem(tokenType === "admin" ? "adminToken" : "userToken")}`,
    }
  });
  return axiosInstance;
}

export const useData = () => {
  const data = useContext(AppContext);
  return data as Record<string, any>;
}

export const AppProvider = ({ children }) => {
  const [adminAuth, setAdminAuth] = useState({
    token: localStorage.getItem("token"),
    user: null,
    isLoading: false,
  });

  const [userAuth, setUserAuth] = useState({
    token: localStorage.getItem("token"),
    user: null,
    isLoading: false,
  });

  return (
    <AppContext.Provider
      value={{
        adminAuth, setAdminAuth, userAuth, setUserAuth
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
