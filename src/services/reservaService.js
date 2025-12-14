import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

const RESERVAS_COLLECTION = "reservas";

export const verificarConflito = async (espacoId, dataInicio, dataFim) => {
  try {
    const inicio = Timestamp.fromDate(new Date(dataInicio));
    const fim = Timestamp.fromDate(new Date(dataFim));

    const q = query(
      collection(db, RESERVAS_COLLECTION),
      where("espacoId", "==", espacoId),
      where("status", "!=", "cancelada"),
    );

    const querySnapshot = await getDocs(q);
    const conflitos = [];

    querySnapshot.forEach((doc) => {
      const reserva = doc.data();
      const reservaInicio = reserva.dataInicio.toDate();
      const reservaFim = reserva.dataFim.toDate();

      if (
        (inicio.toDate() >= reservaInicio && inicio.toDate() < reservaFim) ||
        (fim.toDate() > reservaInicio && fim.toDate() <= reservaFim) ||
        (inicio.toDate() <= reservaInicio && fim.toDate() >= reservaFim)
      ) {
        conflitos.push({ id: doc.id, ...reserva });
      }
    });

    return { success: true, conflitos: conflitos.length > 0, data: conflitos };
  } catch (error) {
    console.error("Erro ao verificar conflito:", error);
    return { success: false, error: error.message };
  }
};

export const criarReserva = async (reservaData) => {
  try {
    const conflitoCheck = await verificarConflito(
      reservaData.espacoId,
      reservaData.dataInicio,
      reservaData.dataFim,
    );

    if (conflitoCheck.conflitos) {
      return {
        success: false,
        error:
          "Conflito de horário detectado. O espaço já está reservado neste período.",
        conflitos: conflitoCheck.data,
      };
    }

    const docRef = await addDoc(collection(db, RESERVAS_COLLECTION), {
      ...reservaData,
      dataInicio: Timestamp.fromDate(new Date(reservaData.dataInicio)),
      dataFim: Timestamp.fromDate(new Date(reservaData.dataFim)),
      status: "pendente",
      createdAt: Timestamp.now(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Erro ao criar reserva:", error);
    return { success: false, error: error.message };
  }
};

export const listarReservas = async () => {
  try {
    const q = query(
      collection(db, RESERVAS_COLLECTION),
      orderBy("dataInicio", "desc"),
    );
    const querySnapshot = await getDocs(q);
    const reservas = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reservas.push({
        id: doc.id,
        ...data,
        dataInicio: data.dataInicio?.toDate(),
        dataFim: data.dataFim?.toDate(),
        createdAt: data.createdAt?.toDate(),
      });
    });
    return { success: true, data: reservas };
  } catch (error) {
    console.error("Erro ao listar reservas:", error);
    return { success: false, error: error.message };
  }
};

export const buscarReservasPorEspaco = async (espacoId) => {
  try {
    const q = query(
      collection(db, RESERVAS_COLLECTION),
      where("espacoId", "==", espacoId),
      orderBy("dataInicio"),
    );
    const querySnapshot = await getDocs(q);
    const reservas = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reservas.push({
        id: doc.id,
        ...data,
        dataInicio: data.dataInicio?.toDate(),
        dataFim: data.dataFim?.toDate(),
      });
    });
    return { success: true, data: reservas };
  } catch (error) {
    console.error("Erro ao buscar reservas por espaço:", error);
    return { success: false, error: error.message };
  }
};

export const buscarReservasPorUsuario = async (usuarioId) => {
  try {
    const q = query(
      collection(db, RESERVAS_COLLECTION),
      where("usuarioId", "==", usuarioId),
      orderBy("dataInicio", "desc"),
    );
    const querySnapshot = await getDocs(q);
    const reservas = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reservas.push({
        id: doc.id,
        ...data,
        dataInicio: data.dataInicio?.toDate(),
        dataFim: data.dataFim?.toDate(),
      });
    });
    return { success: true, data: reservas };
  } catch (error) {
    console.error("Erro ao buscar reservas por usuário:", error);
    return { success: false, error: error.message };
  }
};

export const atualizarReserva = async (id, reservaData) => {
  try {
    const reservaRef = doc(db, RESERVAS_COLLECTION, id);
    const updateData = { ...reservaData };

    if (reservaData.dataInicio) {
      updateData.dataInicio = Timestamp.fromDate(
        new Date(reservaData.dataInicio),
      );
    }
    if (reservaData.dataFim) {
      updateData.dataFim = Timestamp.fromDate(new Date(reservaData.dataFim));
    }

    updateData.updatedAt = Timestamp.now();

    await updateDoc(reservaRef, updateData);
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar reserva:", error);
    return { success: false, error: error.message };
  }
};

export const cancelarReserva = async (id) => {
  try {
    const reservaRef = doc(db, RESERVAS_COLLECTION, id);
    await updateDoc(reservaRef, {
      status: "cancelada",
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao cancelar reserva:", error);
    return { success: false, error: error.message };
  }
};

export const aceitarReserva = async (id) => {
  try {
    const reservaRef = doc(db, RESERVAS_COLLECTION, id);
    await updateDoc(reservaRef, {
      status: "confirmada",
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao aceitar reserva:", error);
    return { success: false, error: error.message };
  }
};

export const rejeitarReserva = async (id) => {
  try {
    const reservaRef = doc(db, RESERVAS_COLLECTION, id);
    await updateDoc(reservaRef, {
      status: "cancelada",
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao rejeitar reserva:", error);
    return { success: false, error: error.message };
  }
};

export const deletarReserva = async (id) => {
  try {
    await deleteDoc(doc(db, RESERVAS_COLLECTION, id));
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar reserva:", error);
    return { success: false, error: error.message };
  }
};

export const obterEstatisticasReservas = async () => {
  try {
    const q = query(collection(db, RESERVAS_COLLECTION));
    const querySnapshot = await getDocs(q);

    let total = 0;
    let pendentes = 0;
    let confirmadas = 0;
    let canceladas = 0;

    querySnapshot.forEach((doc) => {
      total++;
      const status = doc.data().status;
      if (status === "pendente") pendentes++;
      else if (status === "confirmada") confirmadas++;
      else if (status === "cancelada") canceladas++;
    });

    return {
      success: true,
      data: {
        total,
        pendentes,
        confirmadas,
        canceladas,
      },
    };
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    return { success: false, error: error.message };
  }
};
