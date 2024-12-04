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

# Users (ID int PK, Name varchar(100), Surname varchar(100), Username varchar(100), HasedPassword varchar(300), Email varchar(200))

class AutenticationServer:
    def __init__(self) -> None:
        pass
        
    def login (self, jsonUsername, jsonHasedPassword):
        query = "SELECT PasswordHash, Email FROM Users WHERE Username = %s"
        dbCursor.execute(query, (jsonUsername, ))
        dbReturn = dbCursor.fetchone()
        
        for row in dbReturn:
            if row == None: # Utente inesistenti
                #TODO Gestione errore - Inesistenza Utente
                pass
            elif row == jsonHasedPassword: # Credenziali corrette -> 2FA
                #TODO 2FA
                pass
            elif row != jsonHasedPassword: # Password sbagliata
                #TODO Gestione errore - Password sbagliata
                pass
    
    del addUser (self, jsonName, jsonSurname, jsonUsername, jsonHasedPassword, jsonEmail)