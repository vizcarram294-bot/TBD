// routes/materiales.js
import express from 'express';
import sql from 'mssql';
const router = express.Router();

// Buscador paramétrico dinámico compuesto multi-atributo
router.get('/buscar', async (req, res) => {
    const { nombre, codigo, categoria } = req.query;
    try {
        let queryBase = `SELECT m.*, c.nombre_categoria 
                         FROM materiales m 
                         JOIN categorias c ON m.id_categoria = c.id_categoria 
                         WHERE 1=1`;
        
        const pool = await sql.connect();
        const request = pool.request();

        if (nombre) {
            queryBase += " AND m.nombre_material LIKE @nombre";
            request.input('nombre', sql.VarChar, `%${nombre}%`);
        }
        if (codigo) {
            queryBase += " AND m.codigo_material LIKE @codigo";
            request.input('codigo', sql.VarChar, `%${codigo}%`);
        }
        if (categoria) {
            queryBase += " AND c.nombre_categoria LIKE @categoria";
            request.input('categoria', sql.VarChar, `%${categoria}%`);
        }

        const result = await request.query(queryBase);
        res.json({ success: true, data: result.recordset });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;