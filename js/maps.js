let map, marker, geocoder;

function initMap() {
    geocoder = new google.maps.Geocoder();

    // Establece la ubicación inicial en el mapa (Jilotepec de Molina Enriquez, Estado de México)
    const initialLocation = { lat: 19.9532, lng: -99.5375 }; // Jilotepec de Molina Enriquez

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: initialLocation,
    });

    // Crear un marcador para seleccionar ubicación
    marker = new google.maps.Marker({
        position: initialLocation,
        map: map,
        draggable: true, // El marcador será arrastrable
    });

    // Cuando el marcador se mueve, actualizar la dirección en el campo de texto
    google.maps.event.addListener(marker, "dragend", function () {
        const position = marker.getPosition();
        getAddress(position);
    });

    // Si el usuario hace clic en el mapa, mover el marcador y actualizar la dirección
    map.addListener("click", function (event) {
        const position = event.latLng;
        marker.setPosition(position);
        getAddress(position);
    });
}

// Función para obtener la dirección a partir de las coordenadas
function getAddress(latLng) {
    geocoder.geocode({ location: latLng }, function (results, status) {
        if (status === "OK" && results[0]) {
            const address = results[0].formatted_address;
            document.getElementById("ubicacion").value = address; // Actualiza el campo de "Ubicación" con la dirección
        } else {
            alert("No se pudo obtener la dirección.");
        }
    });
}

// Inicializar el mapa cuando la API de Google Maps esté cargada
window.onload = function () {
    initMap();
};
