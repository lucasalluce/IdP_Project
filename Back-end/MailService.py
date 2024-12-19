# Moduli utili
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib

class MailService:
    def __init__(self):
        self.senderEmail = "idp.mailservice@gmail.com"
        self.senderPassword = "kohi grli ueyn rupb"
        print("\tMailService - Online")
    
    def generateMessage (self, reciverMail, subject, body):
        print("\tMailService - Generazione mail ...")
        mailMessage = MIMEMultipart()
        mailMessage["From"] = self.senderEmail
        mailMessage["To"] = reciverMail
        mailMessage["Subject"] = subject
        mailMessage.attach(MIMEText(body, "plain"))
        return mailMessage
    
    def sendMail (self, mailMessage, reciverMail):
        try:
            print("\tMailService - Invio mail ...")
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtpServer:
                smtpServer.login(self.senderEmail, self.senderPassword)
                smtpServer.sendmail(self.senderEmail, reciverMail, str(mailMessage))
        except Exception as e:
            print(f"Errore login/invio mail riscontrato: {e}")
    
    def otpMail (self, otp, reciverMail):
        print("\tMailService - Dati ricevuti, compilazione otpMail ...")
        body = f"Ecco il tuo personale codice OTP per completare l'accesso: {otp}. Il codice scadrà tra 2 minuti.\n\nA presto!" 
        mailMessage = self.generateMessage(reciverMail, "2FA protocoll", body)
        print("\tMailService - otpMail pronta per l'invio")
        self.sendMail(mailMessage, reciverMail)
        print("\tMailService - otpMail inviata")
        
    def addUserMail (self, data):
        print("\tMailService - Dati ricevuti, compilazione addUserMail ...")
        userName = data[0]
        userSurname = data[1]
        userUsername = data[2]
        reciverMail = data[3]
        body = f"Benvenuto/a\nLa registrazione è stata completata con successo, ora puoi accedere nella home inserendo Username e Password\n\nI tuoi dati:\n{userName} {userSurname}\nUsername: {userUsername}\n\nA presto!"
        mailMessage = self.generateMessage(reciverMail, "Registrazione effettuata con successo", body)
        print("\tMailService - addUserMail pronta per l'invio")
        self.sendMail(mailMessage, reciverMail)
        print("\tMailService - addUserMail inviata")
    
    def tmpPasswordMail (self, data):
        print("\tMailService - Dati ricevuti, compilazione tmpPasswordMail ...")
        userUsername = data[0]
        reciverMail = data[1]
        tmpPassowrd = data[2]
        body = f"Ecco le tue credenziali per effettuare l'accesso\nUsername: {userUsername}\nPassword temporanea: {tmpPassowrd}\nEffettuando l'accesso con queste credenziali ti verrà chiesto di reimpostare la password\nSe non sei stato tu a chiedere una password temporanea, accedi con le tue credenziali, e la password temporanea verrà automaticamente eliminata\n\nA presto!"
        mailMessage = self.generateMessage(reciverMail, "Password temporanea", body)
        print("\tMailService - tmpPasswordMail pronta per l'invio")
        self.sendMail(mailMessage, reciverMail)
        print("\tMailService - tmpPasswordMail inviata")
    
    def updatePasswordMail (self, reciverMail):
        print("\tMailService - Dati ricevuti, compilazione updatePasswordMail ...")
        boby = f"Password utente modificata con successo, ora può effettuale l'accesso utilizzando il tuo username e la nuova password\n\nA presto!"
        mailMessage = self.generateMessage(reciverMail, "Modifica password utente", body)
        print("\tMailService - updatePasswordMail pronta per l'invio")
        self.sendMail(mailMessage, reciverMail)
        print("\tMailService - updatePasswordMail inviata")