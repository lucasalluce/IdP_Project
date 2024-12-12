document.addEventListener("DOMContentLoaded", () => {
    // Hashing password
    // IN clearPassword - password in chiaro acquisita dal form
    // OUT hashHex - password cifrata con SHA-256
    async function hashPassword(clearPassword) {
        const encoder = new TextEncoder();
        const data = encoder.encode(clearPassword);                                             // Conversione in binario
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);                         // Calcolo dell'hash SHA-256
        const hashArray = Array.from(new Uint8Array(hashBuffer));                               // Conversione in array
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');     // Conversione in esadecimale
        return hashHex
    }

    // TODO OTP
    const otpForm = document.getElementById("otp-form")
    if (otpForm) {
        otpForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("Modulo inviato");

            const otpInput = document.getElementById("otp-input").value;
        });
    }

    // Login
    const loginForm = document.getElementById("login-form");     // Creazione e collegamento al login-form
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {               // Predisposizione all'evento
            e.preventDefault();                                     // Gestione annullamento dell'evento defautl
            // Acquisizione campi del login-form
            const formUsername = loginForm.querySelector("input[type='text']").value;
            const formPassword = loginForm.querySelector("input[type='password']").value;
            
            // Controllo riempimento campi login-form 
            if (!formUsername || !formPassword) {
                alert("Inserire correttamente Username e Password");
                return;
            }

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
                    if (data.success) {
                        localStorage.setItem("userEmail", data.email);
                        window.location.href = "otp.html";
                    } else {
                        alert("Credenziali errate!! Riprovare")
                    }
                })
                .catch((error) => {
                    console.error("Errore: ", error):
                })
            });

            fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        window.location.href = "/about3";  // Reindirizza se login riuscito
                    } else {
                        alert("Credenziali errate. Riprova.");
                    }
                })
                .catch((error) => {
                    console.error("Errore:", error);
                });
        });
    }



    //--------------------------------------------------------------------------------------------------------------------




    // Gestione registrazione
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





    // Gestione password dimenticata
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