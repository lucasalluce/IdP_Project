document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita il comportamento predefinito del form (reload della pagina)

    // Recupera i dati del form
    const username = document.querySelector('input[placeholder="Username"]').value;
    const password = document.querySelector('input[placeholder="Password"]').value;
    const rememberMe = document.querySelector('input[type="checkbox"]').checked;

    // Crea un oggetto con i dati
    const data = {
        username: username,
        password: password,
        rememberMe: rememberMe
    };

    try {
        // Invia i dati al backend
        const response = await fetch('http://localhost:5000/login', { // Modifica l'URL in base al tuo backend
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.json();
            console.log(result); // Puoi gestire la risposta dal server
            // Esempio: reindirizzamento dopo il login
            if (result.success) {
                window.location.href = '/dashboard';
            } else {
                alert(result.message);
            }
        } else {
            alert('Errore nella comunicazione con il server.');
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Si è verificato un errore durante il login.');
    }
});