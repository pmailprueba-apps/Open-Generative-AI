import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getBarberia } from "./barberias";
import { getCitasPorFecha } from "./citas";
import type { HorarioDia, Cita } from "@/types/firebase";

const DIAS_KEYS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

export interface Slot {
  hora: string; // "09:00"
  disponible: boolean;
  barberosOcupados: { id: string; nombre: string }[];
  barberosLibres: { id: string; nombre: string }[];
  razon?: "pasado" | "margen" | "ocupado" | "cerrado";
}

/**
 * Genera la lista de horas base para una fecha y horario específicos.
 */
export function generarSlotsBase(horario: HorarioDia, duracion: number, fechaStr: string, margenMinutos: number = 30): Slot[] {
  try {
    if (!horario || !horario.abre || !horario.cierra || !horario.activo) return [];
    
    const slots: Slot[] = [];
    
    // Validar formato HH:mm
    if (typeof horario.abre !== "string" || !horario.abre.includes(":") || 
        typeof horario.cierra !== "string" || !horario.cierra.includes(":")) {
      return [];
    }

    const [hAbre, mAbre] = horario.abre.split(":").map(Number);
    const [hCierra, mCierra] = horario.cierra.split(":").map(Number);

    if (isNaN(hAbre) || isNaN(mAbre) || isNaN(hCierra) || isNaN(mCierra)) return [];

    const hoy = new Date();
    // Usar fecha local para comparación
    const hoyStr = hoy.getFullYear() + "-" + 
                  String(hoy.getMonth() + 1).padStart(2, '0') + "-" + 
                  String(hoy.getDate()).padStart(2, '0');
    
    const esHoy = fechaStr === hoyStr;

    let actual = new Date(fechaStr + "T00:00:00");
    if (isNaN(actual.getTime())) return [];
    actual.setHours(hAbre, mAbre, 0, 0);

    const fin = new Date(fechaStr + "T00:00:00");
    fin.setHours(hCierra, mCierra, 0, 0);

    const interval = duracion > 0 ? duracion : 30;
    
    // Límite de seguridad para evitar bucles infinitos
    let iterations = 0;
    while (actual < fin && iterations < 500) {
      iterations++;
      
      const hh = String(actual.getHours()).padStart(2, '0');
      const mm = String(actual.getMinutes()).padStart(2, '0');
      const hora = `${hh}:${mm}`;

      let disponible = true;
      let razon: Slot["razon"] = undefined;

      if (esHoy) {
        const tiempoMinimo = new Date(hoy.getTime() + margenMinutos * 60000);
        const yaPaso = actual < hoy;
        const enMargen = actual < tiempoMinimo && !yaPaso;

        if (yaPaso) {
          disponible = false;
          razon = "pasado";
        } else if (enMargen) {
          disponible = false;
          razon = "margen";
        }
      }

      slots.push({ 
        hora, 
        disponible,
        barberosLibres: [],
        barberosOcupados: [],
        razon
      });

      actual.setMinutes(actual.getMinutes() + interval);
    }

    return slots;
  } catch (e) {
    console.error("Error en generarSlotsBase:", e);
    return [];
  }
}

/**
 * Obtiene disponibilidad detallada por fecha.
 */
