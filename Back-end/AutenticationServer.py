# Connessione al database MySQL - IdP_OAuth2_2FA (localhost)
import mysql.connector
dbConnection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="IdP_OAuth2_2FA"
)
dbCursor = dbConnection.cursor()
    # cursor.execute() - funzione del cursore per interagire con il database

# Applicazione Flask - Server locale
from flask import Flask
from flask_cors import CORS
app = Flask(__name__)
CORS(app)



# Users (ID int PK, Name varchar(100), Surname varchar(100), Username varchar(100), HashedPassword varchar(300), Email varchar(200))




class AutenticationServer:
    def __init__(self) -> None:
        pass
        
    def login (self, jsonUsername, jsonHashedPassword):
            # Acquisizione credenziali dal database
        query = "SELECT HashedPassword, Email FROM Users WHERE Username = %s;"
        dbCursor.execute(query, (jsonUsername, ))
        dbReturn = dbCursor.fetchall()

        if len(dbReturn) == 0: # Caso - Utente inseistente
            pass #TODO Comunicare errore _ Front-end
        else: # Caso - Utente esistente
            if dbReturn[0][0] == jsonHashedPassword: # Caso - Credenziali corrette -> protocol2FA()
                pass #TODO Comunicare primo accesso _ Front-end
                #TODO protocol2FA() -> MailService
            else: # Caso - Credenziali sbagliate
                pass #TODO Comunicare errore _ Front-end

        dbCursor.reset()

    def addUser (self, jsonName, jsonSurname, jsonUsername, jsonHashedPassword, jsonEmail):
            # Controllo preesistenza Username
        query = "SELECT Email FROM Users WHERE Username = %s"
        dbCursor.execute(query, (jsonUsername, ))
        dbReturn = dbCursor.fetchall()

        if len(dbReturn) == 0: # Caso - Utente da aggiungere
            query = "INSERT INTO Users (Name, Surname, Username, HashedPassword, Email) VALUES (%s, %s, %s, %s, %s)"
            dbCursor.execute(query, (jsonName, jsonSurname, jsonUsername, jsonHashedPassword, jsonEmail, ))
            dbConnection.commit()

            if dbCursor.rowcount > 0: # Caso - Inserimento di un nuovo utente completato
                pass #TODO Comunicazione utente registrato -> MailService
            else: # Caso - Errore nell'inserimento
                pass #TODO Comunicazione errore database - Front_end
        else: # Caso - Username già utilizzato
            pass #TODO Comunicazione errore _ Front-end
                
        #TODO Verifica di corretto inserimento della nuova tupla nella tabella
        dbCursor.reset()

    def recoveryPassword(self, jsonEmail):
        query = "SELECT Username, HashedPassword FROM Users WHERE Email = %s"
        dbCursor.execute(query, (jsonEmail, ))
        dbReturn = dbCursor.fetchall()

        if len(dbReturn) == 0: # Caso - Utente inesistente / Errore inserimento mail
            pass #TODO Comunicazione inesistenza utente/errore inserimento mail
        elif len(dbReturn) == 1: # Caso - Utente trovato -> MailService
            pass #TODO  
        else: # Caso - Più utenti registrati con la stessa email
            pass
        
# TEST AREA
#server = AutenticationServer()
#server.login("l.salluce", "Cifhbab")
#server.addUser("Mario", "Rossi", "m.rossi", "fdgaffweX", "m.rossi@studenti.poliba.it")