var createError = require('http-errors');
var express = require('express');
const session = require('express-session')
const passport = require('passport')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var XLSX = require("xlsx");
var FileSaver = require('file-saver');

//middleware
const autenticado = require("./middleware/autenticado").autenticado;
const permisos = require("./middleware/permisos").permisos;


//rutas
const indexRouter = require('./routes/index');
const administrarRouter = require('./routes/administrar');
const coordinadorRouter = require('./routes/coordinador');
const materiasRouter = require('./routes/materia')
//const horarioRouter = require('./routes/horario')
const profesorRouter = require('./routes/profesor');
const alumnoRouter = require('./routes/alumno');
//const coordinadorRouter = require('./routes/coordinador')

//probando base
const bd = require('./config/base')

bd.authenticate()
.then(() => console.log('conexion establecida!'))
.catch(err => console.log('error: ' + err))

//otros
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//uses
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//passport y sesion
app.use(session({
  secret: "sesion secreta",
  resave: true,
  saveUninitialized: true,
})
);

passport.serializeUser(function (user, done) {
	done(null, user);
  });
  passport.deserializeUser(function (user, done) {
	done(null, user);
  });
  
app.use(passport.initialize());
app.use(passport.session());

//uso de rutas
app.use('/',autenticado, indexRouter);
app.use('/Administrar',autenticado, administrarRouter);
app.use('/Profesor',autenticado,profesorRouter);
app.use('/Coordinador',autenticado, coordinadorRouter);
app.use('/Alumno', autenticado,alumnoRouter);
app.use('/Alumno/Materia',autenticado, materiasRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
