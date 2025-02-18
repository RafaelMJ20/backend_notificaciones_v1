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
        const response = await axios.post('http://localhost:3000/notificaciones', {
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

        // Mostrar alerta de éxito
        Swal.fire({
            title: "¡Notificación creada!",
            text: "La notificación se ha registrado con éxito.",
            icon: "success",
            draggable: true
        }).then(() => {
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
        });
    } catch (err) {
        console.error(err);
        
        // Mostrar alerta de error
        Swal.fire({
            title: "Error",
            text: "Hubo un problema al crear la notificación.",
            icon: "error",
            draggable: true
        });
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
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-danger"
        },
        buttonsStyling: false
    });

    const result = await swalWithBootstrapButtons.fire({
        title: "¿Estás seguro?",
        text: "¡No podrás revertir esto!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "No, cancelar",
        reverseButtons: true
    });

    if (result.isConfirmed) {
        try {
            await axios.delete(`http://localhost:3000/notificaciones/${id}`);
            swalWithBootstrapButtons.fire({
                title: "Eliminado",
                text: "La notificación ha sido eliminada.",
                icon: "success"
            }).then(() => location.reload());
        } catch (err) {
            console.error(err);
            swalWithBootstrapButtons.fire({
                title: "Error",
                text: "Hubo un problema al eliminar la notificación.",
                icon: "error"
            });
        }
    } else if (result.dismiss === Swal.DismissReason.cancel) {
        swalWithBootstrapButtons.fire({
            title: "Cancelado",
            text: "La notificación sigue intacta.",
            icon: "error"
        });
    }
}

async function actualizarNotificacion(id) {
    try {
        const response = await fetch(`http://localhost:3000/notificaciones/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            Swal.fire({
                title: "¡Notificación actualizada!",
                text: "Los cambios se han guardado correctamente.",
                icon: "success",
                draggable: true
            }).then(() => {
                cargarNotificaciones(); // Recargar la tabla después de actualizar
            });
        } else {
            const error = await response.json();
            Swal.fire({
                title: "Error",
                text: error.error,
                icon: "error",
                draggable: true
            });
        }
    } catch (error) {
        console.error('Error al actualizar la notificación:', error);
        Swal.fire({
            title: "Error",
            text: "Hubo un problema al actualizar la notificación.",
            icon: "error",
            draggable: true
        });
    }
}

cargarNotificaciones();
