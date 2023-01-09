import UserModel from '../../users/models';
import { userType } from '../../users/types/types';
import { productModel, orderModel, order_productModel } from '../models';
import { productType, orderType, order_productType } from '../types/types';

const user = new UserModel();
const product = new productModel();
const order = new orderModel();
const order_product = new order_productModel();

const userInfo: userType = {
  user_name: 'OMRAN2',
  first_name: 'mohamed',
  last_name: 'omran',
  password: '123',
  superuser: true,
};
const productInfo: productType = {
  name: 'p1',
  description: 'test1',
  price: 20,
};
const productUpdate: productType = {
  price: 50,
};
const orderInfo: orderType = {
  description: 'test2',
};

const orderUpdate: orderType = {
  description: 'test3',
};

const order_productInfo: order_productType = {
  description: 'test4',
};

const order_productUpdate: order_productType = {
  description: 'test5',
};

describe('test product,order,order_product models', () => {
  // create user in database
  beforeAll(async () => {
    userInfo.id = (await user.createRecord(userInfo)).id;
    productInfo.id = ((await product.createRecord(productInfo)) as productType).id;
    orderInfo.id = ((await order.createRecord({ ...orderInfo, user_id: userInfo.id })) as orderType).id;
    order_productInfo.id = ((await order_product.createRecord({ ...order_productInfo, product_id: productInfo.id, order_id: orderInfo.id })) as orderType).id;
  });

  afterAll(async () => {
    // delete the order_product from database
    await order_product.deleteRecord({ id: order_productInfo.id as number });
    // delete the order from database
    await order.deleteRecord({ id: orderInfo.id as number });
    // delete the product from database
    await product.deleteRecord({ id: productInfo.id as number });
    // delete the user from database
    await user.deleteRecord({ id: userInfo.id as number });

    // restart id seq from 1 again
    await user.restartID();
    await product.restartID();
    await order.restartID();
    await order_product.restartID();
  });

  it('get product,order,order_product from database', async () => {
    expect((await product.getRecord(productInfo)).name).toBe(productInfo.name as string);
    expect((await order.getRecord(orderInfo)).description).toBe(orderInfo.description as string);
    expect((await order_product.getRecord(order_productInfo)).description).toBe(order_productInfo.description as string);
  });

  it('update product,order,order_product from database', async () => {
    // product
    expect((await product.updateRecord(productInfo, productUpdate)).price).toBe(productUpdate.price as number);
    expect((await product.getRecord({ id: productInfo.id as number })).price).toBe(productUpdate.price as number);
    // order
    expect((await order.updateRecord(orderInfo, orderUpdate)).description).toBe(orderUpdate.description as string);
    expect((await order.getRecord({ id: orderInfo.id as number })).description).toBe(orderUpdate.description as string);
    // order_product
    expect((await order_product.updateRecord(order_productInfo, order_productUpdate)).description).toBe(order_productUpdate.description as string);
    expect((await order_product.getRecord({ id: order_productInfo.id as number })).description).toBe(order_productUpdate.description as string);
  });

  it('get all products,orders,order_products from database', async () => {
    expect((await product.allRecords()).length).toBeGreaterThan(0);
    expect((await order.allRecords()).length).toBeGreaterThan(0);
    expect((await order_product.allRecords()).length).toBeGreaterThan(0);
  });
});
