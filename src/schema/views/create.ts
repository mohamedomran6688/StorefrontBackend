import { hub } from '../hub';
import { objects_database } from '../../StorefrontBackend/types/types';
import { reqBody } from '../types/types';
class Create extends hub {
  objCreated!: objects_database;
  checkCreateLogin = true; // check create login
  bodyCreate!: reqBody; // body comes in requets
  createExcludeParameters: string[] = ['id']; // exclude fields from body request befor create
  ////////////////////////////
  async prepare_body_create(): Promise<boolean> {
    const body: reqBody = this.req.body;
    // check if body have no data set error to client
    if (!Object.keys(body).length) {
      this.error = new Error('plz provide fields data at body in josn');
      return false;
    }
    const optmize_body: reqBody = {};
    Object.keys(body).forEach((field) => {
      optmize_body[field.toLowerCase().trim()] = body[field];
    });
    this.createExcludeParameters.forEach((field_name) => {
      delete optmize_body[field_name];
    });
    this.bodyCreate = optmize_body;
    return true;
  }
  ////////////////////////////
  async createRecord(): Promise<boolean> {
    let obj: objects_database = {};
    try {
      obj = await this.model.createRecord(this.bodyCreate as objects_database);
    } catch (error) {
      if (!this.error) {
        this.error = error as Error;
        this.resStatus = 400;
        return false;
      }
    }
    this.objCreated = obj;
    return true;
  }

  /////////////////////
  async prepare_request_Create(): Promise<boolean> {
    return this.setCheckLogin(this.checkCreateLogin) && (await this.prepare_body_create()) ? await this.createRecord() : false;
  }
  ///////////////////////
  async set_response_Create() {
    const prepare = await this.prepare_request_Create();
    if (this.error) this.response(this.error.message);
    else if (!prepare) this.unkownError();
    else this.response(null, this.objCreated);
  }
}

export { Create };
