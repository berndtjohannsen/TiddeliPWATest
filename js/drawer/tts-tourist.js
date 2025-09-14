import { DrawerUtils } from './utils.js';

export const TTSTouristHandler = {
    map: null,
    currentPosition: null,
    watchId: null,
    lastAnnouncedStreet: null,
    isTracking: false,
    ttsEnabled: true,
    voices: [],
    currentVoice: null,
    testMode: false,
    testMarker: null,
    nearbyPOIs: [],
    lastAnnouncedPOI: null,
    announcementRadius: 100, // meters
    poiMode: false,

    async init() {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        // Check if TTS is available
        if (!('speechSynthesis' in window)) {
            alert('Text-to-Speech is not supported in this browser.');
            return;
        }

        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">TTS Tourist</h2>
                
                <div class="card">
                    <h3 class="card-title">Location & Street Announcement</h3>
                    <div class="space-y-4">
                        <div class="flex gap-2">
                            <button id="start-tracking" class="btn-primary flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                                Start Tracking
                            </button>
                            
                            <button id="stop-tracking" class="btn-primary bg-red-500 hover:bg-red-600 flex items-center gap-2" disabled>
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
                                </svg>
                                Stop Tracking
                            </button>
                            
                            <button id="announce-current" class="btn-primary bg-green-500 hover:bg-green-600 flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                                </svg>
                                Announce Now
                            </button>
                            
                            <button id="test-mode" class="btn-primary bg-purple-500 hover:bg-purple-600 flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                                Test Mode
                            </button>
                            
                            <button id="poi-mode" class="btn-primary bg-blue-500 hover:bg-blue-600 flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                POI Guide
                            </button>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="tts-voice" class="block text-sm font-medium text-gray-700 mb-2">
                                    Voice:
                                </label>
                                <select id="tts-voice" class="input-primary w-full">
                                    <option value="">Loading voices...</option>
                                </select>
                            </div>
                            
                            <div class="flex items-center gap-4">
                                <label class="flex items-center gap-2">
                                    <input type="checkbox" id="tts-enabled" checked>
                                    <span class="text-sm">Enable TTS announcements</span>
                                </label>
                            </div>
                        </div>
                        
                        <div id="location-info" class="text-sm text-gray-600 space-y-1">
                            <div><strong>Status:</strong> <span id="tracking-status">Ready to start</span></div>
                            <div><strong>Mode:</strong> <span id="current-mode">Normal</span></div>
                            <div><strong>Current location:</strong> <span id="current-coords">Not available</span></div>
                            <div><strong>Nearest street:</strong> <span id="current-street">Not available</span></div>
                            <div><strong>Nearby POIs:</strong> <span id="nearby-count">0</span></div>
                            <div><strong>Last announced:</strong> <span id="last-announced">None</span></div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <h3 class="card-title">Map</h3>
                    <div id="map" class="w-full h-64 rounded-lg border border-gray-300"></div>
                </div>
                
                <div class="card">
                    <h3 class="card-title">Nearby Attractions</h3>
                    <div id="poi-list" class="space-y-2 max-h-48 overflow-y-auto">
                        <div class="text-gray-500 text-sm">No attractions found yet</div>
                    </div>
                </div>
                
                <div class="card">
                    <h3 class="card-title">Settings</h3>
                    <div class="space-y-4">
                        <div>
                            <label for="announcement-interval" class="block text-sm font-medium text-gray-700 mb-2">
                                Announcement interval (seconds):
                            </label>
                            <input 
                                type="range" 
                                id="announcement-interval" 
                                min="5" 
                                max="60" 
                                step="5" 
                                value="10" 
                                class="w-full"
                            />
                            <div class="flex justify-between text-xs text-gray-500 mt-1">
                                <span>5s</span>
                                <span id="interval-value">10s</span>
                                <span>60s</span>
                            </div>
                        </div>
                        
                        <div>
                            <label for="movement-threshold" class="block text-sm font-medium text-gray-700 mb-2">
                                Movement threshold (meters):
                            </label>
                            <input 
                                type="range" 
                                id="movement-threshold" 
                                min="10" 
                                max="100" 
                                step="10" 
                                value="50" 
                                class="w-full"
                            />
                            <div class="flex justify-between text-xs text-gray-500 mt-1">
                                <span>10m</span>
                                <span id="threshold-value">50m</span>
                                <span>100m</span>
                            </div>
                        </div>
                        
                        <div>
                            <label for="poi-radius" class="block text-sm font-medium text-gray-700 mb-2">
                                POI detection radius (meters):
                            </label>
                            <input 
                                type="range" 
                                id="poi-radius" 
                                min="50" 
                                max="500" 
                                step="25" 
                                value="100" 
                                class="w-full"
                            />
                            <div class="flex justify-between text-xs text-gray-500 mt-1">
                                <span>50m</span>
                                <span id="poi-radius-value">100m</span>
                                <span>500m</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initEvents();
        this.initMap();
        await this.loadVoices();
        
        // Make announcePOI globally accessible
        window.ttsTourist = this;
        
        // Add test method for debugging
        window.testKnownLocations = () => {
            console.log('=== Testing Known Locations ===');
            const testCoords = [
                { name: 'Gamla Stan', lat: 59.3258, lng: 18.0708 },
                { name: 'Vasa Museum', lat: 59.3289, lng: 18.0903 },
                { name: 'Royal Palace', lat: 59.3266, lng: 18.0719 }
            ];
            
            testCoords.forEach(coord => {
                console.log(`\n--- Testing ${coord.name} ---`);
                const result = this.getKnownLocation(coord.lat, coord.lng);
                console.log('Result:', result);
            });
        };
    },

    initEvents() {
        // Tracking controls
        document.getElementById('start-tracking').addEventListener('click', () => this.startTracking());
        document.getElementById('stop-tracking').addEventListener('click', () => this.stopTracking());
        document.getElementById('announce-current').addEventListener('click', () => this.announceCurrentLocation());
        document.getElementById('test-mode').addEventListener('click', () => this.toggleTestMode());
        document.getElementById('poi-mode').addEventListener('click', () => this.togglePOIMode());
        
        // Voice selection
        document.getElementById('tts-voice').addEventListener('change', (e) => {
            this.currentVoice = this.voices.find(voice => voice.name === e.target.value);
        });
        
        // TTS toggle
        document.getElementById('tts-enabled').addEventListener('change', (e) => {
            this.ttsEnabled = e.target.checked;
        });
        
        // Settings
        const intervalSlider = document.getElementById('announcement-interval');
        const intervalValue = document.getElementById('interval-value');
        intervalSlider.addEventListener('input', (e) => {
            intervalValue.textContent = e.target.value + 's';
        });
        
        const thresholdSlider = document.getElementById('movement-threshold');
        const thresholdValue = document.getElementById('threshold-value');
        thresholdSlider.addEventListener('input', (e) => {
            thresholdValue.textContent = e.target.value + 'm';
        });
        
        const poiRadiusSlider = document.getElementById('poi-radius');
        const poiRadiusValue = document.getElementById('poi-radius-value');
        poiRadiusSlider.addEventListener('input', (e) => {
            this.announcementRadius = parseInt(e.target.value);
            poiRadiusValue.textContent = e.target.value + 'm';
        });
    },

    initMap() {
        // Initialize map centered on Stockholm (fallback)
        this.map = L.map('map').setView([59.3293, 18.0686], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        // Wait for map to be ready before adding click listener
        this.map.whenReady(() => {
            console.log('Map is ready, adding click listener');
            // Add click event listener for test mode
            this.map.on('click', (e) => {
                console.log('Map clicked, test mode:', this.testMode);
                if (this.testMode) {
                    this.onTestMapClick(e.latlng);
                }
            });
        });
    },

    async loadVoices() {
        return new Promise((resolve) => {
            // Load voices immediately if available
            this.voices = speechSynthesis.getVoices();
            
            if (this.voices.length > 0) {
                this.populateVoiceList();
                resolve();
            } else {
                // Wait for voices to load
                speechSynthesis.addEventListener('voiceschanged', () => {
                    this.voices = speechSynthesis.getVoices();
                    this.populateVoiceList();
                    resolve();
                });
            }
        });
    },

    populateVoiceList() {
        const voiceSelect = document.getElementById('tts-voice');
        
        // Clear existing options
        voiceSelect.innerHTML = '';
        
        if (this.voices.length === 0) {
            voiceSelect.innerHTML = '<option value="">No voices available</option>';
            return;
        }
        
        // Add voices to select
        this.voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice.default) {
                option.textContent += ' - Default';
                this.currentVoice = voice;
            }
            voiceSelect.appendChild(option);
        });
        
        // Set default voice
        if (this.currentVoice) {
            voiceSelect.value = this.currentVoice.name;
        } else if (this.voices.length > 0) {
            this.currentVoice = this.voices[0];
            voiceSelect.value = this.currentVoice.name;
        }
    },

    startTracking() {
        if (this.isTracking) return;
        
        this.isTracking = true;
        this.updateStatus('Starting location tracking...');
        this.updateButtons();
        
        // Get current position first
        navigator.geolocation.getCurrentPosition(
            (position) => this.onLocationUpdate(position),
            (error) => this.onLocationError(error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        
        // Start watching position
        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.onLocationUpdate(position),
            (error) => this.onLocationError(error),
            { 
                enableHighAccuracy: true, 
                timeout: 15000, 
                maximumAge: 30000 
            }
        );
    },

    stopTracking() {
        if (!this.isTracking) return;
        
        this.isTracking = false;
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        
        this.updateStatus('Tracking stopped');
        this.updateButtons();
    },

    async onLocationUpdate(position) {
        this.currentPosition = position;
        const coords = position.coords;
        
        // Update coordinates display
        document.getElementById('current-coords').textContent = 
            `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
        
        // Update map
        this.updateMap(coords.latitude, coords.longitude);
        
        // Get street name
        let streetData = await this.getStreetName(coords.latitude, coords.longitude);
        
        if (streetData && streetData.name) {
            document.getElementById('current-street').textContent = streetData.name;
            
            // Check if we should announce (if street changed and enough time passed)
            if (this.shouldAnnounce(streetData.name)) {
                this.announceStreet(streetData);
                this.lastAnnouncedStreet = streetData.name;
                this.lastAnnounceTime = Date.now();
            }
        }
        
        // Get nearby POIs if in POI mode
        if (this.poiMode) {
            await this.getNearbyPOIs(coords.latitude, coords.longitude);
            this.checkForPOIAnnouncements();
        }
        
        this.updateStatus('Tracking active');
    },

    onLocationError(error) {
        console.error('Location error:', error);
        let message = 'Location error: ';
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message += 'Permission denied';
                break;
            case error.POSITION_UNAVAILABLE:
                message += 'Position unavailable';
                break;
            case error.TIMEOUT:
                message += 'Request timeout';
                break;
            default:
                message += 'Unknown error';
                break;
        }
        this.updateStatus(message);
        this.updateButtons();
    },

    updateMap(lat, lng) {
        if (!this.map) return;
        
        // Update map center
        this.map.setView([lat, lng], 15);
        
        // Remove existing markers
        this.map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                this.map.removeLayer(layer);
            }
        });
        
        // Add current position marker
        L.marker([lat, lng]).addTo(this.map)
            .bindPopup('Your current location')
            .openPopup();
    },

    async getStreetName(lat, lng) {
        try {
            console.log('=== getStreetName called ===');
            console.log('Coordinates:', lat, lng);
            
            // Determine language based on selected voice
            const language = this.getVoiceLanguage();
            console.log('Language:', language);
            
            // Try to get real street name using reverse geocoding
            const streetName = await this.getRealStreetName(lat, lng);
            if (streetName) {
                console.log('Found street name:', streetName);
                return {
                    name: streetName,
                    language: language,
                    fullAddress: `Street: ${streetName}`
                };
            }
            
            // Fallback to coordinate-based location
            console.log('No street name found, using fallback');
            return this.getFallbackStreetName(lat, lng);
            
        } catch (error) {
            console.error('Error getting street name:', error);
            return this.getFallbackStreetName(lat, lng);
        }
    },

    getKnownLocation(lat, lng) {
        // Simple known locations in Stockholm
        const knownLocations = [
            {
                name: 'Gamla Stan',
                lat: 59.3258,
                lng: 18.0708,
                radius: 2000, // Large radius for easy detection
                description: 'Old Town Stockholm'
            },
            {
                name: 'Central Stockholm',
                lat: 59.3300,
                lng: 18.0580,
                radius: 3000, // Very large radius to cover most of central Stockholm
                description: 'Central Stockholm area'
            },
            {
                name: 'Stockholm City',
                lat: 59.3350,
                lng: 18.0550,
                radius: 3000, // Very large radius
                description: 'Stockholm city area'
            }
        ];
        
        console.log('=== Checking known locations ===');
        console.log('User coordinates:', lat, lng);
        
        for (const location of knownLocations) {
            const distance = this.calculateDistance(lat, lng, location.lat, location.lng);
            console.log(`Distance to ${location.name}: ${Math.round(distance)}m (radius: ${location.radius}m)`);
            if (distance <= location.radius) {
                console.log(`✅ Found known location: ${location.name} (${Math.round(distance)}m away)`);
                return location;
            }
        }
        
        console.log('❌ No known location found within radius');
        return null;
    },


    async getRealStreetName(lat, lng) {
        try {
            console.log('Trying to get real street name for:', lat, lng);
            
            // Try multiple CORS proxies for Nominatim
            const proxies = [
                `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`)}`,
                `https://cors-anywhere.herokuapp.com/https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
                `https://thingproxy.freeboard.io/fetch/https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`
            ];
            
            for (let i = 0; i < proxies.length; i++) {
                try {
                    console.log(`Trying proxy ${i + 1}:`, proxies[i]);
                    const response = await fetch(proxies[i]);
                    console.log('Response status:', response.status);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Nominatim response:', data);
                        
                        // Extract street name from the response
                        let streetName = null;
                        
                        if (data.address) {
                            // Try different address fields to find street name
                            if (data.address.road) {
                                streetName = data.address.road;
                                console.log('Found road:', streetName);
                            } else if (data.address.pedestrian) {
                                streetName = data.address.pedestrian;
                                console.log('Found pedestrian way:', streetName);
                            } else if (data.address.footway) {
                                streetName = data.address.footway;
                                console.log('Found footway:', streetName);
                            } else if (data.address.cycleway) {
                                streetName = data.address.cycleway;
                                console.log('Found cycleway:', streetName);
                            } else if (data.address.suburb) {
                                streetName = data.address.suburb;
                                console.log('Found suburb:', streetName);
                            } else if (data.address.city_district) {
                                streetName = data.address.city_district;
                                console.log('Found city district:', streetName);
                            } else if (data.address.quarter) {
                                streetName = data.address.quarter;
                                console.log('Found quarter:', streetName);
                            }
                        }
                        
                        console.log('Final street name result:', streetName);
                        return streetName;
                    }
                } catch (proxyError) {
                    console.log(`Proxy ${i + 1} failed:`, proxyError);
                    continue;
                }
            }
            
            console.log('All proxies failed');
            return null;
            
        } catch (error) {
            console.error('Error getting street name:', error);
            return null;
        }
    },

    getVoiceLanguage() {
        if (!this.currentVoice || !this.currentVoice.lang) {
            return 'en'; // Default to English
        }
        
        // Extract language code from voice language (e.g., 'en-US' -> 'en')
        return this.currentVoice.lang.split('-')[0];
    },

    getAcceptLanguage(language) {
        // Map language codes to Nominatim accept-language format
        const languageMap = {
            'en': 'en',
            'sv': 'sv',
            'es': 'es',
            'fr': 'fr',
            'de': 'de',
            'it': 'it',
            'pt': 'pt',
            'ru': 'ru',
            'ja': 'ja',
            'ko': 'ko',
            'zh': 'zh'
        };
        
        return languageMap[language] || 'en';
    },

    getAnnouncementText(streetData) {
        const language = streetData.language;
        const streetName = streetData.name;
        
        // Multilingual announcement templates
        const announcements = {
            'en': `You are on ${streetName}`,
            'sv': `Du är på ${streetName}`,
            'es': `Estás en ${streetName}`,
            'fr': `Vous êtes sur ${streetName}`,
            'de': `Sie sind auf ${streetName}`,
            'it': `Sei su ${streetName}`,
            'pt': `Você está em ${streetName}`,
            'ru': `Вы находитесь на ${streetName}`,
            'ja': `${streetName}にいます`,
            'ko': `${streetName}에 있습니다`,
            'zh': `您在${streetName}`
        };
        
        return announcements[language] || announcements['en'];
    },

    // Fallback method for when geocoding fails
    getFallbackStreetName(lat, lng) {
        // Create a proper street name based on coordinates
        const latRounded = Math.round(lat * 10000) / 10000;
        const lngRounded = Math.round(lng * 10000) / 10000;
        
        // Create a more descriptive name
        let streetName = `Street ${latRounded}, ${lngRounded}`;
        
        // Try to determine area based on coordinates
        if (lat > 59.2 && lat < 59.5 && lng > 17.8 && lng < 18.3) {
            streetName = `Stockholm Street ${latRounded}, ${lngRounded}`;
        }
        
        console.log('Using fallback street name:', streetName);
        return {
            name: streetName,
            language: this.getVoiceLanguage(),
            fullAddress: `Area: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
        };
    },

    shouldAnnounce(streetName) {
        if (!this.ttsEnabled) return false;
        if (streetName === this.lastAnnouncedStreet) return false;
        
        const interval = parseInt(document.getElementById('announcement-interval').value) * 1000;
        const timeSinceLastAnnounce = Date.now() - (this.lastAnnounceTime || 0);
        
        return timeSinceLastAnnounce >= interval;
    },

    announceStreet(streetData) {
        if (!this.ttsEnabled) return;
        
        // Get the announcement text in the appropriate language
        const announcementText = this.getAnnouncementText(streetData);
        const utterance = new SpeechSynthesisUtterance(announcementText);
        
        // Set voice if one is selected
        if (this.currentVoice) {
            utterance.voice = this.currentVoice;
        }
        
        // Set language explicitly (helps on some mobile browsers)
        if (this.currentVoice && this.currentVoice.lang) {
            utterance.lang = this.currentVoice.lang;
        }
        
        utterance.rate = 0.8; // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        speechSynthesis.speak(utterance);
        
        // Update display
        document.getElementById('last-announced').textContent = streetData.name;
    },

    async announceCurrentLocation() {
        if (!this.currentPosition) {
            alert('No location available. Please start tracking first.');
            return;
        }
        
        const coords = this.currentPosition.coords;
        let streetData = await this.getStreetName(coords.latitude, coords.longitude);
        
        if (streetData && streetData.name) {
            document.getElementById('current-street').textContent = streetData.name;
            this.announceStreet(streetData);
            this.lastAnnouncedStreet = streetData.name;
            this.lastAnnounceTime = Date.now();
        }
    },

    updateStatus(message) {
        document.getElementById('tracking-status').textContent = message;
    },

    updateButtons() {
        const startBtn = document.getElementById('start-tracking');
        const stopBtn = document.getElementById('stop-tracking');
        const testBtn = document.getElementById('test-mode');
        
        if (this.isTracking) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            testBtn.disabled = true;
        } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
            testBtn.disabled = false;
        }
        
        // Update test mode button appearance
        if (this.testMode) {
            testBtn.classList.remove('bg-purple-500', 'hover:bg-purple-600');
            testBtn.classList.add('bg-orange-500', 'hover:bg-orange-600');
            testBtn.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Exit Test Mode
            `;
        } else {
            testBtn.classList.remove('bg-orange-500', 'hover:bg-orange-600');
            testBtn.classList.add('bg-purple-500', 'hover:bg-purple-600');
            testBtn.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                Test Mode
            `;
        }
    },

    toggleTestMode() {
        this.testMode = !this.testMode;
        console.log('Test mode toggled:', this.testMode);
        
        if (this.testMode) {
            this.updateStatus('Test mode active - Click on the map to test TTS');
            document.getElementById('current-mode').textContent = 'Test Mode';
            
            // Clear any existing test marker
            if (this.testMarker) {
                this.map.removeLayer(this.testMarker);
                this.testMarker = null;
            }
            
            // Clear location info
            document.getElementById('current-coords').textContent = 'Click on map';
            document.getElementById('current-street').textContent = 'Click on map';
            document.getElementById('last-announced').textContent = 'None';
        } else {
            this.updateStatus('Test mode disabled');
            document.getElementById('current-mode').textContent = 'Normal';
            
            // Remove test marker
            if (this.testMarker) {
                this.map.removeLayer(this.testMarker);
                this.testMarker = null;
            }
            
            // Clear location info
            document.getElementById('current-coords').textContent = 'Not available';
            document.getElementById('current-street').textContent = 'Not available';
            document.getElementById('last-announced').textContent = 'None';
        }
        
        this.updateButtons();
    },

    async onTestMapClick(latlng) {
        console.log('Map clicked in test mode:', this.testMode, latlng);
        if (!this.testMode) return;
        
        const lat = latlng.lat;
        const lng = latlng.lng;
        console.log('Processing click at:', lat, lng);
        
        // Update coordinates display
        document.getElementById('current-coords').textContent = 
            `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        
        // Update map with test marker
        this.updateTestMap(lat, lng);
        
        // Get street name for clicked location
        console.log('Getting street name for:', lat, lng);
        let streetData = await this.getStreetName(lat, lng);
        console.log('Street data received:', streetData);
        
        if (streetData && streetData.name) {
            document.getElementById('current-street').textContent = streetData.name;
            
            // Announce the street name
            console.log('Announcing street:', streetData.name);
            this.announceStreet(streetData);
            this.lastAnnouncedStreet = streetData.name;
            this.lastAnnounceTime = Date.now();
        }
    },

    updateTestMap(lat, lng) {
        if (!this.map) return;
        
        // Remove existing test marker
        if (this.testMarker) {
            this.map.removeLayer(this.testMarker);
        }
        
        // Add test marker
        this.testMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'test-marker',
                html: '<div style="background-color: #f59e0b; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(this.map);
        
        // Bind popup
        this.testMarker.bindPopup('Test location - Click to announce street name')
            .openPopup();
        
        // Center map on test location
        this.map.setView([lat, lng], 15);
    },

    // POI Mode Methods
    togglePOIMode() {
        this.poiMode = !this.poiMode;
        console.log('POI mode toggled:', this.poiMode);
        
        if (this.poiMode) {
            this.updateStatus('POI mode active - Will announce nearby attractions');
            document.getElementById('current-mode').textContent = 'POI Mode';
        } else {
            this.updateStatus('POI mode disabled');
            document.getElementById('current-mode').textContent = 'Normal';
            this.nearbyPOIs = [];
            this.updatePOIList();
            document.getElementById('nearby-count').textContent = '0';
        }
        
        this.updateButtons();
    },

    async getNearbyPOIs(lat, lng) {
        try {
            console.log('Getting nearby POIs for:', lat, lng, 'radius:', this.announcementRadius);
            
            // Use known POIs (no external API calls to avoid CORS issues)
            const knownPOIs = this.getKnownPOIs(lat, lng);
            console.log('Found known POIs:', knownPOIs);
            this.processPOIData(knownPOIs, lat, lng);
            
        } catch (error) {
            console.error('Error fetching POIs:', error);
            this.updateStatus('Error fetching attractions');
            this.processPOIData([], lat, lng);
        }
    },

    getKnownPOIs(lat, lng) {
        // Known POIs in Stockholm for testing
        const knownPOIs = [
            {
                id: 'vasamuseet',
                lat: 59.3289,
                lon: 18.0903,
                tags: {
                    name: 'Vasa Museum',
                    tourism: 'museum'
                }
            },
            {
                id: 'royalpalace',
                lat: 59.3266,
                lon: 18.0719,
                tags: {
                    name: 'Royal Palace',
                    historic: 'castle'
                }
            },
            {
                id: 'storkyrkan',
                lat: 59.3256,
                lon: 18.0706,
                tags: {
                    name: 'Storkyrkan',
                    amenity: 'place_of_worship'
                }
            },
            {
                id: 'skansen',
                lat: 59.3233,
                lon: 18.1036,
                tags: {
                    name: 'Skansen',
                    tourism: 'attraction'
                }
            },
            {
                id: 'modernamuseet',
                lat: 59.3230, // slightly different coordinates
                lon: 18.1040,
                tags: {
                    name: 'Moderna Museet',
                    tourism: 'museum'
                }
            },
            {
                id: 'gamlastan',
                lat: 59.3258,
                lon: 18.0708,
                tags: {
                    name: 'Gamla Stan',
                    historic: 'district'
                }
            },
            {
                id: 'centralstation',
                lat: 59.3300,
                lon: 18.0580,
                tags: {
                    name: 'Stockholm Central Station',
                    railway: 'station'
                }
            },
            {
                id: 'cityhall',
                lat: 59.3270,
                lon: 18.0520,
                tags: {
                    name: 'City Hall',
                    amenity: 'townhall'
                }
            }
        ];
        
        const nearbyPOIs = [];
        console.log('=== Checking known POIs ===');
        console.log('User coordinates:', lat, lng, 'radius:', this.announcementRadius);
        
        for (const poi of knownPOIs) {
            const distance = this.calculateDistance(lat, lng, poi.lat, poi.lon);
            console.log(`Distance to ${poi.tags.name}: ${Math.round(distance)}m (radius: ${this.announcementRadius}m)`);
            if (distance <= this.announcementRadius) {
                nearbyPOIs.push(poi);
                console.log(`✅ Added POI: ${poi.tags.name} (${Math.round(distance)}m away)`);
            }
        }
        
        console.log(`Found ${nearbyPOIs.length} nearby POIs`);
        return nearbyPOIs;
    },

    processPOIData(elements, userLat, userLng) {
        console.log('Processing POI data:', elements);
        this.nearbyPOIs = [];
        
        elements.forEach(element => {
            const lat = element.lat || element.center?.lat;
            const lon = element.lon || element.center?.lon;
            
            if (!lat || !lon) {
                console.warn('Invalid coordinates for element:', element);
                return;
            }
            
            // Calculate distance
            const distance = this.calculateDistance(userLat, userLng, lat, lon);
            
            if (distance <= this.announcementRadius) {
                const poi = {
                    id: element.id,
                    name: element.tags?.name || 'Unnamed attraction',
                    type: this.getPOIType(element.tags || {}),
                    lat: lat,
                    lon: lon,
                    distance: Math.round(distance),
                    tags: element.tags || {}
                };
                
                this.nearbyPOIs.push(poi);
                console.log('Added POI:', poi);
            }
        });
        
        // Sort by distance
        this.nearbyPOIs.sort((a, b) => a.distance - b.distance);
        
        console.log('Final POI list:', this.nearbyPOIs);
        
        // Update UI
        this.updatePOIList();
        document.getElementById('nearby-count').textContent = this.nearbyPOIs.length;
        
        // Update map with POI markers
        this.updateMapWithPOIs();
    },

    getPOIType(tags) {
        if (tags.tourism === 'museum') return 'Museum';
        if (tags.tourism === 'attraction') return 'Attraction';
        if (tags.historic) return 'Historic Site';
        if (tags.amenity === 'place_of_worship') return 'Place of Worship';
        return 'Point of Interest';
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    },

    updatePOIList() {
        const poiList = document.getElementById('poi-list');
        poiList.innerHTML = '';
        
        if (this.nearbyPOIs.length === 0) {
            poiList.innerHTML = '<div class="text-gray-500 text-sm">No attractions found nearby</div>';
            return;
        }
        
        this.nearbyPOIs.forEach(poi => {
            const poiItem = document.createElement('div');
            poiItem.className = 'flex justify-between items-center p-2 bg-gray-50 rounded';
            poiItem.innerHTML = `
                <div>
                    <div class="font-medium">${poi.name}</div>
                    <div class="text-sm text-gray-600">${poi.type} • ${poi.distance}m</div>
                </div>
                <button class="btn-secondary text-xs" onclick="window.ttsTourist.announcePOI('${poi.id}')">
                    Announce
                </button>
            `;
            poiList.appendChild(poiItem);
        });
    },

    updateMapWithPOIs() {
        if (!this.map) return;
        
        // Remove existing POI markers
        this.map.eachLayer(layer => {
            if (layer.poiMarker) {
                this.map.removeLayer(layer);
            }
        });
        
        // Add POI markers
        this.nearbyPOIs.forEach(poi => {
            const marker = L.marker([poi.lat, poi.lon]).addTo(this.map);
            marker.poiMarker = true;
            marker.bindPopup(`
                <strong>${poi.name}</strong><br>
                <em>${poi.type}</em><br>
                Distance: ${poi.distance}m
            `);
        });
    },

    checkForPOIAnnouncements() {
        if (!this.ttsEnabled || this.nearbyPOIs.length === 0) return;
        
        const closestPOI = this.nearbyPOIs[0];
        const interval = parseInt(document.getElementById('announcement-interval').value) * 1000; // Convert to milliseconds
        const timeSinceLastAnnounce = Date.now() - (this.lastAnnounceTime || 0);
        
        // Announce if POI is close enough and enough time has passed
        if (closestPOI.distance <= this.announcementRadius && 
            (closestPOI.id !== this.lastAnnouncedPOI || timeSinceLastAnnounce >= interval)) {
            this.announcePOI(closestPOI.id);
        }
    },

    announcePOI(poiId) {
        const poi = this.nearbyPOIs.find(p => p.id === poiId);
        if (!poi) return;
        
        const announcementText = this.getPOIAnnouncementText(poi);
        const utterance = new SpeechSynthesisUtterance(announcementText);
        
        if (this.currentVoice) {
            utterance.voice = this.currentVoice;
        }
        
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        speechSynthesis.speak(utterance);
        
        // Update display
        document.getElementById('last-announced').textContent = poi.name;
        this.lastAnnouncedPOI = poi.id;
        this.lastAnnounceTime = Date.now();
    },

    getPOIAnnouncementText(poi) {
        const language = this.getVoiceLanguage();
        const distance = poi.distance < 50 ? 'very close to' : 'approaching';
        
        const announcements = {
            'en': `You are ${distance} ${poi.name}, a ${poi.type.toLowerCase()}`,
            'sv': `Du är ${distance === 'very close to' ? 'mycket nära' : 'närmar dig'} ${poi.name}, en ${poi.type.toLowerCase()}`
        };
        
        return announcements[language] || announcements['en'];
    },

};
