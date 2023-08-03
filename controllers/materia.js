const sequelize = require('sequelize')
const Usuario = require('../models').Usuario
const Materia = require('../models').Materia
const Horario = require('../models').Horario
const AlumnoMateria = require('../models').AlumnoMateria
const Asistencia = require('../models').Asistencia


var FileSaver = require('file-saver');
var XLSX = require("xlsx");

const fileType =  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";


exports.verAsistencias = (req, res, next) => {

    res.render('verAsistencias', { title: 'Gestion Asistencias 2023' });
}

exports.gestionarMateria = async (req, res, next) => {
    const usuario = await Usuario.findByPk(req.session.idUsuario)
    Materia.findOne({
        where: {
            id: req.params.id,
            profesorId: req.session.idUsuario
        }
    })
    .then( async materia => {
        if(materia){
            //se encontro materia y le pertenece al profesor
            const horarios = await Horario.findAll({
                where: {materiaId: materia.id},
                order: [['fechaInicio', 'ASC']]
            })
            const alumnoMaterias = await AlumnoMateria.findAll({
                where: {materiaId: materia.id}
            })
            var idsAlumnos= [];
            var idsSinValidar = [];
            for(const alum in alumnoMaterias){
                if(alumnoMaterias[alum].validacion === false){
                    idsSinValidar.push(alumnoMaterias[alum].alumnoId);
                }
                idsAlumnos.push(alumnoMaterias[alum].alumnoId);
            }
            const alumnos = await Usuario.findAll({
                where: {id: idsAlumnos}
            })
            const alumnosSinValidar = await Usuario.findAll({
                where: {id: idsSinValidar}
            })
            res.render('gestionarMateria', { materia: materia, horarios: horarios, usuario: usuario, alumnos: alumnos, alumnosSinValidar: alumnosSinValidar });
        }
        else{
            req.session.notificar= {
                tipo: 'error',
                msj: 'No se encontro la materia dentro de sus materias'
            }
        }
    })
    .catch(err => res.send(err))
}
exports.validarAlumnoMateria = (req, res, next) => {
    AlumnoMateria.update({
        validacion: true
    },{
        where: {
            materiaId: req.params.idMateria,
            alumnoId: req.params.idAlumno
        }
    })
    .then(result => {
        console.log("se obtuvo el resultado" + result)
        res.redirect('back')
    })
    .catch(err => res.send(err))
}

exports.gestionarAsistencias = async (req, res, next) => {
    //traer todos las asistencias de la materia con materiaId
    //traer todos los alumnos que han cargado asistencias en esa materia
    //crear un listado de objetos compuestos por el alumno.id == asistencia.alumnoId con el valor sumado de asistencia.horarioClase
    const materia = await Materia.findByPk(req.params.id);
    const asistencias = await Asistencia.findAll({
        where: {
            materiaId: materia.id
        }
    })
    var alumnosAsistencias = [];
    Usuario.findAll({
        where: {id: asistencias.map(asistencia => asistencia.alumnoId)}
    })
    .then(alumnos => {
        for(const asistencia in asistencias){
            for(const alum in alumnos){
                if(alumnos[alum].id === asistencias[asistencia].alumnoId){
                    alumnosAsistencias.push({
                        id: alumnos[alum].id,
                        nombre: alumnos[alum].nombre,
                        apellido: alumnos[alum].apellido,
                        dni: alumnos[alum].dni,
                        email: alumnos[alum].email,
                        horarioClase: asistencias[asistencia].horarioClase
                    });
                }
            }
        }
        res.render('gestionarAsistencias', {asistentes: alumnosAsistencias, materia: materia});
    })
    .catch(err => res.send(err))
}

const exportToSpreadsheet = (data, fileName) => {
    //Create a new Work Sheet using the data stored in an Array of Arrays.
    const workSheet = XLSX.utils.aoa_to_sheet(data);
    // Generate a Work Book containing the above sheet.
    const workBook = {
      Sheets: { data: workSheet, cols: [] },
      SheetNames: ["data"],
    };
    // Exporting the file with the desired name and extension.
    const excelBuffer = XLSX.write(workBook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: fileType });
    files.saveAs(fileData, fileName + fileExtension);
  };
exports.exportarAsistencias = async (req, res, next) => {

    //traer los horarios de clase que coniciden con el id en req.params.id ordenados por la fecha de inicio
    const horarios = await Horario.findAll({
        where: {
            materiaId: req.params.id,
        },
        order: [['fechaInicio', 'ASC']]
    })
    //traer todas las asistencias de la materia con materiaId 
    const asistencias = await Asistencia.findAll({ where: { materiaId: req.params.id }})
    //traer todos los alumnos que se han inscripto en la materia
    const alumnoMateria = await AlumnoMateria.findAll({ where: { materiaId: req.params.id }})
    
    //en este objeto  unir los alumnos con cada horario
    var alumnosAsistencias = [];
    Usuario.findAll({
        where: {id: alumnoMateria.map(inscripcion => inscripcion.alumnoId)},
        order: [['apellido', 'ASC']]
    })
    .then(alumnosInscriptos => {
        console.log("alumnos inscriptos: " + alumnosInscriptos)
        alumnosInscriptos.forEach(alumno => {
            alumnosAsistencias.push({
                id: alumno.id,
                usuario: alumno.email,
                nombre: alumno.nombre,
                apellido: alumno.apellido
            })
            })
        alumnosAsistencias.forEach(alumno => {
            horarios.forEach(horario => {
                const keyFechaClase = horario.fechaInicio.getDate() + "/" + (horario.fechaInicio.getMonth() + 1) +"/" + horario.fechaInicio.getFullYear()
                const horarioAComparar = horario.fechaInicio.getDate() + "/" + horario.fechaInicio.getMonth();
                
                asistencias.every(asistencia => {
                    const asistenciaAComparar = asistencia.horarioAsistencia.getDate() + "/" + asistencia.horarioAsistencia.getMonth();
                    if( (asistenciaAComparar === horarioAComparar) && (asistencia.alumnoId === alumno.id) ){
                        alumno[keyFechaClase] = "P";
                        return false;
                    }else{
                        alumno[keyFechaClase] = "";
                        return true;
                    }
                })
            })
        })
        console.log("alumnos asistencias: " + alumnosAsistencias)
        //luego recorrer el alumnosAsistencias y revisar con cada horario si coinicide un horario con todas las asistencias registradas por ese alumno
        //exportToSpreadsheet(filas, "Asistencias")
        const worksheet = XLSX.utils.json_to_sheet(alumnosAsistencias);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencias");
        const excelServer = XLSX.writeFile(workbook, "asistencias.xlsx", { compression: true }); // este para guardar en el server
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" }); // este para guardar localmente
        const fileData = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(fileData, "asistencias" + fileExtension);
        
    })
    .then( res.redirect('back') )
    .catch(err => res.send(err)) 
}

