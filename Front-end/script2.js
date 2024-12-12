// Seleziona l'input e l'icona
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