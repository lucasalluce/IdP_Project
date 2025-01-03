# IdP con protocollo OAuth 2.0 e 2FA

## Team

Gianluca Putignano, Federico Raimondi, Luca Salluce, Stefano Troilo, Antonio Volpe\
Questo progetto è stato realizzato da studenti del [Politecnico di Bari](https://www.poliba.it), del dipartimento DEI - Ingegneria Informatica e dell'Automazione, per il corso di Ingegneria del Software a cura del docente Prof.ssa Marina Mongiello.

## Descrizione progetto

Il progetto ha come obiettivo la realizzazione di un Identity Provider (IdP), un sistema centralizzato utile all'identificazione certa di utenti, client, macchine, ecc... che richiedono l'accesso ad una risorsa; sfruttando il protocollo OAuth 2.0 ed aggiungendo un ulteriore livello di sicurezza con l'autenticazione a due fattori (2FA)

## Installazione

> [!NOTE]
> Il testing del sistema è stato effettuato su macchine MacOs, utlizzando _Visual Studio Code_ come ambiente di sviluppo e _XAMPP - phpmyadmin_ come database.

Per utilizzare il codice di questa repository sarà necessare avere sulla prorpia macchina:
- _IDE_ adatto per lavorare con Python, Javascript, HTML, CSS ed SQL, si consiglia [Visual Studio Code](https://code.visualstudio.com)
- Pacchetto [Python](https://www.python.org)
- _Database manager_ che supportu _MySQL_, si consiglia [XAMPP](https://www.apachefriends.org/it/index.html)

In seguito, nel terminale Python eseguire il seguente comando\
`pip install -r requirements.txt`

## Struttura sistema
- Front-end, script della pagine in HTML/CSS e Javascritp
- Back-end, script del server in Python, script del database in SQL

## Utilizzo
_home_ - In questa scheda l'utente può **accedere**, **registrarsi** venendo reindirizzato alla scheda _register_ oppure **richiedere una password temporanea** in caso di smarrimento della password utente.

### Flusso accesso
Per effettuare l'accesso sono richieste le **credenziali utente** - Username e Password, verificare le credenziali il server invia all'utente, sulla casella di posta elettronica associata, il **codice OTP** utile per la verifica a due fattori. Inserendo il codice corretto entro il tempo di validità l'utente potrà completare l'accesso.

### Flusso registrazione nuovo utente
Per la registrazione sono richiesti alcuni **dati anagrafici** e le **credenziali utente** per l'accesso, in questa sezione ci sono controlli di sicurezza in merito alla robustezza della _password_ e sulla corrispondenza con la _confermaPassword_, inoltre è richiesto un indirizzo di posta elettronica utile per il 2FA