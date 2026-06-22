import db from '../config/db.js'

const findAllByProject = async (project_id) => {
const sql = "SELECT * FROM journal WHERE project_id = ?";
const [result] = await db.execute(sql, [project_id]);
return result;
}
const create = async (message, project_id, users_id) => {
    const sql = 'INSERT INTO journal (message, project_id, users_id) VALUES (?,?,?)';
    const [result] = await db.execute(sql, [message,project_id,users_id]);
    return result
}
const remove = async (id_journal) => {
    const sql = 'DELETE FROM journal WHERE id_journal = ?';
    const [result] = await db.execute(sql, [id_journal]);
    return result;
} 

export default {
    findAllByProject,
    create,
    remove
}