export async function disponibilidadPorFecha(
  barberiaId: string,
  fecha: string,
  barberoIdReq?: string,
  duracionMin: number = 30
): Promise<Slot[]> {
  try {
    if (!barberiaId || !fecha) return [];

    const barberia = await getBarberia(barberiaId);
    if (!barberia || !barberia.horarios) return [];

    // --- Validar días de anticipación ---
    const diasLimite = barberia.dias_anticipacion || 30;
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const fechaSolicitada = new Date(fecha + "T00:00:00");
    
    const diffTime = fechaSolicitada.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > diasLimite) {
      return [];
    }

    const dateObj = new Date(fecha + "T12:00:00");
    if (isNaN(dateObj.getTime())) return [];
    
    const diaSemana = dateObj.getDay();
    const diaKey = DIAS_KEYS[diaSemana];
    const horario = barberia.horarios[diaKey as keyof typeof barberia.horarios] as HorarioDia;

    if (!horario || !horario.abre || !horario.cierra || !horario.activo) return [];

    // 1. Obtener barberos de forma segura
    const barberosMap = new Map<string, { id: string; nombre: string }>();
    const queries = [
      query(collection(db, "usuarios"), where("barberia_id", "==", barberiaId), where("role", "==", "barbero")),
      query(collection(db, "usuarios"), where("barberiaId", "==", barberiaId), where("role", "==", "barbero")),
      query(collection(db, "empleados"), where("barberia_id", "==", barberiaId), where("rol", "==", "barbero")),
      query(collection(db, "empleados"), where("barberiaId", "==", barberiaId), where("rol", "==", "barbero"))
    ];

    const snapshots = await Promise.all(queries.map(q => getDocs(q).catch(() => ({ docs: [] } as any))));
    snapshots.forEach(snap => {
      snap.docs?.forEach((d: any) => {
        const data = d.data();
        if (data && !barberosMap.has(d.id)) {
          barberosMap.set(d.id, { 
            id: d.id, 
            nombre: data.nombre || data.displayName || data.email?.split("@")[0] || "Barbero" 
          });
        }
      });
    });

    const barberos = Array.from(barberosMap.values());
    if (barberos.length === 0) return [];

    // 2. Obtener citas
    const citas = await getCitasPorFecha(barberiaId, fecha).catch(() => []);
    
    // 3. Generar slots base (siempre paso 30 para tener granularidad)
    const margen = barberia.margen_reserva_minutos ?? 30;
    let slots = generarSlotsBase(horario, 30, fecha, margen);

    // 4. Calcular ocupación REAL por cada barbero en cada slot
    const slotsConOcupacion = slots.map(slot => {
      const [hS, mS] = slot.hora.split(":").map(Number);
      const minS = hS * 60 + mS;
      const durSlot = 30;

      const barberosOcupadosIds = new Set<string>();

      citas.forEach(c => {
        if (!c || !c.hora) return;
        const estado = c.estado || "pendiente";
        if (estado.includes("cancelada") || estado === "no_show") return;

        const [hC, mC] = c.hora.split(":").map(Number);
        const minC = hC * 60 + mC;
        const durC = c.duracion_min || 30;

        // Traslape de tiempos
        const solapa = (minS < minC + durC) && (minS + durSlot > minC);
        
        if (solapa && c.barberoId) {
          barberosOcupadosIds.add(c.barberoId);
        }
      });

      return {
        ...slot,
        barberosLibres: barberos.filter(b => !barberosOcupadosIds.has(b.id)),
        barberosOcupados: barberos.filter(b => barberosOcupadosIds.has(b.id))
      };
    });

    // 5. Filtrar disponibilidad final basándose en duracionMin
    return slotsConOcupacion.map((slot, index) => {
      let disponible = slot.disponible;
      if (!disponible) return slot;

      // Para este slot, ¿hay algún barbero que esté libre durante toda la duración?
      const barberosQueCumplen = slot.barberosLibres.filter(barbero => {
        // Si el usuario pidió un barbero específico, solo ese cuenta
        if (barberoIdReq && barberoIdReq !== "" && barberoIdReq !== "cualquiera") {
          if (barbero.id !== barberoIdReq) return false;
        }

        // Revisar slots consecutivos
        const numSlotsNecesarios = Math.ceil(duracionMin / 30);
        for (let i = 0; i < numSlotsNecesarios; i++) {
          const nextSlot = slotsConOcupacion[index + i];
          // Si no hay siguiente slot (fin del día) o el barbero está ocupado en ese slot
          if (!nextSlot || !nextSlot.barberosLibres.some(b => b.id === barbero.id)) {
            return false;
          }
        }
        return true;
      });

      return {
        ...slot,
        disponible: barberosQueCumplen.length > 0,
        barberosLibres: barberosQueCumplen
      };
    });
  } catch (e) {
    console.error("Error en disponibilidadPorFecha:", e);
    throw e; 
  }
}
