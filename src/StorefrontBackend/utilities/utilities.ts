import { Response } from 'express';
import { returnDataRespone } from '../../schema/types/types';

const response = (res: Response, status: number, error: null | string = null, data: returnDataRespone = null) => {
  res.status(status);
  res.json({
    success: error ? false : true,
    error: error,
    data: data,
  });
};

// if appname or model name is not found will set respone error
const error_appname_model = (res: Response) => {
  response(res, 400, 'appName or model name incorrect');
};

export { error_appname_model };
export default response;
