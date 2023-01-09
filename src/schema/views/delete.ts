import { Create } from './create';
import { objects_database } from '../../StorefrontBackend/types/types';
import { reqBody } from '../types/types';

class Delete extends Create {
  objDeleted!: objects_database;
  idWillDelete!: string | number; // id of record will delete in database
  checkDeleteLogin = true; // check delete login
  bodyDelete!: reqBody; // body comes in requets
  ////////////////////////////
  async prepare_body_delete(): Promise<boolean> {
    const body: reqBody = this.req.body;
    // check if body have no data set error to client
    if (!Object.keys(body).length) {
      this.error = new Error('plz provide conditions at body in josn');
      return false;
    }
    const optmize_body: reqBody = {};
    Object.keys(body).forEach((field) => {
      optmize_body[field.toLowerCase().trim()] = body[field];
    });
    this.bodyDelete = optmize_body;
    return true;
  }
  //////////////////
  async deleteRecord(): Promise<boolean> {
    let obj: objects_database = {};
    try {
      obj = await this.model.deleteRecord(this.bodyDelete as objects_database);
    } catch (error) {
      if (!this.error) {
        this.error = error as Error;
        this.resStatus = 400;
        return false;
      }
    }
    this.objDeleted = obj;
    return true;
  }

  /////////////////////
  async prepare_request_Delete(): Promise<boolean> {
    return this.setCheckLogin(this.checkDeleteLogin) && (await this.prepare_body_delete()) ? await this.deleteRecord() : false;
  }
  ///////////////////////
  async set_response_Delete() {
    const prepare = await this.prepare_request_Delete();
    if (this.error) this.response(this.error.message);
    else if (!prepare) this.unkownError();
    else this.response(null, this.objDeleted);
  }
}
export { Delete };
