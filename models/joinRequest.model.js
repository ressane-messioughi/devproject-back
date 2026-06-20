import db from "../config/db.js"

const findProjectByTeamCode = async (team_code) => {
    const sql = "SELECT * FROM project WHERE team_code = ?";
    const [result] = await db.execute(sql, [team_code]);
    return result[0]
};
const create = async (project_id, user_id) => {
const sql = `INSERT INTO join_request (project_id, user_id, status) VALUES (?,?,'PENDING')`;
const result = await db.execute(sql, [project_id, user_id])
return result
}

const findAllProjectById = async (project_id) => {
const sql = `SELECT jr.id_request,jr.status,u.firstname,u.lastname,u.username FROM join_request jr JOIN Users u ON jr.user_id = u.id WHERE jr.project_id = ?`;
const [result] = await db.execute(sql, [project_id]);
return result
}

export default {
    findProjectByTeamCode,
    create,
    findAllProjectById
}