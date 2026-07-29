import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);


  useEffect(() => {

    const cancelar = onAuthStateChanged(auth, (user) => {

      setUsuario(user);
      setCarregando(false);

    });


    return () => cancelar();

  }, []);


  return (

    <AuthContext.Provider
      value={{
        usuario,
        carregando
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}


export function useAuth() {

  return useContext(AuthContext);

}