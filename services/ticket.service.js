import ticketModel from '../models/ticket.model.js';
import AppError from '../middleware/AppError.js';

// Fonction pour récupérer tous les tickets (administration)
const getAllTickets = async () => ticketModel.findAll();

// Fonction pour récupérer ses propres tickets
const getMyTickets = async (users_id) => ticketModel.findByUser(users_id);

// Fonction pour ouvrir un ticket
const createTicket = async (subject, message, category, users_id) => {
  const result = await ticketModel.create(subject, message, category, users_id);
  return result;
};

// Fonction pour répondre à un ticket (administration)
const answerTicket = async (id_ticket, status, reponse, answered_by) => {
  const ticket = await ticketModel.findById(id_ticket);
  if (!ticket) {
    throw new AppError('Ticket introuvable', 404);
  }
  const result = await ticketModel.answer(id_ticket, status, reponse, answered_by);
  return result;
};

// Fonction pour supprimer un ticket (administration)
const deleteTicket = async (id_ticket) => {
  const ticket = await ticketModel.findById(id_ticket);
  if (!ticket) {
    throw new AppError('Ticket introuvable', 404);
  }
  return ticketModel.remove(id_ticket);
};

export default { getAllTickets, getMyTickets, createTicket, answerTicket, deleteTicket };
