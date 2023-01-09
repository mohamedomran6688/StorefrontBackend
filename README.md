# StorefrontBackend

- Install: `npm install`
- Build: `npm run build`
- Lint: `npm run lint`
- Prettify: `npm run prettier`
- Run unit tests: `npm run test`
- migrate: `npm run migrate`
- migrate down: `npm run delete_migrate`
- migrate reset: `npm run delete_all_migrate`
- create superUser: `npm run createsuperuser`
- start app: `npm run start`

#### Endpoint to project

- the project split into two apps (users,products)
- every app have create, update, list, delete Endpoints

### create Endpoint

- (args: obj_data): http://localhost:3000/{{AppName}}/{{ModelName}} [POST]
- obj_data containing data would be create like {"user_name": "Mohammed"}
- It will return the object data after create or return the error description

### Update Endpoint

- (args: conditions,update): http://localhost:3000/{{AppName}}/{{ModelName}} [PUT]
- conditions containing data would be get one record like {"user_name": "Mohammed"}
- update containing data would be update like {"user_name": "Mohammed123"}
- It will return the object data after update or return the error description

### list Endpoint

- http://localhost:3000/{{AppName}}/{{ModelName}} [GET]
- It will return the count of list and records data in arry or return the error description

### delete Endpoint

- (args: conditions): http://localhost:3000/{{AppName}}/{{ModelName}} [DELETE]
- conditions containing data would be get one record like {"user_name": "Mohammed"}
- It will return the object data after delete or return the error description

### users app

- have one model is user
- user fields are (id,user_name not null,first_name,last_name,password not null,superuser)

### products app

- have three models (product,order,order_product)
- product fields are (id,name not null,description,price not null)
- order fields are (id,user_id not null,description)
- order order_product are (id,product_id not null,order_id not null,description)

### user model

- Only the superuser who lists all users data another user takes their data
- Any user can create or update data for him with superuser field false
- superuser user can create or delete or update user with superuser field true or false

### product model

- only superuser can creating or deleting or updating the product model
- any user can list products

### order model and order_product model

- Any user lists all his orders or order_products only
- any user can creating or updating an order or order_product only for him
- superuser can creating or updating to order or order_product to any user
- superuser can lists all orders or order_products to all user

### Recommended use endpoints

- All requests require a token except for creating a user and authenticate request
- All requests returning one formatting {"success": true or false, "error": null or string, "data": the data or null if found error }
- to authenticate (args: user_name,password):http://localhost:3000/authenticate [POST]

#### Example create

- will using create user exaple with user_name : omran and password 123
  (args: {"user_name":"omran","password":123}):http://localhost:3000/users/user [POST]

- will using create order exaple with description : test
  (args: {"description" : "test"})[token required]:http://localhost:3000/products/order [POST]

#### Example update

- will using update order exaple with description : test2 to do this we need conditions to get one order using id :1
  (args: {"conditions" : {"id":1} , update:{"description":"test2"}})[token required]:http://localhost:3000/products/order [PUT]

#### Example list all orders

- will using update order exaple with description : test2 to do this we need conditions to get one order using id :1
- [token required]:http://localhost:3000/products/order [GET]

#### Example update

- will using update order id :1
  (args: {"id":1})[token required]:http://localhost:3000/products/order [DELETE]

### Notes

- to create superuser use this commande (npm run createsuperuser)
- there is file named thunder-collection_test.json that is containing more requests examples for Thunder extension

### Enviromental Variables Set up

Bellow are the environmental variables that needs to be set in a .env file. This is the default setting that I used for development, but you can change it to what works for you.

NB: The given values are used in developement and testing but not in production.

PORT=3000
NODE_ENV=dev
PS_host= localhost
PS_port= 5432
PS_DB_dev= name database to dev
PS_DB_test= name database to test
PS_user= user_name of database
PS_password= password of database
BCRYPT_PASS=oeuifhgeorgtleiogjhegohgoiugogynyhbfvdwhv
saltRounds=10
secretOrPrivateKey=iodjmwtsafbvxz
