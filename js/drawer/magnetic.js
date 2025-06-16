import { DrawerUtils } from './utils.js';

export const MagneticHandler = {
    sensor: null,
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">Magnetic Sensor (Magnetometer)</h2>
                <div class="card">
                    <h3 class="card-title">Compass & Raw Data</h3>
                    <div id="magnetometer-support" class="mb-2 text-gray-600"></div>
                    <div class="flex flex-col items-center gap-4">
                        <div class="relative w-32 h-32 mb-2">
                            <img id="compass-img" src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Compass_rose_pale.svg" alt="Compass" class="w-full h-full transition-transform duration-200" style="transform: rotate(0deg);" />
                            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span id="compass-heading" class="text-lg font-bold text-indigo-700 bg-white bg-opacity-80 rounded px-2 py-1">--°</span>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div><b>X:</b> <span id="mag-x">--</span> µT</div>
                            <div><b>Y:</b> <span id="mag-y">--</span> µT</div>
                            <div><b>Z:</b> <span id="mag-z">--</span> µT</div>
                            <div><b>Strength:</b> <span id="mag-strength">--</span> µT</div>
                        </div>
                        <div id="mag-error" class="text-red-600 text-sm mt-2"></div>
                    </div>
                </div>
            </div>
        `;
        this.startSensor();
    },
    startSensor() {
        const supportDiv = document.getElementById('magnetometer-support');
        const compassImg = document.getElementById('compass-img');
        const headingSpan = document.getElementById('compass-heading');
        const xSpan = document.getElementById('mag-x');
        const ySpan = document.getElementById('mag-y');
        const zSpan = document.getElementById('mag-z');
        const strengthSpan = document.getElementById('mag-strength');
        const errorDiv = document.getElementById('mag-error');

        // Try modern API first
        if ('Magnetometer' in window) {
            supportDiv.textContent = 'Magnetometer supported on this device/browser.';
            try {
                this.sensor = new Magnetometer({ frequency: 10 });
                this.sensor.addEventListener('reading', () => {
                    const x = this.sensor.x;
                    const y = this.sensor.y;
                    const z = this.sensor.z;
                    this.updateDisplay(x, y, z, compassImg, headingSpan, xSpan, ySpan, zSpan, strengthSpan);
                });
                this.sensor.addEventListener('error', event => {
                    console.log('Modern API failed, falling back to legacy API');
                    this.startLegacySensor(compassImg, headingSpan, xSpan, ySpan, zSpan, strengthSpan, errorDiv);
                });
                this.sensor.start();
            } catch (err) {
                console.log('Modern API not available, falling back to legacy API');
                this.startLegacySensor(compassImg, headingSpan, xSpan, ySpan, zSpan, strengthSpan, errorDiv);
            }
        } else {
            console.log('Modern API not supported, using legacy API');
            this.startLegacySensor(compassImg, headingSpan, xSpan, ySpan, zSpan, strengthSpan, errorDiv);
        }
    },

    startLegacySensor(compassImg, headingSpan, xSpan, ySpan, zSpan, strengthSpan, errorDiv) {
        if ('ondeviceorientation' in window) {
            supportDiv.textContent = 'Using device orientation for magnetic data.';
            window.addEventListener('deviceorientation', (e) => {
                if (e.alpha !== null || e.beta !== null || e.gamma !== null) {
                    // Convert orientation to magnetic field values
                    const x = e.alpha || 0;
                    const y = e.beta || 0;
                    const z = e.gamma || 0;
                    this.updateDisplay(x, y, z, compassImg, headingSpan, xSpan, ySpan, zSpan, strengthSpan);
                }
            });
        } else {
            supportDiv.textContent = 'Magnetic sensor not supported on this device/browser.';
            errorDiv.textContent = 'Try using Chrome on Android with a device that has a magnetic sensor.';
        }
    },

    updateDisplay(x, y, z, compassImg, headingSpan, xSpan, ySpan, zSpan, strengthSpan) {
        xSpan.textContent = x.toFixed(2);
        ySpan.textContent = y.toFixed(2);
        zSpan.textContent = z.toFixed(2);
        const strength = Math.sqrt(x*x + y*y + z*z);
        strengthSpan.textContent = strength.toFixed(2);
        // Calculate heading (in degrees, 0 = north)
        let heading = Math.atan2(y, x) * (180 / Math.PI);
        if (heading < 0) heading += 360;
        headingSpan.textContent = heading.toFixed(0) + '°';
        compassImg.style.transform = `rotate(${-heading}deg)`;
    }
}; 