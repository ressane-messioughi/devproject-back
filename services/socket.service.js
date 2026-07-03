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

const newJournalMessage = async (id_project, newMessage) => { 
io.to(`project_${id_project}`).emit("newJournalMessage", {newMessage}); 
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


export default {
    deleteProject,
    joinProject,
    memberJoinedProject,
    newJournalMessage,
    journalNotifyTeam,
    newProjectList
} 