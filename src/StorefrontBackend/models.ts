import { pool } from './settings';
import { objects_database } from './types/types';

// field === column but i like say field
// model === table but i like say model

class Models {
  modelName!: string;
  appNmae!: string;
  obj!: objects_database | null; // if instance select row will se in this varable
  fields!: objects_database[]; // it data of fields in model
  allExcludeField!: string[]; // exclude fields in get all records from database
  crateExcludeField!: string[]; // exclude fields in returning from record was create
  filterExcludeField!: string[]; // exclude fields in filter at records in model from database
  getExcludeField!: string[]; // exclude fields in get one record from model from database
  updateOneExcludeField!: string[]; // exclude fields in update one record from model from database
  deleteOneExcludeField!: string[]; // exclude fields in delete one record from model from database

  constructor() {
    this.fields = []; // set fields is empty
    this.allExcludeField = []; // set exclude is empty
    this.crateExcludeField = []; // set exclude is empty
    this.filterExcludeField = []; // set exclude is empty
    this.getExcludeField = []; // set exclude is empty
    this.updateOneExcludeField = []; // set exclude is empty
    this.deleteOneExcludeField = []; // set exclude is empty
  }

  // return table name
  get_table_name() {
    return this.appNmae + '_' + this.modelName;
  }

  // check if model in database or not
  async checkTableExists(): Promise<boolean> {
    // start connection
    const connection = await pool.connect();

    // gnerate sql code
    const sql = `SELECT * 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = '${this.get_table_name()}';`;

    // run query
    const result = await connection.query(sql);
    // relase connection
    connection.release();

    // return create record
    return result.rows.length ? true : false;
  }

  //
  async setFields(): Promise<void> {
    // start connection
    const connection = await pool.connect();
    try {
      // gnerate sql code to get all fields data
      const sql = `SELECT *
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = N'${this.get_table_name()}' ;`;

      // run query and set fields data
      this.fields = (await connection.query(sql)).rows;

      // relase connection
      connection.release();
    } catch (error) {
      connection.release();
      throw new Error(`unable to get an fields from ${this.get_table_name()} : ${(error as Error).message}`);
    }
  }

  // get fields (column) name of table in arry
  async get_fields_name(): Promise<string[]> {
    if (!this.fields.length) {
      await this.setFields();
    }
    // return create record
    return this.fields.map((field) => field.column_name as string);
  }

  // exclude special fields from all fields in model
  async selectFields(exclude: string[]): Promise<string[]> {
    const allFields: string[] = await this.get_fields_name();
    return allFields.filter((field) => !exclude.includes(field));
  }
  // returning sql
  async returning(exclude: string[]): Promise<string> {
    const selectFields: string[] = await this.selectFields(exclude);
    if (selectFields.length) {
      return `
      returning
      ${selectFields.toString()}
      `;
    }
    return '';
  }
  // create record
  async createRecord(obj: objects_database, crateExcludeField: string[] = this.crateExcludeField): Promise<objects_database> {
    // start connection
    const connection = await pool.connect();
    try {
      // gnerate sql code
      const sql = `
      INSERT INTO 
        ${this.get_table_name()} (${Object.keys(obj).toString()})
      values 
        (${Object.keys(obj).map((elm: string, index: number): string => `$${index + 1}`)}) 

        ${await this.returning(crateExcludeField)}
      ;
      `;
      // run query
      const records = await connection.query(sql, Object.values(obj));

      // relase connection
      connection.release();

      // return create record
      return records.rows[0];
    } catch (error) {
      // relase connection
      connection.release();
      delete obj.password;
      throw new Error(`unable to create an new record ${JSON.stringify(obj)} in ${this.get_table_name()} : ${(error as Error).message}`);
    }
  }

  // get all records
  async allRecords(allExcludeField: string[] = this.allExcludeField): Promise<objects_database[]> {
    // start connection
    const connection = await pool.connect();
    try {
      // gnerate sql code
      const sql = `SELECT ${(await this.selectFields(allExcludeField)).toString()} from ${this.get_table_name()} ;`;
      // run query
      const records = await connection.query(sql);

      // relase connection
      connection.release();

      // return create record
      return records.rows;
    } catch (error) {
      // relase connection
      connection.release();
      throw new Error(`unable to get all records form ${this.get_table_name()} : ${(error as Error).message}`);
    }
  }

  // create record
  async filterRecords(conditions: objects_database, filterExcludeField: string[] = this.filterExcludeField): Promise<objects_database[]> {
    //check length conditions
    if (!Object.keys(conditions).length) {
      throw new Error(`must conditions is not empty`);
    }
    // start connection
    const connection = await pool.connect();
    try {
      // gnerate sql code
      const sql = `SELECT ${(await this.selectFields(filterExcludeField)).toString()} from ${this.get_table_name()} WHERE 
        ${Object.keys(conditions)
          .filter((condition) => conditions[condition] !== null)
          .map((condition, index) => `${condition} = ($${index + 1})`)
          .toString()
          .replaceAll(',', ' AND ')}
        ${Object.keys(conditions).filter((condition) => conditions[condition] === null).length && Object.keys(conditions).filter((condition) => conditions[condition] !== null).length ? ' AND ' : ''}
        ${Object.keys(conditions)
          .filter((condition) => conditions[condition] === null)
          .map((condition) => `${condition} is null`)
          .toString()
          .replaceAll(',', ' AND ')}
      ;`;
      // run query
      const records = await connection.query(
        sql,
        Object.values(conditions).filter((value) => value !== null)
      );

      // relase connection
      connection.release();

      // return create record
      return records.rows;
    } catch (error) {
      // relase connection
      connection.release();
      throw new Error(`unable to filter ${JSON.stringify(conditions)} at records in ${this.get_table_name()} : ${(error as Error).message}`);
    }
  }

