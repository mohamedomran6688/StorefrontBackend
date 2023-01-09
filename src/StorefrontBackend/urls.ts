import express from 'express';
import userUrl from '../users/urls';
import { badUrl, listDisplay, CreateRecord, UpdateRecord, DeleteRecord } from './views';

// create new routes
const routes = express.Router();

// register api listDisplay
routes.get('/:app/:model', listDisplay);

// register api create
routes.post('/:app/:model', CreateRecord);

// register api update
routes.put('/:app/:model', UpdateRecord);

// register api delete
routes.delete('/:app/:model', DeleteRecord);

// register user urls
routes.use(userUrl);

// any url dont start with api/ or static
routes.all('*', badUrl);

export default routes;
