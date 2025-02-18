document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post('https://proyecto-notificaciones.onrender.com/login', { email, password });

        // SweetAlert de éxito
        Swal.fire({
            title: '¡Inicio de sesión exitoso!',
            text: 'Bienvenido a la plataforma',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        }).then(() => {
            // Redirigir después de que el usuario cierre la alerta
            window.location.href = 'principal.html';
        });

    } catch (err) {
        // SweetAlert de error
        Swal.fire({
            title: 'Error',
            text: 'Credenciales incorrectas. Inténtalo de nuevo.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        console.error(err);
    }
});
