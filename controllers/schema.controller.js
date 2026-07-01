import schemaService from "../services/schema.service.js";

// Fonction pour récupérer tous les schémas d'un projet
const getProjectSchemas = async (req, res) => {
    const {id_project} = req.params;
    const result = await schemaService.getProjectSchemas(id_project);
    return res.status(200).json(result)
}
// Fonction pour récupérer un schéma par son ID
const getSchemaById = async (req, res) => {
    const {id_project, id_schema} = req.params;
    const result = await schemaService.getSchemaById(id_project, id_schema);
    return res.status(200).json(result)
}
export default {
    getProjectSchemas,
    getSchemaById
}