document.addEventListener("DOMContentLoaded", () => {
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