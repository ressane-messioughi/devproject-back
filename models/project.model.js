import db from "../config/db.js"


const findAll = async () => {
const sql = "SELECT * FROM project";
const [result] = await db.execute(sql);
return result 
}
const findById = async (id_project) => {
    const sql = "SELECT * FROM project WHERE id_project = ?"
    const [result] = await db.execute(sql,[id_project])
    return result
}
const findByUserId = async (user_id) => {
    const sql = `SELECT DISTINCT p.* FROM Project p INNER JOIN Team t ON t.project_id = p.id_project INNER JOIN TEAM_USER tu ON tu.team_id = t.id_team WHERE tu.users_id = ?`;
    const [result] = await db.execute(sql, [user_id]);
    return result;

}
const create = async (name, description, owner_id, team_code) => {
    const sql = "INSERT INTO project (name,description,owner_id,team_code) VALUES (?,?,?,?)"
    const [result] = await db.execute(sql,[name,description,owner_id,team_code])
    return result
}
const update = async (name, description, id_project) => {
    const sql = "UPDATE project SET name = ?, description = ? WHERE id_project = ?"
    const [result] = await db.execute(sql,[name, description, id_project])
    return result
}
const remove = async (id_project) => {
    const sql = "DELETE FROM project WHERE id_project = ?"; 
    const [result] = await db.execute(sql, [id_project]);
    return result
}
export default {
    findAll,
    findById,
    findByUserId,
    create,
    update,
    remove
}