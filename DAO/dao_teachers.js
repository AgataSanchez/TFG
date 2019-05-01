"use strict";

/**
 * Proporciona operaciones para la gestión de profesores
 * en la base de datos.
 */
class DAOTeachers {
    /**
     * Inicializa el DAO de profesores.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Determina si un determinado usuario aparece en la BD con la contraseña
     * pasada como parámetro.
     * 
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando, por un lado, el objeto Error (si se produce, o null en caso contrario)
     * y, por otro lado, un booleano indicando el resultado de la operación
     * (true => el usuario existe, false => el usuario no existe o la contraseña es incorrecta)
     * En caso de error error, el segundo parámetro de la función callback será indefinido.
     * 
     * @param {string} user Identificador del usuario a buscar
     * @param {string} password Contraseña a comprobar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    isUserCorrect(user, password, callback) {
        this.pool.getConnection((err, connection) => {
            if(err){
                callback(err, undefined);
            }
            else{
                //Poner bien los campos acordes con las columnas de la bd
                connection.query("SELECT * FROM conectar  WHERE user = ? and pass = ?",
                [user, password],
                (err, rows) => {
                    connection.release();
                    if (err) { callback(err, undefined); }
                    if (rows.length === 0) {
                        callback("Usuario y/o contraseña incorrectos", undefined);
                    } else {
                        callback(null, rows[0]);
                    }
                });
            }
        });
        
    }
    /**
     * 
     * @param {*} user_id 
     * @param {*} callback 
     */
    currentCourses(user_id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err, null);
            }
            else {
                var today = new Date();
                var year = today.getFullYear();
                connection.query("SELECT * FROM IMPARTE i JOIN EXAMEN e ON i.id_grupo=e.id_grupo WHERE i.id_profesor = ? AND i.ano = ?",
                [user_id, year],
                (err, rows) => {
                    connection.release();
                    if (err) { 
                        callback(err, undefined); 
                    }
                    else if (rows.length === 0) {
                        callback(null, null);
                    } else {
                        
                        callback(null, rows);
                    }
                });
            }
        })
    }

    /**
     *  
     * @param {*} callback 
     */
    getAllUsers(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err, null);
            }
            else {
                connection.query("SELECT * FROM ACTOR_UNIVERSITARIO",
                (err, rows) => {
                    connection.release();
                    if (err) { 
                        callback(err, undefined); 
                    } else {   
                        callback(null, rows);
                    }
                });
            }
        })
    }

    /*isScheduled(user, callback){
        this.pool.getConnection((err,connection)=>{
            if(err){
                callback(err, null);
            } else{
                connection.query("SELECT horario, id_examen, duracion FROM revisa r WHERE r.id_profesor = ? ",
                [user],
                (err, rows) => {
                    if(err){
                        callback(err, null);
                    }if(rows.length === 0){
                        callback(null, null);
                    }
                    else{
                        let i = 0;
                        let encontrado = false;
                        let examen = "";
                        while(!encontrado && i < rows.length){
                            //REVISAR
                            let hour = rows[i].horario.getHour() + duracion.getHour();
                            let minute = rows[i].horario.getMinute() + duracion.getMinute();
                            let date = new Date();
                            date = date.setHours(hour, minute, 00);
                            if(moment().format() >= rows[i].horario && moment().format('LTS') < date){
                                encontrado = true;
                                examen = rows[i].examen;
                            }
                        }
                        if(encontrado){
                            callback(null, examen);
                        }else{
                            callback(null, null);
                        }
                        
                    }
                    connection.release();
                }
            )}
        });
    }*/

    /**
     * 
     * @param {*} examen 
     * @param {*} callback 
     */
    getRoom(examen,callback) {
        this.pool.getConnection((err, connection) => {
            if(err){
                callback(err, undefined);
            }
            else{
                //Poner bien los campos acordes con las columnas de la bd
            connection.query("SELECT id, filas, columnas, pasillo FROM aula WHERE id_examen =  ?",
            [examen],
            (err, rows) => {
            if (err) { callback(err, undefined); }
            if (rows.length === 0) {
                callback(null, null);
            } else {
                callback(null, rows[0]);
            }
            });
        }
        connection.release();
        });
    }

    /**
     * 
     * @param {*} nombre 
     * @param {*} callback 
     */
    getIdTeacher(nombre,callback){
        this.pool.getConnection((err,connection)=>{
            if(err){
                callback(err,undefined);
            }else{
                connection.query("SELECT id_profesor FORM conectar WHERE user=?",[nombre],
                (err,rows)=>{
                    if(err){callback(err,undefined);}
                    if(rows.length===0){
                        callback(null,null);
                    }else{
                        callback(null,rows[0].id_profesor);
                    }
                });
            }
            connection.release();
        });
    }

}

/**IS USER CORRECT ..
 * SI TIENE HORA EN ESE MOMENTO
 * SI LA TIENE, VER QUE EXAMEN ES
 * Y SI TIENE ESA HORA, VER EN QUE AULA PARA CARGAR VISTA
 */

module.exports = {
    DAOTeachers: DAOTeachers
}