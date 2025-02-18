document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post('https://proyecto-notificaciones.onrender.com/login', { email, password });

        // Guardar el estado de inicio de sesión en LocalStorage
        localStorage.setItem('isLoggedIn', 'true'); // Puedes almacenar más datos si es necesario, como el email

        Swal.fire({
            title: '¡Inicio de sesión exitoso!',
            text: 'Bienvenido a la plataforma',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        }).then(() => {
            window.location.href = 'principal.html';  // Redirigir a la página principal
        });

    } catch (err) {
        Swal.fire({
            title: 'Error',
            text: 'Credenciales incorrectas. Inténtalo de nuevo.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        console.error(err);
    }
});
