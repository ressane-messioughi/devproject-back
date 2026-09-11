import ticketService from '../services/ticket.service.js';

// Fonction pour ouvrir un ticket de support
const createTicket = async (req, res) => {
  const { subject, message, category } = req.body;
  const result = await ticketService.createTicket(subject, message, category, req.user.id);
  return res.status(201).json({ message: 'Votre demande a bien été envoyée !', result });
};

// Fonction pour récupérer ses propres tickets
const getMyTickets = async (req, res) => {
  const result = await ticketService.getMyTickets(req.user.id);
  return res.status(200).json({ message: 'Vos demandes', result });
};

// Fonction pour récupérer tous les tickets (administration)
const getAllTickets = async (req, res) => {
  const result = await ticketService.getAllTickets();
  return res.status(200).json({ message: 'Tickets chargés', result });
};

// Fonction pour répondre à un ticket (administration)
const answerTicket = async (req, res) => {
  const { id_ticket } = req.params;
  const { status, answer } = req.body;
  const result = await ticketService.answerTicket(id_ticket, status, answer, req.user.id);
  return res.status(200).json({ message: 'Ticket mis à jour', result });
};

// Fonction pour supprimer un ticket (administration)
const deleteTicket = async (req, res) => {
  const { id_ticket } = req.params;
  const result = await ticketService.deleteTicket(id_ticket);
  return res.status(200).json({ message: 'Ticket supprimé', result });
};

export default { createTicket, getMyTickets, getAllTickets, answerTicket, deleteTicket };
