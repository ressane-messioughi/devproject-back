import teamService from "../services/team.service.js";

const getUserTeam = async (req, res) => {
    const {id_project} = req.params;
    const result = await teamService.getUserTeam(id_project);
    return res.status(200).json(result)
}
export default {
    getUserTeam
}