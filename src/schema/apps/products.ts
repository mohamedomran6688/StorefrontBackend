import { productModel, orderModel, order_productModel } from '../../products/models';
import { orderType } from '../../products/types/types';
import { objects_database } from '../../StorefrontBackend/types/types';
import { collectSchema } from '../collectschema';
import { reqBody } from '../types/types';

class product extends collectSchema {
  model = new productModel();

  // only superuser can create a product
  async prepare_request_Create(): Promise<boolean> {
    return this.setCheckLogin(this.checkCreateLogin) && this.superuserOnly() ? await super.prepare_request_Create() : false;
  }

  // only superuser can update a product
  async prepare_request_Update(): Promise<boolean> {
    return this.setCheckLogin(this.checkUpdateLogin) && this.superuserOnly() ? await super.prepare_request_Update() : false;
  }
  // only superuser can delete a product
  async prepare_request_Delete(): Promise<boolean> {
    return this.setCheckLogin(this.checkDeleteLogin) && this.superuserOnly() ? await super.prepare_request_Delete() : false;
  }
}

class order extends collectSchema {
  model = new orderModel();

  // set user_id field with request user.id  if request not superuser
  async prepare_body_create(): Promise<boolean> {
    if (this.setCheckSuperUser()) return await super.prepare_body_create();
    const check = await super.prepare_body_create();
    if (check && this.req.user) {
      this.bodyCreate = { ...this.bodyCreate, user_id: this.req.user.id as number };
      return check;
    }
    return false;
  }

  // Exclude user_id field from change  if request not superuser
  async prepare_body_update(): Promise<boolean> {
    this.updateExcludeParameters = ['id'];
    if (this.setCheckSuperUser()) return await super.prepare_body_update();

    //Exclude user_id field from change
    this.updateExcludeParameters = ['id', 'user_id'];

    return await super.prepare_body_update();
  }

  // check if user of request is the same order will update or superuser
  async prepare_request_Update(): Promise<boolean> {
    if (this.setCheckSuperUser()) return await super.prepare_request_Update();
    const check = await this.prepare_body_update();
    if (check && this.req.user) {
      try {
        const obj_will_update: orderType = await this.model.getRecord(this.bodyUpdate.conditions as objects_database);

        if (this.req.user.id === obj_will_update.user_id) return super.prepare_request_Update();
        this.set_permissionDenied();
        return false;
      } catch (error) {
        this.resStatus = 400;
        this.error = new Error((error as Error).message);
        return false;
      }
    }
    return false;
  }

  // check if user of request is the same order will delete or superuser
  async prepare_request_Delete(): Promise<boolean> {
    if (this.setCheckSuperUser()) return await super.prepare_request_Delete();
    const check = await this.prepare_body_delete();
    if (check && this.req.user) {
      try {
        const obj_will_delete: orderType = await this.model.getRecord(this.bodyDelete as objects_database);

        if (this.req.user.id === obj_will_delete.user_id) return super.prepare_request_Delete();
        this.set_permissionDenied();
        return false;
      } catch (error) {
        this.resStatus = 400;
        this.error = new Error((error as Error).message);
        return false;
      }
    }
    return false;
  }

  //show orders list only to superuser requests otherwise only request user orders are returned if an empty user return empty
  async listRecords(): Promise<objects_database[]> {
    if (this.setCheckSuperUser()) return await this.model.allRecords();
    else if (this.req.user) return await this.model.filterRecords({ user_id: this.req.user.id } as orderType);
    else return [];
  }
}

class order_product extends collectSchema {
  model = new order_productModel();

  // check order_id is to user of request if request not superuser
  async prepare_body_create(): Promise<boolean> {
    if (this.setCheckSuperUser()) return await super.prepare_body_create();
    const check = await super.prepare_body_create();
    if (check && this.req.user) {
      if (this.bodyCreate.order_id) {
        const order_model = new orderModel();
        try {
          const order_obj: orderType = await order_model.getRecord({ id: this.bodyCreate.order_id } as orderType);
          if (order_obj.user_id !== this.req.user.id) {
            this.set_permissionDenied();
            return false;
          }
        } catch (error) {
          this.error = new Error(`not found order with id = ${this.bodyCreate.order_id} : error ${(error as Error).message}`);
        }
      } else {
        this.error = new Error('plz provide order_id at body in josn');
        this.resStatus = 400;
        return false;
      }
      return check;
    }
    return false;
  }

  // delete order_id from update if is request not superuser
  async prepare_body_update(): Promise<boolean> {
    const check = await super.prepare_body_update();
    if (this.setCheckSuperUser()) return check;
    if (check) {
      const update = this.bodyUpdate.update as reqBody;
      delete update.order_id;
      this.bodyUpdate = { ...this.bodyUpdate, update: update };
    }
    return check;
  }

  // check order_id is to user of request if request not superuser
  async prepare_request_Update(): Promise<boolean> {
    if (this.setCheckLogin(this.checkUpdateLogin) && this.setCheckSuperUser()) return await super.prepare_request_Update();
    const check = await this.prepare_body_update();
    if (check && this.req.user) {
      try {
        const obj_will_update: orderType = await this.model.getRecord(this.bodyUpdate.conditions as objects_database);
        const order_model = new orderModel();
        const order_obj: orderType = await order_model.getRecord({ id: obj_will_update.order_id } as orderType);
        if (this.req.user.id === order_obj.user_id) return super.prepare_request_Update();
        this.set_permissionDenied();
        return false;
      } catch (error) {
        this.resStatus = 400;
        this.error = new Error((error as Error).message);
        return false;
      }
    }
    return false;
  }

  // check order_id is to user of request if request not superuser
  async prepare_request_Delete(): Promise<boolean> {
    if (this.setCheckSuperUser()) return await super.prepare_request_Delete();
    const check = await this.prepare_body_delete();
    if (check && this.req.user) {
      try {
        const obj_will_delete: orderType = await this.model.getRecord(this.bodyDelete as objects_database);
        const order_model = new orderModel();
        const order_obj: orderType = await order_model.getRecord({ id: obj_will_delete.order_id } as orderType);
        if (this.req.user.id === order_obj.user_id) return super.prepare_request_Delete();
        this.set_permissionDenied();
        return false;
      } catch (error) {
        this.resStatus = 400;
        this.error = new Error((error as Error).message);
        return false;
      }
    }
    return false;
  }

  //show orders list only to superuser requests otherwise only request user orders are returned if an empty user return empty
  async listRecords(): Promise<objects_database[]> {
    if (this.setCheckSuperUser()) return await this.model.allRecords();
    else if (this.req.user) {
      const order_model = new orderModel();
      return (
        await [],
        this.model.customSql(
          `SELECT DISTINCT
            ${(await this.model.selectFields(this.model.allExcludeField)).map((field) => `${this.model.get_table_name()}.${field}`).toString()}
          FROM
            ${this.model.get_table_name()} , ${order_model.get_table_name()}
          WHERE
            ${order_model.get_table_name()}.user_id = ${this.req.user.id} AND 
            ${order_model.get_table_name()}.id  = ${this.model.get_table_name()}.order_id
          ;`,
          []
        )
      );
    } else return [];
  }
}

export { product, order, order_product };
