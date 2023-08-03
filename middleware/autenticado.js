const autenticado = function (req, res, next) {
    //autenticado?
    console.log("--Autenticado--")
    console.log("usuario: " + req.session.name)
    console.log("id session: " + req.session.idUsuario)
    console.log("rol session: " + req.session.rol)
    console.log("req url es: " + req.url)
    if(req.session.name){
        return next()
    }
    //no autenticado y quiere autenticarse?
    else if(req.url === '/login'){
        return next()       
    }
    //no autenticado y quiere entrar al sistema
    else{
        req.session.error = 'Debe autenticarse para continuar';
        res.redirect('/login')
    }
}



module.exports.autenticado = autenticado;