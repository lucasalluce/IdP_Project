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

# Users (ID int PK, Name varchar(100), Surname varchar(100), Username varchar(100), HashedPassword varchar(300), Email varchar(200))

class AutenticationServer:
    def __init__(self) -> None:
        pass
        
    def login (self, jsonUsername, jsonHashedPassword):
        query = "SELECT HashedPassword, Email FROM Users WHERE Username = %s;"
        dbCursor.execute(query, (jsonUsername, ))
        dbReturn = dbCursor.fetchall()
        
        if dbReturn.count() == 1:
            
        else 

        #TODO Test
        for row in dbReturn:
            if row == None: # Utente inesistente
                #TODO Gestione errore - Inesistenza Utente
                pass
            elif row[0] == jsonHashedPassword: # Credenziali corrette -> 2FA
                #TODO 2FA
                pass
            elif row != jsonHashedPassword: # Password sbagliata
                #TODO Gestione errore - Password sbagliata
                pass
        
        dbCursor.reset()
    
    def addUser (self, jsonName, jsonSurname, jsonUsername, jsonHashedPassword, jsonEmail):
        query = "INSERT INTO Users (Name, Surname, Username, HashedPassword, Email) VALUES (%s, %s, %s, %s, %s)"
        value = (jsonName, jsonSurname, jsonUsername, jsonHashedPassword, jsonEmail, )
        dbCursor.execute(query, value)
        dbConnection.commit()

        #TODO Verifica di corretto inserimento della nuova tupla nella tabella
        dbCursor.reset()