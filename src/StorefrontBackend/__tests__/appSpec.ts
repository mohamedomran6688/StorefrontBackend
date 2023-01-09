import { userType } from '../../users/types/types';
import { productModel } from '../../products/models';
import { productType, orderType, order_productType } from '../../products/types/types';
import app from '../index';
import supertest from 'supertest';

const request = supertest(app);

const product = new productModel();

const userInfo: userType = {
  user_name: 'OMRAN3',
  first_name: 'mohamed',
  last_name: 'omran',
  password: '123',
};
const productInfo: productType = {
  name: 'p1',
  description: 'test1',
  price: 20,
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

describe('test requests models', () => {
  // create user in database
  beforeAll(async () => {
    // create product only becouse superuse how can create it and cant create useruser online .. only from cmd
    productInfo.id = ((await product.createRecord(productInfo)) as productType).id;

    // create new user (signUp)
    let response = await request.post('/users/user').send(userInfo);
    expect(response.status).toBe(200);
    expect(response.body.data.user_name).toBe(userInfo.user_name);
    userInfo.id = response.body.data.id;

    // authenticate to get token
    response = await request.post('/authenticate').send(userInfo);
    expect(response.status).toBe(200);
    userInfo.token = response.body.data.token;

    // create order
    response = await request.post('/products/order').send(orderInfo).set('Authorization', `Bearer ${userInfo.token}`);

    expect(response.status).toBe(200);
    orderInfo.id = response.body.data.id;
    orderInfo.user_id = response.body.data.user_id;

    // add product to the order
    order_productInfo.order_id = orderInfo.id;
    order_productInfo.product_id = productInfo.id;
    response = await request.post('/products/order_product').send(order_productInfo).set('Authorization', `Bearer ${userInfo.token}`);
    expect(response.status).toBe(200);
    order_productInfo.id = response.body.data.id;
  });

  afterAll(async () => {
    // delete order_product
    let response = await request.delete('/products/order_product').send({ id: order_productInfo.id }).set('Authorization', `Bearer ${userInfo.token}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // delete order
    response = await request.delete('/products/order').send({ id: orderInfo.id }).set('Authorization', `Bearer ${userInfo.token}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // delete product
    response = await request.delete('/products/product').send({ id: productInfo.id }).set('Authorization', `Bearer ${userInfo.token}`);
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('you dont have a permission');

    // delete user
    response = await request.delete('/users/user').send({ id: userInfo.id }).set('Authorization', `Bearer ${userInfo.token}`);
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('you dont have a permission');
  });

  it('get all products', async () => {
    const response = await request.get('/products/product').set('Authorization', `Bearer ${userInfo.token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.count).toBe(1);
    expect(response.body.data.records[0].id).toBe(productInfo.id);
    expect(response.body.data.records[0].name).toBe(productInfo.name);
    expect(response.body.data.records[0].price).toBe(productInfo.price);
  });
  it('get all orders', async () => {
    const response = await request.get('/products/order').set('Authorization', `Bearer ${userInfo.token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.count).toBe(1);
    expect(response.body.data.records[0].id).toBe(orderInfo.id);
    expect(response.body.data.records[0].user_id).toBe(orderInfo.user_id);
    expect(response.body.data.records[0].description).toBe(orderInfo.description);
  });

  it('get all order_product', async () => {
    const response = await request.get('/products/order_product').set('Authorization', `Bearer ${userInfo.token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.count).toBe(1);
    expect(response.body.data.records[0].id).toBe(order_productInfo.id);
    expect(response.body.data.records[0].order_id).toBe(order_productInfo.order_id);
    expect(response.body.data.records[0].product_id).toBe(order_productInfo.product_id);
  });

  it('update order', async () => {
    const response = await request
      .put('/products/order')
      .send({
        conditions: orderInfo,
        update: orderUpdate,
      })
      .set('Authorization', `Bearer ${userInfo.token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(orderInfo.id);
    expect(response.body.data.description).toBe(orderUpdate.description);
  });

  it('update order_product', async () => {
    const response = await request
      .put('/products/order_product')
      .send({
        conditions: order_productInfo,
        update: order_productUpdate,
      })
      .set('Authorization', `Bearer ${userInfo.token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(order_productInfo.id);
    expect(response.body.data.description).toBe(order_productUpdate.description);
  });
});
