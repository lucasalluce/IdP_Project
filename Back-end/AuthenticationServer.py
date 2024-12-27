# Moduli utili
# bcrypt - utile al confronto delle hashedPassword
# random - utile per la generazione dell'OTP
# time - utile per la validazione dell'OTP
# string - utile per la generazione della tmpPassword
# hashlib - utile per l'hashing SHA-256
# MailService - utile per l'invio di mail agli utenti
import bcrypt, random, time, string, hashlib
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

    def hashPassword(self, clearPassword):
        print("\thashingPassword - Acquisizione clearPassword:", clearPassword)
        # Encoding della password come byte
        data = clearPassword.encode('utf-8')
        print("\thashingPassword - Encoding:", data)
        # Calcolo dell'hash SHA-256
        hashObject = hashlib.sha256(data)
        hashHex = hashObject.hexdigest()
        print("\thashingPassword - Hashing SHA-256:", hashHex)
        print("\thashingPassword - Terminazione sotto-processo")
        return hashHex
    
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
            return {"success": False, "message": "Wrong username/unregistered user", "case": 0}
        else: # Caso - Utente esistente
            print("AuthenticationServer.login - Riscontro trovato per questo Username")
            dbHashedPassword = dbReturn[0][0]
            dbEmail = dbReturn[0][1]            
            dbReturn.clear()
            
                # Controllo esistenza tmpPassword per l'username
            if len(tmpPasswordData) != 0:
                for element in tmpPasswordData:
                    if element["username"] == jsonUsername: # Caso - Riscontro di possibile accesso con tmpPassword
                        print("AuthenticationServer.login - Possibile accesso con tmpPasswrod, controllo credenziali ...")
                        elementHashedPassword = self.hashPassword(element["tmpPassword"])
                        hashedPassword = bcrypt.hashpw(elementHashedPassword.encode('utf-8'), bcrypt.gensalt())    # Hashing password (secondo)
                        hashedPassword = hashedPassword.decode('utf-8')
                        
                            # Controllo credenziali
                        if bcrypt.checkpw(jsonHashedPassword.encode('utf-8'), hashedPassword.encode('utf-8')): # Caso - Accesso con tmpPassword -> resetPassword
                            print("AuthenticationServer.login - Riscontro totale, accoutn utente autenticato con tmpPassword")              
                            print("AuthenticationServer.login - Inizio sotto-procedura '2FA'")
                            otp = self.otpGenerator()                                                               # Generazioni OTP
                            index = tmpPasswordData.index(element)
                            otpData.append({"email": dbEmail, "otp": otp, "timestamp": time.time(), "case": 0})                # Salvataggio dati dell'OTP per la verifica
                            print("\t2FA - OTP salvato per la verifica")
                            
                            print("\t2FA - Invio dati al MailService ...")
                            self.mailService.otpMail(otp, dbEmail)                                                  # Invio otpMail - MailService
                            return {"success": True, "message": "Verified user with tmpPasswod, OTP submitted", "email": dbEmail}
                        else:
                            print("AuthenticationServer.login - Riscontro parziale, account utente non autenticato con tmpPassword, tmpPassword spagliata")
                            break
                pass
            
                # Controllo credenziali
            if bcrypt.checkpw(jsonHashedPassword.encode('utf-8'), dbHashedPassword.encode('utf-8')): # Caso - Credenziali corrette
                print("AuthenticationServer.login - Riscontro totale, accoutn utente autenticato")              
                print("AuthenticationServer.login - Inizio sotto-procedura '2FA'")
                otp = self.otpGenerator()                                                               # Generazioni OTP
                otpData.append({"email": dbEmail, "otp": otp, "timestamp": time.time(), "case": 1})                # Salvataggio dati dell'OTP per la verifica
                print("\t2FA - OTP salvato per la verifica")
                
                print("\t2FA - Invio dati al MailService ...")
                self.mailService.otpMail(otp, dbEmail)                                                  # Invio otpMail - MailService
                return {"success": True, "message": "Verified user, OTP submitted", "email": dbEmail}
            else: # Caso - Credenziali sbagliate
                print("AuthenticationServer.login - Riscontro parziale, account utente non autenticato")
                print("AuthenticationServer.login - Terminazione procedura")
                return {"success": False, "message": "Wrong password", "case": 1}

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
                        if element["case"] == 0:
                            print("AuthenticationServer.login - Terminazione procedura")
                            return {"success": True, "message": "OTP verified, login completed whit tmpPassword", "case": 0}
                        print("AuthenticationServer.login - Terminazione procedura")
                        return {"success": True, "message": "OTP verified, login completed", "case": 1}
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
            tmpPasswordData.append({"username": jsonUsername, "email": dbReturn[0][0], "tmpPassword": tmpPassword})
            print("AuthenticationServer.forgotPassword - tmpPassword salvata per la verifica'")
            
            print("AuthenticationServer.forgotPassword - Invio dati al MailService ...")
            data = (jsonUsername, dbReturn[0][0], tmpPassword)
            self.mailService.tmpPasswordMail(data)
            
            print("AuthenticationServer.forgotPassword - Terminazione procedura")
            return {"success": True, "message": "Temporary password created, check email"}    
        
    def resetPassword (self, jsonTmpPassword, jsonNewHashedPassword, jsonUsername):
        print("AuthenticationServer.resetPassword - Controllo corrispondenza tmpPassword ...")
            # Verifica esistenza tmpPassword in attesa di controllo
        if len(tmpPasswordData) == 0: # Caso - tmpPasswordData vuoto -> nessuna tmpPassword da controllarre
            print("AuthenticationServer.resetPassword - tmpPasswordData vuoto, tmpPassword già utilizzata")
            print("AuthenticationServer.resetPassword - Terminazione procedura")
            return {"success": False, "message": "Temporary password already used", "case": 0}
        else: # Caso - tmpPasswordData non vuoto -> ricerca tmpPassword da controllarre
                # Scorrimento tmpPassword in attesa di controllo
            for element in tmpPasswordData:
                    # Controllo corrispondenza username-tmpPassword
                if element["username"] == jsonUsername and element["tmpPassword"] == jsonTmpPassword: # Caso - tmpPassword valida -> aggiornamento password utente
                    print("AuthenticationServer.resetPassword - tmpPassword trovata e valida -> aggiornamento password")
                    hashedPassword = bcrypt.hashpw(jsonNewHashedPassword.encode('utf-8'), bcrypt.gensalt())    # Hashing password (secondo)
                    hashedPassword = hashedPassword.decode('utf-8')
                    print("AuthenticationServer.resetPassword - Aggiornamento tmpPasswordData")
                    index = tmpPasswordData.index(element)
                    tmpPasswordData.pop(index)
                    
                    print("AuthenticationServer.resetPassword - Aggiornamento password utente ...")
                    query = """
                    UPDATE Users
                    SET HashedPassword = %s
                    WHERE Username = %s
                    """
                    data = (hashedPassword, jsonUsername, )
                    dbCursor.execute(query, data)
                    dbConnection.commit()
                    print("AuthenticationServer.resetPassword - Invio query ...")
                    
                    if dbCursor.rowcount == 1: # Caso - Aggiornamento password utente conmpletato
                        print("AuthenticatioServer.resetPassword - Aggiornamento password completato")
                        print("AuthenticatioServer.resetPassword - Invio dati al MailService ...")
                        dbCursor.reset()
                        query = "SELECT Email FROM Users WHERE Username = %s"
                        dbCursor.execute(query, (jsonUsername, ))
                        dbReturn = dbCursor.fetchall()
                        userEmail = dbReturn[0][0]
                        dbCursor.reset()
                        dbReturn.clear()
                        self.mailService.updatePasswordMail(userEmail)
                        print("AuthenticationServer.resetPassword - Terminazione procedura")
                        return {"success": True, "message": "tmpPassword valid, user password successfully updated"}
                    else: # Caso - Errore nell'aggiornamento della password utente
                        print("AuthenticationServer.resetPassword - Aggiornamento password non completato")
                        dbCursor.reset()
                        print("AuthenticationServer.resetPassword - Terminazione procedura")
                        return {"success": False, "message": "Error, user password unsuccessfully updated", "case": 2}
            # Caso - Nessuna corrispondenza, tmpPassword errata
            print("AuthenticationServer.resetPassword - tmpPassword non trovata")
            print("AuthenticationServer.resetPassword - Terminazione procedura")
            return {"success": False, "message": "Wrong tmpPassword", "case": 1}


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

