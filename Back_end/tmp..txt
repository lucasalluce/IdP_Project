from flask import Flask, request, jsonify, render_template
from werkzeug.security import generate_password_hash, check_password_hash
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string

app = Flask(__name__)

# Simulazione del database per gli utenti (in produzione, dovresti usare un vero database)
# INSERIRE IL DATABASE EFFETTIVO
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",      # host del database
        user="root",           # username MySQL
        password="password",   # password MySQL
        database="database"    # Nome database
    )

# Funzione per inviare email (per il recupero password)
def send_reset_email(email, reset_token):
    # Configura la connessione SMTP (usa il tuo server SMTP reale)
    sender_email = "youremail@example.com"
    receiver_email = email
    password = "yourpassword"

    # Crea il messaggio
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = "Recupero password"

    body = f"Per resettare la tua password, clicca su questo link: http://localhost:5000/reset-password/{reset_token}"
    message.attach(MIMEText(body, "plain"))

    try:
        # Invia l'email
        server = smtplib.SMTP("smtp.example.com", 587)
        server.starttls()
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, message.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Errore nell'invio dell'email: {e}")
        return False



# Endpoint di login
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    # Connettiti al database
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Controlla se l'utente esiste nel "database"
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    connection.close()

    if user and check_password_hash(user["password"], password):
        return jsonify({"success": True, "message": "Login effettuato con successo!"})
    else:
        return jsonify({"success": False, "message": "Credenziali errate."})




# Endpoint di registrazione
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    # Connettiti al database
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Verifica se l'utente esiste già
    cursor.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, email))
    existing_user = cursor.fetchone()

    if existing_user:
        connection.close()
        return jsonify({"success": False, "message": "L'utente o l'email esistono già."})

    # Aggiungi il nuovo utente
    hashed_password = generate_password_hash(password)
    cursor.execute(
        "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
        (username, email, hashed_password)
    )
    connection.commit()
    connection.close()

    return jsonify({"success": True, "message": "Registrazione avvenuta con successo!"})




# Endpoint per il recupero password
@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    # Connettiti al database
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    # Cerca l'utente tramite email
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    connection.close()

    if not user:
        return jsonify({"success": False, "message": "Email non trovata."})

    # Genera un token di reset
    reset_token = ''.join(random.choices(string.ascii_letters + string.digits, k=16))

    # Invia l'email
    if send_reset_email(email, reset_token):
        return jsonify({"success": True, "message": "Controlla la tua email per il link di reset della password."})
    else:
        return jsonify({"success": False, "message": "Errore nell'invio dell'email."})



# Endpoint per il reset della password (simulato)
@app.route("/reset-password/<reset_token>", methods=["GET", "POST"])
def reset_password(reset_token):
    if request.method == "POST":
        new_password = request.form.get("password")
        # Logica per il reset (verifica il token, aggiorna la password, ecc.)
        return jsonify({"success": True, "message": "Password aggiornata con successo!"})
    return render_template("reset_password.html", token=reset_token)

# Pagina di login (per il frontend)
@app.route("/")
def index():
    return render_template("login.html")

if __name__ == "__main__":
    app.run(debug=True)