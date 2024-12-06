document.addEventListener("DOMContentLoaded", () => {
// Gestione login
   // Gestione login
   const loginForm = document.getElementById("login-form");
   if (loginForm) {
       loginForm.addEventListener("submit", (e) => {
           e.preventDefault();  

           const username = loginForm.querySelector("input[type='text']").value;
           const password = loginForm.querySelector("input[type='password']").value;

           //#TODO hashing password  (da fare lato client o lato server, ma qui ci assumiamo che venga fatto lato server)

           fetch("http://127.0.0.1:5500/Front_end/home.html", {
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