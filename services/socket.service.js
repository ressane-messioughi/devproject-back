import {io} from "../server.js";

const deleteProject = async (id_project, user) => {
    io.to(`project_${id_project}`).emit("memberLeftProject", {
    project_id: id_project,
    user_id: user.id,
    username: user.username,
    avatar: user.avatar,
  });
}

const joinProject = async (project, user, result) => {
io.to(`project_${project.id_project}`).emit('newJoinRequest', {
    id_request: result.insertId,
    project_id: project.id_project,
    status: 'PENDING',
    firstname: user.firstname,
    lastname: user.lastname,
    username: user.username,
    avatar: user.avatar,
  });
}
const memberJoinedProject = async (result) => {
  io.to(`project_${result.project_id}`).emit('memberJoinedProject', {
    project_id: result.project_id,
    username: result.username,
    avatar: result.avatar,
  });

}

// Notifie directement l'utilisateur dont la demande vient d'être acceptée (salle personnelle
// "user_<id>", indépendante des salles de projet — il ne peut pas encore être dans celle du
// projet qu'il vient tout juste de rejoindre)
const joinRequestAccepted = async (user_id, project) => {
  io.to(`user_${user_id}`).emit('joinRequestAccepted', project);
}

const newJournalMessage = async (id_project, newMessage) => {
io.to(`project_${id_project}`).emit("newJournalMessage", newMessage);
}
// Notification en temps réel pour tous les utilisateurs connectés au projet lorsqu'un nouveau message est créé
const journalNotifyTeam = async (id_project,user,title) => {
io.to(`project_${id_project}`).emit("journalNotification", {
// Informations sur le nouveau message pour la notification
  project_id: id_project,
  username: user.username,
  avatar: user.avatar,
  title,
});
}
const newProjectList = async (newProject) => {
io.to(`project_${newProject.project_id}`).emit("newProjectList", newProject);
}

const newBug = async (id_project, bugData) => {
io.to(`project_${id_project}`).emit("newBug", bugData);
}
// Notification en temps réel pour tous les utilisateurs connectés au projet lorsqu'un nouveau bug est signalé
const bugNotifyTeam = async (id_project, user, title) => {
io.to(`project_${id_project}`).emit("bugNotification", {
  project_id: id_project,
  username: user.username,
  avatar: user.avatar,
  title,
});
}

// Diffuse le changement de statut d'un bug à toute la salle du projet, pour mettre à jour
// l'affichage (avatar + username de la personne qui vient de le changer) chez tout le monde
const bugStatusUpdated = async (id_project, updatedBug) => {
  io.to(`project_${id_project}`).emit('bugStatusUpdated', updatedBug);
}

// Diffuse la modification du titre/description d'un bug (par son auteur) à toute la salle du projet
const bugUpdated = async (id_project, updatedBug) => {
  io.to(`project_${id_project}`).emit('bugUpdated', updatedBug);
}

// Diffuse la suppression d'un bug (par le owner) à toute la salle du projet
const bugDeleted = async (id_project, id_bug) => {
  io.to(`project_${id_project}`).emit('bugDeleted', { id_bug });
}

// Notifie directement l'utilisateur qui vient d'être retiré d'un projet par le owner (salle
// personnelle "user_<id>") — il n'est plus dans la salle du projet pour recevoir un message
// diffusé là-bas une fois son accès révoqué
const memberRemoved = async (user_id, project_id) => {
  io.to(`user_${user_id}`).emit('memberRemoved', { project_id });
}

// Diffuse l'ajout d'un schéma à toute la salle du projet
const newSchema = async (id_project, schemaData) => {
io.to(`project_${id_project}`).emit("newSchema", schemaData);
}

// Diffuse le renommage d'un schéma à toute la salle du projet
const schemaUpdated = async (id_project, updatedSchema) => {
  io.to(`project_${id_project}`).emit('schemaUpdated', updatedSchema);
}

// Diffuse la suppression d'un schéma (par le owner) à toute la salle du projet
const schemaDeleted = async (id_project, id_schema) => {
  io.to(`project_${id_project}`).emit('schemaDeleted', { id_schema });
}

// Diffuse le renommage du projet à toute la salle, pour que le sélecteur de projet
// de chaque membre affiche le nouveau nom sans rechargement
const projectUpdated = async (id_project, updatedProject) => {
  io.to(`project_${id_project}`).emit('projectUpdated', updatedProject);
}

// Diffuse l'ajout d'une tâche à toute la salle du projet
const newTask = async (id_project, taskData) => {
io.to(`project_${id_project}`).emit("newTask", taskData);
}

// Diffuse la modification d'une tâche (titre, statut, membre assigné) à toute la salle du projet
const taskUpdated = async (id_project, updatedTask) => {
  io.to(`project_${id_project}`).emit('taskUpdated', updatedTask);
}

// Diffuse la suppression d'une tâche à toute la salle du projet
const taskDeleted = async (id_project, id_task) => {
  io.to(`project_${id_project}`).emit('taskDeleted', { id_task });
}


export default {
    deleteProject,
    joinProject,
    memberJoinedProject,
    joinRequestAccepted,
    newJournalMessage,
    journalNotifyTeam,
    newProjectList,
    newBug,
    bugNotifyTeam,
    bugStatusUpdated,
    bugUpdated,
    bugDeleted,
    memberRemoved,
    newSchema,
    schemaUpdated,
    schemaDeleted,
    projectUpdated,
    newTask,
    taskUpdated,
    taskDeleted
}