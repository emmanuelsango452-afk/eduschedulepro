import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [token, setToken] = useState(null);
  const [chargement, setChargement] = useState(true);

  // Au démarrage, récupérer le token sauvegardé
  useEffect(() => {
    const tokenSauvegarde = localStorage.getItem("edutrack_token");
    const userSauvegarde  = localStorage.getItem("edutrack_user");

    if (tokenSauvegarde && userSauvegarde) {
      setToken(tokenSauvegarde);
      setUtilisateur(JSON.parse(userSauvegarde));
    }
    setChargement(false);
  }, []);

  // Connexion
  const connecter = (tokenRecu, userRecu) => {
    setToken(tokenRecu);
    setUtilisateur(userRecu);
    localStorage.setItem("edutrack_token", tokenRecu);
    localStorage.setItem("edutrack_user", JSON.stringify(userRecu));
  };

  // Déconnexion
  const deconnecter = () => {
    setToken(null);
    setUtilisateur(null);
    localStorage.removeItem("edutrack_token");
    localStorage.removeItem("edutrack_user");
  };

  return (
    <AuthContext.Provider value={{
      utilisateur, token, chargement, connecter, deconnecter
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé
export function useAuth() {
  return useContext(AuthContext);
}