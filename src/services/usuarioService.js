import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";

const USUARIOS_COLLECTION = "usuarios";

export const criarUsuario = async (usuarioData) => {
  try {
    const docRef = await addDoc(collection(db, USUARIOS_COLLECTION), {
      ...usuarioData,
      createdAt: new Date(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return { success: false, error: error.message };
  }
};

export const listarUsuarios = async () => {
  try {
    const q = query(collection(db, USUARIOS_COLLECTION), orderBy("nome"));
    const querySnapshot = await getDocs(q);
    const usuarios = [];
    querySnapshot.forEach((doc) => {
      usuarios.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: usuarios };
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return { success: false, error: error.message };
  }
};

export const buscarUsuarioPorId = async (id) => {
  try {
    const usuarioRef = doc(db, USUARIOS_COLLECTION, id);
    const docSnap = await getDoc(usuarioRef);
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: "Usuário não encontrado" };
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return { success: false, error: error.message };
  }
};

export const atualizarUsuario = async (id, usuarioData) => {
  try {
    const usuarioRef = doc(db, USUARIOS_COLLECTION, id);
    await updateDoc(usuarioRef, {
      ...usuarioData,
      updatedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return { success: false, error: error.message };
  }
};

export const deletarUsuario = async (id) => {
  try {
    await deleteDoc(doc(db, USUARIOS_COLLECTION, id));
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return { success: false, error: error.message };
  }
};
