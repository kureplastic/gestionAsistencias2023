var express = require('express');
var router = express.Router();
const controller = require('../controllers/index');

/* GET home page. */
router.get('/', controller.home);
router.get('/login', controller.cargarlogin);
router.post('/login', controller.login);
router.get('/home', controller.home);
router.get('/logout', controller.logout);

module.exports = router;