  // get one record only;
  async getRecord(conditions: objects_database, getExcludeField: string[] = this.getExcludeField): Promise<objects_database> {
    const records = await this.filterRecords(conditions, getExcludeField);
    switch (records.length) {
      case 0:
        throw new Error(`the record dont exists in ${this.get_table_name()} with ${JSON.stringify(conditions)}`);
        break;
      case 1:
        return records[0];
        break;

      default:
        throw new Error(`it is multiple records in ${this.get_table_name()} with this conditions ${JSON.stringify(conditions)}`);
        break;
    }
  }
  // update one record in mmodel only
  async updateRecord(conditions: objects_database, sets: objects_database, updateOneExcludeField: string[] = this.updateOneExcludeField): Promise<objects_database> {
    // check length sets
    if (!Object.keys(sets).length) {
      throw new Error(`must sets is not empty`);
    }

    // check conditions pointing to on record only
    await this.getRecord(conditions);

    // start connection
    const connection = await pool.connect();
    try {
      // gnerate sql code
      const sql = `UPDATE ${this.get_table_name()}
      SET ${Object.keys(sets)
        .map((set, index) => `${set}=$${index + 1}`)
        .toString()}
      WHERE 
      ${Object.keys(conditions)
        .filter((condition) => conditions[condition] !== null)
        .map((condition, index) => `${condition} = $${index + Object.keys(sets).length + 1}`)
        .toString()
        .replaceAll(',', ' AND ')}
        ${Object.keys(conditions).filter((condition) => conditions[condition] === null).length && Object.keys(conditions).filter((condition) => conditions[condition] !== null).length ? ' AND ' : ''}
        ${Object.keys(conditions)
          .filter((condition) => conditions[condition] === null)
          .map((condition) => `${condition} is null`)
          .toString()
          .replaceAll(',', ' AND ')}
      ${await this.returning(updateOneExcludeField)}
      ;`;

      // run query
      const records = await connection.query(sql, [...Object.values(sets), ...Object.values(conditions).filter((value) => value !== null)]);

      // relase connection
      connection.release();

      // return create record
      return records.rows[0];
    } catch (error) {
      // relase connection
      connection.release();
      delete conditions.paasword;
      delete sets.paasword;
      throw new Error(`unable to update ${JSON.stringify(conditions)} to ${JSON.stringify(sets)} at in ${this.get_table_name()} : ${(error as Error).message}`);
    }
  }
  // update one record in mmodel only
  async deleteRecord(conditions: objects_database, deleteOneExcludeField: string[] = this.deleteOneExcludeField): Promise<objects_database> {
    // check conditions pointing to on record only
    await this.getRecord(conditions);

    // start connection
    const connection = await pool.connect();
    try {
      // gnerate sql code
      const sql = `DELETE FROM ${this.get_table_name()}
      WHERE 
      ${Object.keys(conditions)
        .filter((condition) => conditions[condition] !== null)
        .map((condition, index) => `${condition} = $${index + 1}`)
        .toString()
        .replaceAll(',', ' AND ')}
        ${Object.keys(conditions).filter((condition) => conditions[condition] === null).length && Object.keys(conditions).filter((condition) => conditions[condition] !== null).length ? ' AND ' : ''}
        ${Object.keys(conditions)
          .filter((condition) => conditions[condition] === null)
          .map((condition) => `${condition} is null`)
          .toString()
          .replaceAll(',', ' AND ')}
      ${await this.returning(deleteOneExcludeField)}
      ;`;

      // run query
      const records = await connection.query(
        sql,
        Object.values(conditions).filter((value) => value !== null)
      );

      // relase connection
      connection.release();

      // return create record
      return records.rows[0];
    } catch (error) {
      // relase connection
      connection.release();
      throw new Error(`unable to delete ${JSON.stringify(conditions)} in ${this.get_table_name()} : ${(error as Error).message}`);
    }
  }

  // start id seq from 1 again
  async restartID() {
    // start connecion
    const connection = await pool.connect();
    try {
      // run query
      const sql = `ALTER SEQUENCE ${this.get_table_name()}_id_seq RESTART WITH 1;`;
      const records = await connection.query(sql);

      // relase connection
      connection.release();

      // return create record
      return records.rows;
    } catch (error) {
      // relase connection
      connection.release();
      throw new Error(`error : ${(error as Error).message}`);
    }
  }

  // apply custom sql code
  async customSql(sql: string, QueryConfig: [string | number | boolean][]): Promise<objects_database[]> {
    // start connection
    const connection = await pool.connect();
    try {
      // run query
      const records = await connection.query(sql, QueryConfig);

      // relase connection
      connection.release();

      // return create record
      return records.rows;
    } catch (error) {
      // relase connection
      connection.release();
      throw new Error(`error : ${(error as Error).message}`);
    }
  }
}

export default Models;
