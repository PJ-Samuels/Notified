ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'oliver29';
CREATE DATABASE IF NOT EXISTS Notified;
USE Notified;
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Subscribed_Artists CASCADE;


CREATE TABLE Users (
    user_id int NOT NULL AUTO_INCREMENT,
    email varchar(255) NOT NULL,
    username varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    PRIMARY KEY (user_id)
);
 
CREATE TABLE Subscribed_Artists
(
    user_id int NOT NULL,
    artist_name varchar(255) NOT NULL,
    artist_id varchar(255) NOT NULL,
    PRIMARY KEY (user_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

INSERT INTO Users (email, username, password) VALUES ('osamuels@bu.edu','PJ Samuels', '123');
