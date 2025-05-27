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