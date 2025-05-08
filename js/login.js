document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post('https://frontend-notificaciones-v1.onrender.com/login', { email, password });

        const { email: userEmail, rol } = response.data;

        // Guardar datos en LocalStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('email', userEmail);
        localStorage.setItem('rol', rol); // ← Guarda el rol aquí

        Swal.fire({
            title: '¡Inicio de sesión exitoso!',
            text: 'Bienvenido a la plataforma',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        }).then(() => {
            window.location.href = 'principal.html';
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
