DROP DATABASE IF EXISTS IdP_OAuth2_2FA;
CREATE DATABASE IdP_OAuth2_2FA;
USE IdP_OAuth2_2FA;

CREATE TABLE Users (
    ID int PRIMARY KEY AUTO_INCREMENT,
    Name varchar(100),
    Surname varchar(100),
    Username varchar(100) UNIQUE,
    HashedPassword varchar(300),
    Email varchar(200) CHECK (Email LIKE '%_@_%.__%')
);

INSERT INTO Users (Name, Surname, Username, HashedPassword, Email) VALUES
    ('Luca', 'Salluce', 'l.salluce', 'Cifhbab', 'l.salluce@studenti.poliba.it'),
    ('Stefano', 'Troilo', 's.troilo', 'IIavyufiub', 's.troilo@studenti.poliba.it'),
    ('Federico', 'Raimondi', 'f.raimondi', 'fniahyUDAF', 'f.raimondi@studenti.poliba.it'),
    ('Gianluca', 'Putignano', 'g.putignano', 'daougSUGD', 'g.putignano@studenti.poliba.it'),
    ('Antonio', 'Volpe', 'a.volpe', 'huayuvdA', 'a.volpe@studenti.poliba.it');