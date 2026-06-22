import db from '../config/db.js'

const create = async (name, project_id) => {
    const sql = "INSERT INTO team (name,project_id,created_at) VALUES (?, ?, NOW())";
    const [result] = await db.execute(sql, [name, project_id]);
    return result;
};
const addUserToTeam = async (users_id, team_id, role) => {
    const sql = "INSERT INTO TEAM_USER (users_id, team_id, joined_at, role) VALUES (?,?,NOW(), ?)";
    const [result] = await db.execute(sql,[users_id, team_id, role])
    return result
}
const findByProjectId = async (project_id) => {
    const sql = "SELECT * FROM team WHERE project_id = ?";
    const [result] = await db.execute(sql, [project_id]);
    return result[0];
}
const getUserTeam = async (project_id) => {
    const sql = `SELECT u.id,u.firstname,u.lastname,u.username,u.avatar,tu.role FROM TEAM_USER tu JOIN Users u ON tu.users_id = u.id JOIN team t ON tu.team_id = t.id_team WHERE t.project_id = ?`;
    const [result] = await db.execute(sql, [project_id]);
    return result

}
export default { 
    create,
    addUserToTeam,
    findByProjectId,
    getUserTeam
}