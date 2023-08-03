var express = require('express');
const router = express.Router();
const controller = require('../controllers/alumno');
const materiaController = require('../controllers/materia');

router.get("/", controller.home);
router.get("/editarPerfil", controller.editarPerfil);
router.post("/editarPerfil", controller.updatePerfil);
router.post("/cambiarPassword", controller.cambiarPassword);

router.get("/agregarMateria", controller.agregarMateria);
router.post("/agregarMateria", controller.addMateria);


router.get("/Materia/:id/RemoverMateria", controller.removerMateria);
router.post("/Materia/:id/RemoverMateria", controller.deleteMateria);

router.get("/Materia/:id/VerAsistencias", controller.agregarAsistencias);
router.post("/Materia/:id/AgregarAsistencia", controller.addAsistencia);

module.exports = router;
