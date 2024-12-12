document.addEventListener("DOMContentLoaded", () => {
    // Funzione per fare l'hashing della password
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }


        // Gestione invio OTP
        const otpForm = document.getElementById("otp-form");

    if (otpForm) {
        otpForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("Modulo inviato");

            const otpInput = document.getElementById("otp-input").value;

            // Recupera l'email salvata nel localStorage
            const email = localStorage.getItem("userEmail");
            if (!email) {
                alert("Errore: non è stata trovata l'email dell'utente. Effettua nuovamente il login.");
                window.location.href = "home.html";
                return;
            }

            fetch("http://127.0.0.1:5000/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    otp: otpInput,
                    email: email, // Utilizza l'email salvata
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        alert("OTP verificato con successo!");
                        window.location.href = "about3.html";
                    } else {
                        alert(data.message || "OTP non valido o scaduto.");
                    }
                })
                .catch((error) => {
                    console.error("Errore nella richiesta:", error);
                    alert("Si è verificato un errore durante la verifica dell'OTP. Riprova.");
                });
        });
    }



    // Gestione login
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();  

            const username = loginForm.querySelector("input[type='text']").value;
            const password = loginForm.querySelector("input[type='password']").value;

            if (!username || !password) {
                alert("Inserisci username e password!");
                return;
            }

            // Esegui l'hashing della password prima di inviarla
            hashPassword(password).then((hashedPassword) => {
                fetch("http://127.0.0.1:5000/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username,
                        password: hashedPassword,  // Passiamo la password hashata
                    }),
                })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        localStorage.setItem("userEmail", data.email);
                        window.location.href = "otp.html";  // Reindirizza se login riuscito
                    } else {
                        alert("Credenziali errate. Riprova.");
                    }
                })
                .catch((error) => {
                    console.error("Errore:", error);
                });
            });
        });
    }

    //--------------------------------------------------------------------------------------------------------------------
    
    // Gestione registrazione
const registerForm = document.getElementById("register-form");
if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = registerForm.querySelector("input[placeholder='Name']").value; // Nome
        const surname = registerForm.querySelector("input[placeholder='Surname']").value; // Cognome
        const username = registerForm.querySelector("input[placeholder='Username']").value; // Username
        const email = registerForm.querySelector("input[placeholder='Email']").value; // Email
        const password = registerForm.querySelector("input[placeholder='Password']").value; // Password
        const confirmPassword = registerForm.querySelectorAll("input[type='password']")[1].value; // Confirm Password

        if (password !== confirmPassword) {
            alert("Le password non corrispondono.");
            return;
        }

        // Esegui l'hashing della password prima di inviarla
        hashPassword(password).then((hashedPassword) => {
            fetch("http://127.0.0.1:5000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,  // Nome
                    surname: surname,  // Cognome
                    username: username,  // Username
                    email: email,  // Email
                    password: hashedPassword,  // Password hashata
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
    });
}

    //--------------------------------------------------------------------------------------------------------------------
    
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
                })
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
