"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { barberiaService } from "@/services/barberiaService";
import { Scissors, Clock, DollarSign, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Servicio } from "@/types/firebase";
import { formatPrecio } from "@/lib/utils";
import { SERVICIOS_CATALOGO } from "@/lib/constants";
import { toast } from "sonner";

export default function ServiciosPage() {
  const { user } = useAuth();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.barberia_id) {
      cargarServicios(user.barberia_id);
    }
  }, [user?.barberia_id]);

  const cargarServicios = async (barberiaId: string) => {
    try {
      const barberia = await barberiaService.getById(barberiaId);
      
      // Combinar catálogo con los servicios ya configurados
      const configurados = barberia?.servicios || [];
      
      const iniciales = SERVICIOS_CATALOGO.map(base => {
        const custom = configurados.find(s => s.id === base.id);
        return {
          id: base.id,
          nombre: base.nombre,
          duracion_min: custom?.duracion_min || base.duracion_default,
          precio: custom?.precio || base.precio_default,
          activo: custom ? custom.activo : false,
        };
      });

      setServicios(iniciales);
    } catch (e) {
      console.error(e);
      toast.error("Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: string) => {
    setServicios(prev => prev.map(s => 
      s.id === id ? { ...s, activo: !s.activo } : s
    ));
    setSuccess(false);
  };

  const handleChange = (id: string, field: "precio" | "duracion_min", value: number) => {
    setServicios(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
    setSuccess(false);
  };

  const saveServicios = async () => {
    if (!user?.barberia_id) return;
    setSaving(true);
    try {
      await barberiaService.update(user.barberia_id, { servicios });
      setSuccess(true);
      toast.success("Servicios actualizados correctamente");
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[var(--gold)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--white)]">Catálogo de Servicios</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Activa los servicios que ofreces y personaliza precios</p>
        </div>
        <button
          onClick={saveServicios}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[var(--gold)] text-[var(--dark)] font-bold hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-[var(--gold)]/20"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Guardar Cambios
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5" />
          Configuración guardada con éxito
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {servicios.map((s) => (
          <div 
            key={s.id} 
            className={`p-6 rounded-3xl bg-[var(--card)] border transition-all duration-300 ${
              s.activo 
                ? "border-[rgba(201,168,76,0.3)] shadow-[0_0_20px_rgba(201,168,76,0.05)]" 
                : "border-white/5 opacity-60"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => handleToggle(s.id)}
                  className={`w-14 h-7 rounded-full transition-all relative flex-shrink-0 ${s.activo ? "bg-[var(--gold)]" : "bg-[var(--dark)] border border-white/10"}`}
                >
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-[var(--dark)] transition-all ${s.activo ? "left-8" : "left-1"}`} />
                </button>
                
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${s.activo ? "bg-[var(--gold)]/20 text-[var(--gold)]" : "bg-white/5 text-[var(--muted)]"}`}>
                    <Scissors className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-black text-lg transition-colors ${s.activo ? "text-[var(--white)]" : "text-[var(--muted)]"}`}>
                      {s.nombre}
                    </h3>
                    {!s.activo && <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Inactivo</span>}
                  </div>
                </div>
              </div>

              {s.activo && (
                <div className="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-right-4">
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[10px] text-[var(--muted)] uppercase tracking-widest mb-1.5 font-bold">Precio (MXN)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gold)]" />
                      <input
                        type="number"
                        value={s.precio}
                        onChange={(e) => handleChange(s.id, "precio", Number(e.target.value))}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--dark)] border border-white/10 text-[var(--white)] font-bold focus:border-[var(--gold)] outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[10px] text-[var(--muted)] uppercase tracking-widest mb-1.5 font-bold">Duración (min)</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                      <input
                        type="number"
                        step="5"
                        value={s.duracion_min}
                        onChange={(e) => handleChange(s.id, "duracion_min", Number(e.target.value))}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--dark)] border border-white/10 text-[var(--white)] font-bold focus:border-[var(--gold)] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex gap-4">
        <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
        <div className="text-sm text-blue-200/80 leading-relaxed">
          <p className="font-bold text-blue-400 mb-1">Información sobre el Catálogo</p>
          <p>Los servicios marcados aquí aparecerán automáticamente en tu página de reservas. Los precios y tiempos que definas se usarán para calcular la disponibilidad de tus barberos y la acumulación de puntos de tus clientes.</p>
        </div>
      </div>
    </div>
  );
}
