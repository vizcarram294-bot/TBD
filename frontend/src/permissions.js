const clienteResources = new Set(['clientes','proyectos','avance_proyecto','fases_proyecto','cotizaciones','pagos_cliente','plan_pagos']);
const auditorResources = new Set(['auditoria','intentos_login','usuarios','roles','permisos']);

function roleName(user) {
  return String(user?.rol || '').trim().toLowerCase();
}

export function isCliente(user) {
  return roleName(user) === 'cliente';
}

export function isAuditor(user) {
  return roleName(user) === 'auditor';
}

export function isAdmin(user, permissions = []) {
  return user?.demo === true || roleName(user) === 'administrador' || permissions.includes('*');
}

export function canDo(permissions = [], resource, operation, user = null) {
  const op = String(operation || '').toUpperCase();
  const res = String(resource || '').toLowerCase();

  // Regla fuerte: un usuario con rol Cliente SOLO puede consultar sus propios datos.
  // Aunque por error en BD tenga permisos extras, desde la interfaz no podrá añadir/editar/eliminar.
  if (isCliente(user)) {
    return op === 'SELECT' && clienteResources.has(res);
  }

  // Regla fuerte: Auditor solo visualiza seguridad/auditoría.
  if (isAuditor(user)) {
    return op === 'SELECT' && auditorResources.has(res);
  }

  if (isAdmin(user, permissions)) return true;
  return (permissions || []).some(p => {
    if (p === '*') return true;
    const tabla = String(p.tabla_objetivo || '').toLowerCase();
    const operacion = String(p.operacion || '').toUpperCase();
    return (tabla === res || tabla === '*') && (operacion === op || ['TODO','ALL','*'].includes(operacion));
  });
}

export function canSeeResource(permissions = [], resource, user = null) {
  return canDo(permissions, resource, 'SELECT', user);
}
