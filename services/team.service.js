import teamModel from "../models/team.model.js";

const getUserTeam = async (project_id) => {
    const result = await teamModel.getUserTeam(project_id);
    return result
}
export default {
    getUserTeam
}