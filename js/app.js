document.getElementById('notificacionForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener valores del formulario
    const fecha = document.getElementById('fecha').value;
    const numero = document.getElementById('numero').value;
    const folio = document.getElementById('folio').value;
    const nombre = document.getElementById('nombre').value;
    const ubicacion = document.getElementById('ubicacion').value;
    const comunidad = document.getElementById('comunidad').value;
    const referencia = document.getElementById('referencia').value;
    const niveles = document.getElementById('niveles').value;
    const sup_aproximada = document.getElementById('sup_aproximada').value;

    // Características
    const caracteristicas = [];
    document.querySelectorAll('input[type=checkbox]:checked').forEach((checkbox) => {
        caracteristicas.push(checkbox.value);
    });

    try {
        // Enviar notificación al backend
        const response = await axios.post('https://proyecto-notificaciones.onrender.com/notificaciones', {
            fecha,
            numero,
            folio,
            nombre,
            ubicacion,
            comunidad,
            referencia,
            niveles,
            sup_aproximada,
            caracteristicas: caracteristicas.join(','),
        });

        alert('Notificación creada con éxito');

        // Limpiar los campos del formulario
        document.getElementById('notificacionForm').reset();

        // Limpiar manualmente los campos que no se limpian con reset()
        document.getElementById('ubicacion').value = ''; // Vaciar el campo de "Ubicación"
        
        // Limpiar los checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
            checkbox.checked = false; // Desmarcar todos los checkboxes
        });

        // Opcional: Si tienes un mapa con un marcador, también puedes restablecer la ubicación y el marcador a la ubicación inicial
        const initialLocation = { lat: 19.9532, lng: -99.5375 }; // Coordenadas de Jilotepec de Molina Enriquez
        marker.setPosition(initialLocation); // Restablecer el marcador
        map.setCenter(initialLocation); // Restablecer el centro del mapa

        location.reload(); // Recargar la página para actualizar la lista
    } catch (err) {
        console.error(err);
        alert('Error al crear la notificación');
    }
});

let dataTable;

// Función para cargar notificaciones
async function cargarNotificaciones() {
    try {
        const response = await axios.get('https://proyecto-notificaciones.onrender.com/notificaciones');

        // Formatear los datos
        const datosFormateados = response.data.map(notificacion => {
            const fechaLocal = new Date(notificacion.fecha);
            fechaLocal.setMinutes(fechaLocal.getMinutes() + fechaLocal.getTimezoneOffset());
            const fechaFormateada = fechaLocal.toLocaleDateString('es-ES');

            return [
                fechaFormateada,
                notificacion.numero,
                notificacion.folio,
                notificacion.nombre,
                notificacion.ubicacion,
                notificacion.comunidad,
                notificacion.referencia,
                notificacion.niveles,
                notificacion.sup_aproximada,
                notificacion.caracteristicas,
                notificacion.estado,
                notificacion.habilitado
                    ? `<button class="btn btn-primary btn-sm" onclick="actualizarNotificacion(${notificacion.id})">Actualizar</button>`
                    : '<span>No habilitado</span>',
                `<button class="btn btn-danger btn-sm" onclick="eliminarNotificacion(${notificacion.id})">Eliminar</button>`
            ];
        });

        // Si DataTable ya está inicializado, limpiar los datos antes de recargar
        if (dataTable) {
            dataTable.clear();
            dataTable.rows.add(datosFormateados).draw();
        } else {
            // Inicializar DataTable si no se ha creado aún
            dataTable = $('#notificacionesTable').DataTable({
                data: datosFormateados,
                paging: true,         // Habilita la paginación
                pageLength: 10,       // Muestra 10 registros por página
                lengthChange: false,  // Oculta la opción de cambiar número de registros
                ordering: true,       // Permite ordenar columnas
                info: true,           // Muestra información de la tabla
                autoWidth: false,     // Ajusta automáticamente el ancho de las columnas
                searching: false,
                responsive: true,
                language: {
                    paginate: {
                        previous: "Anterior",
                        next: "Siguiente"
                    },
                    info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                    search: "Buscar:",
                    zeroRecords: "No se encontraron registros",
                    infoEmpty: "No hay registros disponibles"
                }
            });
        }
    } catch (err) {
        console.error(err);
        alert('Error al cargar las notificaciones');
    }
}

async function eliminarNotificacion(id) {
    if (!confirm('¿Estás seguro de eliminar esta notificación?')) return;

    try {
        await axios.delete(`https://proyecto-notificaciones.onrender.com/notificaciones/${id}`);
        alert('Notificación eliminada con éxito');
        location.reload();
    } catch (err) {
        console.error(err);
        alert('Error al eliminar la notificación');
    }
}

async function actualizarNotificacion(id) {
    try {
        const response = await fetch(`https://proyecto-notificaciones.onrender.com/notificaciones/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('Notificación actualizada correctamente');
            cargarNotificaciones(); // Recargar la tabla después de actualizar
        } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
        }
    } catch (error) {
        console.error('Error al actualizar la notificación:', error);
    }
}


cargarNotificaciones();
