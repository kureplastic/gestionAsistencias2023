const sequelize = require('sequelize')
const Usuario = require('../models').Usuario
const Materia = require('../models').Materia
const Horario = require('../models').Horario
const Asistencia = require('../models').Asistencia
const AlumnoMateria = require('../models/').AlumnoMateria

const bcrypt = require('bcrypt');

exports.home = async (req, res, next) => {
    const usuario = await Usuario.findByPk(req.session.idUsuario);
    
    AlumnoMateria.findAll({
        where: {alumnoId: req.session.idUsuario},
        /*
        include: [{
            model: Materia,
            required: true
        }]
        */
        })
    .then(alumnoMaterias => {
        //console.log(alumnoMaterias);
        Materia.findAll({})
        .then(materias => {
            const objAlumMaterias = []
            for(const alumat in alumnoMaterias){
                for(const materia in materias){
                    if(materias[materia].id === alumnoMaterias[alumat].materiaId){
                        objAlumMaterias.push({
                            id: alumnoMaterias[alumat].id,
                            nombre: materias[materia].nombre,
                            alumnoId: alumnoMaterias[alumat].alumnoId,
                            materiaId: alumnoMaterias[alumat].materiaId,
                            validacion: alumnoMaterias[alumat].validacion
                        });
                    }
                }
            }
            var notificar = {}
            notificar = req.session.notificar
            delete req.session.notificar
            res.render('alumno', { usuario: usuario, materias: objAlumMaterias, notificar: notificar});
        })
        .catch(err => res.send(err))
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

exports.updatePerfil = (req, res, next) => {
    req.session.name = req.body.email;
    Usuario.update({
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        dni: req.body.dni,
        email: req.body.email
    }, {
        where: {id: req.session.idUsuario}
    })
    .then((result) => {
        req.session.notificar = {
            tipo: "correcto",
            msj: "Perfil actualizado correctamente"
        }
        res.redirect('/home')
    })
    .catch(err => res.send(err))
}

exports.cambiarPassword = async (req, res, next) => {
    var passViejo = req.body.passwordViejo;
    var pass = req.body.password;
    var passwordConfirmar = req.body.passwordConfirmar;

    const usuario = await Usuario.findByPk(req.session.idUsuario);
    bcrypt.compare(passViejo, usuario.password)
    .then((result) => {
        if(result){
            //pass correcto
            req.session.notificar = {
                tipo: "correcto",
                msj: "Se modifico la contraseña correctamente"
            };
            console.log("pass correcto")
            if(pass == passwordConfirmar){
                //pass coinciden
                bcrypt.hash(pass, 10)
                .then( (hash) => {
                    usuario.update({
                        password: hash
                    })
                })
                res.redirect('back')
            }
            else{
                //pass no coinciden
                console.log("pass revise contraseña");
                req.session.notificar = {
                    tipo: "error",
                    msj: "Revise las contraseñas ingresadas"
                };
                res.redirect('back');
            }
        }
        else{
            req.session.notificar = {
                tipo: "error",
                msj: "Revise las contraseñas ingresadas"
            };
            res.redirect('back')
        }
            
    })
    .catch(err => res.send(err));
}

exports.agregarMateria = (req, res, next) => {
    Materia.findAll({
        order: [['nombre', 'ASC']]
    })
    .then(materias => {
        res.render('agregarMateria', { materias: materias, notificar: req.session.notificar});
        delete req.session.notificar;
    })
}

exports.addMateria = (req, res, next) => {
    AlumnoMateria.findOne({
        where: {
            alumnoId: req.session.idUsuario,
            materiaId: req.body.materia
            }
    })
    .then((result) => {
        if(result){
            req.session.notificar = {
                tipo: "error",
                msj: "La materia ya existe"
            }
            res.redirect("back");
        }
        else{
            if(req.body.materia == ''){
                req.session.notificar = {
                    tipo: "error",
                    msj: "Debe ingresar la materia"
                }
                res.redirect("back");
            }
            AlumnoMateria.create({
                alumnoId: req.session.idUsuario,
                materiaId: req.body.materia,
                validacion: false
            })
            .then((result) => {
                req.session.notificar={
                    tipo: "correcto",
                    msj: "Materia agregada correctamente"
                }
                res.redirect('/home');
            })
            .catch(err => res.send(err))
        }
    })
    .catch(err => res.send(err))
}

exports.removerMateria = (req, res, next) => {
    AlumnoMateria.findByPk(req.params.id)
    .then((materiaAlumno) => {
        Materia.findOne({
            where: {id: materiaAlumno.materiaId}
        })
        .then((materia) => {
            var MateriaAlumnoCompuesto = {
                id: materiaAlumno.id,
                materiaId: materiaAlumno.materiaId,
                alumnoId: materiaAlumno.alumnoId,
                validacion: materiaAlumno.validacion,
                nombre: materia.nombre
            }
            res.render('removerMateria', { materia: MateriaAlumnoCompuesto});
        })
        .catch(err => res.send(err))
    })
    .catch(err => res.send(err))
}

exports.deleteMateria = (req, res, next) => {
    AlumnoMateria.destroy({
        where: {id: req.params.id}
    })
    .then((result) => {
        req.session.notificar= {
            tipo: "correcto",
            msj: "Se removio la materia correctamente"
        }
        res.redirect('/home');
    })
    .catch(err => res.send(err))
}

exports.agregarAsistencias = async (req, res, next) => {
    //podria controlar que el id de la materia se encuentre dentro de las incripciones
    const materia = await Materia.findByPk(req.params.id);
    const asistencias = await Asistencia.findAll({      
        where: {
            materiaId: req.params.id,
            alumnoId: req.session.idUsuario
        }
    })
    const horarios = await Horario.findAll({
        where: {materiaId: req.params.id}
    })
    //fecha de hoy
    //comparar fecha de hoy con cada fecha de cada horario
    //si la fecha comparada es menor que hoy
    //y si la fecha con 30 min mas es mayor que hoy
    //cambiar el estado de asistenciaDisp a true
    var fechaHoy = new Date();
    var asistenciaDisp = false;
    for(const horario in horarios){
        if(horarios[horario].fechaInicio < fechaHoy){
            var fechaLimite = new Date(horarios[horario].fechaInicio);
            fechaLimite.setMinutes(fechaLimite.getMinutes() + 30);
            if(fechaLimite > fechaHoy){
                asistenciaDisp = true;
                //para solo permitir a los usuarios validados registrar asistencias
                /*
                const alumnoMateria = await AlumnoMateria.findOne({
                    where: {
                        alumnoId: req.session.idUsuario,
                        materiaId: req.params.id
                    }
                })
                asistenciaDisp = alumnoMateria.validacion;
                */
                break;
            }
        }
    }
    res.render('verAsistencias', { materia: materia, horarios: horarios, asistencias: asistencias, asistenciaDisp: asistenciaDisp});
}

exports.addAsistencia = async (req, res, next) => {
    const horarios = await Horario.findAll({
        where: {materiaId: req.params.id}
    })
    var fechaHoy = new Date();
    var asistenciaDisp = false;
    var fechaDeClase = new Date();
    for(const horario in horarios){
        if(horarios[horario].fechaInicio < fechaHoy){
            var fechaLimite = new Date(horarios[horario].fechaInicio);
            fechaLimite.setMinutes(fechaLimite.getMinutes() + 30);
            if(fechaLimite > fechaHoy){
                asistenciaDisp = true;
                fechaDeClase = new Date(horarios[horario].fechaInicio);
                break;
            }
        }
    }
    if(asistenciaDisp){
        const asistencias = await Asistencia.findAll({
            where: {
                materiaId: req.params.id,
                alumnoId: req.session.idUsuario
            }
        });
        //controlar que ya no se agrego
        if(asistencias.length > 0){
            var seEncuentraAsistencia = false
            for(const asistencia in asistencias){
                if(asistencias[asistencia].horarioAsistencia.getDate() === fechaHoy.getDate() && 
                    asistencias[asistencia].horarioAsistencia.getMonth() === fechaHoy.getMonth()) {
                    req.session.notificar = {
                        tipo: "error",
                        msj: "Ya se agrego la asistencia previamente"
                    }
                    seEncuentraAsistencia = true;
                    res.redirect('/home');
                    break;
                }
            }
            if(!seEncuentraAsistencia){
                Asistencia.create({
                    alumnoId: req.session.idUsuario,
                    materiaId: req.params.id,
                    horarioAsistencia: fechaHoy,
                    horarioClase: fechaDeClase
                })
                .then((result) => {
                    req.session.notificar={
                        tipo: "correcto",
                        msj: "Asistencia agregada correctamente"
                    }
                    res.redirect('/home');
                })
                .catch(err => res.send(err))
            }
        }
        else{
            Asistencia.create({
                alumnoId: req.session.idUsuario,
                materiaId: req.params.id,
                horarioAsistencia: fechaHoy,
                horarioClase: fechaDeClase
            })
            .then((result) => {
                req.session.notificar={
                    tipo: "correcto",
                    msj: "Asistencia agregada correctamente"
                }
                res.redirect('/home');
            })
            .catch(err => res.send(err))
        }
    }
    else{
        req.session.notificar= {
            tipo: "error",
            msj: "No se pudo agregar la asistencia"
        }
        res.redirect('/home');
    }
}