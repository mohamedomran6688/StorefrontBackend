import express from 'express';
import { collectSchema } from '../schema/collectschema';
import response, { error_appname_model } from './utilities/utilities';
import * as schema_app from '../schema/apps/index';
// functions
const apps: { [key: string]: { [key: string]: any } } = schema_app;
// check app name and model name is vaild or not if not vaild will set response with error
const checkParams = (res: express.Response, appName: string, model: string): boolean => {
  if (Object.keys(apps).includes(appName)) {
    if (Object.keys(apps[appName]).includes(model)) {
      return true;
    }
  }
  error_appname_model(res);
  return false;
};

// list all records in table in database
const listDisplay = (req: express.Request, res: express.Response): void => {
  if (!checkParams(res, req.params.app, req.params.model)) return;
  const model: collectSchema = new apps[req.params.app][req.params.model](req, res);
  model.set_response_ListDispaly();
};

// create record in table in database
const CreateRecord = (req: express.Request, res: express.Response): void => {
  if (!checkParams(res, req.params.app, req.params.model)) return;
  const model: collectSchema = new apps[req.params.app][req.params.model](req, res);
  model.set_response_Create();
};

// update record in table in database
const UpdateRecord = (req: express.Request, res: express.Response): void => {
  if (!checkParams(res, req.params.app, req.params.model)) return;
  const model: collectSchema = new apps[req.params.app][req.params.model](req, res);
  model.set_response_Update();
};
// delete record in table in database
const DeleteRecord = (req: express.Request, res: express.Response): void => {
  if (!checkParams(res, req.params.app, req.params.model)) return;
  const model: collectSchema = new apps[req.params.app][req.params.model](req, res);
  model.set_response_Delete();
};

// handel bad url
const badUrl = (req: express.Request, res: express.Response): void => {
  response(res, 404, 'url is not valid');
};

// export
export { badUrl, listDisplay, CreateRecord, UpdateRecord, DeleteRecord };
