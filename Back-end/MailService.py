# Moduli utili
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib


class MailService:
    def __init__(self):
        self.senderMail = "idp.mailservice@gmail.com"
        self.senderPassword = "kohi grli ueyn rupb"
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as self.smtpServer:
                self.smtpServer.login(self.senderMail, self.senderPassword)
        except Exception as e:
            print(f"Errore login riscontrato: {e}")
        print("MailService - Online")
    
    def generateMessage (self, reciverMail, subject, body):
        mailMessage = MIMEMultipart()
        mailMessage["From"] = self.senderMail
        mailMessage["To"] = reciverMail
        mailMessage["Subject"] = subject
        mailMessage.attach(MIMEText(body, "plain"))
        return mailMessage
    
    def sendMail (self, mailMessage, reciverMail):
        try:
            self.smtpServer.sendmail(self.senderMail, reciverMail, str(mailMessage))
        except Exception as e:
            print(f"Errore invio mail riscontrato: {e}")
    
    def otpMail (self, otp, reciverMail):
        body = f"Ecco il tuo personale codice OTP per completare l'accesso: {otp}. Il codice scadrà tra 2 minuti." 
        mailMessage = self.generateMessage(reciverMail, "2FA protocoll", body)    
        self.sendMail(mailMessage, reciverMail)
        