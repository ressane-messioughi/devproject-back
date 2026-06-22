import joinRequestModel from "../models/joinRequest.model.js"
import teamModel from "../models/team.model.js";

const createRequest = async (team_code, user_id) => {
    const project = await joinRequestModel.findProjectByTeamCode(team_code)
    const result = await joinRequestModel.create(project.id_project, user_id)
    return result 
};
const getAllRequestByProject = async (id_project) => {
    const result = await joinRequestModel.findAllProjectById(id_project);
    return result;
};
const acceptRequest = async (id_request) => {
    const request = await joinRequestModel.findById(id_request);
    console.log(request);
    const team = await teamModel.findByProjectId(request.project_id)
    await teamModel.addUserToTeam(request.user_id,team.id_team, "MEMBER")
    await joinRequestModel.updateStatus(id_request, "ACCEPTED")
    return request
}
const refuseRequest = async (id_request) => {
    const request = await joinRequestModel.updateStatus(id_request, "REFUSED") 
    return request
}

export default {
    createRequest,
    getAllRequestByProject,
    acceptRequest,
    refuseRequest
}