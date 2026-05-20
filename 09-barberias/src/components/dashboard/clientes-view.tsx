"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { Usuario } from "@/types/firebase";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Loader2, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  Clock,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

export function ClientesView() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [pendientes, setPendientes] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const cargarDatos = async () => {
    if (!user?.barberia_id) return;
    try {
      setLoading(true);
      
      // Obtener clientes únicos a partir de las citas de la barbería
      const token = await user.getIdToken();
      
      // Si es barbero, solo ver sus propios clientes
      const barberoParam = user.role === "barbero" && user.barbero_id
        ? `&barberoId=${user.barbero_id}`
        : "";
      
      const citasRes = await fetch(
        `/api/barberias/${user.barberia_id}/citas?limit=500${barberoParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!citasRes.ok) throw new Error("Error al cargar citas");
      
      const citas: any[] = await citasRes.json();
      
      // Agrupar clientes únicos por clienteId
      const clienteMap = new Map<string, any>();
      for (const cita of citas) {
        const cId = cita.clienteId || cita.cliente_id;
        if (cId && !clienteMap.has(cId)) {
          clienteMap.set(cId, {
            uid: cId,
            nombre: cita.cliente_nombre || "Cliente",
            email: "",
            role: "cliente",
            activo: true,
          });
        }
      }

      // Enriquecer con datos reales del usuario desde Firestore
      const db = (await import("@/lib/firebase")).db;
      const { doc, getDoc } = await import("firebase/firestore");
      
      const clientesEnriquecidos: Usuario[] = await Promise.all(
        Array.from(clienteMap.values()).map(async (c) => {
          try {
            const snap = await getDoc(doc(db, "usuarios", c.uid));
            if (snap.exists()) {
              return { uid: c.uid, ...snap.data() } as Usuario;
            }
          } catch {}
          return c as Usuario;
        })
      );

      const activos = clientesEnriquecidos.filter(c => c.activo !== false);
      const inactivos = clientesEnriquecidos.filter(c => c.activo === false);

      setClientes(activos);
      setPendientes(inactivos);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [user?.barberia_id]);

  const handleAprobar = async (uid: string) => {
    try {
      await userService.update(uid, { activo: true });
      toast.success("Cliente aprobado correctamente");
      cargarDatos();
    } catch (e) {
      toast.error("Error al aprobar cliente");
    }
  };

  const handleRechazar = async (uid: string) => {
    if (!confirm("¿Estás seguro de rechazar esta solicitud? El usuario no podrá usar los servicios de la barbería.")) return;
    try {
      await userService.update(uid, { barberia_id: null, role: "usuario", activo: false });
      toast.success("Solicitud rechazada");
      cargarDatos();
    } catch (e) {
      toast.error("Error al rechazar solicitud");
    }
  };

  const filtrados = clientes.filter(c => 
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
        <p className="text-[var(--muted)] animate-pulse">Cargando base de clientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--white)] tracking-tight">Base de Clientes</h1>
          <p className="text-sm text-[var(--muted)] mt-1 flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--gold)]" />
            Gestiona y valida el acceso de tus clientes
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl bg-[var(--card)] border border-[rgba(201,168,76,0.18)] text-sm text-[var(--white)] focus:border-[var(--gold)] outline-none transition-all w-full md:w-80 shadow-inner"
          />
        </div>
      </div>

      {/* Solicitudes Pendientes */}
      {pendientes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-[var(--gold)] uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Nuevos Clientes por Validar ({pendientes.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendientes.map((cliente) => (
              <div 
                key={cliente.uid}
                className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 transition-all hover:bg-amber-500/10 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500">
                      {cliente.foto_url ? (
                        <img src={cliente.foto_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Users className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--white)]">{cliente.nombre || "Nuevo Cliente"}</h3>
                      <p className="text-xs text-[var(--muted)] flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {cliente.email}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-2">
                  <button 
                    onClick={() => handleAprobar(cliente.uid)}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow-md shadow-amber-500/20"
                  >
                    <UserCheck className="w-4 h-4" />
                    ACEPTAR
                  </button>
                  <button 
                    onClick={() => handleRechazar(cliente.uid)}
                    className="px-3 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Clientes Validados */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-[var(--muted)] uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          Clientes Validados
        </h2>
        
        <div className="rounded-2xl border border-[rgba(201,168,76,0.12)] bg-[var(--card)] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-bold text-[var(--gold)] uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--gold)] uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--gold)] uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-xs font-bold text-[var(--gold)] uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(201,168,76,0.05)]">
                {filtrados.length > 0 ? filtrados.map((cliente) => (
                  <tr key={cliente.uid} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)] overflow-hidden">
                          {cliente.foto_url ? (
                            <img src={cliente.foto_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--white)]">{cliente.nombre}</p>
                          <p className="text-[10px] text-[var(--muted)] uppercase tracking-tighter">ID: {cliente.uid.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck className="w-3 h-3" />
                        Validado
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs text-[var(--white)] flex items-center gap-1.5 font-medium">
                          <Mail className="w-3.5 h-3.5 text-[var(--gold)]" /> {cliente.email}
                        </p>
                        {cliente.telefono && (
                          <p className="text-xs text-[var(--muted)] flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[var(--muted)]" /> {cliente.telefono}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[var(--muted)] hover:text-[var(--gold)] transition-colors p-2 rounded-lg hover:bg-[var(--gold)]/10">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-[var(--muted)]">
                      <div className="flex flex-col items-center gap-3 opacity-20">
                        <Users className="w-16 h-16" />
                        <p className="font-medium">No hay clientes validados que coincidan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
