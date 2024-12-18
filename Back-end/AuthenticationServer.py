# Moduli utili
# bcrypt - utile al confronto delle hashedPassword
# random - utile per la generazione dell'OTP
# time - utile per la validazione dell'OTP
# string - utile per la generazione della tmpPassword
# MailService - utile per l'invio di mail agli utenti
import bcrypt, random, time, string
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
tmpPasswordData = []

class AuthenticationServer:
    def __init__(self):
        self.mailService = MailService()        # Inizializzaione MailService
    
    def otpGenerator (self):
        print("AuthenticationServer.login.2FA - Generazione OTP ...")
        # Generazione codice OTP a 6 cifre
        otp = random.randint(100000, 999999)
        print("AuthenticationServer.login.2FA - OTP generato: " + str(otp))
        return otp

    def tmpPasswordGenerator (self):
        print("AuthenticationServer.recoveryPassword.tmpPasswordGeneration - Generazione password temporanea ...")
        lenght = 12                                                                 # Lunghezza minima della password
        lowChar = random.choice(string.ascii_lowercase)
        uppChar = random.choice(string.ascii_uppercase)
        nr = random.choice(string.digits)
        specialChar = random.choice("!@#$%^&*()-_=+[]{}|;:',.<>?/")
        fill = ''.join(random.choices(
            string.ascii_letters + string.digits + "!@#$%^&*()-_=+[]{}|;:',.<>?/",
            k = lenght - 4
        ))
        tmpPass = list(uppChar + lowChar + nr + specialChar + fill)
        random.shuffle(tmpPass)
        print("AuthenticationServer.recoveryPassword.tmpPasswordGeneration - Password generata: " + ''.join(tmpPass))
        return ''.join(tmpPass)

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
            dbHashedPassword = dbReturn[0][0]
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
                        
                        # TODO Acquisizione e passaggio userData
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
        print("AuthenticationServer.addUser - Controllo esistenza utente con stesso Username")
        print("AuthenticationServer.addUser - Interrogazione database ...")
        query = "SELECT * FROM Users WHERE Username = %s"
        dbCursor.execute(query, (jsonUsername, ))
        dbReturn = dbCursor.fetchall()
        dbCursor.reset()

        if len(dbReturn) == 0: # Caso - Utente da aggiungere            
            print("AuthenticationServer.addUser - Nessun riscontro -> Creazione nuovo utente ...")
            query = "INSERT INTO Users (Name, Surname, Username, Email, HashedPassword) VALUES (%s, %s, %s, %s, %s)"
            hashedPassword = bcrypt.hashpw(jsonHashedPassword.encode('utf-8'), bcrypt.gensalt())
            hashedPassword = hashedPassword.decode('utf-8')
            data = (jsonName, jsonSurname, jsonUsername, jsonEmail, hashedPassword, )
            dbCursor.execute(query, data)
            dbConnection.commit()
            print("AuthenticationServer.addUser - Invio query ...")
            
            if dbCursor.rowcount == 1: # Caso - Inserimento di un nuovo utente completato
                print("AuthenticationServer.addUser - Nessun riscontro -> Creazione utente completata")
                print("AuthenticationServer.addUser - Invio dati al MailService ...")
                self.mailService.addUserMail(data)                                                               # Invio addUserMail - MailService
                dbCursor.reset()
                print("AuthenticationServer.addUser - Terminazione procedura 'addUser'")
                return {"success": True, "message": "User successfully created and added to database"}
            else: # Caso - Errore nell'inserimento
                print("AuthenticationServer.addUser - Creazione utente non completata")
                dbCursor.reset()
                print("AuthenticationServer.addUser - Terminazione procedura 'addUser'")
                return {"success": False, "message": "Error, user creation and database addition not completed"}
        else: # Caso - Username già utilizzato
            print("AuthenticationServer.addUser - Username già registrato")
            print("AuthenticationServer.addUser - Terminazione procedura 'addUser'")
            return {"success": False, "message": "Error, Username already in use"} 

    # TODO
    def recoveryPassword(self, jsonUsername):
        pass

print("AuthenticationServer - Loading ...")
print("AuthenticationServer - Online, in attesa di richieste ...~")

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

@app.route("/otpValidationLogin", methods=["POST"])
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

# TODO Edit
@app.route("/getUserData", methods=["POST"])
def getUserData():
    print("AuthenticationServer.getUserData - Inizio procedura recupero dati utente")
    data = request.get_json()
    jsonEmail = data.get("email")  # Riceve l'email dal frontend
    print("AuthenticationServer.getUserData - Email ricevuta:", jsonEmail)
    
    # Query per recuperare i dati utente dal DB
    query = "SELECT Name, Surname, Username, Email FROM Users WHERE Email = %s;"
    dbCursor.execute(query, (jsonEmail,))
    userData = dbCursor.fetchone()
    
    if userData:
        print("AuthenticationServer.getUserData - Dati utente trovati:", userData)
        return jsonify({
            "success": True,
            "name": userData[0],
            "surname": userData[1],
            "username": userData[2],
            "email": userData[3]
        })
    else:
        print("AuthenticationServer.getUserData - Nessun utente trovato")
        return jsonify({"success": False, "message": "Utente non trovato"})

@app.route("/addUser", methods=["POST"])
def addUser():
    print("AuthenticationServer - Richiesta ricevuta :'addUser', inizio procedura")
    print("AuthenticationServer.addUser - Acquisizione dati ...")
    data = request.get_json()
    jsonName = data.get("name")
    jsonSurname = data.get("surname")
    jsonUsername = data.get("username")
    jsonEmail = data.get("email")
    jsonHashedPassword = data.get("password")
    print("AuthenticationServer.addUser - Acquisizione dati completata")
    server = AuthenticationServer()
    result = server.addUser(jsonName, jsonSurname, jsonUsername, jsonEmail, jsonHashedPassword)
    return jsonify(result)

# TODO
@app.route("/recoveryPassword", methods=["POST"])
def recoveryPassword():
    pass

if __name__ == "__main__":
    app.run(debug=True)