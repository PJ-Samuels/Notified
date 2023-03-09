CREATE DATABASE Notified;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Subscribed_Artists;

CREATE TABLE User (
    id int NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE Subscribed_Artists
(
    user_id int NOT NULL,
    artist_name varchar(255) NOT NULL,
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES User(id),
);
