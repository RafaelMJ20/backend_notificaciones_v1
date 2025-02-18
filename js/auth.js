// auth.js
window.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario está autenticado
    if (!localStorage.getItem('isLoggedIn')) {
        // Si no está autenticado, redirigir a la página de login
        window.location.href = 'login.html';
    }
});
