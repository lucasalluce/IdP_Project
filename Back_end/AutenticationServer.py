# Connessione al DataBase MySQL - IdP_OAuth2_2FA (localhost)
import mysql.connector
dbConnection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="IdP_OAuth2_2FA"
)
dbCursor = dbConnection.cursor()
    # cursor.execute() - funzione del cursore per interagire con il Database

# Users (ID int PK, Name varchar(100), Surname varchar(100), Username varchar(100), PasswordHash varchar(300), Email varchar(200))

class AutenticationServer:
    def __init__(self) -> None:
        pass

    def login (self, jsonUsername, jsonHasedPassword):
        query = "SELECT PasswordHash FROM Users WHERE Username = %s"
        