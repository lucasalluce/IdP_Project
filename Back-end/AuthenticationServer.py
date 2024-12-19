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
        self.mailService = MailService() # Inizializzaione MailService
    
    def otpGenerator (self):
        print("\t2FA - Generazione OTP ...")
        otp = random.randint(100000, 999999)    # Generazione codice OTP a 6 cifre
        print("\t2FA - OTP generato: " + str(otp))
        return otp

    def tmpPasswordGenerator (self):
        print("\ttmpPasswordGeneration - Generazione password temporanea ...")
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
        print("\ttmpPasswordGeneration - Password generata: " + ''.join(tmpPass))
        print("\ttmpPasswordGeneration - Terminazione sotto-procedura")
        return ''.join(tmpPass)

    def login (self, jsonUsername, jsonHashedPassword):
        # TODO controllo tmpPassword
        
            # Acquisizione risconti Username - database
        print("AuthenticationServer.login - Interrogazione database ...")
        query = "SELECT HashedPassword, Email FROM Users WHERE Username = %s;"
        dbCursor.execute(query, (jsonUsername, ))
        dbReturn = dbCursor.fetchall()
        dbCursor.reset()

            # Controllo riscontri
        if len(dbReturn) == 0: # Caso - Nessun riscontro
            print("AuthenticationServer.login - Nessun riscontro trovato per questo Username")
            print("AuthenticationServer.login - Terminazione procedura")
            return {"success": False, "message": "Wrong username/unregistered user"}
        else: # Caso - Utente esistente
            print("AuthenticationServer.login - Riscontro trovato per questo Username")
            dbHashedPassword = dbReturn[0][0]
            dbEmail = dbReturn[0][1]            
            dbReturn.clear()
                # Controllo credenziali
            if bcrypt.checkpw(jsonHashedPassword.encode('utf-8'), dbHashedPassword.encode('utf-8')): # Caso - Credenziali corrette
                print("AuthenticationServer.login - Riscontro totale, accoutn utente autenticato")              
                print("AuthenticationServer.login - Inizio sotto-procedura '2FA'")
                otp = self.otpGenerator()                                                               # Generazioni OTP
                otpData.append({"email": dbEmail, "otp": otp, "timestamp": time.time()})                # Salvataggio dati dell'OTP per la verifica
                print("\t2FA - OTP salvato per la verifica")
                
                print("\t2FA - Invio dati al MailService ...")
                self.mailService.otpMail(otp, dbEmail)                                                  # Invio otpMail - MailService
                return {"success": True, "message": "Verified user, OTP submitted", "email": dbEmail}
            else: # Caso - Credenziali sbagliate
                print("AuthenticationServer.login - Riscontro parziale, account utente non autenticato")
                print("AuthenticationServer.login - Terminazione procedura")
                return {"success": False, "message": "Wrong password"}

    def otpValidator (self, jsonUserOTP, jsonEmail):
        print("\t\totpValidation - Controllo corrispondeza OTP ...")
            # Verifica esistenza OTP in attesa di controllo
        if len(otpData) == 0: # Caso - otpData vuoto -> nessun OTP da controllarre
            print("\t\totpValidation - Nessun elemento di confronto, accesso negato")
            print("\t\totpValidation - Terminazione sotto-procedura")
            print("\t2FA - Terminazione sotto-procedura")
            print("AuthenticationServer.login - Terminazione procedura")
            return {"success": False, "message": "OTP already used", "case": 0}
        else: # Caso - otpData non vuoto -> ricerca OTP da confrontare
                # Scorrimento OTP in attesa di controllo
            for element in otpData:
                    # Controllo corrispondenza email-OTP
                if element["email"] == jsonEmail and element["otp"] == jsonUserOTP: # Corrispondenza totale
                    print("\t\totpValidation - OTP trovato, controllo validità ...")
                        # Verifica del tempo di vita OTP
                    if time.time() - element["timestamp"] <= 120: # Caso - OTP valido, accesso completato
                        print("\t\totpValidation - OTP valido, accesso completato")
                        print("\t\totpValidation - Aggiornamento otpData")
                        index = otpData.index(element)
                        otpData.pop(index)
                        print("\t\totpValidation - Terminazione sotto-procedura")
                        print("\t2FA - Terminazione sotto-procedura")
                        print("AuthenticationServer.login - Terminazione procedura")
                        
                        # TODO Recupero dati utente per cartella sanitaria
                        
                        return {"success": True, "message": "OTP verified, login completed"}
                    else: # Caso - OTP scaduto, accesso negato
                        print("\t\totpValidation - OTP non valido, accesso negato")
                        print("\t\totpValidation - Aggiornamento otpData")
                        index = otpData.index(element)
                        otpData.pop(index)
                        print("\t\totpValidation - Terminazione sotto-procedura")
                        print("\t2FA - Terminazione sotto-procedura")
                        print("AuthenticationServer.login - Terminazione procedura")
                        return {"success": False, "message": "Expired OTP", "case": 0}
            # Caso - Nessuna corrispondenza, OTP errato
            print("\t\totpValidation - OTP non trovato")
            print("\t\totpValidation - Terminazione sotto-procedura")
            print("\t2FA - Terminazione sotto-procedura")
            print("AuthenticationServer.login - Terminazione procedura")
            return {"success": False, "message": "Wrong OTP", "case": 1}

    def addUser (self, jsonName, jsonSurname, jsonUsername, jsonEmail, jsonHashedPassword):
            # Acquisizione riscontri Username - database
        print("AuthenticationServer.addUser - Controllo esistenza utente con stesso Username")
        print("AuthenticationServer.addUser - Interrogazione database ...")
        query = "SELECT * FROM Users WHERE Username = %s"
        dbCursor.execute(query, (jsonUsername, ))
        dbReturn = dbCursor.fetchall()
        dbCursor.reset()

            # Controllo preesistenza Username
        if len(dbReturn) == 0: # Caso - Utente da aggiungere            
            print("AuthenticationServer.addUser - Nessun riscontro -> Creazione nuovo utente ...")
            query = "INSERT INTO Users (Name, Surname, Username, Email, HashedPassword) VALUES (%s, %s, %s, %s, %s)"
            hashedPassword = bcrypt.hashpw(jsonHashedPassword.encode('utf-8'), bcrypt.gensalt())    # Hashing password (secondo)
            hashedPassword = hashedPassword.decode('utf-8')
            data = (jsonName, jsonSurname, jsonUsername, jsonEmail, hashedPassword, )
            dbCursor.execute(query, data)
            dbConnection.commit()
            print("AuthenticationServer.addUser - Invio query ...")
            
            if dbCursor.rowcount == 1: # Caso - Inserimento di un nuovo utente completato
                print("AuthenticationServer.addUser - Creazione nuovo utente completata")
                print("AuthenticationServer.addUser - Invio dati al MailService ...")
                self.mailService.addUserMail(data)                                                  # Invio addUserMail - MailService
                dbCursor.reset()
                print("AuthenticationServer.addUser - Terminazione procedura")
                return {"success": True, "message": "User successfully created and added to database"}
            else: # Caso - Errore nell'inserimento
                print("AuthenticationServer.addUser - Creazione nuovo utente non completata")
                dbCursor.reset()
                print("AuthenticationServer.addUser - Terminazione procedura")
                return {"success": False, "message": "Error, user creation and database addition not completed"}
            
        else: # Caso - Username già utilizzato
            print("AuthenticationServer.addUser - Username già registrato")
            print("AuthenticationServer.addUser - Terminazione procedura")
            return {"success": False, "message": "Error, Username already in use"}

    def forgotPassword (self, jsonUsername):
            # Acquisizione riscontri Username - database
        print("AuthenticationServer.forgotPassword - Controllo esistenza utente con stesso Username")
        print("AuthenticationServer.forgotPassword - Interrogazione database ...")
        query = "SELECT Email FROM Users WHERE Username = %s"
        dbCursor.execute(query, (jsonUsername, ))
        dbReturn = dbCursor.fetchall()
        dbCursor.reset()
        
            # Controllo riscontro
        if len(dbReturn) == 0: # Caso - Nessun riscontro, Username errato
            print("AuthenticationServer.forgotPassword - Nessun riscontro, Username errato")
            print("AuthenticationServer.forgotPassword - Terminazione procedura")
            return {"success": False, "message": "No user is registered with this username"}           
        else: # Caso - Utente identificato
            print("AuthenticationServer.forgotPassword - Riscontro trovato per questo Username")
            print("AuthenticationServer.forgotPassword - Inizio sotto-procedura 'tmpPasswordGeneration'")
            tmpPassword = self.tmpPasswordGenerator()
            tmpPasswordData.append({"username": jsonUsername, "tmpPassword": tmpPassword})
            print("AuthenticationServer.forgotPassword - tmpPassword salvata per la verifica'")
            
            print("AuthenticationServer.forgotPassword - Invio dati al MailService ...")
            data = (jsonUsername, dbReturn[0][3], tmpPassword)
            self.mailService.tmpPasswordMail(data)
            
            print("AuthenticationServer.forgotPassword - Terminazione procedura")
            return {"success": True, "message": "Temporary password created, check email"}    
        

