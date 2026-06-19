import db from '../config/db.js'

const findAll = async () => {
const sql = "SELECT * FROM journal";
const [result] = await db.execute(sql);
return result;
}
const findById = async (id_project) => {
    const sql = 'SELECT * FROM journal WHERE id_project = ?';
    const [result] = await db.execute(sql, [id_project]);
    return result
}
const create = async (message, id_project, id) => {
    const sql = 'INSERT INTO journal (message, id_project, id) VALUES (?,?,?)';
    const [result] = await db.execute(sql, [message,id_project,id]);
    return result
}
const update = async (id_journal, message) => {
    const sql = 'UPDATE journal SET message = ? WHERE journal_id = ?';
    const [result] = await db.execute(sql, [id_journal, message])
    return result
}
const remove = async (id_journal) => {
    const sql = 'DELETE FROM journal WHERE id_journal = ?';
    const [result] = await db.execute(sql, [id_journal]);
    return result;
} 
export default {
    findAll,
    findById,
    create,
    update,
    remove
}