### Italian
> [English version](#english)
# IdP con protocollo OAuth 2.0 e 2FA
Team - Gianluca Putignano, Federico Raimondi, Luca Salluce, Stefano Troilo, Antonio Volpe\
Questo progetto è stato realizzato da studenti del [Politecnico di Bari](https://www.poliba.it) di Ingegneria Informatica e dell'Automazione, per il corso di Ingegneria del Software a cura del docente Prof.ssa Marina Mongiello.

## Progetto
Il progetto ha come obiettivo la realizzazione di un Identity Provider (IdP), un sistema centralizzato utile all'identificazione certa di utenti, client, macchine, ecc... che richiedono l'accesso ad una risorsa; sfruttando il protocollo OAuth 2.0 ed aggiungendo un ulteriore livello di sicurezza con l'autenticazione a due fattori (2FA)

## Come funziona?
Struttura sistema:
- Front-end, script della pagine in HTML/CSS e Javascritp
- Back-end, script del server in Python, script del database in SQL
> Consultare la sezione [Settings preliminari](#settings-preliminari)

(home.html) L'utente può **accedere** inserendo username e password, **registrarsi** nell'apposita sezione inserendo i dati richiesti oppure **recuperare la password**.

Per effettuare l'accesso sono richieste le _credenziali utente_ - Username e Password, verificare le credenziali il server invia all'utente, sulla casella di posta elettronica associata, il _codice OTP_ utile per la 2FA. Inserendo il codice corretto entro il tempo di validità l'utente potrà completare l'accesso.

## Settings preliminari


> [!NOTE]
> Il testing del sistema è stato effettuato su macchine MacOs, utlizzando _Visual Studio Code_ come ambiente di sviluppo e _XAMPP - phpmyadmin_ come database.

### English
