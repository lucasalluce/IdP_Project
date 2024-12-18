document.addEventListener("DOMContentLoaded", () => {
    // ~~ Gestione visibilità campi password (home.html, register.html) ~~
        // Funzione per cambiare tipo (password <-> text)
    async function togglePasswordVisibility (formPassword, toggleIcon) {
        if (formPassword.type === "password") {
            formPassword.type = "text";
            toggleIcon.classList.replace('bx-low-vision', 'bx-show');
        } else {
            formPassword.type = "password";
            toggleIcon.classList.replace('bx-show', 'bx-low-vision');
        }
    }
        // login.html
    const loginPassword = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    if (loginPassword && togglePassword) {
        togglePassword.addEventListener('click', () => {                // Acquisizione evento -> cambio di visibilità
            togglePasswordVisibility(loginPassword, togglePassword)     // Funzione togglePasswordVisibility()
        });
    }
        // register.html
    const registerPassword = document.getElementById("registerPassword");
    const toggleRegisterPassword = document.getElementById("toggleRegisterPassword");
    const registerConfirmPassword = document.getElementById("registerConfirmPassword");
    const toggleRegisterConfirmPassword = document.getElementById("toggleRegisterConfirmPassword");
    if (toggleRegisterPassword && registerPassword) {
        toggleRegisterPassword.addEventListener("click", () => {                    // Acquisizione evento -> cambio di visibilità
            togglePasswordVisibility(registerPassword, toggleRegisterPassword);     // Funzione togglePasswordVisibility()
        });
    }
    if (toggleRegisterConfirmPassword && registerConfirmPassword) {
        toggleRegisterConfirmPassword.addEventListener("click", () => {                             // Acquisizione evento -> cambio di visibilità
            togglePasswordVisibility(registerConfirmPassword, toggleRegisterConfirmPassword);       // Funzione togglePasswordVisibility()
        });
    }

    // ~~ Gestione conformità campi password, confirmPassword (register.html) ~~
    if (window.location.href === "register.html") {
        const formPassword = document.getElementById("registerPassword");
        const formConfirmPassword = document.getElementById("registerConfirmPassword");
        const formErrorPassword = document.getElementById("errorPassword");
        const formErrorConfirmPassword = document.getElementById("errorConfirmPassword");

        const validatedPassword = (password) => {
            const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
            return passwordRegex.test(password);
        }
        const validateConfirmPassword = () => {
            return formPassword.value === formConfirmPassword.value;
        }

            // Visualizzaione finestra informativa - password
        formPassword.addEventListener("input", () => {
            if(!validatedPassword(formPassword.value)) {
                formErrorPassword.classList.add("error-visible");
            } else {
                formErrorPassword.classList.remove("error-visible");
            }
        });
            // Visualizzaione finestra informativa - confermaPassword
        formConfirmPassword.addEventListener("input", () => {
            if (!validateConfirmPassword()) {
                formErrorConfirmPassword.classList.add("error-visible");
            } else {
                formErrorConfirmPassword.classList.remove("error-visible");
            }
        });
    }

    // ~~ Hashing password ~~
    async function hashPassword(clearPassword) {
        console.log("\thashingPassword - Acquisizione clearPassword: ", clearPassword);
        const encoder = new TextEncoder();
        const data = encoder.encode(clearPassword);                                             // Conversione in binario
        console.log("\thashingPassword - Encoding: ", data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);                         // Calcolo dell'hash SHA-256
        const hashArray = Array.from(new Uint8Array(hashBuffer));                               // Conversione in array
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');     // Conversione in esadecimale
        console.log("\thashingPassword - Hashing SHA-256: ", hashHex);
        console.log("\thashingPassword - Terminazione sotto-processo");
        return hashHex
    }

    // TODO Edit
    // Caricamento dei dati utente nella cartella sanitaria
    if (window.location.href === "cartellaSanitaria.html") {
        console.log("Cartella Sanitaria - Caricamento dati utente...");

        // Recupero dati dal localStorage
        const userName = localStorage.getItem("userName");
        const userSurname = localStorage.getItem("userSurname");
        const userUsername = localStorage.getItem("userUsername");
        const userEmail = localStorage.getItem("userEmail");

        if (userName && userSurname && userUsername && userEmail) {
            // Inserimento dei dati nei campi HTML
            document.querySelector(".surname p").textContent = userSurname;
            document.querySelector(".name p").textContent = userName;
            document.querySelector(".dropdown-menu div:nth-child(1)").textContent = userUsername;
            document.querySelector(".dropdown-menu div.informations").textContent = userEmail;
        } else {
            console.error("Dati utente non trovati nel localStorage!");
            alert("Errore: Accesso non autorizzato!");
            window.location.href = "home.html";
        }
    }

    // ~~ Funzionalità principali ~~
        // Processo di login utente
    const loginForm = document.getElementById("login-form");     // Creazione e collegamento al login-form
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {               // Predisposizione all'evento
            e.preventDefault();                                     // Gestione annullamento dell'evento defautl
            
            console.log("~ Inzio proceduta 'login'");
            console.log("login - Acquisizione parametri login-form");
            // Acquisizione campi del login-form
            const formUsername = loginForm.querySelector("input[id='username']").value;
            const formPassword = loginForm.querySelector("input[id='password']").value;

            console.log("login - Controllo effettivo inserimento dati login-form");
            // Controllo riempimento campi login-form 
            if (!formUsername || !formPassword) {
                console.log("login - Errore parametri login-form");
                alert("Inserire correttamente Username e Password");
                return
            }

            console.log("login - Inizio procedura 'hashingPassword'");
            // Hasing password
            hashPassword(formPassword).then((hashedPassword) => {           // Acquisizione risposta funzione hashPassword - password cifrata con SHA-256
                // Chiamata POST HTTP per la creazione del file JSON con i dati del login-forn
                console.log("login.hashingPassword - HashedPassword ", hashedPassword)
                console.log("login.hashingPassword - Fine procedura 'hashingPassword'");
                console.log("login - Richiesta server ...");
                fetch("http://127.0.0.1:5000/login", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({                                  // Compilazione file JSON
                        username: formUsername,
                        password: hashedPassword
                    })
                })
                .then((response) => response.json())                        // Acqisizione file JSON di risposta
                .then((data) => {                                           
                    console.log("login - Risposta server ricevuta");
                    if (data.success) {                                     // Verifica del corretto login
                        console.log("login - Acquisizione dati di risposta");
                        localStorage.setItem("userEmail", data.email);      // Acquisizione dei dati nel file di risposta JSON
                        console.log("login - Dati di risposta: ", localStorage.getItem("userEmail"));

                        window.location.href = "otp.html";                  // Reindirizzamento alla scheda di conferma OTP
                    } else {
                        alert("Credenziali errate!! Riprovare")             // Allert di errore nel login - Credenziali inserite non correte
                    }
                })
                .catch((error) => {
                    console.error("Errore: ", error);
                })
                console.log("login - Inzio proceduta '2FA'");
            });
        });
    }

        // Processo 2FA di login
    const otpForm = document.getElementById("otp-form");
    if (otpForm) {
        otpForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("login.2FA - Acquisizione parametro form ...");

            const formOTP = otpForm.querySelector("input[id='otp']").value;
            const dataEmail = localStorage.getItem("userEmail");

            if (!formOTP) {
                console.log("login - Errore parametri otp-form");
                alert("Inserire correttamente OTP");
                return;
            }
            if (!dataEmail) {
                console.log("login - Errore parametro localStorage");
                alert("Errore dati: email utente non trovata nel localStorage");
                window.location.href = "home.html";
                return;
            }

            // Chiamata al server Flask per verificare OTP
            fetch("http://127.0.0.1:5000/otpValidationLogin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    otp: formOTP,
                    email: dataEmail
                })
            })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    console.log("login.2FA - OTP verificato con successo!");

                    // TODO Edit
                    // Recupero dati utente dopo verifica OTP
                    fetch("http://127.0.0.1:5000/getUserData", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: dataEmail })
                    })
                    .then((response) => response.json())
                    .then((userData) => {
                        if (userData.success) {
                            console.log("login.2FA - Dati utente ricevuti:", userData);

                            // Salvataggio dati nel localStorage per utilizzarli nella cartella sanitaria
                            localStorage.setItem("userName", userData.name);
                            localStorage.setItem("userSurname", userData.surname);
                            localStorage.setItem("userUsername", userData.username);
                            localStorage.setItem("userEmail", userData.email);

                            // Reindirizzamento alla cartella sanitaria
                            alert("Accesso avvenuto con successo!");
                            window.location.href = "cartellaSanitaria.html";
                        } else {
                            console.error("Errore nel recupero dei dati utente:", userData.message);
                            alert("Errore nel caricamento dei dati utente!");
                        }
                    })
                    .catch((error) => {
                        console.error("Errore nella richiesta dati utente:", error);
                    });
                } else {
                    console.log("login.2FA - Errore OTP");
                    alert(data.message);
                }
            })
            .catch((error) => {
                console.error("Errore nella verifica OTP:", error);
            });
        });
    }

        // Processo - Registrazione nuovo utente
    const registerForm = document.getElementById("register-form"); // Acquisizione register-form
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("\t~Inizio processo 'addUser'~");
            console.log("addUser - Acquisizione dati register-form ...");
                // Collegamento ai campi del register-fotm al submit
            const formName = registerForm.querySelector("input[id='name']");
            const formSurname = registerForm.querySelector("input[id='surname']");
            const formUsername = registerForm.querySelector("input[id='username']");
            const formEmail = registerForm.querySelector("input[id='email']");
            const formPassword = registerForm.querySelector("input[id='registerPassword']");
            const formConfirmPassword = registerForm.querySelector("input[id='registerConfirmPassword']")
            console.log("addUser - Acquisizione dati completata");

            console.log("addUser - Controllo corrispondenza password e confirmPassword ...");
                // Allert - password e confirmPassword non corrispondenti
            if (formPassword.value !== formConfirmPassword.value) {
                console.log("addUser - Errore nel controllo");
                console.log("addUser - Terminazione processo");
                formConfirmPassword.value = "";
                alert("Password and confimPassword do not match, check them!");
                return;
            }
            console.log("addUser - Controllo completato")
        
            console.log("addUser - Inizio sotto-processo 'hashingPassword'")
                // Hashing formPassword    
            hashPassword(formPassword.value).then((hashedPasswrod) => {
                console.log("addUser - Invio richiesta all'AuthenticationServer.addUser() ...")
                    // Chiamata http -> AuthenticationServer.addUser()
                fetch("http://127.0.0.1:5000/addUser", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({                              // Compilazione Json
                        name: formName.value,
                        surname: formSurname.value,
                        username: formUsername.value,
                        email: formEmail.value,
                        password: hashedPasswrod
                    })
                })
                .then((response) => {
                    // Acquisizione risposta AuthenticationServer.addUser()
                    console.log("addUser - Ricezione risposta dell'AuthenticationServer.addUser() ...");
                    response.json();
                })
                .then((data) => {                                       // Analisi risposta
                    console.log("addUser - Risposta ricevuta, analisi ...");
                    if (data.success) {     // Caso - True, registrazione avvenuta
                        console.log("addUser - Risposta positiva, messaggio: ", data.message);
                        alert(data.message);
                        window.location.href = "home.html";
                    } else {                // Caso - False, registrazione non avvenuta / errore
                        console.log("addUser - Risposta negativa, messaggio: ", data.message);
                        alert(data.message);
                        formUsername.value = "";
                    }
                })
                .catch((error) => {
                    console.error("Errore - ", error);
                })
            })
        })
    }

        // TODO Processo di recupero password utente
    const forgotPasswordForm = document.getElementById("forgot-password-form");
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", (e) => {
            e.preventDefault();

            console.log("~ Inzio proceduta 'forgotPassword'");
            console.log("forgotPassword - Acquisizione parametri forgot-password-form");
            const formUsername = forgotPasswordForm.querySelector("input[id='username']").value;

            console.log("forgorPassword - Controllo effettivo inserimento dati forgot-password-form")
            if (!formUsername) {
                alert("Campo username non inserito!");
                return;
            }

            console.log("forgorPassword - Inzio richiesta AuthenticationServer")
            fetch("http://127.0.0.1:5000/recoveryPassword", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({                                  // Compilazione file JSON
                    username: formUsername
                })
            })
            .then((response) => response.json())                        // Acqisizione file JSON di risposta
            .then((data) => {                                           
                console.log("forgorPassword - Ricezione risposta AuthenticationServer");
                if (data.success) {                                     // Verifica
                    // TODO
                    window.location.href = "";                          // Reindirizzamento
                } else {
                    alert("Credenziali errate!! Riprovare")             // Allert di errore
                }
            })
            .catch((error) => {
                console.error("Errore: ", error);
            })
        });
    }
});