import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import CalificacionesService from './../services/calificaciones-service.js'

const router = Router();
const currentService = new CalificacionesService();

// Devuelve todas las calificaciones con el nombre del alumno y el nombre de la materia (no solo los IDs). (GET /api/calificaciones)
router.get('', async (req, res) => {
    try {
        console.log(`CalificacionesController.get`);
        const returnArray = await currentService.getAllAsync();
        if (returnArray != null) {
            res.status(StatusCodes.OK).json(returnArray);
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error interno.`);
        }
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
    }
});

// Devuelve todas las calificaciones de un alumno específico, con el nombre de la materia. (GET /api/calificaciones/alumno/:idAlumno)
router.get('/alumno/:idAlumno', async (req, res) => {
    try {
        const idAlumno = req.params.idAlumno;
        const returnArray = await currentService.getByAlumnoAsync(idAlumno);
        res.status(StatusCodes.OK).json(returnArray);
    } catch (error) {
        console.log(error);
        if (error.message.includes('no existe')) {
            res.status(StatusCodes.NOT_FOUND).send(`Error: ${error.message}`);
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
        }
    }
});

// Devuelve una calificación por su ID, con los nombres (misma query con JOIN que el GET de todos, pero filtrada por calificaciones.id). (GET /api/calificaciones/:id)
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const returnEntity = await currentService.getByIdAsync(id);
        if (returnEntity != null) {
            res.status(StatusCodes.OK).json(returnEntity);
        } else {
            res.status(StatusCodes.NOT_FOUND).send(`No se encontró la calificación (id: ${id}).`);
        }
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
    }
});

// Crea una nueva calificación. Este es el endpoint con más validaciones del TP. (POST /api/calificaciones)
router.post('', async (req, res) => {
    try {
        const entity = req.body;
        const newEntity = await currentService.createAsync(entity);
        if (newEntity != null) {
            res.status(StatusCodes.CREATED).json(newEntity);
        } else {
            res.status(StatusCodes.BAD_REQUEST).json(null);
        }
    } catch (error) {
        console.log(error);
        if (error.statusCode === 409) {
            res.status(StatusCodes.CONFLICT).json({ error: error.message });
        } else {
            res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    }
});

// Modifica una calificación existente. Solo se puede cambiar la nota y/o la fecha. (PUT /api/calificaciones/:id)
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const entity = req.body;

        // Ignora id_alumno y id_materia si vienen en el body
        delete entity.id_alumno;
        delete entity.id_materia;

        entity.id = id;
        const rowsAffected = await currentService.updateAsync(entity);
        res.status(StatusCodes.OK).json(rowsAffected);
    } catch (error) {
        console.log(error);
        if (error.message.includes('No se encontró la calificación')) {
            res.status(StatusCodes.NOT_FOUND).send(`Error: ${error.message}`);
        } else {
            res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
        }
    }
});

// Elimina una calificación por su ID. (DELETE /api/calificaciones/:id)
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const rowCount = await currentService.deleteByIdAsync(id);
        if (rowCount != 0) {
            res.status(StatusCodes.OK).json(null);
        } else {
            res.status(StatusCodes.NOT_FOUND).send(`No se encontró la calificación (id: ${id}).`);
        }
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
    }
});

export default router;
