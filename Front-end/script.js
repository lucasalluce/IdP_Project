document.addEventListener("DOMContentLoaded", () => {
    // Seleziona l'input e l'icona per il LOGIN
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');  
    if (passwordInput && togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.classList.toggle('bx-low-vision');
            togglePassword.classList.toggle('bx-show');
        });
    }

    // Seleziona l'input e l'icona per la REGISTRAZIONE
    // Seleziona gli elementi specifici della pagina di registrazione
    const passwordRegister = document.getElementById("passwordRegister");
    const togglePasswordRegister = document.getElementById("togglePasswordRegister");
    const confirmPasswordRegister = document.getElementById("confirmPasswordRegister");
    const toggleConfirmPasswordRegister = document.getElementById("toggleConfirmPasswordRegister");
    // Funzione per cambiare il tipo di input (password <-> text) e gestire le icone
    function togglePasswordVisibility(inputField, toggleIcon) {
        if (inputField.type === "password") {
            inputField.type = "text";
            toggleIcon.classList.replace('bx-low-vision', 'bx-show'); // Cambia l'icona per "occhio aperto"
        } else {
            inputField.type = "password";
            toggleIcon.classList.replace('bx-show', 'bx-low-vision'); // Cambia l'icona per "occhio chiuso"
        }
    }
    // Aggiungi l'evento per la visibilità della password
    if (togglePasswordRegister && passwordRegister) {
        togglePasswordRegister.addEventListener("click", () => {
            togglePasswordVisibility(passwordRegister, togglePasswordRegister);
        });
    }
    // Aggiungi l'evento per la visibilità della conferma della password
    if (toggleConfirmPasswordRegister && confirmPasswordRegister) {
        toggleConfirmPasswordRegister.addEventListener("click", () => {
            togglePasswordVisibility(confirmPasswordRegister, toggleConfirmPasswordRegister);
        });
    }
    
    // Hashing password
    // IN clearPassword - password in chiaro acquisita dal form
    // OUT hashHex - password cifrata con SHA-256
    async function hashPassword(clearPassword) {
        const encoder = new TextEncoder();
        const data = encoder.encode(clearPassword);                                             // Conversione in binario
        console.log("login.hashingPassword - ");
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);                         // Calcolo dell'hash SHA-256
        const hashArray = Array.from(new Uint8Array(hashBuffer));                               // Conversione in array
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');     // Conversione in esadecimale
        return hashHex
    }

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
                alert("Inserire correttamente Username e Password");
                return;
            }

            console.log("login - Inizio procedura 'hashingPassword'");
            // Hasing password
            hashPassword(formPassword).then((hashedPassword) => {           // Acquisizione risposta funzione hashPassword - password cifrata con SHA-256
                // Chiamata POST HTTP per la creazione del file JSON con i dati del login-forn
                fetch("http://127.0.0.1:5000/login", {
                    method: "POST",
                    headers: {"Contetn-Type": "application/json"},
                    body: JSON.stringify({                                  // Compilazione file JSON
                        username: formUsername,
                        password: hashedPassword,
                    })
                })
                .then((response) => response.json())                        // Acqisizione file JSON di risposta
                .then((data) => {                                           
                    if (data.success) {                                     // Verifica del corretto login
                        localStorage.setItem("userEmail", data.email);      // Acquisizione dei dati nel file di risposta JSON
                        window.location.href = "otp.html";                  // Reindirizzamento alla scheda di conferma OTP
                    } else {
                        alert("Credenziali errate!! Riprovare")             // Allert di errore nel login - Credenziali inserite non correte
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
                headers: {"Contetn-Type": "application/json"},
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
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const formName = registerForm.querySelector("input[id='name'").value;
            const formSurname = registerForm.querySelector("input[id='surname'").value;
            const formUsername = registerForm.querySelector("input[id='username'").value;
            const formEmail = registerForm.querySelector("input[id='email'").value;
            const formPassword = registerForm.querySelector("input[id='passwordRegister'").value;
            const formConfirmPassword = registerForm.querySelector("input[id='confirmPasswordRegister'").value;

            if (formPassword !== formConfirmPassword) {
                alert("Le password inserite non corrispondono");
                return;
            }

            hashPassword(formPassword).then((hashedPasswrod) => {
                fetch("http://127.0.0.1:5000/addUser",  {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        name: formName,
                        surnama: formSurname,
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