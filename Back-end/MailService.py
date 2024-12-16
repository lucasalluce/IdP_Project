# Moduli utili
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib

class MailService:
    def __init__(self):
        self.senderEmail = "idp.mailservice@gmail.com"
        self.senderPassword = "kohi grli ueyn rupb"
        print("MailService - Online")
    
    def generateMessage (self, reciverMail, subject, body):
        print("MailService - Generazione mail ...")
        mailMessage = MIMEMultipart()
        mailMessage["From"] = self.senderEmail
        mailMessage["To"] = reciverMail
        mailMessage["Subject"] = subject
        mailMessage.attach(MIMEText(body, "plain"))
        return mailMessage
    
    def sendMail (self, mailMessage, reciverMail):
        try:
            print("MailService - Invio mail ...")
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtpServer:
                smtpServer.login(self.senderEmail, self.senderPassword)
                smtpServer.sendmail(self.senderEmail, reciverMail, str(mailMessage))
        except Exception as e:
            print(f"Errore login/invio mail riscontrato: {e}")
    
    def otpMail (self, otp, userEmail):
        print("MailService - Dati ricevuti, inizio procedura otpMail ...")
        body = f"Ecco il tuo personale codice OTP per completare l'accesso: {otp}. Il codice scadrà tra 2 minuti." 
        mailMessage = self.generateMessage(userEmail, "2FA protocoll", body)
        print("MailService - otpMail pronta per l'invio")
        self.sendMail(mailMessage, userEmail)
        print("MailService - otpMail inviata")
        
    def addUserMail (self, data):
        print("MailService - Dati ricevuti, inzio procedura addUserMail ...")
        userName = data[0]
        userSurname = data[1]
        userUsername = data[2]
        userEmail = data[3]
        body = f"Benvenuto/a\nLa registrazione è stata completata con successo, ora puoi accedere nella home inserendo Username e Password\n\n\tI tuoi dati:\n{userName} {userSurname}\nUsername: {userUsername}\n\nA presto!"
        mailMessage = self.generateMessage(userEmail, "Registrazione effettuata con successo", body)
        print("MailService - addUserMail pronta per l'invio")
        self.sendMail(mailMessage, userEmail)
        print("MailService - addUserMail inviata")