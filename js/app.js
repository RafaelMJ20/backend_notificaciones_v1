document.getElementById('notificacionForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const rol = localStorage.getItem('rol');
    if (rol !== 'admin') {
        return Swal.fire({
            title: "Acceso denegado",
            text: "Solo los administradores pueden crear notificaciones.",
            icon: "error"
        });
    }

    const fecha = document.getElementById('fecha').value;
    const numero = document.getElementById('numero').value;
    const folio = document.getElementById('folio').value;
    const nombre = document.getElementById('nombre').value;
    const ubicacion = document.getElementById('ubicacion').value;
    const comunidad = document.getElementById('comunidad').value;
    const referencia = document.getElementById('referencia').value;
    const niveles = document.getElementById('niveles').value;
    const sup_aproximada = document.getElementById('sup_aproximada').value;

    const caracteristicas = [];
    document.querySelectorAll('input[type=checkbox]:checked').forEach((checkbox) => {
        caracteristicas.push(checkbox.value);
    });

    try {
        const response = await axios.post('https://frontend-notificaciones-v1.onrender.com/notificaciones', {
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
            rol
        });

        Swal.fire({
            title: "¡Notificación creada!",
            text: "La notificación se ha registrado con éxito.",
            icon: "success"
        }).then(() => {
            document.getElementById('notificacionForm').reset();
            document.getElementById('ubicacion').value = '';
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach((checkbox) => {
                checkbox.checked = false;
            });

            const initialLocation = { lat: 19.9532, lng: -99.5375 };
            marker.setPosition(initialLocation);
            map.setCenter(initialLocation);

            location.reload();
        });
    } catch (err) {
        console.error(err);
        Swal.fire({
            title: "Error",
            text: "Hubo un problema al crear la notificación.",
            icon: "error"
        });
    }
});

let dataTable;

async function cargarNotificaciones() {
    try {
        const response = await axios.get('https://frontend-notificaciones-v1.onrender.com/notificaciones');
        const rol = localStorage.getItem('rol');

        const datosFormateados = response.data.map(notificacion => {
            const fechaLocal = new Date(notificacion.fecha);
            fechaLocal.setMinutes(fechaLocal.getMinutes() + fechaLocal.getTimezoneOffset());
            const fechaFormateada = fechaLocal.toLocaleDateString('es-ES');

            const seguimientoBtn = `
            <button class="btn btn-sm ${
                notificacion.resuelta ? 'btn-success' : 'btn-warning text-dark'
            }" onclick="cambiarSeguimiento(${notificacion.id})">
                ${notificacion.resuelta ? 'Resuelta' : 'Pendiente'}
            </button>`;


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
                // Botón de seguimiento
                notificacion.resuelta
                    ? `<button class="btn btn-sm btn-success" disabled>Resuelta</button>`
                    : `<button class="btn btn-sm btn-warning text-dark" onclick="cambiarSeguimiento(${notificacion.id})">Pendiente</button>`,
                // Botón de actualización, solo si no está resuelta y el rol es admin
                notificacion.resuelta
                    ? '<span>Resuelta</span>'
                    : (rol === 'admin'
                        ? `<button class="btn btn-primary btn-sm" onclick="actualizarNotificacion(${notificacion.id})">Actualizar</button>`
                        : '<span>No autorizado</span>'),
                // Botón de eliminación, solo si el rol es admin
                rol === 'admin'
                    ? `<button class="btn btn-danger btn-sm" onclick="eliminarNotificacion(${notificacion.id})">Eliminar</button>`
                    : '<span>No autorizado</span>'
            ];
            
        });

        if (dataTable) {
            dataTable.clear();
            dataTable.rows.add(datosFormateados).draw();
        } else {
            dataTable = $('#notificacionesTable').DataTable({
                data: datosFormateados,
                paging: true,
                pageLength: 10,
                lengthChange: false,
                ordering: true,
                info: true,
                autoWidth: false,
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
    const rol = localStorage.getItem('rol');
    if (rol !== 'admin') {
        return Swal.fire({
            title: "Acceso denegado",
            text: "No tienes permiso para eliminar notificaciones.",
            icon: "error"
        });
    }

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
            await axios.delete(`https://frontend-notificaciones-v1.onrender.com/notificaciones/${id}`, {
                data: { rol }
            });

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
    const rol = localStorage.getItem('rol');
    if (rol !== 'admin') {
        return Swal.fire({
            title: "Acceso denegado",
            text: "No tienes permiso para actualizar notificaciones.",
            icon: "error"
        });
    }

    try {
        const response = await fetch(`https://frontend-notificaciones-v1.onrender.com/notificaciones/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rol })
        });

        if (response.ok) {
            Swal.fire({
                title: "¡Notificación actualizada!",
                text: "Los cambios se han guardado correctamente.",
                icon: "success"
            }).then(() => {
                cargarNotificaciones();
            });
        } else {
            const error = await response.json();
            Swal.fire({
                title: "Error",
                text: error.error,
                icon: "error"
            });
        }
    } catch (error) {
        console.error('Error al actualizar la notificación:', error);
        Swal.fire({
            title: "Error",
            text: "Hubo un problema al actualizar la notificación.",
            icon: "error"
        });
    }
}

async function cambiarSeguimiento(id) {
    const rol = localStorage.getItem('rol');
    if (rol !== 'admin') {
        return Swal.fire({
            title: "Acceso denegado",
            text: "No tienes permiso para modificar el seguimiento.",
            icon: "error"
        });
    }

    try {
        const response = await fetch(`https://frontend-notificaciones-v1.onrender.com/notificaciones/${id}/resuelta`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rol })
        });

        if (response.ok) {
            const data = await response.json();
            Swal.fire({
                title: "Seguimiento actualizado",
                text: `La notificación se marcó como ${data.resuelta ? 'Resuelta' : 'Pendiente'}.`,
                icon: "success"
            }).then(() => {
                cargarNotificaciones();
            });
        } else {
            const error = await response.json();
            Swal.fire({
                title: "Error",
                text: error.error || "No se pudo actualizar el seguimiento.",
                icon: "error"
            });
        }
    } catch (error) {
        console.error('Error al cambiar el seguimiento:', error);
        Swal.fire({
            title: "Error",
            text: "Hubo un problema al cambiar el seguimiento.",
            icon: "error"
        });
    }
}

cargarNotificaciones();
