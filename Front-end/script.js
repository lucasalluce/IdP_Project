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
    const registerPassword = document.getElementById("passwordRegister");
    const toggleRegisterPassword = document.getElementById("togglePasswordRegister");
    const registerConfirmPassword = document.getElementById("confirmPasswordRegister");
    const toggleRegisterConfirmPassword = document.getElementById("toggleConfirmPasswordRegister");
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

    // ~ Gestione funzionalità ~
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
                return;
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
                        password: hashedPassword,
                    })
                })
                .then((response) => response.json())                        // Acqisizione file JSON di risposta
                .then((data) => {                                           
                    console.log("login - Risposta server ricevuta");
                    if (data.success) {                                     // Verifica del corretto login
                        console.log("login - Acquisizione dati di risposta");
                        localStorage.setItem("userEmail", data.email);      // Acquisizione dei dati nel file di risposta JSON
                        console.log("login - Dati di risposta: ", localStorage.getItem("userEmail"));

                        setTimeout(() => {
                            window.location.href = "otp.html";                  
                        }, 500);

                        //window.location.href = "otp.html";                  // Reindirizzamento alla scheda di conferma OTP
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
            localStorage.removeItem("userEmail");

            if (!dataEmail) {
                alert("Errore passaggio dati: email dell'utente non trovata ");
                window.location.href = "home.html";
                return
            }
            if (!formInput) {
                alert("Inserire codice OTP");
                return;
            }

            fetch("http://127.0.0.1:5000/otpValidation", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({                                  // Compilazione file JSON
                    otp: formOTP,
                    email: dataEmail,
                })
            })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert("OTP valido");
                    window.location.href = "cartellaSanitaria.html"
                } else {
                    // TODO gestire casi False
                    alert(data.message)
                }
            })
            .catch((error) => {
                console.error("Errore: ", error);
            })
        });
    }

        // Processo di registrazione nuovo utente
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        const formPassword = registerForm.querySelector("input[id='passwordRegister'").value;
        const formConfirmPassword = registerForm.querySelector("input[id='confirmPasswordRegister'").value;

        
        // Inizio copyValidatePassword
        const passwordField = registerForm.querySelector("#passwordRegister");
        const confirmPasswordField = registerForm.querySelector("#confirmPasswordRegister");
        const passwordError = document.getElementById("password-error");
        const confirmPasswordError = document.getElementById("confirm-password-error");
    
        // Funzione per validare la password
        const validatePassword = (password) => {
            const passwordRegex = /^(?=(.*[A-Z]))(?=(.*[\W_]))(?=(.*\d.*\d))[\w\W]{8,}$/;
            return passwordRegex.test(password);
        };
    
        // Funzione per validare la conferma password
        const validateConfirmPassword = () => {
            return passwordField.value === confirmPasswordField.value;
        };
    
        // Aggiungi un event listener per il campo password
        passwordField.addEventListener("input", () => {
            // Se la password non è valida, mostra l'errore
            if (!validatePassword(passwordField.value)) {
                passwordError.classList.add("error-visible");
            } else {
                // Se la password è valida, nascondi l'errore
                passwordError.classList.remove("error-visible");
            }
        });
    
        // Aggiungi un event listener per il campo conferma password
        confirmPasswordField.addEventListener("input", () => {
            // Se la password e la conferma non corrispondono, mostra l'errore
            if (!validateConfirmPassword()) {
                confirmPasswordError.classList.add("error-visible");
            } else {
                confirmPasswordError.classList.remove("error-visible");
            }
        });
        // Fine copyValidatePassword

        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const formName = registerForm.querySelector("input[id='name'").value;
            const formSurname = registerForm.querySelector("input[id='surname'").value;
            const formUsername = registerForm.querySelector("input[id='username'").value;
            const formEmail = registerForm.querySelector("input[id='email'").value;
            const formPassword = registerForm.querySelector("input[id='passwordRegister'").value;
            const formConfirmPassword = registerForm.querySelector("input[id='confirmPasswordRegister'").value;

            // TODO Validate password

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
                        password: hashedPasswrod,
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

            const email = forgotPasswordForm.querySelector("input[type='email']").value;

            fetch("/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                }),
            })


                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        alert("Controlla la tua email per il link di reset della password.");
                        window.location.href = "home.html"; // Riporta alla pagina di login
                    } else {
                        alert("Errore nel recupero password. Assicurati che l'email sia corretta.");
                    }
                })
                .catch((error) => {
                    console.error("Errore:", error);
                });
        });
    }

});