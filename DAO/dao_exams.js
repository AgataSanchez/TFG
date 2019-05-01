"use strict";


/**
 * Proporciona operaciones para la gestión de examenes
 * en la base de datos.
 */
class DAOExams {
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
     * Determina si un determinado examen aparece en la BD con el nombre
     * pasado como parámetro.
     * 
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando, por un lado, el objeto Error (si se produce, o null en caso contrario)
     * y, por otro lado, un booleano indicando el resultado de la operación
     * (true => el examen no existe, false => el examen existe)
     * En caso de error error, el segundo parámetro de la función callback será indefinido.
     * 
     * @param {string} idExamen Identificador del examen a buscar
     * @param {string} nombreExamen Nombre a comprobar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */

    /*Deveulve true/false*/
    addExamToBBDD(nombreExamen,callback){
        this.pool.getConnection((err, connection) => {
            if(err){
                callback(err, undefined);
            }
            else{
                //Poner bien los campos acordes con las columnas de la bd
            connection.query("SELECT nombreExamen FROM examenes  WHERE nombre = ?",
            [nombreExamen],
            (err, rows) => {
            if (err) { callback(err, undefined); }
            if (rows.length === 0) {
                connection.query("INSERT INTO examenes(nombre) VALUES ('?')",[nombreExamen],
                (err)=>{
                    if(err){callback(err,undefined)}
                    else{callback(null, true);}
                });
            } else {
                callback(null, false);
            }
            });
        }
        connection.release();
        });
    }
    /*Deveulve true/false*/
    removeExamFromBBDD(nombreExamen,callback){
        this.pool.getConnection((err, connection) => {
            if(err){
                callback(err, undefined);
            }
            else{
                //Poner bien los campos acordes con las columnas de la bd
            connection.query("SELECT nombreExamen FROM examenes  WHERE nombre = ?",
            [nombreExamen],
            (err, rows) => {
            if (err) { callback(err, undefined); }
            if (rows.length !== 0) {//Existe el examen
                connection.query("DELETE FROM examenes WHERE nombre= ?",[nombreExamen],
                (err)=>{
                    if(err){callback(err,undefined)}
                    else{callback(null, true);}
                });
            } else {//No existe el examen
                callback(null, false);
            }
            });
        }
        connection.release();
        });
    }
    /**
     * Devuelve null o el array de examenes
     * @param {*} idAsignatura 
     * @param {*} callback 
     */
    showExams(idAsignatura,callback){
        this.pool.getConnection((err, connection) => {
            if(err){
                callback(err, undefined);
            }
            else{
                //Poner bien los campos acordes con las columnas de la bd
            connection.query("SELECT enunciado1, enunciado2, enunciado3 FROM imparte i JOIN examen e ON i.id_grupo=e.id_grupo  WHERE i.id_asignatura= ?",[idAsignatura],
            (err, rows) => {
            if (err) { callback(err, undefined); }
            if (rows.length !== 0) {//Existe algun examen
                callback(err,rows);//Devolvemos el array
            } else {//No existe ningun examen
                callback(null, null);
            }
            });
        }
        connection.release();
        });
    }
}

module.exports = {
    DAOExams: DAOExams
}