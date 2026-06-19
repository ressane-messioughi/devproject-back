import db from "../config/db.js"


const findAll = async () => {
const sql = "SELECT * FROM project";
const [result] = await db.execute(sql);
return result 
}
const findById = async (id) => {
    const sql = "SELECT * FROM project WHERE id_project = ?"
    const [result] = await db.execute(sql,[id])
    return result
}
const create = async (name, description, owner_id, team_code) => {
    const sql = "INSERT INTO project (name,description,owner_id,team_code) VALUES (?,?,?,?)"
    const [result] = await db.execute(sql,[name,description,owner_id,team_code])
    return result
}
const update = async (name, description, id) => {
    const sql = "UPDATE project SET name = ?, description = ? WHERE id_project = ?"
    const [result] = await db.execute(sql,[name, description, id])
    return result
}
const remove = async (id) => {
    const sql = "DELETE FROM project WHERE id_project = ?"; 
    const [result] = await db.execute(sql, [id]);
    return result
}
export default {
    findAll,
    findById,
    create,
    update,
    remove
}