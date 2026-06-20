import joinRequestModel from "../models/joinRequest.model.js"

const createRequest = async (team_code, user_id) => {
    const project = await joinRequestModel.findProjectByTeamCode(team_code)
    const result = await joinRequestModel.create(project.id_project, user_id)
    return result 
};
const getAllRequestByProject = async (id_project) => {
    const result = await joinRequestModel.findAllProjectById(id_project);
    return result;
};


export default {
    createRequest,
    getAllRequestByProject
}