"use strict";

/**
 * Proporciona operaciones para la gestión de examenes
 * en la base de datos.
 */
class DAOAdmin {
    /**
     * Inicializa el DAO de examanes.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
      * Búsqueda de la cadena "string" en la base de datos.
      * @param {String} string cadena de texto para buscar en los nombres de usuario presentes en la base de datos.
      * @param {Function} callback Función que devolverá el objeto error o el resultado
      */
     search(string, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) {callback(`Error de conexión: ${err.message}`, undefined)}
            else {
                connection.query("SELECT * FROM actor_universitario WHERE tipo != ? AND apellidos LIKE ?",
                [0, "%" + string + "%"],
                (err, rows) => {
                    connection.release();
                    if (err) { callback(err, undefined);}
                    else {
                        let users = [];
                        rows.forEach(user => {
                            users.push({ name: user.nombre, surnames: user.apellidos, type: user.tipo, id:user.id});
                        });
                        callback(null, users);
                    }
                })
            }
        });
    }

    /**
     * 
     * @param {*} user 
     * @param {*} callback 
     */
    addUser(user, callback){
        this.pool.getConnection((err,connection)=>{
            if(err){
                callback(err, undefined);
            }
            else{
                connection.query("SELECT nombre, apellidos FROM actor_universitario WHERE nombre=? AND apellidos=?",
                [user.nombre, user.apellidos], (err, rows)=>{
                    if(err){
                        callback(err,undefined);
                    }else{
                        if(rows.length===0){
                            connection.query("INSERT INTO actor_universitario(nombre, apellidos, tipo) VALUES (?,?,?)",
                            [user.nombre, user.apellidos, user.tipo], (err,exito)=>{
                                if(err){
                                    callback(err, undefined);
                                }else
                                callback(null,exito);
                            });
                        }else{
                            callback(null, false);
                        }
                    }   
            
                });
            }
        });

    }

    /**
     * 
     * @param {*} id 
     * @param {*} callback 
     */
    removeUser(id, callback){
        this.pool.getConnection((err,connection)=>{
            if(err){
                callback(err,undefined);
            }else{
                connection.query("SELECT id FROM actor_universitario WHERE id = ?", [id], (err,row)=>{
                    if(err){
                        callback(err,undefined);
                    }else{
                        if(row.length===1){
                            connection.query("DELETE FROM actor_universitario WHERE id= ?", [id], (err,exito)=>{
                                if(err){
                                    callback(err,undefined);
                                }else{
                                    callback(null, exito);
                                }
                            });
                        }else{
                            callback(undefined, false);
                        }
                    }
                });
            }
        });
    }
}

module.exports = {
    DAOAdmin: DAOAdmin
}