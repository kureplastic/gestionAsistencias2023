const sequelize = require('sequelize')
const Usuario = require('../models').Usuario
const Materia = require('../models').Materia
const Horario = require('../models').Horario
const AlumnoMateria = require ('../models').AlumnoMateria

const bcrypt = require('bcrypt')


exports.listar = async (req, res, next) => {
    const usuario = await Usuario.findByPk(req.session.idUsuario)
    const alumnos = await Usuario.findAll({
        where: {rol: 'Alumno'},
        order: [['apellido', 'ASC']]        
    })
    const profesores = await Usuario.findAll({
        where: {rol: 'Profesor'},
        order: [['apellido', 'ASC']]    
    })
    const coordinadores = await Usuario.findAll({
        where: {rol: 'Coordinador'},
        order: [['apellido', 'ASC']]
    })
    const admins = await Usuario.findAll({
        where: {rol: 'Administrador'},
        order: [['apellido', 'ASC']]
    })
    Materia.findAll({
        order: [['nombre', 'ASC']]
    })
    .then(materias => {
        console.log(req.session);
        var notificar = {}
        notificar = req.session.notificar
        delete req.session.notificar
        console.log("aqui se realizo un delete de notificar")
        console.log(req.session);
        
        res.render('listar', { materias: materias, alumnos: alumnos, profesores: profesores, coordinadores: coordinadores, admins: admins, usuario: {name: req.session.name, rol: req.session.rol, id: req.session.idUsuario}, notificar: notificar, usuario: usuario});
    })
    .catch(err => res.send(err));
}

exports.registrarUsuario = (req, res, next) => {
    res.render('registrarUsuario', { title: 'Gestion Asistencias 2023' });
}

exports.asignarAlumno = async (req, res, next) => {
    const alumnos = await Usuario.findAll({
        where: {rol: 'Alumno'},
        order: [['apellido', 'ASC']]
    });
    Materia.findAll({
        order: [['nombre', 'ASC']]
    })
    .then(materias => {
        res.render('asignarAlumno', { alumnos: alumnos, materias: materias });
    })
    .catch(err => res.send(err))
    
}

exports.linkAlumno = (req, res, next) => {
    AlumnoMateria.findOne({
        where: {alumnoId: req.body.alumnoId, materiaId: req.body.materiaId}
    })
    .then((alumnoMateria) => {
        if(alumnoMateria){
            req.session.notificar={
                tipo: "error", 
                msj: "El alumno ya está asignado a la materia seleccionada"
            }
            res.redirect('/home')
        }
        else{
            AlumnoMateria.create({
                alumnoId: req.body.alumnoId,
                materiaId: req.body.materiaId,
                validacion: false
            })
            .then((result) => {
                req.session.notificar={
                    tipo: "correcto",
                    msj: "Alumno asignado correctamente"
                }
                res.redirect('/home')
            })
            .catch(err => res.send(err))
        }
    })
    .catch(err => res.send(err))
}

exports.addUsuario = (req, res) => {
    //console.log(req.body);
    //console.log(req.session.name)
    Usuario.findOne({
        where: {email: req.body.email}
    })
    .then(usuario => {
        if(usuario){
            req.session.notificar={
                tipo: "error",
                msj: "Usuario ya existe con ese correo "
            }
            res.redirect('/home')
        }
        else{
            Usuario.create({
                nombre: req.body.nombre,
                apellido: req.body.apellido,
                email: req.body.email,
                dni: req.body.dni,
                password: bcrypt.hashSync(req.body.password, 10),
                rol: req.body.rol
            })
            .then((result) => {
                console.log("se obtuvo el resultado" + result)
                req.session.notificar={
                    tipo: "correcto",
                    msj: "Usuario agregado correctamente"
                }
                res.redirect('/home')
            })
            .catch(err => res.send(err))
        }
    })
    .catch(err => res.send(err))      
}

exports.eliminarUsuario = (req, res, next) => {
    Usuario.findByPk(req.params.id)
    .then(usuario => {
        if(usuario !== null){
            res.render('eliminarUsuario', { usuario: usuario });
        }
        else{
            req.session.notificar = {
                tipo: "error",
                msj: "Usuario no encontrado"
            }
            res.redirect('/home');
        }
        
    })
    .catch(err => res.send(err))
}

exports.deleteUsuario = (req, res, next) => {
    Usuario.destroy({
        where: {id: req.params.id}
    })
    .then((result) => {
        console.log("se obtuvo el resultado" + result)
        res.redirect('back')
    })
    .catch(err => res.send(err))
}

exports.editarUsuario = async (req, res, next) => {
    const alumnoMaterias = await AlumnoMateria.findAll({
        where : {alumnoId: req.params.id}
    })

    Usuario.findByPk(req.params.id)
    .then(usuario => {
        res.render('editarUsuario', { usuario: usuario, materias: alumnoMaterias, tipoUsuario: "Alumno" });
    })
    .catch(err => res.send(err))
}

exports.updateUsuario = async (req, res, next) => {
    const busqueda = await Usuario.findByPk(req.params.id);
    const emailOriginal = busqueda.email;
    if(emailOriginal !== req.body.email){
        Usuario.findOne({
            where: {email: req.body.email}
        })
        .then(usuario => {
            if(usuario){
                req.session.notificar={
                    tipo: "error",
                    msj: "Usuario ya existe con ese correo "
                }
                res.redirect('/home')
            }
            else{
                Usuario.update({
                    nombre: req.body.nombre,
                    apellido: req.body.apellido,
                    email: req.body.email,
                    dni: req.body.dni,
                    rol: req.body.rol
                },
                {
                    where: {id: req.params.id}
                })
                .then((result) => {
                    
                    req.session.notificar={
                        tipo: "correcto",
                        msj: "Usuario actualizado correctamente"
                    }
                    
                    res.cookie(`notificar`,`Usuario actualizado correctamente`)
                    res.redirect('/home')
                })
                .catch(err => res.send(err))
            }
        })
        .catch(err => res.send(err))
    }
    else{
        Usuario.update({
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            email: req.body.email,
            dni: req.body.dni,
            rol: req.body.rol
        },
        {
            where: {id: req.params.id}
        })
        .then((result) => {
            req.session.notificar={
                tipo: "correcto",
                msj: "Usuario actualizado correctamente"
            }
            res.redirect('/home')
        })
        .catch(err => res.send(err))
    }
}

exports.restablecerPassword = (req, res, next) => {
    Usuario.findByPk(req.params.id)
    .then(user => {
        if(user){
            var pass = user.dni;
            bcrypt.hash(pass, 10)
            .then( (hash) => {
                user.update({
                    password: hash
                })
            })
        }
    })    
    .then((result) => {
        req.session.notificar= {
            tipo: "correcto",
            msj: "Password restablecido correctamente"
        }
        res.redirect('/home')
    })
    .catch(err => res.send(err));
}

exports.removerMateria = (req, res, next) => {
    AlumnoMateria.findOne({
        where:{
            alumnoId: req.params.idUsuario,
            materiaId: req.params.idMateria
        }
    })
    .then((materiaAlumno) => {
        if(materiaAlumno){
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
        }else{
            req.session.notificar = {
                msj: "La asignacion Alumno-Materia no existe",
                tipo: "error"
            }
            res.redirect('/home')
        }
        
    })
    .catch(err => res.send(err))
}

