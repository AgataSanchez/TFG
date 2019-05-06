"use strict";

const config = require("./config");
const mysql = require("mysql");
const daoTeachers = require("./DAO/dao_teachers");
const daoExams = require("./DAO/dao_exams");
const daoAdmin = require("./DAO/dao_admin");
const router = require("./router");
const path = require("path");
const express = require("express");
const bodyParser = require ("body-parser");
const session = require ("express-session");
const expressValidator = require("express-validator");
const multer = require("multer");
const upload = multer({ dest: path.join(__dirname, "public/uploads")});
const util = require("util");
const app = express();

const pool = mysql.createPool(config.mysqlconfig);
pool.query = util.promisify(pool.query);

const middlewareSession = session ({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({extended:true}));
app.use(middlewareSession);
app.use(expressValidator());

const teachers = new daoTeachers.DAOTeachers(pool);
const exams = new daoExams.DAOExams(pool);
const admin = new daoAdmin.DAOAdmin(pool);
const Storage = require("./storage");
const eventStorage = new Storage(pool);
router.setRoutes(app, "/events", eventStorage);

app.listen(config.port, function(err) {
    if (err) {
        console.log("Error al iniciar el servidor");
    }
    else {
        console.log(`servidor arrancado en el puerto ${config.port}`);
    }
});

app.get("/", (request, response) => {
    if (request.session.loggedUser === undefined) {
        response.redirect("login");
    }
    else {
        response.render("aula");
    }
});

app.get("/login", (request, response) => {
    if (request.session.loggedUser === undefined) {
        response.render("login", {error: request.session.error});
        request.session.error = undefined;
    } 
    else {
        response.redirect("profile");
    }
});

app.get("/admin", (request, response) => {
    if (request.session.loggedUser !== "admin") {
        response.render("admin");
    }
    else {
        response.render("admin");
    }
})

app.post("/isUserCorrect", (request, response) => {
    teachers.isUserCorrect(request.body.user, request.body.pass, (err, user) => {
        if (err) {
            request.session.error = err;
            response.redirect("login");
        }
        else if (user === undefined){
            response.session.error = "Usuario y/o contraseña incorrecta";
            response.redirect("login");
        }
        else { 
            teachers.currentCourses(user.id_profesor, (err, courses) => {
                if (err) {
                    request.session.error = err;
                    response.redirect("login");
                }
                else if (!courses){
                    request.session.exam = false;
                    request.session.loggedUser = user;
                    response.redirect("PerfilExamen");
                }
                else {
                    let found = false;
                    let i = 0;
                    while (!found && (i < courses.length())) {
                        if (checkExams(courses[i])) {
                            found = true;
                        }
                        else {
                            i++;
                        }
                    }
                    teachers.getExam(courses[i].grupo_id, (err, room) => {
                        if (err) {
                            request.session.error = err;
                            response.redirect("login");
                        }
                        else {
                            if (room != null) {
                                request.session.loggedUser = user;
                                response.render("aula");
                                response.end();
                            }
                        }
                    })
                }
            })
        }
    });
});

app.get("/examen", (request, response) => {
    if (request.session.loggedUser === undefined) {
        response.render("lab06_11");
        response.end();
    }
    else {
        response.render("aula");
        response.end();
    }
});

app.get("/PerfilExamen", (request, response)=>{
    if (request.session.loggedUser === undefined) {
        response.render("Exams",  {examenes: null}); //CAMBIAR A LOGIN
    }
    else {
        response.render("Exams", {examenes:request.session.exams});
    }
});

app.get("/adminusers", (request, response) => {
    if (request.session.loggedUser === undefined) {
        teachers.getAllUsers((err, users) => {
            if (err) {
                response.render("useradmin", {users:"no se han podido cargar los usuarios", credentials: request.session.credentials, errAdd: undefined, errRemove: undefined})
            }
            else {
                if (request.session.errorAdd === undefined) {
                    request.session.errorAdd = null;
                }
                if (request.session.errorRemove === undefined) {
                    request.session.errorRemove = null;
                }
                if (request.session.credentials === undefined) {
                    request.session.credentials = null;
                }
                response.render("useradmin", {users:users, credentials: request.session.credentials, errAdd: request.session.errorAdd, errRemove: request.session.errorRemove})
                response.end();
            }
        });
    }
    else {
        response.render("useradmin", {users:undefined, credentials: request.session.credentials, errAdd: undefined, errRemove: undefined});
        response.end();
    }
});

app.post("/searchUser", (request,response) => {
    admin.search(request.body.search, (err, result) => {
        if (err) {
            console.log("La búsqueda tuvo un problemita");
        } else {
            if (result.length === 0) {
                console.log("La búsqueda estaba vacía mu vacía")
            } else {
                request.session.credentials = result;
            }
        }
        response.redirect("adminusers#manageCredentials")
    });
});

app.post("/addUser", (request, response) => {
    request.checkBody("nombre", "Nombre de usuario no válido").matches(/^[a-zA-Z0-9 ]+$/i);
    request.checkBody("apellidos", "Apellidos no válidos").matches(/^[a-zA-Z0-9 ]+$/i);
    request.checkBody("tipo", "Tipo no válido").matches(/^[0-3]$/);
    request.getValidationResult().then(function(result) {
        if(result.isEmpty()) {
            let user = {
                nombre:request.body.nombre,
                apellidos: request.body.apellidos,
                tipo: request.body.tipo
            };
            admin.addUser(user, (err, result) => {
                if(err){
                    response.redirect("adminusers");
                }
                else {
                    if(result){
                        request.session.errorAdd = false;
                        response.redirect("adminusers#addUser");
                    }else{
                        request.session.errorAdd = true;
                        response.redirect("adminusers#addUser");
                    }
                }
            });
        }
        else {
            request.session.errorResult = result.array();
            response.redirect("adminusers#addUser");
        }
    });
    
});
app.post("/deleteUser", (request, response)=>{
    request.checkBody("idU", "id no válido").matches(/^\d*$/);
    request.getValidationResult().then(function(result){
        if(result.isEmpty()){
            admin.removeUser(request.body.idU, (err,result)=>{
                if(err){
                    response.redirect("adminusers");
                }else{
                    if(result){
                        request.session.errorRemove = false;
                        response.redirect("adminusers#deleteUser");
                    }else{
                        request.session.errorRemove = true;
                        response.redirect("adminusers#deleteUser");
                    }
                }
            });
        }else{
            request.session.errorResult = result.array();
            response.redirect("adminusers#deleteUser");
        }
    });
    
});

app.post("/examenesSubidos", (request,response)=>{
    exams.showExams(request.loggedUser.id, (err,exams)=>{
        if(err){
            response.redirect("/PerfilExamen");
        }else{
            if(exams.length===0){
                response.redirect("/PerfilExamen");
            
            }else{
                request.session.exams=exams;
                response.redirect("/PerfilExamen");
            }
        }
    });
});

app.post('/uploadexams', upload.array('examen', 12), (request, response) => {
    if (request.files) {
        request.files.forEach(file => {
            console.log(`Fichero guardado en: ${file.path}`); 
        })
    }
    response.redirect("PerfilExamen");
});

app.get("/uploads/:id", (request, response) => {
    let examPath = path.join(__dirname, "public/uploads", request.params.id);
    response.sendFile(examPath);
});

app.get("/destroy", (request, response) => {
    request.session.destroy();
    response.redirect("login");
});

app.use((request, response, next) => {    
    response.status(404);     
    response.render("error", { url: request.url });
}); 