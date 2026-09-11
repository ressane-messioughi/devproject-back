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

export default {
  getProjectSchemas,
  getSchemaById,
  createSchema,
  updateSchema,
  deleteSchema,
};
