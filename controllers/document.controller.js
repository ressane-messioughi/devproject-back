import documentService from '../services/document.service.js';
import socketService from '../services/socket.service.js';
import teamModel from '../models/team.model.js';
import cloudinary from '../config/cloudinary.js';

// Fonction pour récupérer tous les documents d'un projet
const getProjectDocuments = async (req, res) => {
  const { id_project: project_id } = req.params;
  const result = await documentService.getProjectDocuments(project_id);
  return res.status(200).json({ message: 'Documents du projet chargés', result });
};

// Fonction pour déposer un document (fichier obligatoire, envoyé sur Cloudinary)
const createDocument = async (req, res) => {
  const { id_project: project_id } = req.params;
  const uploaded_by = req.user.id;
  const { name, description } = req.body;

  // resource_type 'auto' laisse Cloudinary reconnaître le type : sans lui, un PDF,
  // un tableur ou une archive seraient refusés parce que ce ne sont pas des images.
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'devproject/documents', resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(req.file.buffer);
  });

  const fichier = {
    file_url: uploadResult.secure_url,
    file_name: req.file.originalname,
    file_size: req.file.size,
    file_type: req.file.mimetype,
  };

  const result = await documentService.createDocument(
    name,
    description,
    fichier,
    project_id,
    uploaded_by,
  );

  const newDocument = {
    id_document: result.insertId,
    name,
    description: description ?? null,
    ...fichier,
    project_id: Number(project_id),
    uploaded_by,
    created_at: new Date(),
    username: req.user.username,
    avatar: req.user.avatar,
  };
  socketService.newDocument(project_id, newDocument);
  socketService.documentNotifyTeam(project_id, req.user, name);

  return res.status(201).json({ message: 'Document déposé avec succès !', result });
};

// Fonction pour renommer un document (uniquement la personne qui l'a déposé)
const updateDocument = async (req, res) => {
  const { id_project: project_id, id_document } = req.params;
  const { name, description } = req.body;
  const result = await documentService.updateDocument(
    id_document,
    req.user.id,
    name,
    description,
  );

  socketService.documentUpdated(project_id, {
    id_document: Number(id_document),
    name,
    description: description ?? null,
  });

  return res.status(200).json({ message: 'Document modifié avec succès !', result });
};

// Fonction pour supprimer un document.
// L'auteur retire le sien, le owner peut retirer n'importe lequel : on lui demande son
// rôle dans l'équipe avant de trancher.
const deleteDocument = async (req, res) => {
  const { id_project: project_id, id_document } = req.params;

  const team = await teamModel.findByProjectId(project_id);
  const teamUser = team ? await teamModel.getUserRole(req.user.id, team.id_team) : null;
  const estOwner = teamUser?.role === 'OWNER';

  const result = await documentService.deleteDocument(id_document, req.user.id, estOwner);

  socketService.documentDeleted(project_id, Number(id_document));

  return res.status(200).json({ message: 'Document supprimé avec succès !', result });
};

export default {
  getProjectDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
};
