import React, { createContext, useState, useEffect, useContext } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);

        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().tipo || "cliente");
        } else {
          await setDoc(doc(db, "usuarios", user.uid), {
            nome: user.displayName || user.email?.split("@")[0] || "Usuário",
            email: user.email,
            tipo: "cliente",
            telefone: "",
            empresa: "",
            createdAt: new Date(),
          });
          setUserRole("cliente");
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "usuarios", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "usuarios", user.uid), {
          nome: user.displayName || user.email?.split("@")[0] || "Usuário",
          email: user.email,
          tipo: "cliente",
          telefone: "",
          empresa: "",
          createdAt: new Date(),
        });
      }

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, nome, telefone, empresa) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Criar usuário no Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        nome: nome,
        email: email,
        tipo: "cliente",
        telefone: telefone || "",
        empresa: empresa || "",
        createdAt: new Date(),
      });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const isAdmin = () => {
    return userRole === "admin";
  };

  const value = {
    currentUser,
    userRole,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
