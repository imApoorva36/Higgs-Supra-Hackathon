"use client";
import React, { createContext, useState } from "react";
import { useContext } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [role, setRole] = useState(1);
  const [contract, setContract] = useState("");
  const { data: session } = useSession();

  async function handleGAuthCb() {
    if (session) {
      return session.id_token;
    }
    await signIn("google");
    return "";
  }

  return (
    <AppContext.Provider value={{ account, setAccount, role, setRole, contract, setContract }}>
        {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);