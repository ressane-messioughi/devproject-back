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

// Fonction pour recuperer les commentaires d'un schema
const getSchemaComments = async (schema_id) => {
  const result = await schemaModel.findCommentsBySchema(schema_id);
  return result;
};

// Fonction pour ajouter un commentaire sur un schema
const createComment = async (message, schema_id, users_id) => {
  const schema = await schemaModel.findById(schema_id);
  if (!schema) {
    throw new AppError('Schéma introuvable', 404);
  }
  const result = await schemaModel.createComment(message, schema_id, users_id);
  return result;
};

// Fonction pour supprimer un commentaire (uniquement son auteur)
const deleteComment = async (id_comment, requester_id) => {
  const comment = await schemaModel.findCommentById(id_comment);
  if (!comment) {
    throw new AppError('Commentaire introuvable', 404);
  }
  if (comment.users_id !== requester_id) {
    throw new AppError('Vous ne pouvez supprimer que vos propres commentaires', 403);
  }
  const result = await schemaModel.removeComment(id_comment);
  return result;
};

// Fonction pour recuperer les approbations de tous les schemas d'un projet
const getProjectApprovals = async (project_id) => {
  const result = await schemaModel.findApprovalsByProject(project_id);
  return result;
};

// Fonction pour approuver un schema, ou retirer son approbation si elle existe deja.
// Le meme appel fait les deux : le bouton de l'interface est une bascule.
const toggleApproval = async (schema_id, users_id) => {
  const schema = await schemaModel.findById(schema_id);
  if (!schema) {
    throw new AppError('Schéma introuvable', 404);
  }

  const result = await schemaModel.createApproval(schema_id, users_id);

  // affectedRows valant 0, la ligne existait deja : on retire l'approbation
  if (result.affectedRows === 0) {
    await schemaModel.removeApproval(schema_id, users_id);
    return { approved: false };
  }
  return { approved: true };
};

export default {
  getProjectSchemas,
  getSchemaById,
  createSchema,
  updateSchema,
  deleteSchema,
  getSchemaComments,
  createComment,
  deleteComment,
  getProjectApprovals,
  toggleApproval,
};
