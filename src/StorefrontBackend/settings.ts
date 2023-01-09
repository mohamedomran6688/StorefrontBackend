import dotenv from 'dotenv';
import { Pool } from 'pg';
import { Request } from '../users/types/types';
import UserModel from '../users/models';
import express from 'express';

dotenv.config();

// set database connection and port server
const env: {
  PORT: number;
  NODE_ENV: string;
  PS_host: string;
  PS_port: number;
  PS_DB: string;
  PS_user: string;
  PS_password: string;
  BCRYPT_PASS: string;
  saltRounds: number;
  secretOrPrivateKey: string;
} = {
  PORT: +(process.env.PORT as string),
  NODE_ENV: process.env.NODE_ENV as string,
  PS_host: process.env.PS_host as string,
  PS_port: +(process.env.PS_port as string),
  PS_DB: (process.env.NODE_ENV as string).includes('test') ? (process.env.PS_DB_test as string) : (process.env.PS_DB_dev as string),
  PS_user: process.env.PS_user as string,
  PS_password: process.env.PS_password as string,
  BCRYPT_PASS: process.env.BCRYPT_PASS as string,
  saltRounds: +(process.env.saltRounds as string),
  secretOrPrivateKey: process.env.secretOrPrivateKey as string,
};

// create pool
const pool = new Pool({
  host: env.PS_host,
  database: env.PS_DB,
  user: env.PS_user,
  password: env.PS_password,
  port: env.PS_port,
});

// pool.on('error', (error: Error) => {
//    console.log('error in pool', error);
// });

// set user in request object for all requests
const setUserReq = async (req: Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  const Authorization = req.get('Authorization');
  req.user = null;
  if (Authorization) {
    const [bearer, token] = Authorization.split(' ');
    if (token && bearer === 'Bearer') {
      const user = new UserModel();
      req.user = await user.userToken(token);
    }
  }
  next();
};

export { pool, env, setUserReq };
