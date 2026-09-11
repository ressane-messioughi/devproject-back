import schemaService from '../services/schema.service.js';
import socketService from '../services/socket.service.js';
import cloudinary from '../config/cloudinary.js';

// Fonction pour récupérer tous les schémas d'un projet
const getProjectSchemas = async (req, res) => {
  const { id_project: project_id } = req.params;
  const result = await schemaService.getProjectSchemas(project_id);
  return res.status(200).json({ message: 'Liste des schémas du projet chargée', result });
};

// Fonction pour récupérer un schéma par son ID
const getSchemaById = async (req, res) => {
  const { id_schema } = req.params;
  const result = await schemaService.getSchemaById(id_schema);
  return res.status(200).json(result);
};

// Fonction pour créer un schéma (avec un fichier obligatoire, uploadé sur Cloudinary)
const createSchema = async (req, res) => {
  const { id_project: project_id } = req.params;
  const uploaded_by = req.user.id;
  const { name } = req.body;

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'devproject/schemas' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(req.file.buffer);
  });
  const file_url = uploadResult.secure_url;

  const result = await schemaService.createSchema(name, file_url, project_id, uploaded_by);

  const newSchema = {
    id_schema: result.insertId,
    name,
    file_url,
    project_id,
    uploaded_by,
    created_at: new Date(),
    username: req.user.username,
    avatar: req.user.avatar,
  };
  socketService.newSchema(project_id, newSchema);
  socketService.schemaNotifyTeam(project_id, req.user, name);

  return res.status(201).json({ message: 'Schéma ajouté avec succès !', result });
};

// Fonction pour renommer un schéma (uniquement la personne qui l'a déposé)
const updateSchema = async (req, res) => {
  const { id_project: project_id, id_schema } = req.params;
  const { name } = req.body;
  const requester_id = req.user.id;
  const result = await schemaService.updateSchema(id_schema, requester_id, name);

  socketService.schemaUpdated(project_id, { id_schema: Number(id_schema), name });

  return res.status(200).json({ message: 'Schéma renommé avec succès !', result });
};

// Fonction pour supprimer un schéma (uniquement le owner du projet, voir middleware isProjectOwner)
const deleteSchema = async (req, res) => {
  const { id_project: project_id, id_schema } = req.params;
  const result = await schemaService.deleteSchema(id_schema);

  socketService.schemaDeleted(project_id, Number(id_schema));

  return res.status(200).json({ message: 'Schéma supprimé avec succès !', result });
};

// Fonction pour récupérer les commentaires d'un schéma
const getSchemaComments = async (req, res) => {
  const { id_schema } = req.params;
  const result = await schemaService.getSchemaComments(id_schema);
  return res.status(200).json({ message: 'Commentaires du schéma chargés', result });
};

// Fonction pour ajouter un commentaire sur un schéma
const createComment = async (req, res) => {
  const { id_project: project_id, id_schema } = req.params;
  const users_id = req.user.id;
  const { message } = req.body;
  const result = await schemaService.createComment(message, id_schema, users_id);

  const newComment = {
    id_comment: result.insertId,
    message,
    schema_id: Number(id_schema),
    users_id,
    created_at: new Date(),
    username: req.user.username,
    avatar: req.user.avatar,
  };
  socketService.newSchemaComment(project_id, newComment);

  return res.status(201).json({ message: 'Commentaire ajouté avec succès !', result });
};

// Fonction pour supprimer un commentaire (uniquement son auteur)
const deleteComment = async (req, res) => {
  const { id_project: project_id, id_schema, id_comment } = req.params;
  const result = await schemaService.deleteComment(id_comment, req.user.id);

  socketService.schemaCommentDeleted(project_id, {
    id_comment: Number(id_comment),
    schema_id: Number(id_schema),
  });

  return res.status(200).json({ message: 'Commentaire supprimé avec succès !', result });
};

// Fonction pour récupérer les approbations de tous les schémas du projet
const getProjectApprovals = async (req, res) => {
  const { id_project: project_id } = req.params;
  const result = await schemaService.getProjectApprovals(project_id);
  return res.status(200).json({ message: 'Approbations du projet chargées', result });
};

// Fonction pour approuver un schéma, ou retirer son approbation (bascule)
const toggleApproval = async (req, res) => {
  const { id_project: project_id, id_schema } = req.params;
  const users_id = req.user.id;
  const result = await schemaService.toggleApproval(id_schema, users_id);

  socketService.schemaApprovalUpdated(project_id, {
    schema_id: Number(id_schema),
    users_id,
    username: req.user.username,
    avatar: req.user.avatar,
    approved: result.approved,
  });

  return res.status(200).json({
    message: result.approved ? 'Schéma approuvé !' : 'Approbation retirée',
    result,
  });
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
