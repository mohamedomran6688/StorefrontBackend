import { objects_database } from '../../StorefrontBackend/types/types';

type returnDataRespone = string | number | null | objects_database | objects_database[] | { [key: string]: objects_database | objects_database[] | returnDataRespone | returnDataRespone[] };

type reqBody = { [key: string]: string | number | boolean | null | reqBody | reqBody[] | { [key: string]: reqBody | reqBody[] } };

export { returnDataRespone, reqBody };
