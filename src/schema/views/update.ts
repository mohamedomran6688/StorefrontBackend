import { listDisplay } from './listdisplay';
import { objects_database } from '../../StorefrontBackend/types/types';
import { reqBody } from '../types/types';

class Update extends listDisplay {
  objUpdate!: objects_database;
  checkUpdateLogin = true; // check update login
  bodyUpdate!: reqBody; // body comes in requets
  updateExcludeParameters: string[] = ['id']; // exclude fields from body request befor update
  ////////////////////////////
  async prepare_body_update(): Promise<boolean> {
    const body: reqBody = this.req.body;
    // check if body have no data set error to client
    const [conditions, update]: objects_database[] = [body.conditions, body.update] as objects_database[];
    if (!Object.keys(conditions ?? {}).length || !Object.keys(update ?? {}).length) {
      this.error = new Error('plz provide conditions and update data at body in josn');
      return false;
    }

    const optmize_body_conditions: reqBody = {};
    Object.keys(conditions ?? {}).forEach((field) => {
      optmize_body_conditions[field.toLowerCase().trim()] = (conditions as reqBody)[field as string];
    });

    const optmize_body_update: reqBody = {};
    Object.keys(update ?? {}).forEach((field) => {
      optmize_body_update[field.toLowerCase().trim()] = (update as reqBody)[field];
    });

    this.updateExcludeParameters.forEach((field_name) => {
      delete update[field_name];
    });
    this.bodyUpdate = { conditions: optmize_body_conditions, update: optmize_body_update };
    return true;
  }
  ////////////////////////////
  async updateRecord(): Promise<boolean> {
    let obj: objects_database = {};
    try {
      obj = await this.model.updateRecord(this.bodyUpdate.conditions as objects_database, this.bodyUpdate.update as objects_database);
    } catch (error) {
      if (!this.error) {
        this.error = error as Error;
        this.resStatus = 400;
        return false;
      }
    }
    this.objUpdate = obj;
    return true;
  }

  /////////////////////
  async prepare_request_Update(): Promise<boolean> {
    return this.setCheckLogin(this.checkUpdateLogin) && (await this.prepare_body_update()) ? await this.updateRecord() : false;
  }
  ///////////////////////
  async set_response_Update() {
    const prepare = await this.prepare_request_Update();
    if (this.error) this.response(this.error.message);
    else if (!prepare) this.unkownError();
    else this.response(null, this.objUpdate);
  }
}
export { Update };
