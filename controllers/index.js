const sequelize = require('sequelize')
const Usuario = require('../models').Usuario

const bcrypt = require('bcrypt')
const passport = require('passport')

exports.cargarlogin = (req, res, next) => {
    var error = {}
    error = req.session.error
    delete req.session.error
    res.render('login', { error: error});
}

exports.home = (req, res, next) => {
    const rolDeSesion = req.session.rol;
    if(rolDeSesion === 'Profesor'){
        res.redirect('/Profesor');
    }
    else if(rolDeSesion === 'Administrador'){
        res.redirect('/Administrar');
    }
    else if(rolDeSesion === 'Coordinador'){
        res.redirect('/Coordinador');
    }
    else if(rolDeSesion === 'Alumno'){
        res.redirect('/Alumno');
    }
    else{
        res.session.error = 'Debe autenticarse para continuar';
        res.redirect('/login');
    }
}
//post Login
exports.login = (req, res) => {
    //buscar usuario
    Usuario.findOne({ where: { email: req.body.email } })
    .then(usuario => {
        if(usuario){
            //comparar passaword
            bcrypt.compare(req.body.password, usuario.password)
                .then(resultado => {
                    if (resultado){
                        //password correcto
                        req.session.name = usuario.email
                        req.session.idUsuario = usuario.id
                        req.session.rol = usuario.rol
                        res.redirect('/home')
                    }
                    else{
                        //password incorrecto
                        req.session.error = 'Usuario y/o contraseña incorrectos';
                        res.redirect('/login')
                    }
                })
        }
        else{
            req.session.error = 'Usuario y/o contraseña incorrectos';
            res.redirect('/login')
        }
    })
    .catch(err => res.send(err))
}

exports.logout =  (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.session.destroy();
        res.redirect('/login');
      });
};

