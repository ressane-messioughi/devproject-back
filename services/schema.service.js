import schemaModel from "../models/schema.model";

const getAll = async (id_project) => {
    const result = await schemaModel.findAll(id_project)
    return result 
}
const getById = async (id_project, id_schema) => {
    const result = await schemaModel.findById(id_project, id_schema);
    return result 
}
export default {
    getAll,
    getById
}