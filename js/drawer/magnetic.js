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
                            <div id="compass-img" class="w-full h-full transition-transform duration-200" style="transform: rotate(0deg);">
                                <svg viewBox="0 0 100 100" class="w-full h-full">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#4B5563" stroke-width="2"/>
                                    <path d="M50 5 L55 45 L50 50 L45 45 Z" fill="#EF4444"/>
                                    <path d="M50 95 L45 55 L50 50 L55 55 Z" fill="#4B5563"/>
                                    <text x="50" y="30" text-anchor="middle" fill="#4B5563" font-size="12">N</text>
                                    <text x="50" y="75" text-anchor="middle" fill="#4B5563" font-size="12">S</text>
                                    <text x="75" y="50" text-anchor="middle" fill="#4B5563" font-size="12">E</text>
                                    <text x="25" y="50" text-anchor="middle" fill="#4B5563" font-size="12">W</text>
                                </svg>
                            </div>
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
                    this.startLegacySensor(supportDiv, compassImg, headingSpan, xSpan, ySpan, zSpan, strengthSpan, errorDiv);
                });
                this.sensor.start();
            } catch (err) {
                console.log('Modern API not available, falling back to legacy API');
                this.startLegacySensor(supportDiv, compassImg, headingSpan, xSpan, ySpan, zSpan, strengthSpan, errorDiv);
            }
        } else {
            console.log('Modern API not supported, using legacy API');
            this.startLegacySensor(supportDiv, compassImg, headingSpan, xSpan, ySpan, zSpan, strengthSpan, errorDiv);
        }
    },

    startLegacySensor(supportDiv, compassImg, headingSpan, xSpan, ySpan, zSpan, strengthSpan, errorDiv) {
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
        
        // Update compass display
        headingSpan.textContent = heading.toFixed(0) + '°';
        compassImg.style.transform = `rotate(${-heading}deg)`;
    },

    initCompass() {
        const compassEl = document.querySelector('#compass');
        const headingEl = document.querySelector('#heading');
        const valuesEl = document.querySelector('#values');
        let lastHeading = 0;
        let smoothHeading = 0;
        const smoothingFactor = 0.1; // Adjust this value between 0 and 1 (lower = smoother)
        const headingHistory = [];
        const historySize = 5;

        if ('Magnetometer' in window) {
            try {
                const sensor = new window.Magnetometer({ frequency: 60 }); // 60 Hz for smooth updates
                sensor.addEventListener('reading', () => {
                    // Get raw values
                    const x = sensor.x;
                    const y = sensor.y;
                    const z = sensor.z;

                    // Calculate heading using atan2 for better accuracy
                    let heading = Math.atan2(y, x) * (180 / Math.PI);
                    if (heading < 0) heading += 360;

                    // Add to history
                    headingHistory.push(heading);
                    if (headingHistory.length > historySize) {
                        headingHistory.shift();
                    }

                    // Calculate moving average
                    const avgHeading = headingHistory.reduce((a, b) => a + b, 0) / headingHistory.length;

                    // Apply smoothing
                    smoothHeading = smoothHeading + (avgHeading - smoothHeading) * smoothingFactor;

                    // Handle the 0/360 transition smoothly
                    if (Math.abs(smoothHeading - lastHeading) > 180) {
                        if (smoothHeading > lastHeading) {
                            smoothHeading -= 360;
                        } else {
                            smoothHeading += 360;
                        }
                    }

                    // Update compass rotation with smooth transition
                    compassEl.style.transform = `rotate(${-smoothHeading}deg)`;
                    lastHeading = smoothHeading;

                    // Update heading text
                    const cardinal = this.getCardinalDirection(smoothHeading);
                    headingEl.textContent = `${smoothHeading.toFixed(1)}° ${cardinal}`;

                    // Update raw values
                    valuesEl.textContent = `x: ${x.toFixed(2)} µT, y: ${y.toFixed(2)} µT, z: ${z.toFixed(2)} µT`;
                });
                sensor.addEventListener('error', () => {
                    headingEl.textContent = 'Permission denied or unavailable';
                    valuesEl.textContent = 'No data available';
                });
                sensor.start();
            } catch {
                headingEl.textContent = 'Not available';
                valuesEl.textContent = 'No data available';
            }
        } else {
            headingEl.textContent = 'Not available';
            valuesEl.textContent = 'No data available';
        }
    },

    getCardinalDirection(heading) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(heading / 45) % 8;
        return directions[index];
    }
}; 