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

const ESPACOS_COLLECTION = "espacos";

export const criarEspaco = async (espacoData) => {
  try {
    const dadosNormalizados = {
      ...espacoData,

      tipo: espacoData.tipo ? espacoData.tipo.toLowerCase() : "sala",

      localizacao: espacoData.localizacao || espacoData.localização || "",
      createdAt: new Date(),
      disponivel:
        espacoData.disponivel !== undefined ? espacoData.disponivel : true,
    };
    // Remover localização com ç se existir
    if (dadosNormalizados.localização) {
      delete dadosNormalizados.localização;
    }

    const docRef = await addDoc(
      collection(db, ESPACOS_COLLECTION),
      dadosNormalizados,
    );
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Erro ao criar espaço:", error);
    return { success: false, error: error.message };
  }
};

// Listar todos os espaços
export const listarEspacos = async () => {
  try {
    const q = query(collection(db, ESPACOS_COLLECTION), orderBy("nome"));
    const querySnapshot = await getDocs(q);
    const espacos = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      const espacoNormalizado = {
        id: doc.id,
        ...data,

        localizacao: data.localizacao || data.localização || "",
        // Normalizar tipo para minúsculo
        tipo: data.tipo ? data.tipo.toLowerCase() : "sala",
      };
      espacos.push(espacoNormalizado);
    });
    return { success: true, data: espacos };
  } catch (error) {
    console.error("Erro ao listar espaços:", error);
    return { success: false, error: error.message };
  }
};

export const buscarEspacoPorId = async (id) => {
  try {
    const espacoRef = doc(db, ESPACOS_COLLECTION, id);
    const docSnap = await getDoc(espacoRef);
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: "Espaço não encontrado" };
  } catch (error) {
    console.error("Erro ao buscar espaço:", error);
    return { success: false, error: error.message };
  }
};

export const atualizarEspaco = async (id, espacoData) => {
  try {
    const espacoRef = doc(db, ESPACOS_COLLECTION, id);

    const dadosNormalizados = {
      ...espacoData,
      tipo: espacoData.tipo ? espacoData.tipo.toLowerCase() : "sala",
      localizacao: espacoData.localizacao || espacoData.localização || "",
      updatedAt: new Date(),
    };
    // Remover localização com ç se existir
    if (dadosNormalizados.localização) {
      delete dadosNormalizados.localização;
    }

    await updateDoc(espacoRef, dadosNormalizados);
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar espaço:", error);
    return { success: false, error: error.message };
  }
};

// Deletar espaço
export const deletarEspaco = async (id) => {
  try {
    await deleteDoc(doc(db, ESPACOS_COLLECTION, id));
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar espaço:", error);
    return { success: false, error: error.message };
  }
};

// Filtrar espaços por tipo
export const filtrarEspacosPorTipo = async (tipo) => {
  try {
    const q = query(
      collection(db, ESPACOS_COLLECTION),
      where("tipo", "==", tipo),
      orderBy("nome"),
    );
    const querySnapshot = await getDocs(q);
    const espacos = [];
    querySnapshot.forEach((doc) => {
      espacos.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: espacos };
  } catch (error) {
    console.error("Erro ao filtrar espaços:", error);
    return { success: false, error: error.message };
  }
};
