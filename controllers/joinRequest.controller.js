import joinRequestService from "../services/joinRequest.service.js";

const createRequest = async (req, res) => {
    const {team_code} = req.body;
    const user_id = req.user.id;
    const result = await joinRequestService.createRequest(team_code, user_id);
    return res.status(201).json({message: "Demande envoyée avec succès ! ✅", result})
};
const getAllRequestByProject = async (req, res) => {
    const {id_project} = req.params;
    const result = await joinRequestService.getAllRequestByProject(id_project);
    return res.status(200).json(result)
};
const acceptRequest = async (req, res) => {
const {id_request} = req.params;
const result = await joinRequestService.acceptRequest(id_request);
return res.status(201).json({message : "Demande accepté avec succès ! ✅", result})
}
const refuseRequest = async (req, res) => {
    const {id_request} = req.params;
    const result = await joinRequestService.refuseRequest(id_request);
    return res.status(200).json({message : "Demannde refusé avec succès ! ⛔️"})
} 

export default {
    createRequest,
    getAllRequestByProject,
    acceptRequest,
    refuseRequest
}