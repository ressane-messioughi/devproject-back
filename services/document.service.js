import documentModel from '../models/document.model.js';
import AppError from '../middleware/AppError.js';

// Fonction pour récupérer tous les documents d'un projet
const getProjectDocuments = async (project_id) => {
  const result = await documentModel.findAllByProject(project_id);
  return result;
};

// Fonction pour créer un document
const createDocument = async (name, description, fichier, project_id, uploaded_by) => {
  const result = await documentModel.create(name, description, fichier, project_id, uploaded_by);
  return result;
};

// Fonction pour renommer un document (uniquement la personne qui l'a déposé)
const updateDocument = async (id_document, requester_id, name, description) => {
  const document = await documentModel.findById(id_document);
  if (!document) {
    throw new AppError('Document introuvable', 404);
  }
  if (document.uploaded_by !== requester_id) {
    throw new AppError('Vous ne pouvez modifier que les documents que vous avez déposés', 403);
  }
  const result = await documentModel.updateDetails(id_document, name, description);
  return result;
};

// Fonction pour supprimer un document.
// L'auteur peut retirer le sien, le owner peut retirer n'importe lequel : ce dernier cas
// est vérifié en amont par le middleware isProjectOwner, sur une route séparée.
const deleteDocument = async (id_document, requester_id, estOwner) => {
  const document = await documentModel.findById(id_document);
  if (!document) {
    throw new AppError('Document introuvable', 404);
  }
  if (!estOwner && document.uploaded_by !== requester_id) {
    throw new AppError('Vous ne pouvez supprimer que les documents que vous avez déposés', 403);
  }
  const result = await documentModel.remove(id_document);
  return result;
};

export default {
  getProjectDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
};
