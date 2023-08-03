var express = require('express');
const router = express.Router();
const controller = require('../controllers/administrar');
const controllerMateria = require('../controllers/materia');
const controllerAlumno = require('../controllers/alumno');


router.get("/", controller.listar);


router.get("/asignarAlumno", controller.asignarAlumno);
router.post("/asignarAlumno", controller.linkAlumno);

//rutas para gestion usuario
router.get("/registrarUsuario", controller.registrarUsuario);
router.post("/registrarUsuario", controller.addUsuario);

router.get("/Usuario/:id/eliminarUsuario", controller.eliminarUsuario);
router.post("/Usuario/:id/eliminarUsuario", controller.deleteUsuario);

router.get("/Usuario/:id/editarUsuario", controller.editarUsuario);
router.post("/Usuario/:id/editarUsuario", controller.updateUsuario);

router.get("/Usuario/:idUsuario/Materia/:idMateria/RemoverMateria", controller.removerMateria);
router.post("/Usuario/:idUsuario/Materia/:idMateria/RemoverMateria", controller.removerMateria);

router.post("/Usuario/:id/restablecerPassword", controller.restablecerPassword);

//rutas para gestion materia
router.get("/registrarMateria", controllerMateria.registrarMateria);
router.post("/registrarMateria", controllerMateria.addMateria);

router.get("/Materia/:id/eliminarMateria", controllerMateria.eliminarMateria);
router.post("/Materia/:id/eliminarMateria", controllerMateria.deleteMateria);

router.get("/Materia/:id/editarMateria", controllerMateria.editarMateria);
router.post("/Materia/:id/editarMateria", controllerMateria.updateMateria);

router.post("/Materia/:id/agregarHorario", controllerMateria.addHorario);

router.get("/Materia/:idMateria/Horario/:idHorario/AsignarDiaLibre",controllerMateria.asignarDiaLibre)
router.post("/Materia/:idMateria/Horario/:idHorario/AsignarDiaLibre",controllerMateria.asignDiaLibre)

router.get("/Materia/:idMateria/Horario/:idHorario/EliminarHorario",controllerMateria.eliminarHorario)
router.post("/Materia/:idMateria/Horario/:idHorario/EliminarHorario",controllerMateria.deleteHorario)

//rutas asistencias
router.get("/asistencias", controllerAlumno.agregarAsistencias);

module.exports = router;
