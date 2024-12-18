DROP DATABASE IF EXISTS idp_oauth2_2fa;
CREATE DATABASE idp_oauth2_2fa;
USE idp_oauth2_2fa;

CREATE TABLE Users (
    ID int PRIMARY KEY AUTO_INCREMENT,
    Name varchar(100),
    Surname varchar(100),
    Username varchar(100) UNIQUE,
    Email varchar(200) CHECK (Email LIKE '%_@_%.__%'),
    HashedPassword varchar(300)
);