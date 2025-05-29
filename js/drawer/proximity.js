import { DrawerUtils } from './utils.js';

export const ProximityHandler = {
    sensor: null,
    eventLog: [],
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">Proximity Sensor Demo</h2>
                <div class="card flex flex-col items-center gap-6">
                    <div>
                        <h3 class="card-title mb-2">Live Proximity</h3>
                        <div class="flex items-center gap-4">
                            <span id="prox-icon" class="text-5xl transition-all">🖐️</span>
                            <span id="prox-status" class="font-mono text-2xl px-4 py-2 rounded bg-black text-green-400">--</span>
                        </div>
                        <div class="mt-2 text-sm">Distance: <span id="prox-distance">--</span> cm</div>
                        <div id="prox-error" class="text-red-600 text-sm mt-2"></div>
                    </div>
                    <div>
                        <h3 class="card-title mb-2">Event Log</h3>
                        <div class="w-64 h-24 bg-gray-100 rounded overflow-auto p-2 text-xs" id="prox-log"></div>
                    </div>
                </div>
            </div>
        `;
        this.eventLog = [];
        this.startProximity();
    },
    startProximity() {
        const statusSpan = document.getElementById('prox-status');
        const iconSpan = document.getElementById('prox-icon');
        const distanceSpan = document.getElementById('prox-distance');
        const errorDiv = document.getElementById('prox-error');
        const logDiv = document.getElementById('prox-log');
        function logEvent(msg) {
            const ts = new Date().toLocaleTimeString();
            ProximityHandler.eventLog.unshift(`[${ts}] ${msg}`);
            if (ProximityHandler.eventLog.length > 20) ProximityHandler.eventLog.pop();
            logDiv.innerHTML = ProximityHandler.eventLog.map(e => `<div>${e}</div>`).join('');
        }
        // Try Generic Sensor API
        if ('ProximitySensor' in window) {
            try {
                this.sensor = new window.ProximitySensor();
                this.sensor.addEventListener('reading', () => {
                    const near = this.sensor.near;
                    const dist = this.sensor.distance;
                    statusSpan.textContent = near ? 'NEAR' : 'FAR';
                    statusSpan.className = 'font-mono text-2xl px-4 py-2 rounded bg-black ' + (near ? 'text-red-400' : 'text-green-400');
                    iconSpan.textContent = near ? '👃' : '🖐️';
                    iconSpan.style.transform = near ? 'scale(1.3)' : 'scale(1)';
                    distanceSpan.textContent = dist != null ? dist.toFixed(1) : '--';
                    logEvent(`Proximity: ${near ? 'NEAR' : 'FAR'}, ${dist != null ? dist.toFixed(1) + 'cm' : 'no distance'}`);
                });
                this.sensor.addEventListener('error', e => {
                    errorDiv.textContent = 'Sensor error: ' + e.error.name;
                    logEvent('Sensor error: ' + e.error.name);
                });
                this.sensor.start();
                errorDiv.textContent = '';
            } catch (err) {
                errorDiv.textContent = 'Could not start ProximitySensor: ' + err.message;
                logEvent('Could not start ProximitySensor: ' + err.message);
            }
        } else if ('ondeviceproximity' in window || 'onuserproximity' in window) {
            // Legacy events
            errorDiv.textContent = '';
            window.ondeviceproximity = (e) => {
                statusSpan.textContent = e.near ? 'NEAR' : 'FAR';
                statusSpan.className = 'font-mono text-2xl px-4 py-2 rounded bg-black ' + (e.near ? 'text-red-400' : 'text-green-400');
                iconSpan.textContent = e.near ? '👃' : '🖐️';
                iconSpan.style.transform = e.near ? 'scale(1.3)' : 'scale(1)';
                distanceSpan.textContent = e.value != null ? e.value.toFixed(1) : '--';
                logEvent(`Proximity: ${e.near ? 'NEAR' : 'FAR'}, ${e.value != null ? e.value.toFixed(1) + 'cm' : 'no distance'}`);
            };
            window.onuserproximity = (e) => {
                statusSpan.textContent = e.near ? 'NEAR' : 'FAR';
                statusSpan.className = 'font-mono text-2xl px-4 py-2 rounded bg-black ' + (e.near ? 'text-red-400' : 'text-green-400');
                iconSpan.textContent = e.near ? '👃' : '🖐️';
                iconSpan.style.transform = e.near ? 'scale(1.3)' : 'scale(1)';
                distanceSpan.textContent = '--';
                logEvent(`Proximity: ${e.near ? 'NEAR' : 'FAR'}, no distance`);
            };
        } else {
            errorDiv.textContent = 'Proximity sensor not supported on this device/browser.';
            logEvent('Proximity sensor not supported.');
        }
    },
    destroy() {
        if (this.sensor && this.sensor.stop) this.sensor.stop();
        this.sensor = null;
        window.ondeviceproximity = null;
        window.onuserproximity = null;
    }
}; 