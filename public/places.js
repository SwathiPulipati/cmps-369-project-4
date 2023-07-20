const markers = [];
var map;

const initMap = () => {
    map = L.map('map').setView([41, -74], 11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

const addPlace = async () => {
    const label = document.querySelector("#label").value;
    const address = document.querySelector("#address").value;
    document.querySelector("#label").value = '';
    document.querySelector("#address").value = '';

    const response = await axios.put('/places', { label: label, address: address });

    const lat = response.data.lat;
    const lng = response.data.lng;
    if(lat !== '' && lng !== '')
    map.flyTo(new L.LatLng(lat,lng));

    await loadPlaces();
    
}

const deletePlace = async (id) => {
    await axios.delete(`/places/${id}`);
    await loadPlaces();
}

const on_row_click = (e) => {
    let row = e.target;
    if(e.target.tagName.toUpperCase() == "TD"){
        row = e.target.parentNode;
    }
    const lat = row.dataset.lat;
    const lng = row.dataset.lng;

    if(lat !== '' && lng !== '')
        map.flyTo(new L.LatLng(lat,lng));
}

const loadPlaces = async () => {
    const response = await axios.get('/places');
    const tbody = document.querySelector('tbody');

    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    for (let i = 0; i < markers.length; i++) {
        map.removeLayer(markers[i].marker);
    }
    markers.splice(0,markers.length);
    console.log("markers: ", markers);


    if (response && response.data && response.data.places) {
        for (const place of response.data.places) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${place.label}</td>
                <td>${place.address}</td>
                <td>
                    <button class='btn btn-danger' onclick='deletePlace(${place.id})'>Delete</button>
                </td>
            `;
            tr.dataset.lat = place.lat;
            tr.dataset.lng = place.lng;
            tr.onclick = on_row_click;
            tbody.appendChild(tr);
            if(place.lat !== '' && place.lng !== ''){
                const marker = L.marker([place.lat, place.lng]).addTo(map).bindPopup(`<b>${place.label}</b><br/>${place.address}`);
                markers.push({id: place.id, marker: marker});
            }
            console.log(markers);
        }
    }
}

