/* Replace with your SQL commands */
-- create user table
create table users_user(
    id serial primary key,
    user_name varChar(50) unique not null,
    first_name varChar(50),
    last_name varChar(50),
    password varChar(255) not null,
    superuser boolean DEFAULT false
);