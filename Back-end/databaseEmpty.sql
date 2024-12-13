DROP DATABASE IF EXISTS IdP_OAuth2_2FA;
CREATE DATABASE IdP_OAuth2_2FA;
USE IdP_OAuth2_2FA;

CREATE TABLE Users (
    ID int PRIMARY KEY AUTO_INCREMENT,
    Name varchar(100),
    Surname varchar(100),
    Username varchar(100) UNIQUE,
    Email varchar(200) CHECK (Email LIKE '%_@_%.__%'),
    HashedPassword varchar(300)
);