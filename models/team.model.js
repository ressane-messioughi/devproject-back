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
export default { 
    create,
    addUserToTeam
}