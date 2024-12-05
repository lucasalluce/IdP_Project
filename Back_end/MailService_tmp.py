import smtplib
import random
import time 
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

#Configurazione SMTP (modifica i valori con i dati personali)
smtp_server = "smtp.gmail.com"
smtp_port = 587
smtp_user = "tua_mail"
smtp_password = "password_per_app" 

#Generatore Codice OTP
def otp_generator(length=6):
    return ''.join(random.choices('0123456789', k=length))

#Funzione per inviare un codice OTP tramite email
def send_otp(to_email, otp):
    try: 
        #composizione del messaggio
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = to_email
        msg['Subject'] = "il tuo codice OTP"
        body = f"Il tuo codice OTP è: {otp}\n\nInserisci questo codice per completare l'autenticazione.\n\nGrazie!"
        msg.attach(MIMEText(body, 'plain'))

        #connessione al server SMTP
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())
        server.quit()

        print("Email inviata con successo.")
    except Exception as e:
        print(f"Errore durante l'invio dell'email: {e}")

#funzione principale per l'autenticazione
def email_authentication(to_email):
    otp=otp_generator()
    send_otp(to_email, otp)

    print("Un codice OTP è stato inviato alla tua email. Ora comincia il timer di 2 minuti! ")
    start_time=time.time() #inizia il timer
    while True:
        user_input=input("Inserisci il codice OTP o digita exit: ").strip()
        if user_input.lower()=='exit': 
                print("Autenticazione annullata")
                break
            
        if user_input==otp:
                print("Autenticazione avvenuta con successo")
                break
        else:
                print("Codice OTP errato, riprova")

        if time.time() - start_time > 120:
                print("Il codice OTP è scaduto, genera un nuovo codice")
                break

if __name__== "__main__":
    destinatario = input("Inserisci l'email dove vuoi che arrivi il codice: ").strip()
    email_authentication(destinatario)