const sequelize = require('sequelize')
const Usuario = require('../models').Usuario
const Materia = require('../models').Materia
const Horario = require('../models/horario')
const AlumnoMateria = require('../models/alumnoMateria')

exports.home = async (req, res, next) => {
    const usuario = await Usuario.findByPk(req.session.idUsuario)
    Materia.findAll({
        where: {
            profesorId: req.session.idUsuario
        }
    }).then(materias => {
        var notificar = {}
        notificar = req.session.notificar
        delete req.session.notificar
        res.render('profesor', { usuario: usuario, materias: materias, notificar: notificar});
    })
    .catch(err => res.send(err))
}

exports.editarPerfil = (req, res, next) => {
    Usuario.findByPk(req.session.idUsuario)
    .then(usuario => {
        res.render('editarPerfil', { usuario: usuario, notificar: req.session.notificar});
        delete req.session.notificar;
    })
    .catch(err => res.send(err))
}
