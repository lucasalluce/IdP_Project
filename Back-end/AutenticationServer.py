# Moduli utili
# bcrypt - utile al confronto delle hashedPassword
# random - 
import bcrypt, random

# Connessione al database MySQL - IdP_OAuth2_2FA (localhost)
import mysql.connector
dbConnection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="IdP_OAuth2_2FA"
)
# Users (ID int PK, Name varchar(100), Surname varchar(100), Username varchar(100), HashedPassword varchar(300), Email varchar(200))
dbCursor = dbConnection.cursor()
    # cursor.execute() - funzione del cursore per interagire con il database

# Applicazione Flask - Server locale
from flask import Flask
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

class AutenticationServer:
    def __init__(self) -> None:
        print("Server - Online, in attesa di richieste")
    
    def otpGenerator (self):
        print("Server.2FA - Generazione OTP ...")
        # Generazione codice OTP a 6 cifre
        otp = random.randint(100000, 999999)
        print("Server.2FA - OTP generato " + str(otp))
        return otp
    
    def login (self, jsonUsername, jsonHashedPassword):
        print("Server - Inizio della procedura 'login'")
        
        print("Server.login - Interrogazione database ...")
            # Acquisizione credenziali dal database
        query = "SELECT HashedPassword, Email FROM Users WHERE Username = %s;"
        dbCursor.execute(query, (jsonUsername, ))
        dbReturn = dbCursor.fetchall()
        dbCursor.reset()
        print("Server.login - Dati acquisiti")

        if len(dbReturn) == 0: # Caso - Username errato/Utente inseistente
            print("Server.login - Nessun riscontro")
            print("Server - Fine della procedura 'login'")
            return {"success": False, "message": "Username errato/Utente inesistente"} # Risposta del server
        else: # Caso - Utente esistente
            dbHashedPassword = dbReturn[0][0]
            dbEmail = dbReturn[0][1]            
            dbReturn.clear()
            if bcrypt.checkpw(jsonHashedPassword.encode('utf-8'), dbHashedPassword.encode('utf-8')): # Caso - Credenziali corrette -> protocol2FA()
                print("Server.login - Riscontro totale, utente autenticato")
                print("Server.login - Passaggio alla procedura '2FA'")
                otp = self.otpGenerator()
                # TODO decidere approccio MailService / funzione sendOtp(otp, dbEmail)
                # TODO salvataggio corrispondenza mail-otp,timestamp
                    # Soluzione di Fede
                    #otp_data[email] = {
                    #   "otp": otp,
                    #   "timestamp": time.time()  # Memorizza il timestamp per scadenza
                    #}
                
                return {"success": True, "message": "Utente verificato, OTP inviato", "Email": dbEmail} # Risposta del server, in allegato mail dell'utente che ha fatto l'accesso (utile per la successiva verifica del codice OTP)
            else: # Caso - Credenziali sbagliate
                
                return {"success": False, "message": "Password errata"} # Risposta del server

        

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