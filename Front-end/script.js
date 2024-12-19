document.addEventListener("DOMContentLoaded", () => {
    // ~~ Gestione visibilità campi password (home.html, register.html, resetPassword.html) ~~
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
        // resetPassword.html
    const resetTmpPassword = document.getElementById("resetTmpPassword");
    const resetNewPassword = document.getElementById("resetNewPassword");
    const resetConfirmPassword = document.getElementById("resetConfirmPassword");
    const toggleResetTmpPassword = document.getElementById("toggleResetTmpPassword");
    const toggleResetNewPassword = document.getElementById("toggleResetNewPassword");
    const toggleResetConfirmPassword = document.getElementById("toggleResetConfirmPassword");
    if (toggleResetTmpPassword && resetTmpPassword) {
        toggleResetTmpPassword.addEventListener("click", () => {                    // Acquisizione evento -> cambio di visibilità
            togglePasswordVisibility(resetTmpPassword, toggleResetTmpPassword);     // Funzione togglePasswordVisibility()
        });
    }
    if (toggleResetNewPassword && resetNewPassword) {
        toggleResetNewPassword.addEventListener("click", () => {                    // Acquisizione evento -> cambio di visibilità
            togglePasswordVisibility(resetNewPassword, toggleResetNewPassword);     // Funzione togglePasswordVisibility()
        });
    }
    if (toggleResetConfirmPassword && resetConfirmPassword) {
        toggleResetConfirmPassword.addEventListener("click", () => {                    // Acquisizione evento -> cambio di visibilità
            togglePasswordVisibility(resetConfirmPassword, toggleResetNewPassword);     // Funzione togglePasswordVisibility()
        });
    }

    // ~~ Gestione conformità campi password, confirmPassword (register.html, resetPassword.html) ~~
        // register.html
    if (window.location.href.includes("register.html")) {
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
        // resetPassword.html
    if (window.location.href.includes("resetPassword.html")) {
        const formNewPassword = document.getElementById("resetNewPassword");
        const formConfirmPassword = document.getElementById("resetConfirmPassword");
        const formErrorResetNewPassword = document.getElementById("errorResetNewPassword");
        const formErrorResetConfirmPassword = document.getElementById("errorResetConfirmPassword");

        const validatedPassword = (password) => {
            const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
            return passwordRegex.test(password);
        }
        const validateConfirmPassword = () => {
            return formNewPassword.value === formConfirmPassword.value;
        }
            // Visualizzaione finestra informativa - password
        formNewPassword.addEventListener("input", () => {
            if(!validatedPassword(formNewPassword.value)) {
                formErrorResetNewPassword.classList.add("error-visible");
            } else {
                formErrorResetNewPassword.classList.remove("error-visible");
            }
        });
            // Visualizzaione finestra informativa - confermaPassword
        formConfirmPassword.addEventListener("input", () => {
            if (!validateConfirmPassword()) {
                formErrorResetConfirmPassword.classList.add("error-visible");
            } else {
                formErrorResetConfirmPassword.classList.remove("error-visible");
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
    if (window.location.href.includes("cartellaSanitaria.html")) {
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
        // Processo - Login utente
    const loginForm = document.getElementById("login-form");    // Acquisizione login-form
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {           // Predisposizione evento
            e.preventDefault();
            console.log("\t~Inizio processo 'login'~");
            console.log("login - Acquisizione dati login-form ...");
                // Collegamento ai campi del login-form
            const formUsername = loginForm.querySelector("input[id='username']")
            const formPassword = loginForm.querySelector("input[id='password']")
            console.log("login - Acquisizione dati completata");

            console.log("login - Inizio sotto-processo 'hashingPassword'");
                // Hasing formPassword
            hashPassword(formPassword.value).then((hashedPassword) => {
                console.log("login - Invio richietsa all'AuthenticationServer.login() ...");
                    // Chiamata http -> AuthenticationServer.login()
                fetch("http://127.0.0.1:5000/login", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({                                  // Compilazione file Json
                        username: formUsername.value,
                        password: hashedPassword
                    })
                })
                .then((response) => response.json())                        // Acqisizione file Json di risposta
                .then((data) => {                                           // Analisi risposta
                    console.log("login - Risposta ricevuta, analisi ...");
                    if (data.success) {     // Caso - True, login avvenuto
                        console.log("login - Risposta positiva, messaggio: ", data.message);
                        localStorage.setItem("userEmail", data.email);      // Salvataggio dati -> processo '2FA'
                        console.log("login - Inizio sotto-processo '2FA'");
                        alert(data.message);
                        window.location.href = "otp.html";                  // Reindirizzamento alla scheda di conferma OTP
                    } else {                // Caso - False, login non avvenuto
                        console.log("login - Risposta negativa, messaggio: ", data.message);
                            // TODO switch case
                        console.log("login - Terminazione processo");
                        alert(data.message);
                        formUsername.value = "";
                        formPassword.value = "";
                    }
                })
                .catch((error) => {
                    console.error("Errore: ", error);
                })
            });
        });
    }

        // Processo 2FA di login
    const otpForm = document.getElementById("otp-form");
    if (otpForm) {
        otpForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("\t2FA - Acquisizione dati otp-form ...");
                // Collegamento ai campi dell'otp-form
            const formOTP = otpForm.querySelector("input[id='otp']");
            const dataEmail = localStorage.getItem("userEmail");
            console.log("\t2FA - Acquisizione dati completata");
            
            // TODO Controllo sul formOTP - nr esatto di caratteri numerici

            console.log("\t2FA - Controllo corretta acquisizione dataEmail");
            if (!dataEmail) {
                console.log("\t2FA - Errore, dataEmail non trovata nel localStorage");
                localStorage.removeItem("userEmail");
                alert("Error - An error occurred in the process, please login again");
                window.location.href = "home.html";
            }
            console.log("\t2FA - Controllo completato")

            console.log("addUser - Invio richiesta all'AuthenticationServer.otpValidation() ...")
                // Chiamata http -> AuthenticationServer.otpValidation()
            fetch("http://127.0.0.1:5000/otpValidation", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({                                                          // Compilazione file Json
                    otp: formOTP.value,
                    email: dataEmail
                })
            })
            .then((response) => response.json())                            // Acquisizione file Json di risposta
            .then((data) => {                                               // Analisi risposta
                console.log("\t2FA - Risposta ricevuta, analisi ...");
                if (data.success) {     // Caso - True, OTP valido
                    console.log("\t2FA - Risposta positiva, messaggio: ", data.message);
                    console.log("\t2FA - Terminazione sotto-processo");
                    console.log("login - Terminazione processo");
                    alert(data.message);

                    // TODO Recupero dati utente per cartella sanitaria

                    window.location.href = "cartellaSanitaria.html";
                } else {                // Caso - False, OTP non valido/scaduto
                    console.log("\t2FA - Risposta negativa, messaggio: ", data.message);
                    alert(data.message);
                    
                    switch (data.case) {
                        case 0:
                            console.log("\t2FA - Terminazione sotto-processo");
                            console.log("login - Terminazione processo");
                            localStorage.removeItem("userEmail");
                            window.location.href = "home.html";
                            break;
                        case 1:
                            formOTP.value = "";
                            break;
                        default:
                            console.log("\t2FA - Terminazione sotto-processo");
                            console.log("login - Terminazione processo");
                            localStorage.removeItem("userEmail");
                            window.location.href = "home.html";
                            break;
                    }
                }
            })
            .catch((error) => {
                console.error("Errore - ", error);
            });
        });
    }

        // Processo - Registrazione nuovo utente
    const registerForm = document.getElementById("register-form");      // Acquisizione register-form
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {                // Predisposizione evento
            e.preventDefault();
            console.log("\t~Inizio processo 'addUser'~");
            console.log("addUser - Acquisizione dati register-form ...");
                // Collegamento ai campi del register-form
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
                    body: JSON.stringify({                              // Compilazione file Json
                        name: formName.value,
                        surname: formSurname.value,
                        username: formUsername.value,
                        email: formEmail.value,
                        password: hashedPasswrod
                    })
                })
                .then((response) => response.json())                    // Acquisizione file Json di risposta
                .then((data) => {                                       // Analisi risposta
                    console.log("addUser - Risposta ricevuta, analisi ...");
                    if (data.success) {     // Caso - True, registrazione avvenuta
                        console.log("addUser - Risposta positiva, messaggio: ", data.message);
                        console.log("addUser - Terminazione processo");
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
    
        // Processo - Password utente dimenticata
    const forgotPasswordForm = document.getElementById("forgot-password-form");
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("\t~Inizio processo 'forgotPassword'~");
            console.log("forgotPassword - Acquisizione dati forgot-password-form ...");
                // Collegamento ai campi del forgot-password-form
            const formUsername = forgotPasswordForm.querySelector("input[id='username']");
            console.log("forgotPassword - Acquisizione dati completata");

            console.log("forgorPassword - Inizio richiesta all'AuthenticationServer.forgotPassword() ...");
                // Chiamata http -> AuthenticationServer.forgotPassword()
            fetch("http://127.0.0.1:5000/forgotPassword", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({                                  // Compilazione file Json
                    username: formUsername.value
                })
            })
            .then((response) => response.json())                        // Acqisizione file Json di risposta
            .then((data) => {
                console.log("forgorPassword - Risposta ricevuta, analisi ...");
                if (data.success) {
                    console.log("forgotPassword - Risposta positiva, messaggio: ", data.message);
                    console.log("forgotPassword - Terminazione processo");
                    alert(data.message);
                    window.location.href = "home.html";
                } else {
                    console.log("forgotPassword - Risposta negativa, messaggio: ", data.message);
                    console.log("forgotPassword - Terminazione processo");
                    alert(data.message);
                    formUsername.value = "";
                }
            })
            .catch((error) => {
                console.error("Errore: ", error);
            })
        });
    }

        // Processo - Reset della password utente
    const resetPasswordForm = document.getElementById("reset-password-form");
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("\t~Inizio processo 'resetPassword'~");
            console.log("resetPassword - Acquisizione dati reset-password-form ...");
                // Collegamento ai campi del reset-password-form
            const formTmpPassword = resetPasswordForm.querySelector("input[id='resetTmpPassword'");
            const formNewPassword = resetPasswordForm.querySelector("input[id='resetNewPassword'");
            const formConfirmPassword = resetPasswordForm.querySelector("input[id='resetConfirmPassword'");
            const dataUsername = localStorage.getItem("userUsername");
            console.log("resetPassword - Acquisizione dati completata");

            console.log("resetPassword - Inizio sotto-processo 'hashingPassword'")
                // Hashing formPassword    
            hashPassword(formNewPassword.value).then((hashedPasswrod) => {
                console.lof("resetPassword - Inizio richiesta all'AuthenticationServer.resetPassword() ...");
                    // Chiamata http -> AuthenticationServer.resetPassword()
                fetch("http://127.0.0.1:5000/resetPassword", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({                                          // Compilazione file Json
                        tmpPassword: formTmpPassword.value,
                        newPassword: hashedPasswrod,
                        username: dataUsername
                    })
                })
                .then((response) => response.json())
                .then((data) => {
                    console.log("resetPassword - Risposta ricevuto, analisi ...");
                    if (data.success) {
                        
                    } else {

                    }
                })
                .catch((error) => {
                    console.error("Error: ", error);
                })
            });
        });
    }
});