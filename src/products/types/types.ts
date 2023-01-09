import { objects_database } from '../../StorefrontBackend/types/types';

type product = {
  id?: number;
  name?: string;
  description?: string | null;
  price?: number;
};
type order = {
  id?: number;
  user_id?: number;
  description?: string | null;
};
type order_product = {
  id?: number;
  product_id?: number;
  order_id?: number;
  description?: string | null;
};

type productType = product & objects_database;
type orderType = order & objects_database;
type order_productType = order_product & objects_database;

export { productType, orderType, order_productType };
