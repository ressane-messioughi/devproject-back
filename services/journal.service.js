import journalModel from '../models/journal.model.js'

const findAllMessage = async () => {
    const result = await journalModel.findAll()
    return result 
}
const findMessageById = async (journal_id) => {
    const result = await journalModel.findById(journal_id);
    return result 
}
const createMessage = async (message,project_id, users_id) => {
const result = await journalModel.create(message,project_id, users_id);
return result
}
const updateMessage = async (journal_id,project_id,users_id ) => {
    const result = await journalModel.update(journal_id, project_id, users_id);
    return result 
} 
const deleteMessage = async (journal_id) => {
    const result = await journalModel.remove(journal_id)
    return result;
}
export default {
    findAllMessage,
    findMessageById,
    createMessage,
    updateMessage,
    deleteMessage
}