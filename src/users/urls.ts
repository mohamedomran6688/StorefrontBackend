import express from 'express';
import { authenticate } from './views';

// create new routes
const routes = express.Router();

// register authenticate
routes.post('/authenticate', authenticate);

export default routes;
