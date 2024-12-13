# Moduli utili
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib

class MailService:
    def __init__(self):
        self.senderEmail = "idp.mailservice@gmail.com"
        self.senderPassword = "kohi grli ueyn rupb"
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as self.smtpServer:
                self.smtpServer.login(self.senderEmail, self.senderPassword)
        except Exception as e:
            print(f"Errore login riscontrato: {e}")
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
            self.smtpServer.sendmail(self.senderEmail, reciverMail, str(mailMessage))
        except Exception as e:
            print(f"Errore invio mail riscontrato: {e}")
    
    def otpMail (self, otp, reciverMail):
        print("MailService - Dati ricevuti, inizio procedura otpMail ...")
        body = f"Ecco il tuo personale codice OTP per completare l'accesso: {otp}. Il codice scadrà tra 2 minuti." 
        mailMessage = self.generateMessage(reciverMail, "2FA protocoll", body)
        print("MailService - otpMail pronta per l'invio")
        self.sendMail(mailMessage, reciverMail)
        print("MailService - otpMail inviata con successo")
        