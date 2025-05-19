import { createContext, useContext, useState } from "react";
import axios from "axios";
const AppContext = createContext({});

function getURL(link) {
  const parsedURL = new URL(link);
  // Get the protocol and hostname to create the base URL
  const baseURL = `${parsedURL.protocol}//${parsedURL.hostname}`;
  return baseURL;
}


const currentURL = window.location.href;
// let apiLink = `${getURL(currentURL)}/`;
let apiLink = `${getURL(currentURL)}/api/`;
export const useAxios = (tokenType: "admin" | "user") => {
  const axiosInstance = axios.create({
    baseURL: `${apiLink}`,
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
    token: localStorage.getItem("adminToken"),
    user: null,
    isLoading: false,
  });

  const [userAuth, setUserAuth] = useState({
    token: localStorage.getItem("userToken"),
    user: null,
    isLoading: false,
  });


  const [generateResponse, setGenerateResponse] = useState("");
  const [astroResult, setAstroResult] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  return (
    <AppContext.Provider
      value={{
        adminAuth,
        setAdminAuth,
        userAuth,
        setUserAuth,
        generateResponse,
        setGenerateResponse,
        astroResult,
        setAstroResult,
        mobileMenuOpen,
        setMobileMenuOpen,
        apiLink
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext); 
