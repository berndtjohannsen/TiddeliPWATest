import { DrawerUtils } from './utils.js';

export const CommunicationHandler = {
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        
        mainContent.innerHTML = `
            <div class="space-y-6">
                <!-- WiFi Status -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h2 class="text-lg font-semibold mb-2">WiFi Status</h2>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-medium">Connection Type:</span>
                            <span id="wifi-type" class="text-gray-600">Checking...</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-medium">Speed:</span>
                            <span id="wifi-speed" class="text-gray-600">Checking...</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-medium">Signal Strength:</span>
                            <span id="wifi-signal" class="text-gray-600">Checking...</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-medium">Data Usage:</span>
                            <span id="wifi-data" class="text-gray-600">Checking...</span>
                        </div>
                    </div>
                </div>

                <!-- Bluetooth Status -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h2 class="text-lg font-semibold mb-2">Bluetooth Status</h2>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-medium">Available:</span>
                            <span id="bt-available" class="text-gray-600">Checking...</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-medium">Connected Devices:</span>
                            <span id="bt-devices" class="text-gray-600">Checking...</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-medium">Version:</span>
                            <span id="bt-version" class="text-gray-600">Checking...</span>
                        </div>
                    </div>
                </div>

                <!-- BLE Proximity (Experimental Scanning) -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h2 class="text-lg font-semibold mb-2">BLE Proximity (Experimental)</h2>
                    <div id="ble-prox-support" class="text-sm text-gray-600 mb-3">Checking scanning support...</div>
                    <div class="flex gap-2 mb-3">
                        <button id="ble-scan-start" class="bg-indigo-600 text-white px-3 py-1 rounded text-sm">Start Scan</button>
                        <button id="ble-scan-stop" class="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm">Stop</button>
                        <button id="ble-clear" class="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm">Clear</button>
                    </div>
                    <div class="text-xs text-gray-500 mb-2">Requires Chrome on Android with BLE scanning support. HTTPS and location permission needed.</div>
                    <div id="ble-nearest" class="text-sm mb-2">Nearest: --</div>
                    <div id="ble-list" class="text-xs text-gray-700 space-y-1 max-h-56 overflow-y-auto"></div>
                </div>

                <!-- WAN Status -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h2 class="text-lg font-semibold mb-2">WAN Status</h2>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-medium">Connection Type:</span>
                            <span id="wan-type" class="text-gray-600">Checking...</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-medium">Speed:</span>
                            <span id="wan-speed" class="text-gray-600">Checking...</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-medium">Signal Strength:</span>
                            <span id="wan-signal" class="text-gray-600">Checking...</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-medium">Data Usage:</span>
                            <span id="wan-data" class="text-gray-600">Checking...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initNetworkInfo();
        this.initBluetoothInfo();
        this.initWanInfo();
        this.initBLEProximity();
    },

    initNetworkInfo() {
        if ('connection' in navigator) {
            const updateNetworkInfo = () => {
                const conn = navigator.connection;
                
                // Update WiFi info with more details
                document.getElementById('wifi-type').textContent = 
                    `${conn.effectiveType || 'Unknown'} (${conn.type || 'Unknown'})`;
                
                // Speed information
                const speedInfo = [];
                if (conn.downlink) speedInfo.push(`↓${conn.downlink}Mbps`);
                if (conn.uplink) speedInfo.push(`↑${conn.uplink}Mbps`);
                if (conn.rtt) speedInfo.push(`RTT:${conn.rtt}ms`);
                document.getElementById('wifi-speed').textContent = speedInfo.join(' | ');
                
                // Signal strength with more granular information
                const signalStrength = this.getSignalStrength(conn.downlink);
                const signalQuality = this.getSignalQuality(conn.downlink);
                document.getElementById('wifi-signal').textContent = 
                    `${signalStrength} (${signalQuality})`;
                
                // Data usage and metered status
                const dataInfo = [];
                if (conn.metered) dataInfo.push('Metered');
                if (conn.saveData) dataInfo.push('Data Saver');
                document.getElementById('wifi-data').textContent = 
                    dataInfo.length > 0 ? dataInfo.join(' | ') : 'Unmetered';
            };

            // Listen for network changes
            navigator.connection.addEventListener('change', updateNetworkInfo);
            // Initial update
            updateNetworkInfo();
        } else {
            document.getElementById('wifi-type').textContent = 'Not available';
            document.getElementById('wifi-speed').textContent = 'Not available';
            document.getElementById('wifi-signal').textContent = 'Not available';
            document.getElementById('wifi-data').textContent = 'Not available';
        }
    },

    initBluetoothInfo() {
        if ('bluetooth' in navigator) {
            document.getElementById('bt-available').textContent = 'Available';
            document.getElementById('bt-version').textContent = '5.0';
            
            // Add a button to request Bluetooth device
            const btDevicesEl = document.getElementById('bt-devices');
            btDevicesEl.innerHTML = `
                <button id="bt-scan" class="bg-indigo-600 text-white px-3 py-1 rounded text-sm">
                    Scan for Devices
                </button>
            `;

            // Add click handler for Bluetooth scanning
            document.getElementById('bt-scan').addEventListener('click', async () => {
                try {
                    const device = await navigator.bluetooth.requestDevice({
                        // Accept all Bluetooth devices
                        acceptAllDevices: true
                    });
                    
                    btDevicesEl.textContent = `Connected to: ${device.name || 'Unknown Device'}`;
                    
                    // Listen for disconnection
                    device.addEventListener('gattserverdisconnected', () => {
                        btDevicesEl.innerHTML = `
                            <button id="bt-scan" class="bg-indigo-600 text-white px-3 py-1 rounded text-sm">
                                Scan for Devices
                            </button>
                        `;
                        // Re-add click handler
                        document.getElementById('bt-scan').addEventListener('click', arguments.callee);
                    });
                } catch (error) {
                    btDevicesEl.textContent = 'Permission denied or cancelled';
                    // Re-add the scan button after a delay
                    setTimeout(() => {
                        btDevicesEl.innerHTML = `
                            <button id="bt-scan" class="bg-indigo-600 text-white px-3 py-1 rounded text-sm">
                                Scan for Devices
                            </button>
                        `;
                        // Re-add click handler
                        document.getElementById('bt-scan').addEventListener('click', arguments.callee);
                    }, 2000);
                }
            });
        } else {
            document.getElementById('bt-available').textContent = 'Not available';
            document.getElementById('bt-devices').textContent = 'Not available';
            document.getElementById('bt-version').textContent = 'Not available';
        }
    },

    initWanInfo() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            
            // Update WAN info (using cellular connection if available)
            document.getElementById('wan-type').textContent = 
                conn.type === 'cellular' ? 'Cellular' : 'Not cellular';
            document.getElementById('wan-speed').textContent = 
                conn.type === 'cellular' ? `${conn.downlink} Mbps` : 'N/A';
            document.getElementById('wan-signal').textContent = 
                conn.type === 'cellular' ? this.getSignalStrength(conn.downlink) : 'N/A';
            document.getElementById('wan-data').textContent = 'Not available';
        } else {
            document.getElementById('wan-type').textContent = 'Not available';
            document.getElementById('wan-speed').textContent = 'Not available';
            document.getElementById('wan-signal').textContent = 'Not available';
            document.getElementById('wan-data').textContent = 'Not available';
        }
    },

    // BLE Proximity scanning (experimental): attempts to use Web Bluetooth Scanning API
    initBLEProximity() {
        const supportEl = document.getElementById('ble-prox-support');
        const startBtn = document.getElementById('ble-scan-start');
        const stopBtn = document.getElementById('ble-scan-stop');
        const clearBtn = document.getElementById('ble-clear');
        const listEl = document.getElementById('ble-list');
        const nearestEl = document.getElementById('ble-nearest');

        if (!startBtn || !stopBtn || !clearBtn) return;

        // Track active scan and device RSSI EMA
        let activeScan = null;
        const deviceMap = new Map(); // id -> { name, rssiEma, lastRssi, txPower, lastSeen }

        // Feature detection for scanning
        const scanningSupported = !!(navigator.bluetooth && navigator.bluetooth.requestLEScan && 'onadvertisementreceived' in navigator.bluetooth);
        supportEl.textContent = scanningSupported
            ? 'Scanning supported: you may be prompted for permission.'
            : 'Scanning not supported on this browser/device. You can still use classic device request above.';

        // EMA helper
        const ema = (prev, next, alpha = 0.2) => (prev == null ? next : (1 - alpha) * prev + alpha * next);

        // Map RSSI to proximity band
        function proximityFromRSSI(rssi) {
            if (rssi == null) return 'unknown';
            if (rssi >= -60) return 'immediate'; // ~ <1 m
            if (rssi >= -70) return 'near';      // ~ 1-3 m
            return 'far';                        // >3 m (very rough)
        }

        function render() {
            // Render list
            const rows = [];
            let nearest = null;
            let nearestKey = null;
            deviceMap.forEach((v, k) => {
                rows.push(`<div class=\"flex justify-between\"><span>${v.name || 'Unnamed'} <span class=\"text-gray-400\">(${k.slice(-5)})</span></span><span>RSSI:${Math.round(v.rssiEma ?? v.lastRssi)} dBm • ${proximityFromRSSI(v.rssiEma ?? v.lastRssi)}</span></div>`);
                const val = v.rssiEma ?? v.lastRssi;
                if (val != null && (nearest == null || val > nearest)) {
                    nearest = val;
                    nearestKey = k;
                }
            });
            listEl.innerHTML = rows.join('') || '<div class=\"text-gray-500\">No advertisements yet.</div>';

            if (nearestKey) {
                const v = deviceMap.get(nearestKey);
                nearestEl.textContent = `Nearest: ${v.name || 'Unnamed'} (${nearestKey.slice(-5)}) — RSSI ${Math.round(nearest)} dBm — ${proximityFromRSSI(nearest)}`;
            } else {
                nearestEl.textContent = 'Nearest: --';
            }
        }

        async function startScan() {
            if (!scanningSupported) return;
            try {
                // Request location permission implicitly via scan; must be called from a user gesture
                activeScan = await navigator.bluetooth.requestLEScan({
                    keepRepeatedDevices: true,
                    acceptAllAdvertisements: true
                });

                navigator.bluetooth.addEventListener('advertisementreceived', advHandler);
                supportEl.textContent = 'Scanning... Move near your beacon.';
            } catch (e) {
                supportEl.textContent = 'Scan failed or permission denied.';
            }
        }

        function stopScan() {
            try {
                if (activeScan) activeScan.stop();
            } catch {}
            try {
                navigator.bluetooth.removeEventListener('advertisementreceived', advHandler);
            } catch {}
            activeScan = null;
            supportEl.textContent = 'Scan stopped';
        }

        function clearList() {
            deviceMap.clear();
            render();
        }

        function advHandler(event) {
            // event: BluetoothAdvertisementEvent
            const id = event.device && event.device.id ? event.device.id : (event.uuid || Math.random().toString(36).slice(2));
            const name = (event.device && event.device.name) || event.name || 'Beacon';
            const rssi = event.rssi ?? null;
            const txPower = event.txPower ?? null;

            const prev = deviceMap.get(id) || {};
            const rssiEma = rssi == null ? prev.rssiEma : ema(prev.rssiEma, rssi, 0.2);
            deviceMap.set(id, {
                name,
                rssiEma,
                lastRssi: rssi,
                txPower,
                lastSeen: Date.now()
            });
            render();
        }

        startBtn.onclick = startScan;
        stopBtn.onclick = stopScan;
        clearBtn.onclick = clearList;
    },

    getSignalStrength(speed) {
        if (!speed) return 'Unknown';
        if (speed > 10) return 'Excellent';
        if (speed > 5) return 'Good';
        if (speed > 2) return 'Fair';
        return 'Poor';
    },

    getSignalQuality(speed) {
        if (!speed) return 'Unknown';
        if (speed > 10) return '90-100%';
        if (speed > 5) return '70-90%';
        if (speed > 2) return '50-70%';
        return '0-50%';
    }
}; 