import { DrawerUtils } from './utils.js';

export const SpeedHandler = {
    watchId: null,
    lastPos: null,
    lastTime: null,
    speed: 0,
    unit: 'kmh', // 'kmh' or 'mph'
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">Speed Demo (GPS)</h2>
                <div class="card flex flex-col items-center gap-6">
                    <div>
                        <h3 class="card-title mb-2">Speedometer</h3>
                        <canvas id="speedo-canvas" width="220" height="120" class="bg-gray-100 rounded shadow"></canvas>
                        <div class="flex items-center gap-4 mt-2">
                            <span id="speedo-digital" class="font-mono text-3xl bg-black text-green-400 px-4 py-2 rounded">--</span>
                            <span id="speedo-unit" class="text-lg">km/h</span>
                            <button id="speedo-toggle" class="btn-secondary text-xs">Toggle km/h ↔ mph</button>
                        </div>
                        <div class="flex gap-4 mt-2 text-sm">
                            <span>Accuracy: <span id="speedo-accuracy">--</span> m</span>
                            <span id="speedo-status" class="text-gray-600">Waiting for GPS...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.unit = 'kmh';
        this.lastPos = null;
        this.lastTime = null;
        this.speed = 0;
        this.initEvents();
        this.startGPS();
    },
    initEvents() {
        document.getElementById('speedo-toggle').onclick = () => {
            this.unit = this.unit === 'kmh' ? 'mph' : 'kmh';
            document.getElementById('speedo-unit').textContent = this.unit === 'kmh' ? 'km/h' : 'mph';
            this.updateDisplay();
        };
    },
    startGPS() {
        const statusSpan = document.getElementById('speedo-status');
        const accuracySpan = document.getElementById('speedo-accuracy');
        if (!('geolocation' in navigator)) {
            statusSpan.textContent = 'Geolocation not supported.';
            return;
        }
        this.watchId = navigator.geolocation.watchPosition(
            pos => {
                const coords = pos.coords;
                accuracySpan.textContent = coords.accuracy ? coords.accuracy.toFixed(0) : '--';
                statusSpan.textContent = coords.accuracy && coords.accuracy < 25 ? 'GPS OK' : 'Low accuracy';
                let speed = coords.speed;
                if (speed == null || isNaN(speed)) {
                    // Fallback: calculate from last position
                    if (this.lastPos) {
                        const dt = (pos.timestamp - this.lastTime) / 1000;
                        if (dt > 0) {
                            const d = this.haversine(this.lastPos.latitude, this.lastPos.longitude, coords.latitude, coords.longitude);
                            speed = d / dt; // m/s
                        }
                    }
                }
                this.lastPos = coords;
                this.lastTime = pos.timestamp;
                this.speed = speed != null && !isNaN(speed) ? speed : 0;
                this.updateDisplay();
            },
            err => {
                statusSpan.textContent = 'GPS error: ' + err.message;
            },
            { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
        );
    },
    updateDisplay() {
        // Convert speed to selected unit
        let speedVal = this.speed * (this.unit === 'kmh' ? 3.6 : 2.23694); // m/s to km/h or mph
        speedVal = Math.max(0, speedVal);
        document.getElementById('speedo-digital').textContent = speedVal ? speedVal.toFixed(1) : '--';
        // Draw analog gauge
        const canvas = document.getElementById('speedo-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw arc (0-120 km/h or 0-80 mph)
        const maxVal = this.unit === 'kmh' ? 120 : 80;
        const startAngle = Math.PI * 0.75;
        const endAngle = Math.PI * 0.25;
        ctx.beginPath();
        ctx.arc(110, 110, 90, startAngle, endAngle, false);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 12;
        ctx.stroke();
        // Draw ticks
        ctx.save();
        ctx.translate(110, 110);
        for (let i = 0; i <= maxVal; i += 10) {
            const angle = startAngle + (endAngle - startAngle) * (i / maxVal);
            ctx.save();
            ctx.rotate(angle - Math.PI/2);
            ctx.beginPath();
            ctx.moveTo(0, -78);
            ctx.lineTo(0, -90);
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
            // Label
            const lx = Math.cos(angle) * 65;
            const ly = Math.sin(angle) * 65;
            ctx.font = 'bold 12px sans-serif';
            ctx.fillStyle = '#374151';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(i.toString(), lx, ly);
        }
        ctx.restore();
        // Draw needle
        const needleAngle = startAngle + (endAngle - startAngle) * (Math.min(speedVal, maxVal) / maxVal);
        ctx.save();
        ctx.translate(110, 110);
        ctx.rotate(needleAngle - Math.PI/2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -70);
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.restore();
        // Draw center dot
        ctx.beginPath();
        ctx.arc(110, 110, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#6366f1';
        ctx.fill();
    },
    haversine(lat1, lon1, lat2, lon2) {
        // Returns distance in meters between two lat/lon points
        const R = 6371000;
        const toRad = x => x * Math.PI / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },
    destroy() {
        if (this.watchId) navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
    }
}; 