document.addEventListener("DOMContentLoaded", () => {
    // ~ Gestione visibilità campi password schede home.html, register.html ~
        // Funzione per il cambiare del tipo (password <-> text)
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

    // ~ Gestione hashing password ~
    async function hashPassword(clearPassword) {
        console.log("login.hashingPassword - Acquisizione clearPassword: ", clearPassword);
        const encoder = new TextEncoder();
        const data = encoder.encode(clearPassword);                                             // Conversione in binario
        console.log("login.hashingPassword - Encoding: ", data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);                         // Calcolo dell'hash SHA-256
        const hashArray = Array.from(new Uint8Array(hashBuffer));                               // Conversione in array
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');     // Conversione in esadecimale
        console.log("login.hashingPassword - Hashing SHA-256: ", hashHex);
        return hashHex
    }

    // ~ Gestione funzionalità principali ~
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

            console.log("login - Controllo esistenza parametri login-form");
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

// Caricamento dei dati utente nella cartella sanitaria
if (window.location.href.includes("cartellaSanitaria.html")) {
    console.log("Cartella Sanitaria - Caricamento dati utente...");

    // Recupero dati dal localStorage
    const userName = localStorage.getItem("userName");
    const userSurname = localStorage.getItem("userSurname");
    const userUsername = localStorage.getItem("userUsername");
    const userEmail = localStorage.getItem("userEmail");

    if (userName && userSurname && userUsername && userEmail) {
        // Inserimento dei dati nei campi HTML
        document.querySelector(".cognome p").textContent = userSurname;
        document.querySelector(".nome p").textContent = userName;
        document.querySelector(".dropdown-menu div:nth-child(1)").textContent = userUsername;
        document.querySelector(".dropdown-menu div.informations").textContent = userEmail;
    } else {
        console.error("Dati utente non trovati nel localStorage!");
        alert("Errore: Accesso non autorizzato!");
        window.location.href = "home.html";
    }
}


        // Processo di registrazione nuovo utente
    const registerForm = document.getElementById("register-form");
if (registerForm) {
            // ~ Gestione verifiche sulle password ~
        const formPassword = registerForm.querySelector("input[id='registerPassword']");
        const formConfirmPassword = registerForm.querySelector("input[id='registerConfirmPassword']");
        const formErrorPassword = document.getElementById("errorPassword");
        const formErrorConfirmPassword = document.getElementById("errorConfirmPassword");
        
        const validatedPassword = (password) => {
            const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
            return passwordRegex.test(password);
        }
        const validateConfirmPassword = () => {
            return formPassword.value === formConfirmPassword.value;
        }

        formPassword.addEventListener("input", () => {
            if(!validatedPassword(formPassword.value)) {
                formErrorPassword.classList.add("error-visible");
            } else {
                formErrorPassword.classList.remove("error-visible");
            }
        });
        formConfirmPassword.addEventListener("input", () => {
            if (!validateConfirmPassword()) {
                formErrorConfirmPassword.classList.add("error-visible");
            } else {
                formErrorConfirmPassword.classList.remove("error-visible");
            }
        });
    
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const formName = registerForm.querySelector("input[id='name']").value;
            const formSurname = registerForm.querySelector("input[id='surname']").value;
            const formUsername = registerForm.querySelector("input[id='username']").value;
            const formEmail = registerForm.querySelector("input[id='email']").value;
            const formPassword = registerForm.querySelector("input[id='registerPassword']").value;
            const formConfirmPassword = registerForm.querySelector("input[id='registerConfirmPassword']").value;

            if (formPassword !== formConfirmPassword) {
                alert("Le password inserite non corrispondono");
                return;
            }

            hashPassword(formPassword).then((hashedPasswrod) => {
                fetch("http://127.0.0.1:5000/addUser", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        name: formName,
                        surname: formSurname,
                        username: formUsername,
                        email: formEmail,
                        password: hashedPasswrod
                    })
                })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        alert("Registrazione avvenuta con successo!");
                        window.location.href = "home.html";
                    } else {
                        alert("Errore nella registrazione. Riprova.");
                    }
                })
                .catch((error) => {
                    console.error("Errore: ", error);
                })
            })
        })
    }

        // TODO Processo di recupero password utente
    const forgotPasswordForm = document.getElementById("forgot-password-form");
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const formUsername = forgotPasswordForm.querySelector("input[id='username']").value;

            if (!formUsername) {
                alert("Username non inserito!");
                return;
            }
        });
    }
});