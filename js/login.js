document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post('https://proyecto-notificaciones.onrender.com/login', { email, password });
        alert('Inicio de sesión exitoso');
        // Redireccionar a la página principal
        window.location.href = 'index.html';
    } catch (err) {
        alert('Credenciales incorrectas');
        console.error(err);
    }
});
