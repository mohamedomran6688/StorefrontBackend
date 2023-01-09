import { objects_database } from '../../StorefrontBackend/types/types';
import express from 'express';

type user = {
  id?: number;
  user_name?: string;
  first_name?: string | null;
  last_name?: string | null;
  password?: string | null;
  superuser?: boolean;
};

type userType = user & objects_database;

interface Request extends express.Request {
  user: userType | null;
}
export { userType, Request };
