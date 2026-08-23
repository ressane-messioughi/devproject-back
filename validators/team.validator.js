import { body } from 'express-validator';

const TEAM_ROLES = [
  'Développeur Front',
  'Développeur Back',
  'Développeur Fullstack',
  'DevOps',
  'Lead',
  'Scrum',
];

export const validateTeamRoleBody = [
  body('team_role')
    .notEmpty().withMessage('Le rôle est obligatoire')
    .isIn(TEAM_ROLES).withMessage(`Le rôle doit être l'un de : ${TEAM_ROLES.join(', ')}`),
];
