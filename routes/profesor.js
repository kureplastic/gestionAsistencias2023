var express = require('express');
const router = express.Router();
const controller = require('../controllers/profesor');
const materiaController = require('../controllers/materia');

router.get("/", controller.home);
router.get("/editarPerfil", controller.editarPerfil);

router.get("/Materia/:id", materiaController.gestionarMateria);

router.post("/Materia/:idMateria/Alumno/:idAlumno/Validar",materiaController.validarAlumnoMateria);

router.get("/Materia/:id/gestionarAsistencias", materiaController.gestionarAsistencias);
router.get("/Materia/:id/AgregarHorario", materiaController.agregarHorario);
router.get("/Materia/:id/ExportarAsistencias", materiaController.exportarAsistencias);

router.get("/Materia/:idMateria/Horario/:idHorario/AsignarDiaLibre",materiaController.asignarDiaLibre)
router.post("/Materia/:idMateria/Horario/:idHorario/AsignarDiaLibre",materiaController.asignDiaLibre)

router.get("/Materia/:idMateria/Horario/:idHorario/EliminarHorario",materiaController.eliminarHorario)
router.post("/Materia/:idMateria/Horario/:idHorario/EliminarHorario",materiaController.deleteHorario)




module.exports = router;