@app.route("/getUserData", methods=["POST"])
def getUserData():
    print("AuthenticationServer - Richiesta ricevuta: 'getUserData', inizio procedura")
    print("AuthenticationServer.getUserData - Acquisizione dati ...")
    data = request.get_json()
    jsonUsername = data.get("username")
    print("AuthenticationServer.getUserData - Acquisizione dati completata")
    
        # Interrogazione database
    query = "SELECT Name, Surname, Email FROM Users WHERE Username = %s;"
    dbCursor.execute(query, (jsonUsername,))
    dbReturn = dbCursor.fetchone()
    
    if dbReturn:
        print("AuthenticationServer.getUserData - Dati utente acquisiti")
        return jsonify({"success": True, "message": "User data uploaded correctly", "name": dbReturn[0], "surname": dbReturn[1], "email": dbReturn[2]})
    else:
        print("AuthenticationServer.getUserData - Nessun utente trovato")
        return jsonify({"success": False, "message": "Error, user not found"})

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

@app.route("/resetPassword", methods=["POST"])
def resetPassword():
    print("AuthenticationServer - Richiesta ricevuto: 'resetPassword', inizio procedura")
    print("AuthenticationServer.resetPassword - Acquisizione dati ...")
    data = request.get_json()
    jsonTmpPassword = data.get("tmpPassword")
    jsonNewHashedPassword = data.get("newPassword")
    jsonUsername = data.get("username")
    print("AuthenticationServer.resetPassword - Acquisizione dati completata")
    server = AuthenticationServer()
    result = server.resetPassword(jsonTmpPassword, jsonNewHashedPassword, jsonUsername)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)