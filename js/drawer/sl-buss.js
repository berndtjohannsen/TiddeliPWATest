import { DrawerUtils } from './utils.js';

export const SLBussHandler = {
    map: null,
    currentPositionMarker: null,
    busStopMarkers: [],
    isTracking: false,
    watchId: null,
    busStops: null,

    async init() {
        DrawerUtils.setFullScreenMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = '<div id="map" style="width:100%;height:calc(100vh - 4rem);border-radius:1rem;"></div>';
        
        try {
            // Load bus stops data
            await this.loadBusStops();
            // Initialize map and start tracking
            await this.initializeMap();
            await this.startTracking();
        } catch (error) {
            console.error('Error initializing:', error);
            alert('Could not initialize the map. Please ensure you have granted location permissions.');
        }
    },

    async loadBusStops() {
        try {
            const response = await fetch('/testdata/slsites.json');
            if (!response.ok) throw new Error('Failed to load bus stops data');
            this.busStops = await response.json();
            // Log the first stop to see its structure
            console.log('First bus stop data:', this.busStops[0]);
            console.log(`Loaded ${this.busStops.length} bus stops`);
        } catch (error) {
            console.error('Error loading bus stops:', error);
            throw error;
        }
    },

    async initializeMap() {
        // Wait for L (Leaflet) to be available
        if (!window.L) {
            console.error('Leaflet is not loaded');
            return;
        }

        // Initialize the map
        this.map = L.map('map').setView([59.3293, 18.0686], 13);
        
        // Add the OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        // Add event listener for map movement
        this.map.on('moveend', () => this.updateBusStops());
    },

    async startTracking() {
        if (!navigator.geolocation) {
            throw new Error('Geolocation is not supported by this browser.');
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    // Update map view to current location
                    this.map.setView([latitude, longitude], 15);
                    
                    // Add or update position marker
                    if (this.currentPositionMarker) {
                        this.currentPositionMarker.setLatLng([latitude, longitude]);
                    } else {
                        this.currentPositionMarker = L.marker([latitude, longitude], {
                            icon: L.divIcon({
                                className: 'current-position-marker',
                                html: '<div style="width:12px; height:12px; background-color:#3B82F6; border-radius:50%; border:2px solid white; box-shadow:0 1px 2px rgba(0,0,0,0.2);"></div>'
                            })
                        }).addTo(this.map);
                    }

                    // Start watching position for updates
                    this.watchId = navigator.geolocation.watchPosition(
                        (pos) => this.handlePositionUpdate(pos),
                        (error) => this.handlePositionError(error),
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 30000
                        }
                    );
                    
                    this.isTracking = true;
                    resolve();
                },
                (error) => {
                    this.handlePositionError(error);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 30000
                }
            );
        });
    },

    updateBusStops() {
        if (!this.map || !this.busStops) {
            console.log('Map or bus stops not ready:', { map: !!this.map, busStops: !!this.busStops });
            return;
        }

        // Clear existing bus stop markers
        this.busStopMarkers.forEach(marker => marker.remove());
        this.busStopMarkers = [];

        // Get current map bounds
        const bounds = this.map.getBounds();
        
        // Filter bus stops within current view
        const visibleStops = this.busStops.filter(stop => {
            const lat = stop.lat || stop.latitude || stop.Lat || stop.Latitude;
            const lng = stop.lon || stop.longitude || stop.Lon || stop.Longitude || stop.long || stop.Long;
            
            if (!lat || !lng) {
                return false;
            }

            const isInBounds = lat >= bounds.getSouth() && 
                             lat <= bounds.getNorth() && 
                             lng >= bounds.getWest() && 
                             lng <= bounds.getEast();
            
            return isInBounds;
        });

        // Add markers for visible stops (limit to 100 for performance)
        visibleStops.slice(0, 100).forEach(stop => {
            const lat = stop.lat || stop.latitude || stop.Lat || stop.Latitude;
            const lng = stop.lon || stop.longitude || stop.Lon || stop.Longitude || stop.long || stop.Long;
            
            // Create a custom icon for the bus stop
            const icon = L.divIcon({
                className: 'bus-stop-marker',
                html: `
                    <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                        <div style="width:8px; height:8px; background-color:#EF4444; border-radius:50%; border:1px solid white; box-shadow:0 1px 2px rgba(0,0,0,0.2);"></div>
                    </div>
                `,
                iconSize: [24, 24],     // Size of the clickable area (24x24 pixels)
                iconAnchor: [12, 12],   // Center point of the icon
                popupAnchor: [0, -12]   // Where the popup should appear relative to the icon
            });

            const marker = L.marker([lat, lng], { icon }).addTo(this.map);
            
            // Create a detailed popup content
            const name = stop.name || stop.Name || stop.stopName || stop.StopName || 'Unknown Stop';
            const siteId = stop.site_id || stop.siteId || stop.SiteId || stop.id || stop.Id || '';
            const type = stop.type || stop.Type || '';
            
            const popupContent = `
                <div style="padding:8px;">
                    <h3 style="font-weight:bold; font-size:16px; margin-bottom:4px;">${name}</h3>
                    ${siteId ? `<p style="font-size:12px; color:#666; margin-bottom:4px;">Stop ID: ${siteId}</p>` : ''}
                    ${type ? `<p style="font-size:12px; color:#666;">${type}</p>` : ''}
                </div>
            `;

            // Create and bind the popup with options for better UX
            const popup = L.popup({
                maxWidth: 300,
                closeButton: true,
                autoClose: true,
                closeOnClick: false
            }).setContent(popupContent);

            marker.bindPopup(popup);
            
            // Add click handler
            marker.on('click', () => {
                marker.openPopup();
            });
            
            this.busStopMarkers.push(marker);
        });
    },

    handlePositionUpdate(position) {
        const { latitude, longitude } = position.coords;
        
        // Update current position marker
        if (this.currentPositionMarker) {
            this.currentPositionMarker.setLatLng([latitude, longitude]);
        }
    },

    handlePositionError(error) {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unknown error occurred while getting location.';
        
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable.';
                break;
            case error.TIMEOUT:
                errorMessage = 'Location request timed out.';
                break;
        }
        
        alert(errorMessage);
    },

    destroy() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.busStopMarkers = [];
        this.currentPositionMarker = null;
        this.isTracking = false;
        this.busStops = null;
    }
}; 