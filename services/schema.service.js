import schemaModel from "../models/schema.model";

// Fonction pour récupérer tous les schémas d'un projet
const getAll = async (id_project) => {
    const result = await schemaModel.findAll(id_project)
    return result 
}

// Fonction pour récupérer un schéma par son ID
const getById = async (id_project, id_schema) => {
    const result = await schemaModel.findById(id_project, id_schema);
    return result 
}
export default {
    getAll,
    getById
}