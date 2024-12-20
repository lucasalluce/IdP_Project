___Settings Python____

! NOTA IMPORTANTE !
Tra MacOs e Windows i pattern delle directory differiscono nello slash, quelli mostrati sotto utilizzano
la notazione di MacOs, quindi per Windows prestare attenzione ai \

1. Creazione e configurazione environment
    -   Utilizzando il terminale, raggiungere la directory -> /Back-end/Environment
    !!  SOLO DOPO essere entrato nella directory corretta eseguire il seguente comando, indicando
        il proprio nome - es. IdP_Project_Luca
    (windows)   >>  python -m venv IdP_Project_Nome
    (mac)       >>  python3 -m venv IdP_Project_Nome
    -   Eseguito il comando, raggiungere la directory appena creata -> /Back-end/Environment/IdP_Project_Nome
    !!  SOLO DOPO essere entrato nella directory corretta eseguire il seguete comando
    (windows)   >>  .\Scripts\activate
    (mac)       >>  source bin/activate
    **  Ci si accorge che tutto ha funzionato se la stringa del terminale che precede l'inserimento dei comandi
        presenta - (IdP_Project_Nome)
:)  Ottimo lavoro, environment configurato con successo, WELL DONE !!!

2. Installazione moduli Python
    ~ MySQL connection ~
        -   Dopo aver correttamente creato e configurato l'environment, procediamo con l'installazione di MySQL connection
        -   Eseguire il seguente comando nel terminale
        (windows)   >>  python -m pip install mysql-connector-python
        (mac)       >>  python3 -m pip install mysql-connector-python
        **  Ci si accorge che tutto ha funzionato se si visualizza come ultimo messaggio - Successfully installed mysql-connector-python-9.1.0
        !!  Potrebbere essere sollevato dal terminale, la possibilità di aggiornare il pip, in tal caso eseguire il seguente comando
        >>  pip install --upgrade pip
        **  Ci si accorge che tutto ha funzionato se si visualizza - Successfully installed pip-24.3.1

    ~ Flask e Flask-Cors
        -   Dopo aver correttamente creato e configurato l'environment, procediamo con l'installazione di Flask
        -   Eseguire il seguente comando nel terminale
        (windows)   >>  python -m pip install Flask
        (mac)       >>  python3 -m pip install Flask
        **  Ci si accorge che tutto ha funzionato se si visualizza - Successfully installed Flask-3.1.0 Jinja2-3.1.4 MarkupSafe-3.0.2 Werkzeug-3.1.3 blinker-1.9.0 click-8.1.7 itsdangerous-2.2.0
        !!  SOLO DOPO l'installazione del framework generale di Flask si proceda all'installazione di Flask-Cors
        (windows)   >>  python -m pip install flask-cors
        (mac)       >>  python3 -m pip install flask-cors
        **  Ci si accorge che tutto ha funzionato se si visualizza - Successfully installed flask-cors-5.0.0

    ~ bcrypt ~
        -   Dopo aver correttamente creato e configurato l'environment, procediamo con l'installazione di bcrypt
        -   Eseguire il seguente comando nel terminale
        (windows)   >>  python -m pip install bcrypt
        (mac)       >>  python3 -m pip install bcrypt
        **  Ci si accorge che tutto ha funzionato se si visualizza - Successfully installed bcrypt-4.2.1
:)  Ottimo lavoro, configurazione ambiente Python completata con successo, WELL DONE !!!
