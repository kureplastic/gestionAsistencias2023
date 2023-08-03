const permisos = function (req, res, next) {
    //autenticado y con rol?
    console.log("--Permisos--");
    console.log("usuario: " + req.session.name);
    console.log("rol session: " + req.session.rol);
    if(req.session.name){
        var rutaPosible = "/" + req.session.rol;
        console.log("la ruta armada con el rol es: " + rutaPosible);
        console.log("Y la ruta a la que se quiere acceder es: " + req.url);
        if (req.url == rutaPosible) 
            return next();
        //hacer un else tambien par si es admin y quiere entrar a /administrar ya que no coincide
        else if (req.url == '/Administrar' && req.session.rol == 'Administrador')
            return next();
        else {
            req.session.error = 'No tiene permisos para continuar';
            res.send('No tiene permisos para continuar');
        }
    }
}



module.exports.permisos = permisos;