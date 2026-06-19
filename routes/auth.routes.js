import express from 'express';
import {validateAuthBody} from "../validators/auth.validator.js"
import validate from '../middleware/Validate.js';
import {authenticate} from '../middleware/auth.middleware.js'

import { updateUser , login, register } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);

router.post('/login', validateAuthBody, validate, login);

router.patch('/:id_users', authenticate, updateUser);

export default router;
