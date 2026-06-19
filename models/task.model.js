import db from '../config/db.js' 

const findAll = async (id_project) => {
    const sql = 'SELECT * FROM task WHERE id_project = ?';
    const [result] = await db.execute(sql, [id_project]);
    return result
}
const findById = async (id_project, id_task) => {
    const sql = 'SELECT * FROM task WHERE id_project = ? AND task_id = ?';
    const [result] = await db.execute(sql, [id_project, id_task]);
    return result
}
const create = async (id_project, title, description, status) => {
    const sql = 'INSERT INTO task (title,description,status) VALUES (?,?,?)';
    const [result] = await db.execute(sql, [id_project, id_task]);
    return result 
}
const update = async (id_project, id_task, title, description, status) => {
    const sql = 'UPDATE task SET title = ?, description = ?, status = ? WHERE id_project = ? AND id_task = ?';
    const [result] = await db.execute(sql, [id_project, id_task, title, description, status]);
    return result;
}
const remove = async (id_project,id_task ) => {
const sql = 'DELETE FROM task WHERE id_project = ? AND id_task = ?';
const [result] = await db.execute(sql,[id_project, id_task])
return result 
}
export default {
   findAll,
   findById,
   create,
   update,
   remove
}