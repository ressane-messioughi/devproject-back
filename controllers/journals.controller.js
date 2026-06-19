import journalService from "../services/journal.service.js";

const getAll = async (req, res) => {
    const {id_project} = req.params
    const result = await journalService.findAllMessage(id_project)
    return res.status(200).json(result)
}
// const getById = async (req, res) => {
//     const journal_id = req.params
//     const result = await journalServicxe.findMessageById(journal_id);
//     return res.json(result)
// }
const createMessage = async (req, res) => {
    const {message} = req.body
    const {id_project} = req.params
    const id = req.user.id
    const result = await journalService.createMessage(message, id, id_project)
    return res.status(201).json({result, message : 'Message créer avec succès !'}) 
}
const updateMessage = async (req, res) => {
    const {message} = req.body;
    const {id_project} = req.params
    const id = req.user.id;
    const result = await journalService.updateMessage(message, id, id_project)
    return res.status(200).json({result, message : 'Message créer avec succès !'}) 
    
}
const deleteMessage = async (req,res) => {
    const {id_project, id_journal} = req.params
    const result = await journalService.deleteMessage(id_project, id_journal)
    return res.status(204).json() 

}
export default {
    getAll,
    // getById,
    createMessage,
    updateMessage,
    deleteMessage
}