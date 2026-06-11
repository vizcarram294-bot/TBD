import { Router } from 'express';
import { getPool, sql } from '../config/db.js';
import { dependentOptionSources, optionSources } from '../resources/definitions.js';

const router = Router();

router.get('/:field', async (req, res, next) => {
  try {
    const field = req.params.field;
    const pool = await getPool();
    const dependsValue = req.query.dependsValue;
    const dep = dependentOptionSources[field];

    if (dep && dependsValue) {
      const result = await pool.request()
        .input('dependsValue', sql.Int, Number(dependsValue))
        .query(dep.query);
      return res.json(result.recordset);
    }

    const query = optionSources[field];
    if (!query) return res.json([]);
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (error) {
    next(error);
  }
});

export default router;
