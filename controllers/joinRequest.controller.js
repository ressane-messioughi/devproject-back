import joinRequestService from "../services/joinRequest.service.js";

const createRequest = async (req, res) => {
    const {team_code} = req.body
    const user_id = req.user.id
    const result = await joinRequestService.createRequest(team_code, user_id);
    return res.status(201).json({message: "Demande envoyée avec succès", result})
}
const getAllRequestByProject = async (req, res) => {
    const {id_project} = req.params;
    const result = await joinRequestService.getAllRequestByProject(id_project)
    return res.status(200).json(result)
}
export default {
    createRequest,
    getAllRequestByProject
}