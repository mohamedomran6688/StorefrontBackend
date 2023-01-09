import bcrypt from 'bcrypt';
import Models from '../StorefrontBackend/models';
import { env } from '../StorefrontBackend/settings';
import { tokenType } from '../StorefrontBackend/types/types';
import { userType } from './types/types';
import jwt from 'jsonwebtoken';

class UserModel extends Models {
  appNmae = 'users';
  modelName = 'user';

  constructor() {
    super();
    // exclude password from all methodes in returning
    this.allExcludeField = ['password'];
    this.crateExcludeField = this.allExcludeField;
    this.getExcludeField = this.allExcludeField;
    this.updateOneExcludeField = this.allExcludeField;
    this.deleteOneExcludeField = this.allExcludeField;
    this.filterExcludeField = this.allExcludeField;
  }

  hashPassword = (password: string): string => {
    return bcrypt.hashSync(`${password}${env.BCRYPT_PASS}`, env.saltRounds);
  };

  // compare between the password was received and the password in database
  compareHashedPassword = (password: string, encrypted: string): boolean => {
    return bcrypt.compareSync(`${password}${env.BCRYPT_PASS}`, encrypted);
  };

  // overwrite to suprt method  createRecord to hash password befor create
  async createRecord(obj: userType, crateExcludeField: string[] = this.crateExcludeField): Promise<userType> {
    // take a copy from obj
    const obj_create: userType = JSON.parse(JSON.stringify(obj));
    // check if paasword is string or set it null
    obj_create.password = typeof obj_create.password === 'string' ? this.hashPassword(obj_create.password as string) : null;

    return await super.createRecord(obj_create, crateExcludeField);
  }
  //
  async getRecord(conditions: userType, getExcludeField: string[] = this.getExcludeField): Promise<userType> {
    // take a copy from obj
    const conditions_copy: userType = JSON.parse(JSON.stringify(conditions));
    // delete  paasword if found
    delete conditions_copy.password;

    return await super.getRecord(conditions_copy, getExcludeField);
  }

  // overwrite to suprt method  createRecord to hash password befor create
  async updateRecord(conditions: userType, sets: userType, updateOneExcludeField: string[] = this.updateOneExcludeField): Promise<userType> {
    // check if paasword is string or set it null
    if (sets.password) this.hashPassword(sets.password as string);
    else delete sets.password;

    return await super.updateRecord(conditions, sets, updateOneExcludeField);
  }

  // genrate token from user info
  token = (user: userType): string => {
    return jwt.sign({ user }, env.secretOrPrivateKey);
  };

  // check user name and password and if ti correct will return token else return null
  async authenticate(user_name: string, paasword: string): Promise<string | null> {
    try {
      const user = await this.getRecord({ user_name: user_name }, []);
      const isPasswordValid = this.compareHashedPassword(paasword, user.password as string);
      delete user.paasword;
      if (isPasswordValid) {
        return this.token(user);
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  // get user info from token
  userToken = async (token: string): Promise<userType | null> => {
    try {
      const decode = jwt.verify(token, env.secretOrPrivateKey) as tokenType;
      if (decode.user) {
        // get user info from database without password field
        return await this.getRecord({ id: decode.user.id }, ['password']);
      }
      return null;
    } catch (error) {
      return null;
    }
  };
}

export default UserModel;