exports.agregarHorario = (req, res, next) => {
    Materia.findByPk(req.params.id).then(materia => {
        res.render('agregarHorario', { materia: materia });
    })
    .catch(err => res.send(err))
}

exports.registrarMateria = (req, res, next) => {
    Usuario.findAll({
            where: {rol: 'Profesor'},
            order: [['apellido', 'ASC']]
    })
    .then(profesores => {
        res.render('registrarMateria', { profesores: profesores });
    })
    
}

exports.addMateria = (req, res, next) => {
    console.log(req.body);
    Materia.create({
        nombre: req.body.nombre,
        profesorId: req.body.profesorId == '' ? null : req.body.profesorId
    })
    .then((result) => {
        console.log("se obtuvo el resultado" + result)
        req.session.notificar={
            tipo: 'correcto',
            msj: 'Materia agregada correctamente'
        }
        res.redirect('/home')
    })
    .catch(err => res.send(err))    
}

exports.eliminarMateria = (req, res, next) => {
    Materia.findByPk(req.params.id)
    .then(materia => {
        res.render('eliminarMateria', { materia: materia });
    })
    .catch(err => res.send(err))
}

exports.deleteMateria = (req, res, next) => {
    Materia.destroy({
        where: {id: req.params.id}
    })
    .then((result) => {
        req.session.notificar= {
            tipo: 'correcto',
            msj: 'Materia eliminada correctamente'
        }
        res.redirect('/home')
    })
    .catch(err => res.send(err))
}

exports.editarMateria = async (req, res, next) => {
    const profesores = await Usuario.findAll({
        where: {rol: 'Profesor'},
        order: [['apellido', 'ASC']]
    })
    const horarios = await Horario.findAll({
        where: {materiaId: req.params.id}
    })

    Materia.findByPk(req.params.id)
    .then(materia => {
        if(materia){
            res.render('editarMateria', { materia: materia, profesores: profesores, horarios: horarios });
        }
        else{
            req.session.notificar= {
                tipo: 'error',
                msj: 'No se encontro la materia '
            }
            res.redirect('/home')
        }
    })
    .catch(err => res.send(err))
}

exports.updateMateria = (req, res, next) => {
    Materia.update({
            nombre: req.body.nombre,
            profesorId: req.body.profesorId == '' ? null : req.body.profesorId
    },
    {
        where: {id: req.params.id}
    })
    .then((result) => {
        req.session.notificar={
            tipo: 'correcto',
            msj: 'Materia actualizada correctamente'
        }
        res.redirect('/home')
    })
    .catch(err => res.send(err))
}

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
  }

exports.addHorario = (req, res, next) => {
    var fechaInicio = new Date(req.body.fechaInicio);
    //fechaInicio = fechaInicio.addHours(-3);
    console.log("fechaInicio al ser creada: "+ fechaInicio);
    var fechaFin = new Date(req.body.fechaInicio).addHours(req.body.horasCursada);
    console.log("fechaFin al Ser Creada: "+ fechaFin);
    Horario.create({
        materiaId: req.params.id,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        esDiaLibre: false
    })
    .then((result) => {
        req.session.notificar={
            tipo: 'correcto',
            msj: 'Horario creado correctamente'
        }
        res.redirect('/home')
    })
    .catch(err => res.send(err))
}

exports.asignarDiaLibre = (req, res, next) => {
    Horario.findByPk(req.params.idHorario)
    .then(horario => {
        res.render('diaLibre', { horario: horario });
    })
    .catch(err => res.send(err))
}

exports.asignDiaLibre = async(req, res, next) => {
    const horario =  await Horario.findByPk(req.params.idHorario)
    const estadoDia = horario.esDiaLibre
    horario.update({
        esDiaLibre: !estadoDia
    })
    .then((result) => {
        console.log("se obtuvo el resultado" + result)
        res.redirect('/home')
    })
    .catch(err => res.send(err))
}

exports.eliminarHorario = (req, res, next) => {
    Horario.findByPk(req.params.idHorario)
    .then(horario => {
        if(horario){
            res.render('eliminarHorario', { horario: horario });
        }
        else{
            req.session.notificar= {
                tipo: 'error',
                msj: 'No se encontro el horario '
            }
            res.redirect('/home')
        }
    })
    .catch(err => res.send(err))
}

exports.deleteHorario = (req, res, next) => {
    Horario.destroy({
        where: {id: req.params.idHorario}
    })
    .then((result) => {
        req.session.notificar={
            tipo: 'correcto',
            msj: 'Horario eliminado correctamente'
        }
        res.redirect('/home')
    })
    .catch(err => res.send(err))
}