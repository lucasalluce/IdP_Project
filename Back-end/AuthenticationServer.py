# Moduli utili
# bcrypt - utile al confronto delle hashedPassword
# random - utile per la generazione dell'OTP
# time - utile per la validazione dell'OTP
# MailService - utile per l'invio di mail agli utenti
import bcrypt, random, time
from MailService import MailService

# Connessione al database MySQL - IdP_OAuth2_2FA (localhost)
import mysql.connector
dbConnection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="IdP_OAuth2_2FA"
)
# Users (ID int PK, Name varchar(100), Surname varchar(100), Username varchar(100), Email varchar(200), HashedPassword varchar(300))
dbCursor = dbConnection.cursor()
    # cursor.execute() - funzione del cursore per interagire con il database

# Applicazione Flask - Server locale
from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

# Gestione OTP
otpData = []

class AuthenticationServer:
    def __init__(self):
        print("AuthenticationServer - Loading ...")
        self.mailService = MailService()        # Inizializzaione MailService
        print("AuthenticationServer - Online, in ascolto ...")
    
    def otpGenerator (self):
        print("AuthenticationServer.login.2FA - Generazione OTP ...")
        # Generazione codice OTP a 6 cifre
        otp = random.randint(100000, 999999)
        print("AuthenticationServer.login.2FA - OTP generato: " + str(otp))
        return otp

    def login (self, jsonUsername, jsonHashedPassword):
        print("AuthenticationServer.login - Interrogazione database ...")
            # Acquisizione possibili risconti dal database
        query = "SELECT HashedPassword, Email FROM Users WHERE Username = %s;"
        dbCursor.execute(query, (jsonUsername, ))
        dbReturn = dbCursor.fetchall()
        dbCursor.reset()
        print("AuthenticationServer.login - Interrogazione terminata")

        # Controllo credenziali
        if len(dbReturn) == 0:  # _Caso_ Username errato/Utente inseistente
            print("AuthenticationServer.login - Nessun riscontro, utente non autenticato")
            print("AuthenticationServer - Fine procedura 'login'")
            return {"success": False, "message": "Username errato/Utente inesistente"} # Risposta del server
        else:   # _Caso_ Utente esistente
            dbHashedPassword = dbReturn[0][0]   # Con doppio hash
            dbEmail = dbReturn[0][1]            
            dbReturn.clear()
                # _Caso_ Credenziali corrette -> 2FA
            if bcrypt.checkpw(jsonHashedPassword.encode('utf-8'), dbHashedPassword.encode('utf-8')):    # Controllo corrispondenza password
                print("AuthenticationServer.login - Riscontro totale, utente autenticato")              
                print("AuthenticationServer.login - Inizio sotto-procedura '2FA'")
                otp = self.otpGenerator()                                                               # Generazioni OTP
                
                print("AuthenticationServer.login.2FA - Invio dati al MailService ...")
                self.mailService.otpMail(otp, dbEmail)                                                  # Invio otpMail - MailService
                otpData.append({"email": dbEmail, "otp": otp, "timestamp": time.time()})                # Salvataggio dati dell'OTP per la verifica
                print("AuthenticationServer.login.2FA - OTP salvato per la verifica")
                print("OTP salvati: ", otpData)
                return {"success": True, "message": "Utente verificato, OTP inviato", "email": dbEmail} # Risposta del server, in allegato email dell'utente che ha fatto l'accesso (utile per il successivo verifyOTP())
            else:   # Caso - Credenziali sbagliate
                print("AuthenticationServer.login - Riscontro parziale, utente non autenticato")
                print("AuthenticationServer - Fine procedura 'login'")
                return {"success": False, "message": "Password errata"} # Risposta del server

    def otpValidator (self, jsonUserOTP, jsonEmail):
        print("AuthenticationServer.login.2FA.otpValidation - Inizio controllo OTP ...")
        if len(otpData) == 0: # _Caso_ otpData vuoto -> nessun OTP da controllarre
            print("AuthenticationServer.login.2FA.otpValidation - Nessun elemento di confronto -> accesso negato")
            return {"success": False, "message": "OTP già utilizzato"}
        else: # _Caso_ otpData non vuoto -> ricerca OTP da confrontare
            for element in otpData:
                if element["email"] == jsonEmail and element["otp"] == jsonUserOTP: # _Caso_ corrispondenza trovata -> verifica del tempo di vita OTP
                    print("AuthenticationServer.login.2FA.otpValidation - OTP trovato -> controllo validità ...")
                    if time.time() - element["timestamp"] <= 120: # _Caso_ OTP valido -> accesso completato
                        print("AuthenticationServer.login.2FA.otpValidation - OTP valido -> accesso completato")
                        index = otpData.index(element)
                        otpData.pop(index)
                        print("AuthenticationServer.login.2FA.otpValidation - Cancellazione OTP verificato")
                        print("OTP salvati: ", otpData)
                        print("AuthenticationServer.login.2FA.otpValidation - Fine procedura 'login.2FA.otpValidation'")
                        return {"success": True, "message": "OTP verificato, accesso completato"}               # TODO Valutare il passaggio del Token in questo punto
                    else: # _Caso_ OTP scaduto
                        print("AuthenticationServer.login.2FA.otpValidation - OTP non valido, accesso negato")
                        index = otpData.index(element)
                        otpData.pop(index)
                        print("AuthenticationServer.login.2FA.otpValidation - Cancellazione OTP scaduto")
                        print("OTP salvati: ", otpData)
                        print("AuthenticationServer.login.2FA.otpValidation - Fine procedura 'login.2FA.otpValidation'")
                        return {"success": False, "message": "OTP scaduto"}
            # _Caso_ nessuna corrispondenza -> OTP errato
            print("AuthenticationServer.login.2FA.otpValidation - OTP non trovato")
            print("AuthenticationServer.login.2FA.otpValidation - Fine procedura 'login.2FA.otpValidation'")
            return {"success": False, "message": "OTP errato o già utilizzato"}

    def addUser (self, jsonName, jsonSurname, jsonUsername, jsonEmail, jsonHashedPassword):
            # Controllo preesistenza Username
        print("AuthenticationServer.addUser - Interrogazione database ...")
        query = "SELECT * FROM Users WHERE Username = %s"
        dbCursor.execute(query, (jsonUsername, ))
        dbReturn = dbCursor.fetchall()
        print("AuthenticationServer.addUser - Interrogazione terminata")

        if len(dbReturn) == 0: # Caso - Utente da aggiungere            
            print("AuthenticationServer.addUser - Nessun riscontro -> inserimento nuovo utente")
            query = "INSERT INTO Users (Name, Surname, Username, Email, HashedPassword) VALUES (%s, %s, %s, %s, %s)"
            hashedPassword = bcrypt.hashpw(jsonHashedPassword.encode('utf-8'), bcrypt.gensalt())
            hashedPassword = hashedPassword.decode('utf-8')
            data = (jsonName, jsonSurname, jsonUsername, jsonEmail, hashedPassword, )
            dbCursor.execute(query, data)
            dbConnection.commit()
            print("AuthenticationServer.addUser - Query inviata")
            
            if dbCursor.rowcount == 1: # Caso - Inserimento di un nuovo utente completato
                # TODO Mail di conferma -> MailService
                #self.mailService.otpMail(data)
                
                dbCursor.reset()
                print("AuthenticationServer.addUser - Nuovo utente aggiunto con successo")
                print("AuthenticationServer - Fine procedura 'addUser'")
                return {"success": True, "message": "Utente aggiunto al database con successo"}
            else: # Caso - Errore nell'inserimento
                dbCursor.reset()
                print("AuthenticationServer.addUser - Nuovo utente non aggiunto, errore database")
                print("AuthenticationServer - Fine procedura 'addUser'")
                return {"success": False, "message": "Errore nell'agggiunta del nuovo utente nel database"}
        else: # Caso - Username già utilizzato
            print("AuthenticationServer.addUser - Username già registrato")
            print("AuthenticationServer - Fine procedura 'addUser'")
            return {"success": False, "message": "Username già in uso"}
        

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

