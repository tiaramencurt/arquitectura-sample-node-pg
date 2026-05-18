import CalificacionesRepository from '../repositories/calificaciones-repository.js';
import AlumnosService from './alumnos-service.js';
import MateriasService from './materias-service.js';

export default class CalificacionesService {
    constructor() {
        console.log('Estoy en: CalificacionesService.constructor()');
        this.CalificacionesRepository = new CalificacionesRepository();
        this.AlumnosService  = new AlumnosService();
        this.MateriasService = new MateriasService();
    }

    // Obtiene todas las calificaciones
    getAllAsync = async () => {
        console.log(`CalificacionesService.getAllAsync()`);
        // Llama al repository para traer los datos
        const returnArray = await this.CalificacionesRepository.getAllAsync();
        return returnArray;
    }

    // Busca una calificación por su id
    getByIdAsync = async (id) => {
        console.log(`CalificacionesService.getByIdAsync(${id})`);
        // Llama al repository para traer los datos
        const returnEntity = await this.CalificacionesRepository.getByIdAsync(id);
        return returnEntity;
    }

    // Obtiene todas las calificaciones de un alumno
    getByAlumnoAsync = async (idAlumno) => {
        console.log(`CalificacionesService.getByAlumnoAsync(${idAlumno})`);
        // Validación: nos fijamos si el alumno existe
        await this.validarAlumnoExiste(idAlumno);
        // Si existe buscamos las calificaciones
        const returnArray = await this.CalificacionesRepository.getByAlumnoAsync(idAlumno);
        return returnArray;
    }

    createAsync = async (entity) => {
        console.log(`CalificacionesService.createAsync(${JSON.stringify(entity)})`);

        // Validación 1: nos fijamos sii la nota es entre 0 y 10
        this.validarNota(entity?.nota);
        // Validación 2: nos fijamos sii el alumno existe
        await this.validarAlumnoExiste(entity?.id_alumno);
        // Validación 3: nos fijamos sii la materia existe
        await this.validarMateriaExiste(entity?.id_materia);
        // Validación 4: nos fijamos sii no existe una calificaci{on para el alumno en esa materia
        const existente = await this.CalificacionesRepository.getByAlumnoAndMateriaAsync(
            entity.id_alumno,
            entity.id_materia
        );
        if (existente != null) {
            const error = new Error(`Ya existe una calificación para el alumno ${entity.id_alumno} en la materia ${entity.id_materia}.`);
            error.statusCode = 409;
            throw error;
        }

        const newEntity = await this.CalificacionesRepository.createAsync(entity);
        return newEntity;
    }

    updateAsync = async (entity) => {
        console.log(`CalificacionesService.updateAsync(${JSON.stringify(entity)})`);

        // Validación 1: la calificación debe existir
        const existente = await this.CalificacionesRepository.getByIdAsync(entity.id);
        if (existente == null) {
            throw new Error(`No se encontró la calificación (id: ${entity.id}).`);
        }

        // Validación 2: si se envía nota, debe ser válida
        if (entity.nota !== undefined && entity.nota !== null) {
            this.validarNota(entity.nota);
        }

        const rowsAffected = await this.CalificacionesRepository.updateAsync(entity);
        return rowsAffected;
    }

    deleteByIdAsync = async (id) => {
        console.log(`CalificacionesService.deleteByIdAsync(${id})`);
        const rowsAffected = await this.CalificacionesRepository.deleteByIdAsync(id);
        return rowsAffected;
    }

    // --- Helpers de validación ---

    validarNota = (nota) => {
        if (nota === undefined || nota === null || !Number.isInteger(nota) || nota < 0 || nota > 10) {
            throw new Error(`La nota debe ser un número entero entre 0 y 10.`);
        }
    }

    validarAlumnoExiste = async (idAlumno) => {
        if (!idAlumno) {
            throw new Error(`El alumno con id ${idAlumno} no existe.`);
        }
        const alumno = await this.AlumnosService.getByIdAsync(idAlumno);
        if (alumno == null) {
            throw new Error(`El alumno con id ${idAlumno} no existe.`);
        }
    }

    validarMateriaExiste = async (idMateria) => {
        if (!idMateria) {
            throw new Error(`La materia con id ${idMateria} no existe.`);
        }
        const materia = await this.MateriasService.getByIdAsync(idMateria);
        if (materia == null) {
            throw new Error(`La materia con id ${idMateria} no existe.`);
        }
    }
}
