import { Delete } from './delete';
import { objects_database } from '../../StorefrontBackend/types/types';

class listDisplay extends Delete {
  records!: objects_database[];
  checklistDisplayLogin = true; // check listDisplay login
  ////////////////////////////
  async listRecords(): Promise<objects_database[]> {
    return await this.model.allRecords();
  }
  ////////////////////////////
  async getListRecord(): Promise<boolean> {
    let records: objects_database[] = [];
    try {
      records = await this.listRecords();
    } catch (error) {
      if (!this.error) {
        this.error = error as Error;
        this.resStatus = 400;
        return false;
      }
    }
    this.records = records;
    return true;
  }

  /////////////////////
  async prepare_request_ListDispaly(): Promise<boolean> {
    return this.setCheckLogin(this.checklistDisplayLogin) ? await this.getListRecord() : false;
  }
  ///////////////////////
  async set_response_ListDispaly() {
    const prepare = await this.prepare_request_ListDispaly();
    if (this.error) this.response(this.error.message);
    else if (!prepare) this.unkownError();
    else this.response(null, { count: this.records.length, records: this.records });
  }
}

export { listDisplay };
