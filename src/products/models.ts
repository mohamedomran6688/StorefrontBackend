import Models from '../StorefrontBackend/models';

class app extends Models {
  appNmae = 'products';
}

class productModel extends app {
  modelName = 'product';
}

class orderModel extends app {
  modelName = 'order';
}

class order_productModel extends app {
  modelName = 'order_product';
}

export { productModel, orderModel, order_productModel };
