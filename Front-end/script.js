document.addEventListener("DOMContentLoaded", () => {
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

    /*
        // Seleziona l'input e l'icona per il LOGIN
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    // Aggiungi un evento di click all'icona
    togglePassword.addEventListener('click', () => {
        // Cambia il tipo di input tra password e text
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Cambia l'icona tra 'bx-low-vision' e 'bx-show'
        togglePassword.classList.toggle('bx-low-vision');
        togglePassword.classList.toggle('bx-show');
    });
    */


    
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
    



    // Processo di login
    const loginForm = document.getElementById("login-form");     // Creazione e collegamento al login-form
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {               // Predisposizione all'evento
            e.preventDefault();                                     // Gestione annullamento dell'evento defautl
            console.log("~ Inzio proceduta 'login'");
            console.log("login - Acquisizione parametri login-form");
            // Acquisizione campi del login-form
            const formUsername = loginForm.querySelector("input[type='text']").value;
            const formPassword = loginForm.querySelector("input[type='password']").value;
            
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

    // 
    const otpForm = document.getElementById("otp-form")
    if (otpForm) {
        otpForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("Modulo inviato");

            const otpInput = document.getElementById("otp-input").value;

            const email = localStorage.getItem("userEmail");
            if (!email) {
                alert("Errore passaggio dati: email dell'utente non trovata ")
            }
        });
    }

    // TODO Processo di registrazione
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const username = registerForm.querySelector("input[type='text']").value;
            const email = registerForm.querySelector("input[type='email']").value;
            const password = registerForm.querySelector("input[type='password']").value;
            const confirmPassword = registerForm.querySelector("input[type='password']:nth-child(4)").value;

            if (password !== confirmPassword) {
                alert("Le password non corrispondono.");
                return;
            }

            fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        alert("Registrazione avvenuta con successo!");
                        window.location.href = "home.html"; // Riporta alla pagina di login
                    } else {
                        alert("Errore nella registrazione. Riprova.");
                    }
                })
                .catch((error) => {
                    console.error("Errore:", error);
                });
        });
    }

    // TODO Processo di recupero password
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

    // TODO Processo di 

});