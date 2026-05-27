import express from 'express';

import {
  getProjectTeam,
  inviteMember,
  removeMember,
  updateMemberRole,
} from '../controllers/team.controller.js';

const router = express.Router();

router.get('/:projectId', getProjectTeam);

router.post('/:projectId/invite', inviteMember);

router.put('/:projectId/:userId/role', updateMemberRole);

router.delete('/:projectId/:userId', removeMember);

export default router;
