import { DrawerUtils } from './utils.js';

export const PedometerHandler = {
    motionListener: null,
    stepCount: 0,
    lastPeak: 0,
    lastAcc: 0,
    threshold: 10, // tune for sensitivity
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">Pedometer Demo</h2>
                <div class="card flex flex-col items-center gap-6">
                    <div>
                        <h3 class="card-title mb-2">Step Counter</h3>
                        <div class="flex items-center gap-4">
                            <span id="pedometer-icon" class="text-4xl">👟</span>
                            <span id="pedometer-count" class="font-mono text-3xl bg-black text-green-400 px-4 py-2 rounded">0</span>
                        </div>
                        <button id="pedometer-reset" class="btn-secondary mt-2">Reset</button>
                        <div id="pedometer-error" class="text-red-600 text-sm mt-2"></div>
                    </div>
                    <div>
                        <h3 class="card-title mb-2">Live Acceleration (Z)</h3>
                        <div class="w-48 h-16 bg-gray-100 rounded relative overflow-hidden">
                            <canvas id="pedometer-accel" width="192" height="64"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.stepCount = 0;
        this.lastPeak = 0;
        this.lastAcc = 0;
        this.initEvents();
        this.startMotion();
    },
    initEvents() {
        document.getElementById('pedometer-reset').onclick = () => {
            this.stepCount = 0;
            document.getElementById('pedometer-count').textContent = '0';
        };
    },
    startMotion() {
        const errorDiv = document.getElementById('pedometer-error');
        const countSpan = document.getElementById('pedometer-count');
        const iconSpan = document.getElementById('pedometer-icon');
        const accelCanvas = document.getElementById('pedometer-accel');
        const accelCtx = accelCanvas.getContext('2d');
        let accHistory = Array(192).fill(32);
        if ('DeviceMotionEvent' in window) {
            errorDiv.textContent = '';
            this.motionListener = (event) => {
                let z = 0;
                if (event.acceleration && event.acceleration.z != null) {
                    z = event.acceleration.z;
                } else if (event.accelerationIncludingGravity && event.accelerationIncludingGravity.z != null) {
                    z = event.accelerationIncludingGravity.z;
                }
                // Simple high-pass filter
                const acc = z * 10; // scale for visibility
                accHistory.push(32 + acc);
                if (accHistory.length > 192) accHistory.shift();
                // Draw graph
                accelCtx.clearRect(0, 0, 192, 64);
                accelCtx.beginPath();
                accelCtx.moveTo(0, accHistory[0]);
                for (let i = 1; i < accHistory.length; ++i) {
                    accelCtx.lineTo(i, accHistory[i]);
                }
                accelCtx.strokeStyle = '#6366f1';
                accelCtx.lineWidth = 2;
                accelCtx.stroke();
                // Step detection: simple peak detection
                if (acc > this.threshold && this.lastAcc <= this.threshold) {
                    if (Date.now() - this.lastPeak > 300) { // debounce
                        this.stepCount++;
                        countSpan.textContent = this.stepCount;
                        iconSpan.textContent = this.stepCount % 2 === 0 ? '👟' : '🦶';
                        this.lastPeak = Date.now();
                    }
                }
                this.lastAcc = acc;
            };
            window.addEventListener('devicemotion', this.motionListener);
        } else {
            errorDiv.textContent = 'DeviceMotionEvent not supported on this device/browser.';
        }
    },
    destroy() {
        if (this.motionListener) window.removeEventListener('devicemotion', this.motionListener);
        this.motionListener = null;
    }
}; 