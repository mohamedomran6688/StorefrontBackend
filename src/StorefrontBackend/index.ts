import express from 'express';
import { Request } from '../users/types/types';
import urls from './urls';
import { env, setUserReq } from './settings';

// create express app
const app = express();

// middlewear to parse incoming request
app.use(express.json());

// apply middlewear to set user in request if found or null
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  setUserReq(req as Request, res, next);
});

// register urls
app.use(urls);

// start server
app.listen(env.PORT, () => {
  console.log(`server started at http://localhost:${env.PORT}`);
});

export default app;
