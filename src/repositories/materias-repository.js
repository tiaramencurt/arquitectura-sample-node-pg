import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import MateriasService from './../services/materias-service.js'

const router = Router();
const currentService = new MateriasService();

// Devuelve todas las materias (GET/api/materias)

router.get('', async (req, res) => {
    try {
        console.log(`MateriasController.get`);
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

// Devuelve una materia por su ID (GET /api/materias/:id)

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const returnEntity = await currentService.getByIdAsync(id);
        if (returnEntity != null) {
            res.status(StatusCodes.OK).json(returnEntity);
        } else {
            res.status(StatusCodes.NOT_FOUND).send(`No se encontró la materia (id: ${id}).`);
        }
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
    }
});

// Crea una nueva materia (POST /api/materias)

router.post('', async (req, res) => {
    try {
        const entity = req.body;
        const newId = await currentService.createAsync(entity);
        if (newId > 0) {
            res.status(StatusCodes.CREATED).json(newId);
        } else {
            res.status(StatusCodes.BAD_REQUEST).json(null);
        }
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
    }
});

 // Modifica una materia existente (PUT /api/materias/:id)

router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const entity = req.body;

        if (entity.id && parseInt(entity.id) !== id) {
            return res.status(StatusCodes.BAD_REQUEST).send(`El id de la URL (${id}) no coincide con el id del body (${entity.id}).`);
        }

        entity.id = id;
        const rowsAffected = await currentService.updateAsync(entity);
        if (rowsAffected != 0) {
            res.status(StatusCodes.OK).json(rowsAffected);
        } else {
            res.status(StatusCodes.NOT_FOUND).send(`No se encontró la materia (id: ${id}).`);
        }
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
    }
});

// Elimina una materia por su ID (DELETE /api/materias/:id)

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const rowCount = await currentService.deleteByIdAsync(id);
        if (rowCount != 0) {
            res.status(StatusCodes.OK).json(null);
        } else {
            res.status(StatusCodes.NOT_FOUND).send(`No se encontró la materia (id: ${id}).`);
        }
    } catch (error) {
        console.log(error);
        if (error.message.includes('calificaciones asociadas')) {
            res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
        }
    }
});

export default router;