@app.route("/login", methods=["POST"])
def login():
    print("AuthenticationServer - Inizio procedura 'login'")
    print("AuthenticationServer.login - Acquisizione dati ...")
    data = request.get_json()
    jsonUsername = data.get("username")
    jsonHasedPassword = data.get("password")
    print("AuthenticationServer.login - Dati acquisiti")
    server = AuthenticationServer()
    result = server.login(jsonUsername, jsonHasedPassword)
    return jsonify(result)

@app.route("/otpValidation", methods=["POST"])
def otpValidation():
    print("AuthenticationServer.login.2FA - Inizio procedura 'otpValidation'")
    print("AuthenticationServer.login.2FA.otpValidation - Acquisizione dati ...")
    data = request.get_json()
    jsonUserOTP = int(data.get("otp"))
    jsonEmail = data.get("email")
    print("AuthenticationServer.login.2FA.otpValidation - Dati acquisiti")
    server = AuthenticationServer()
    result = server.otpValidator(jsonUserOTP, jsonEmail)
    return jsonify(result)

@app.route("/addUser", methods=["POST"])
def addUser():
    print("AuthenticationServer - Inizio procedura 'addUser'")
    print("AuthenticationServer.addUser - Acquisizione dati ...")
    data = request.get_json()
    jsonName = data.get("name")
    jsonSurname = data.get("surname")
    jsonUsername = data.get("username")
    jsonEmail = data.get("email")
    jsonHashedPassword = data.get("password")
    print("AuthenticationServer.addUser - Dati acquisiti")
    server = AuthenticationServer()
    result = server.addUser(jsonName, jsonSurname, jsonUsername, jsonEmail, jsonHashedPassword)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)