print("AuthenticationServer - Loading ...")
print("AuthenticationServer - Online, in attesa di richieste ...~")

@app.route("/login", methods=["POST"])
def login():
    print("AuthenticationServer - Richiesta ricevuta: 'login', inizio procedura")
    print("AuthenticationServer.login - Acquisizione dati ...")
    data = request.get_json()
    jsonUsername = data.get("username")
    jsonHasedPassword = data.get("password")
    print("AuthenticationServer.login - Acquisizione dati completata")
    server = AuthenticationServer()
    result = server.login(jsonUsername, jsonHasedPassword)
    return jsonify(result)

@app.route("/otpValidation", methods=["POST"])
def otpValidation():
    print("\t2FA - Richiesta ricevuto: 'otpValidation', inizio sotto-procedura")
    print("\t\totpValidation - Acquisizione dati ...")
    data = request.get_json()
    jsonUserOTP = int(data.get("otp"))
    jsonEmail = data.get("email")
    print("\t\totpValidation - Acquisizione dati completata")
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
    print("AuthenticationServer - Richiesta ricevuta: 'addUser', inizio procedura")
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

@app.route("/forgotPassword", methods=["POST"])
def forgotPassword():
    print("AuthenticationServer - Richiesta ricevuta: 'forgotPassword', inizio procedura")
    print("AuthenticationServer.forgotPassword - Acquisizione dati ...")
    data = request.get_json()
    jsonUsername = data.get("username")
    print("AuthenticationServer.forgotPassword - Acquisizione dati completata")
    server = AuthenticationServer()
    result = server.forgotPassword(jsonUsername)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)