import schemaModel from '../models/schema.model.js';
import AppError from '../middleware/AppError.js';

// Fonction pour récupérer tous les schémas d'un projet
const getProjectSchemas = async (project_id) => {
  const result = await schemaModel.findAllByProject(project_id);
  return result;
};

// Fonction pour récupérer un schéma par son ID
const getSchemaById = async (id_schema) => {
  const result = await schemaModel.findById(id_schema);
  if (!result) {
    throw new AppError('Schéma introuvable', 404);
  }
  return result;
};

// Fonction pour créer un schéma
const createSchema = async (name, file_url, project_id, uploaded_by) => {
  const result = await schemaModel.create(name, file_url, project_id, uploaded_by);
  return result;
};

// Fonction pour renommer un schéma (uniquement la personne qui l'a déposé)
const updateSchema = async (id_schema, requester_id, name) => {
  const schema = await schemaModel.findById(id_schema);
  if (!schema) {
    throw new AppError('Schéma introuvable', 404);
  }
  if (schema.uploaded_by !== requester_id) {
    throw new AppError('Vous ne pouvez renommer que les schémas que vous avez déposés', 403);
  }
  const result = await schemaModel.updateName(id_schema, name);
  return result;
};

// Fonction pour supprimer un schéma (uniquement le owner du projet, vérifié par le middleware isProjectOwner)
const deleteSchema = async (id_schema) => {
  const result = await schemaModel.remove(id_schema);
  return result;
};

export default {
  getProjectSchemas,
  getSchemaById,
  createSchema,
  updateSchema,
  deleteSchema,
};
