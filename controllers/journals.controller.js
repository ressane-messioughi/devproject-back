import journalService from "../services/journal.service.js";

const getProjectMessage = async (req, res) => {
    const {id_project} = req.params
    const result = await journalService.getProjectMessage(id_project)
    return res.status(200).json(result)
};
const createMessage = async (req, res) => {
    const {message} = req.body;
    const {id_project} = req.params;
    const users_id = req.user.id;
    const result = await journalService.createMessage(message, id_project, users_id);
    return res.status(201).json({result, message : 'Message créer avec succès !'}) 
};
const deleteMessage = async (req,res) => {
    const {id_journal} = req.params;
    const result = await journalService.deleteMessage(id_journal);
    return res.status(200).json({message : "Message supprimé avec succès !", result});
};
export default {
    getProjectMessage,
    createMessage,
    deleteMessage
}