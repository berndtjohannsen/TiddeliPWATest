import { DrawerUtils } from './utils.js';

export const GpsHandler = {
    init() {
        DrawerUtils.setFullScreenMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = '<div id="map" style="width:100%;height:calc(100vh - 4rem);border-radius:1rem;"></div>';
        
        setTimeout(() => {
            if (window.L && document.getElementById('map')) {
                const map = L.map('map').setView([59.3293, 18.0686], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }).addTo(map);

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(pos => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        L.marker([lat, lng]).addTo(map).bindPopup('You are here').openPopup();
                        map.setView([lat, lng], 15);
                    });
                }
            }
        }, 100);
    }
}; 