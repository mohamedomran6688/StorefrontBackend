import { objects_database } from '../../StorefrontBackend/types/types';
import UserModel from '../../users/models';
import { userType } from '../../users/types/types';
import { collectSchema } from '../collectschema';
import { reqBody } from '../types/types';

class user extends collectSchema {
  model = new UserModel();
  checklistDisplayLogin = true;
  checkCreateLogin = false;

  // if request user not superuser will set field superuser with false
  async prepare_body_create(): Promise<boolean> {
    let check = await super.prepare_body_create(); // normal check
    if (!check) return check;
    check = this.setCheckSuperUser();
    // if request user not superuser will set field superuser with false
    if (!check) {
      this.bodyCreate = { ...this.bodyCreate, superuser: false };
    }
    return true;
  }

  // if request user not superuser will delete field superuser if exists
  async prepare_body_update(): Promise<boolean> {
    let check = await super.prepare_body_update(); // normal check
    if (!check) return check;
    check = this.setCheckSuperUser();
    // if request user not superuser will delete if exists field superuser
    if (!check) {
      const update: reqBody = this.bodyUpdate.update as reqBody;
      delete update.superuser;
      this.bodyUpdate = { ...this.bodyUpdate, update: update };
    }
    return true;
  }
  /////////////////////////////////////////////////////////////
  // check the user will update is the same user request or superuser
  async prepare_request_Update(): Promise<boolean> {
    if (this.setCheckLogin(this.checkUpdateLogin) && this.setCheckSuperUser()) return await super.prepare_request_Update();
    if (!this.req.user || !(await this.prepare_body_update())) return false;
    try {
      const user_will_update: userType = await this.model.getRecord(this.bodyUpdate.conditions as userType);
      if (user_will_update.id !== this.req.user.id) {
        this.set_permissionDenied();
        return false;
      }
      return await super.prepare_request_Update();
    } catch (error) {
      this.resStatus = 400;
      this.error = new Error((error as Error).message);
      return false;
    }
  }
  /////////////////////////////////////////////////////////////
  //show users list only to superuser requests else return data of user of request only if found else retun empty
  async listRecords(): Promise<objects_database[]> {
    if (this.setCheckSuperUser()) return await this.model.allRecords();
    else if (this.req.user) return await this.model.filterRecords({ id: this.req.user.id } as userType);
    else return [];
  }

  //delete users only to superuser requests
  async prepare_request_Delete(): Promise<boolean> {
    if (this.setCheckSuperUser()) return await super.prepare_request_Delete();
    // if request user not superuser
    this.set_permissionDenied();
    return false;
  }
}

export { user };
