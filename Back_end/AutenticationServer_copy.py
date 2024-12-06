# Connessione al database MySQL - IdP_OAuth2_2FA (localhost)
import mysql.connector
from flask import Flask, app, request, jsonify


import mysql.connector
import hashlib


dbConnection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="IdP_OAuth2_2FA"
)
dbCursor = dbConnection.cursor()
   
   
   
    # cursor.execute() - funzione del cursore per interagire con il database

# Users (ID int PK, Name varchar(100), Surname varchar(100), Username varchar(100), HashedPassword varchar(300), Email varchar(200))

class AuthenticationServer:
    def __init__(self) -> None:
        pass

    def login(self, jsonUsername, jsonPassword):
        # Esegui l'hash della password (se non viene fatto nel frontend)
        hashedPassword = hashlib.sha256(jsonPassword.encode()).hexdigest()

        # Acquisizione credenziali dal database
        query = "SELECT HashedPassword, Email FROM Users WHERE Username = %s;"
        dbCursor.execute(query, (jsonUsername,))
        dbReturn = dbCursor.fetchall()

        if len(dbReturn) == 0:  # Caso - Utente inesistente
            return {"success": False, "message": "Utente non trovato"}
        else:  # Caso - Utente esistente
            if dbReturn[0][0] == hashedPassword:  # Credenziali corrette
                return {"success": True}
            else:  # Credenziali sbagliate
                return {"success": False, "message": "Password errata"}

        dbCursor.reset()

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()  # Ottieni i dati inviati dal frontend
    username = data.get("username")
    password = data.get("password")
    
    auth_server = AuthenticationServer()
    result = auth_server.login(username, password)
    
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)



#---------------------------------------------------------------------------------------------------------------------------------

#GESTIONE PER ADDUSER

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

# TEST AREA
#server = AutenticationServer()
#server.login("l.salluce", "Cifhbab")
#server.addUser("Mario", "Rossi", "m.rossi", "fdgaffweX", "m.rossi@studenti.poliba.it")