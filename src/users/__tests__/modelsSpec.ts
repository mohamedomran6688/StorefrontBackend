import UserModel from '../models';
import { userType } from '../types/types';

const user = new UserModel();

const userInfo: userType = {
  user_name: 'OMRAN',
  first_name: 'mohamed',
  last_name: 'omran',
  password: '123',
  superuser: true,
};
const userFake: userType = {
  user_name: 'mohamed',
  first_name: 'mohamed123',
  last_name: 'omran123',
  password: '123123',
};

describe('test user model', () => {
  // create user in database
  beforeAll(async () => {
    userInfo.id = (await user.createRecord(userInfo)).id;
  });

  afterAll(async () => {
    // delete user from database
    user.deleteRecord(userInfo);
    // restart id seq from 1 again
    await user.restartID();
  });

  it('authenticate user_name and password', async () => {
    expect(typeof (await user.authenticate(userInfo.user_name as string, userInfo.password as string))).toBe('string');
  });

  it('authenticate fake user_name and password', async () => {
    expect(await user.authenticate(userFake.user_name as string, userFake.password as string)).toBe(null);
  });

  it('get user from database', async () => {
    expect((await user.getRecord(userInfo)).user_name).toBe(userInfo.user_name as string);
  });

  it('get all users from database', async () => {
    expect((await user.allRecords()).length).toBeGreaterThan(0);
  });
});
