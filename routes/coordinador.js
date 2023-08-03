var express = require('express');
const router = express.Router();
const controller = require('../controllers/administrar');

router.get("/", controller.listar);


module.exports = router;