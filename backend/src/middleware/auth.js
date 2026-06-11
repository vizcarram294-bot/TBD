import jwt from 'jsonwebtoken';
import { getPool, sql } from '../config/db.js';

export function authenticateToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Debes iniciar sesión.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch {
    return res.status(401).json({ message: 'Sesión vencida o token inválido. Vuelve a iniciar sesión.' });
  }
}

function roleName(user) {
  return String(user?.rol || '').trim().toLowerCase();
}

function isAdmin(user) {
  return user?.demo === true || roleName(user) === 'administrador';
}

function isCliente(user) {
  return roleName(user) === 'cliente';
}

function isAuditor(user) {
  return roleName(user) === 'auditor';
}

const clienteResources = new Set(['clientes','proyectos','avance_proyecto','fases_proyecto','cotizaciones','pagos_cliente','plan_pagos']);
const auditorResources = new Set(['auditoria','intentos_login','usuarios','roles','permisos']);

export function requirePermission(operation) {
  return async (req, res, next) => {
    try {
      if (isAdmin(req.user)) return next();
      const resource = req.params.resource;
      if (!resource) return next();

      // Regla fuerte para clientes: solo lectura de sus propios módulos.
      // Esto protege aunque en la tabla permisos alguien haya cargado INSERT/UPDATE/DELETE por error.
      if (isCliente(req.user)) {
        if (operation !== 'SELECT' || !clienteResources.has(String(resource).toLowerCase())) {
          return res.status(403).json({ message: 'El rol Cliente solo puede consultar sus datos. No puede añadir, editar ni eliminar.' });
        }
        return next();
      }
      // Regla fuerte para Auditor: solo lectura de seguridad y auditoría.
      // Aunque en la BD le carguen permisos INSERT/UPDATE/DELETE por error, se bloquea aquí.
      if (isAuditor(req.user)) {
        if (operation !== 'SELECT' || !auditorResources.has(String(resource).toLowerCase())) {
          return res.status(403).json({ message: 'El rol Auditor solo puede consultar auditoría, intentos, usuarios, roles y permisos.' });
        }
        return next();
      }

      const pool = await getPool();
      const result = await pool.request()
        .input('id_usuario', sql.Int, Number(req.user?.id_usuario || 0))
        .input('tabla', sql.VarChar(80), resource)
        .input('operacion', sql.VarChar(20), operation)
        .query(`
          SELECT TOP 1 p.id_permiso
          FROM usuario_rol ur
          INNER JOIN permisos p ON p.id_rol = ur.id_rol
          WHERE ur.id_usuario = @id_usuario
            AND (LOWER(p.tabla_objetivo) = LOWER(@tabla) OR p.tabla_objetivo = '*')
            AND (UPPER(p.operacion) = UPPER(@operacion) OR UPPER(p.operacion) IN ('TODO','ALL','*'))
        `);
      if (!result.recordset.length) {
        return res.status(403).json({ message: `No tienes permiso ${operation} sobre ${resource}.` });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
