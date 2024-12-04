document.addEventListener("DOMContentLoaded", () => {
    // Gestione login
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();  // Evita il comportamento predefinito del form

            const username = loginForm.querySelector("input[type='text']").value;
            const password = loginForm.querySelector("input[type='password']").value;

            fetch("/login", {
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
                        window.location.href = "/dashboard"; // Redirigi se il login è successo
                    } else {
                        alert("Credenziali errate. Riprova.");
                    }
                })
                .catch((error) => {
                    console.error("Errore:", error);
                });
        });
    }




    



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
                        window.location.href = "home.html"; // Redirigi alla pagina di login
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
                        window.location.href = "home.html"; // Redirigi alla pagina di login
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