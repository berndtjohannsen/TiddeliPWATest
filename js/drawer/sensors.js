import { DrawerUtils } from './utils.js';

export const SensorsHandler = {
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        
        mainContent.innerHTML = `
            <div class="space-y-4">
                <h2 class="text-lg font-semibold mb-2">Available Sensors & Live Values</h2>
                <ul class="list-disc pl-6 text-base" id="sensor-list">
                    <!-- Motion Sensors -->
                    <li id="sensor-accel">Accelerometer: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-gyro">Gyroscope: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-linaccel">Linear Acceleration: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-gravity">Gravity: <span class="sensor-value">Checking...</span></li>
                    
                    <!-- Orientation Sensors -->
                    <li id="sensor-absori">Absolute Orientation: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-relori">Relative Orientation: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-magnet">Magnetometer: <span class="sensor-value">Checking...</span></li>
                    
                    <!-- Environmental Sensors -->
                    <li id="sensor-light">Ambient Light: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-proximity">Proximity: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-humidity">Humidity: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-pressure">Barometric Pressure: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-temperature">Temperature: <span class="sensor-value">Checking...</span></li>
                    
                    <!-- Location Sensors -->
                    <li id="sensor-geo">Geolocation: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-altitude">Altitude: <span class="sensor-value">Checking...</span></li>
                    
                    <!-- Device Sensors -->
                    <li id="sensor-battery">Battery: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-network">Network Status: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-vibration">Vibration: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-wake-lock">Wake Lock: <span class="sensor-value">Checking...</span></li>
                    
                    <!-- Media Sensors -->
                    <li id="sensor-camera">Camera: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-microphone">Microphone: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-audio">Audio Input: <span class="sensor-value">Checking...</span></li>
                    
                    <!-- Biometric Sensors -->
                    <li id="sensor-fingerprint">Fingerprint: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-face">Face ID: <span class="sensor-value">Checking...</span></li>
                    
                    <!-- Advanced Sensors -->
                    <li id="sensor-nfc">NFC: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-bluetooth">Bluetooth: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-usb">USB: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-gamepad">Gamepad: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-midi">MIDI: <span class="sensor-value">Checking...</span></li>
                </ul>
                <p class="text-xs text-gray-500 mt-2">
                    Note: Most sensors require permission and may not be supported on all devices/browsers.
                    Some sensors are experimental or not yet widely supported.
                </p>
            </div>
        `;

        this.initAccelerometer();
        this.initGyroscope();
        this.initGeolocation();
        this.initBattery();
        this.initAmbientLight();
        this.initMagnetometer();
        this.initOrientationSensors();
        this.initLinearAcceleration();
        this.initGravity();
        this.initCamera();
        this.initNetworkStatus();
        this.initVibration();
        this.initWakeLock();
        this.initMicrophone();
        this.initAudioInput();
        this.initFingerprint();
        this.initFaceID();
        this.initNFC();
        this.initBluetooth();
        this.initUSB();
        this.initGamepad();
        this.initMIDI();
        this.initTemperature();
        this.initProximity();
    },

    initAccelerometer() {
        const accelEl = document.querySelector('#sensor-accel .sensor-value');
        if ('ondevicemotion' in window) {
            window.addEventListener('devicemotion', function handler(e) {
                if (e.acceleration && (e.acceleration.x || e.acceleration.y || e.acceleration.z)) {
                    accelEl.textContent = `x: ${e.acceleration.x?.toFixed(2)}, y: ${e.acceleration.y?.toFixed(2)}, z: ${e.acceleration.z?.toFixed(2)}`;
                    window.removeEventListener('devicemotion', handler);
                }
            });
            setTimeout(() => { if (accelEl.textContent === 'Checking...') accelEl.textContent = 'No data (try on mobile)'; }, 2000);
        } else {
            accelEl.textContent = 'Not available';
        }
    },

    initGyroscope() {
        const gyroEl = document.querySelector('#sensor-gyro .sensor-value');
        if ('ondeviceorientation' in window) {
            window.addEventListener('deviceorientation', function handler(e) {
                if (e.alpha || e.beta || e.gamma) {
                    gyroEl.textContent = `α: ${e.alpha?.toFixed(1)}, β: ${e.beta?.toFixed(1)}, γ: ${e.gamma?.toFixed(1)}`;
                    window.removeEventListener('deviceorientation', handler);
                }
            });
            setTimeout(() => { if (gyroEl.textContent === 'Checking...') gyroEl.textContent = 'No data (try on mobile)'; }, 2000);
        } else {
            gyroEl.textContent = 'Not available';
        }
    },

    initGeolocation() {
        const geoEl = document.querySelector('#sensor-geo .sensor-value');
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                pos => geoEl.textContent = `lat: ${pos.coords.latitude.toFixed(5)}, lon: ${pos.coords.longitude.toFixed(5)}`,
                err => geoEl.textContent = 'Permission denied or unavailable'
            );
        } else {
            geoEl.textContent = 'Not available';
        }
    },

    initBattery() {
        const batteryEl = document.querySelector('#sensor-battery .sensor-value');
        if ('getBattery' in navigator) {
            navigator.getBattery().then(bat => {
                batteryEl.textContent = `${(bat.level * 100).toFixed(0)}%`;
            });
        } else {
            batteryEl.textContent = 'Not available';
        }
    },

    initAmbientLight() {
        const lightEl = document.querySelector('#sensor-light .sensor-value');
        if ('AmbientLightSensor' in window) {
            try {
                const sensor = new window.AmbientLightSensor();
                sensor.addEventListener('reading', () => {
                    lightEl.textContent = `${sensor.illuminance} lux`;
                });
                sensor.addEventListener('error', () => {
                    lightEl.textContent = 'Permission denied or unavailable';
                });
                sensor.start();
            } catch {
                lightEl.textContent = 'Not available';
            }
        } else {
            lightEl.textContent = 'Not available';
        }
    },

    initMagnetometer() {
        const magnetEl = document.querySelector('#sensor-magnet .sensor-value');
        
        // Try the new Magnetometer API first
        if ('Magnetometer' in window) {
            try {
                const sensor = new window.Magnetometer();
                sensor.addEventListener('reading', () => {
                    magnetEl.textContent = `x: ${sensor.x?.toFixed(2)}, y: ${sensor.y?.toFixed(2)}, z: ${sensor.z?.toFixed(2)}`;
                });
                sensor.addEventListener('error', () => {
                    // Fall back to legacy API if new API fails
                    initLegacyMagnetometer(magnetEl);
                });
                sensor.start();
            } catch {
                // Fall back to legacy API if new API is not available
                initLegacyMagnetometer(magnetEl);
            }
        } else {
            // Use legacy API if new API is not supported
            initLegacyMagnetometer(magnetEl);
        }

        function initLegacyMagnetometer(element) {
            if ('ondeviceorientation' in window) {
                window.addEventListener('deviceorientation', function handler(e) {
                    if (e.alpha !== null || e.beta !== null || e.gamma !== null) {
                        // Convert orientation to magnetic field values
                        const x = Math.round(e.alpha || 0);
                        const y = Math.round(e.beta || 0);
                        const z = Math.round(e.gamma || 0);
                        element.textContent = `x: ${x}, y: ${y}, z: ${z}`;
                        window.removeEventListener('deviceorientation', handler);
                    }
                });
                setTimeout(() => { 
                    if (element.textContent === 'Checking...') 
                        element.textContent = 'No data (try on mobile)'; 
                }, 2000);
            } else {
                element.textContent = 'Not available';
            }
        }
    },

    initOrientationSensors() {
        // Absolute Orientation
        const absoriEl = document.querySelector('#sensor-absori .sensor-value');
        if ('AbsoluteOrientationSensor' in window) {
            try {
                const sensor = new window.AbsoluteOrientationSensor();
                sensor.addEventListener('reading', () => {
                    absoriEl.textContent = 'Available';
                });
                sensor.addEventListener('error', () => {
                    absoriEl.textContent = 'Permission denied or unavailable';
                });
                sensor.start();
            } catch {
                absoriEl.textContent = 'Not available';
            }
        } else {
            absoriEl.textContent = 'Not available';
        }

        // Relative Orientation
        const reloriEl = document.querySelector('#sensor-relori .sensor-value');
        if ('RelativeOrientationSensor' in window) {
            try {
                const sensor = new window.RelativeOrientationSensor();
                sensor.addEventListener('reading', () => {
                    reloriEl.textContent = 'Available';
                });
                sensor.addEventListener('error', () => {
                    reloriEl.textContent = 'Permission denied or unavailable';
                });
                sensor.start();
            } catch {
                reloriEl.textContent = 'Not available';
            }
        } else {
            reloriEl.textContent = 'Not available';
        }
    },

    initLinearAcceleration() {
        const linaccelEl = document.querySelector('#sensor-linaccel .sensor-value');
        if ('LinearAccelerationSensor' in window) {
            try {
                const sensor = new window.LinearAccelerationSensor();
                sensor.addEventListener('reading', () => {
                    linaccelEl.textContent = `x: ${sensor.x?.toFixed(2)}, y: ${sensor.y?.toFixed(2)}, z: ${sensor.z?.toFixed(2)}`;
                });
                sensor.addEventListener('error', () => {
                    linaccelEl.textContent = 'Permission denied or unavailable';
                });
                sensor.start();
            } catch {
                linaccelEl.textContent = 'Not available';
            }
        } else {
            linaccelEl.textContent = 'Not available';
        }
    },

    initGravity() {
        const gravityEl = document.querySelector('#sensor-gravity .sensor-value');
        if ('GravitySensor' in window) {
            try {
                const sensor = new window.GravitySensor();
                sensor.addEventListener('reading', () => {
                    gravityEl.textContent = `x: ${sensor.x?.toFixed(2)}, y: ${sensor.y?.toFixed(2)}, z: ${sensor.z?.toFixed(2)}`;
                });
                sensor.addEventListener('error', () => {
                    gravityEl.textContent = 'Permission denied or unavailable';
                });
                sensor.start();
            } catch {
                gravityEl.textContent = 'Not available';
            }
        } else {
            gravityEl.textContent = 'Not available';
        }
    },

    initCamera() {
        const camEl = document.querySelector('#sensor-camera .sensor-value');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            camEl.textContent = 'Available (see Camera option)';
        } else {
            camEl.textContent = 'Not available';
        }
    },

    initNetworkStatus() {
        const networkEl = document.querySelector('#sensor-network .sensor-value');
        if ('connection' in navigator) {
            const updateNetworkInfo = () => {
                const conn = navigator.connection;
                networkEl.textContent = `${conn.effectiveType} (${conn.downlink}Mbps)`;
            };
            navigator.connection.addEventListener('change', updateNetworkInfo);
            updateNetworkInfo();
        } else {
            networkEl.textContent = 'Not available';
        }
    },

    initVibration() {
        const vibEl = document.querySelector('#sensor-vibration .sensor-value');
        if ('vibrate' in navigator) {
            vibEl.textContent = 'Available';
        } else {
            vibEl.textContent = 'Not available';
        }
    },

    initWakeLock() {
        const wakeEl = document.querySelector('#sensor-wake-lock .sensor-value');
        if ('wakeLock' in navigator) {
            wakeEl.textContent = 'Available';
        } else {
            wakeEl.textContent = 'Not available';
        }
    },

    initMicrophone() {
        const micEl = document.querySelector('#sensor-microphone .sensor-value');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            micEl.textContent = 'Available';
        } else {
            micEl.textContent = 'Not available';
        }
    },

    initAudioInput() {
        const audioEl = document.querySelector('#sensor-audio .sensor-value');
        if (window.AudioContext || window.webkitAudioContext) {
            audioEl.textContent = 'Available';
        } else {
            audioEl.textContent = 'Not available';
        }
    },

    initFingerprint() {
        const fpEl = document.querySelector('#sensor-fingerprint .sensor-value');
        if (window.PublicKeyCredential) {
            fpEl.textContent = 'Available';
        } else {
            fpEl.textContent = 'Not available';
        }
    },

    initFaceID() {
        const faceEl = document.querySelector('#sensor-face .sensor-value');
        if (window.PublicKeyCredential) {
            faceEl.textContent = 'Available';
        } else {
            faceEl.textContent = 'Not available';
        }
    },

    initNFC() {
        const nfcEl = document.querySelector('#sensor-nfc .sensor-value');
        if ('NDEFReader' in window) {
            nfcEl.textContent = 'Available';
        } else {
            nfcEl.textContent = 'Not available';
        }
    },

    initBluetooth() {
        const btEl = document.querySelector('#sensor-bluetooth .sensor-value');
        if ('bluetooth' in navigator) {
            btEl.textContent = 'Available';
        } else {
            btEl.textContent = 'Not available';
        }
    },

    initUSB() {
        const usbEl = document.querySelector('#sensor-usb .sensor-value');
        if ('usb' in navigator) {
            usbEl.textContent = 'Available';
        } else {
            usbEl.textContent = 'Not available';
        }
    },

    initGamepad() {
        const gamepadEl = document.querySelector('#sensor-gamepad .sensor-value');
        if ('getGamepads' in navigator) {
            gamepadEl.textContent = 'Available';
        } else {
            gamepadEl.textContent = 'Not available';
        }
    },

    initMIDI() {
        const midiEl = document.querySelector('#sensor-midi .sensor-value');
        if ('requestMIDIAccess' in navigator) {
            midiEl.textContent = 'Available';
        } else {
            midiEl.textContent = 'Not available';
        }
    },

    initTemperature() {
        const tempEl = document.querySelector('#sensor-temperature .sensor-value');
        if ('TemperatureSensor' in window) {
            try {
                const sensor = new window.TemperatureSensor();
                sensor.addEventListener('reading', () => {
                    tempEl.textContent = `${sensor.temperature.toFixed(1)}°C`;
                });
                sensor.addEventListener('error', () => {
                    tempEl.textContent = 'Permission denied or unavailable';
                });
                sensor.start();
            } catch {
                tempEl.textContent = 'Not available';
            }
        } else {
            tempEl.textContent = 'Not available';
        }
    },

    initProximity() {
        const proxEl = document.querySelector('#sensor-proximity .sensor-value');
        if ('ProximitySensor' in window) {
            try {
                const sensor = new window.ProximitySensor();
                sensor.addEventListener('reading', () => {
                    if (sensor.near) {
                        proxEl.textContent = 'Near';
                    } else {
                        proxEl.textContent = 'Far';
                    }
                });
                sensor.addEventListener('error', () => {
                    proxEl.textContent = 'Permission denied or unavailable';
                });
                sensor.start();
            } catch {
                proxEl.textContent = 'Not available';
            }
        } else {
            proxEl.textContent = 'Not available';
        }
    }
}; 