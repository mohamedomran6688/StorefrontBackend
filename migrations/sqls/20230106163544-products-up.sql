/* Replace with your SQL commands */
/* Replace with your SQL commands */
create table products_product(
    id serial primary key,
    name varChar(50) unique not null,
    description TEXT,
    price FLOAT not null
);

create table products_order (
    id serial primary key,
    user_id int NOT NULL,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users_user(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table products_order_product (
    id serial primary key,
    product_id int NOT NULL,
    order_id int NOT NULL,
    description TEXT,
    FOREIGN KEY (product_id) REFERENCES products_product(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (order_id) REFERENCES products_order(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT product_id_order_id UNIQUE (product_id, order_id)
);