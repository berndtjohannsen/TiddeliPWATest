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
                    <li id="sensor-accel">Accelerometer: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-gyro">Gyroscope: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-geo">Geolocation: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-battery">Battery: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-light">Ambient Light: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-magnet">Magnetometer: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-absori">Absolute Orientation: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-relori">Relative Orientation: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-linaccel">Linear Acceleration: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-gravity">Gravity: <span class="sensor-value">Checking...</span></li>
                    <li id="sensor-camera">Camera/Microphone: <span class="sensor-value">Checking...</span></li>
                </ul>
                <p class="text-xs text-gray-500 mt-2">
                    Note: Some sensors may require permission or may not be supported on all devices/browsers.
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
        if ('Magnetometer' in window) {
            try {
                const sensor = new window.Magnetometer();
                sensor.addEventListener('reading', () => {
                    magnetEl.textContent = `x: ${sensor.x?.toFixed(2)}, y: ${sensor.y?.toFixed(2)}, z: ${sensor.z?.toFixed(2)}`;
                });
                sensor.addEventListener('error', () => {
                    magnetEl.textContent = 'Permission denied or unavailable';
                });
                sensor.start();
            } catch {
                magnetEl.textContent = 'Not available';
            }
        } else {
            magnetEl.textContent = 'Not available';
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
    }
}; 