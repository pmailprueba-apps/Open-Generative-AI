import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { Role } from "@/types/roles";
import { verifyAuth } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar quién hace la petición
    let caller;
    try {
      caller = await verifyAuth(request);
    } catch (authError: any) {
      return NextResponse.json({ error: authError.message }, { status: 401 });
    }

    const body = await request.json();
    const { role, barberia_id, barbero_id } = body as {
      uid?: string;
      email?: string;
      role: Role;
      barberia_id?: string;
      barbero_id?: string;
    };

    let targetUid = body.uid;
    const auth = getAdminAuth();

    // Si no hay UID pero hay email, buscar el usuario
    if (!targetUid && body.email) {
      try {
        const userRecord = await auth.getUserByEmail(body.email);
        targetUid = userRecord.uid;
      } catch (e) {
        return NextResponse.json({ error: "No se encontró ningún usuario con ese correo electrónico" }, { status: 404 });
      }
    }

    if (!targetUid) targetUid = caller.uid;

    // 2. Lógica de Autorización Progresiva
    let authorized = false;
    let reason = "";

    // REGLA 1: Superadmin puede hacer todo
    if (caller.role === "superadmin") {
      authorized = true;
    } 
    // REGLA 2: Un usuario sin rol puede asignarse 'usuario' o 'cliente' a sí mismo
    else if (!caller.role && targetUid === caller.uid) {
      if (role === "usuario" || role === "cliente") {
        authorized = true;
      } else {
        reason = "Solo puedes asignarte el rol de usuario o cliente inicialmente";
      }
    }
    // REGLA 3: Un Admin puede asignar roles dentro de su propia barbería
    else if (caller.role === "admin" && caller.barberia_id) {
      if (barberia_id === caller.barberia_id) {
        // Solo puede promover a barbero o admin (co-administrador)
        if (role === "barbero" || role === "admin") {
          authorized = true;
        } else {
          reason = "Un admin solo puede asignar roles de barbero o admin en su barbería";
        }
      } else {
        reason = "No puedes asignar roles para otra barbería";
      }
    }

    if (!authorized) {
      return NextResponse.json({ 
        error: "No tienes permiso para realizar esta acción", 
        details: reason 
      }, { status: 403 });
    }

    if (!targetUid || !role) {
      return NextResponse.json({ error: "uid y role son requeridos" }, { status: 400 });
    }

    // 3. Aplicar Claims
    const claims: Record<string, unknown> = { role };
    if (barberia_id) claims.barberia_id = barberia_id;
    if (barbero_id) claims.barbero_id = barbero_id;

    await auth.setCustomUserClaims(targetUid, claims);
    
    // 4. Sincronizar con Firestore
    const db = getAdminDb();
    const updateData: any = {
      role: role,
      barberia_id: barberia_id || null,
      barbero_id: barbero_id || (role === "barbero" ? targetUid : null),
      updatedAt: new Date(),
    };

    // Si es un barbero nuevo o un cliente nuevo siendo asignado, empezar como inactivo (pendiente de validación)
    if ((role === "barbero" && caller.role === "admin") || role === "cliente") {
      updateData.activo = false;
    }

    await db.collection("usuarios").doc(targetUid).set(updateData, { merge: true });

    console.log(`Auth Security: Claims updated for ${targetUid} by ${caller.uid}. Role: ${role}, Activo: ${updateData.activo ?? 'N/A'}`);
    
    return NextResponse.json({ success: true, claims });
  } catch (error: any) {
    console.error("Auth Security Error:", error.message, error.stack);
    return NextResponse.json({ 
      error: "Error procesando la solicitud", 
      details: error.message 
    }, { status: 500 });
  }
}
