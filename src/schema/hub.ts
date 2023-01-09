import { Request } from '../users/types/types';
import express from 'express';
import Models from '../StorefrontBackend/models';
import response from '../StorefrontBackend/utilities/utilities';
import { returnDataRespone } from './types/types';
class hub {
  model!: Models;
  req: Request;
  res: express.Response;
  resStatus = 200;
  error: Error | null = null;
  //////////////////////
  constructor(req: Request, res: express.Response) {
    this.req = req;
    this.res = res;
  }
  //////////////////////
  setCheckLogin(checkLogin: boolean): boolean {
    if (checkLogin && !this.req.user) {
      this.error = new Error('plz login');
      this.resStatus = 400;
      return false;
    }
    return true;
  }

  /////////
  setCheckSuperUser(): boolean {
    if (this.req.user) {
      if (this.req.user.superuser) {
        return true;
      }
    }
    return false;
  }
  //////////////////////////
  set_permissionDenied(): void {
    this.resStatus = 403;
    this.error = new Error('you dont have a permission');
  }
  //////////////////////////
  // if request not useruser set error to response permission denied
  superuserOnly(): boolean {
    if (!this.setCheckSuperUser()) {
      if (!this.error) this.set_permissionDenied();
      return false;
    }
    return true;
  }
  //////////////////////////
  unkownError(): void {
    this.resStatus = 410;
    this.response('unkown error');
  }
  //////////////////////////
  response(error: null | string = null, data: returnDataRespone = null): void {
    response(this.res, this.resStatus, error, data);
  }
}

export { hub };
