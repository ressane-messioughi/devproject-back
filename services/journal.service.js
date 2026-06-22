import journalModel from '../models/journal.model.js'

const getProjectMessage = async (project_id) => {
    const result = await journalModel.findAllByProject(project_id);
    return result
}

const createMessage = async (message,project_id, users_id) => {
    const result = await journalModel.create(message, project_id, users_id);
    return result
}
const deleteMessage = async (id_journal) => {
    const result = await journalModel.remove(id_journal)
    return result;
}
export default {
    getProjectMessage,
    createMessage,
    deleteMessage
}