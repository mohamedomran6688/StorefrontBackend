import express from 'express';
import response from '../StorefrontBackend/utilities/utilities';
import UserModel from './models';
// functions

// login exists user
const authenticate = async (req: express.Request, res: express.Response): Promise<void> => {
  const { user_name, password } = req.body;
  if (user_name && password) {
    const user = new UserModel();
    const token = await user.authenticate(user_name, password);
    if (token) {
      response(res, 200, null, { token: token });
      return;
    } else {
      response(res, 400, 'error in user name or password', null);
      return;
    }
  }
  response(res, 400, 'plz provide user_name and paasword at body in josn', null);
};

// export
export { authenticate };
