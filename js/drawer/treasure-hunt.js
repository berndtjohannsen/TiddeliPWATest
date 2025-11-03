import { DrawerUtils } from './utils.js';

// Treasure Hunt (heading-only) prototype drawer
// Uses device orientation (compass/gyro fused by the browser) to rotate an AR arrow
// toward a target bearing. No distance estimation is performed.
export const TreasureHuntHandler = {
    video: null,           // Camera video element
    canvas: null,          // Overlay canvas element
    ctx: null,             // Canvas 2D context
    cameraStream: null,    // MediaStream from camera
    isRunning: false,      // Render loop flag
    orientationHandler: null, // Device orientation listener
    headingDeg: 0,         // Smoothed current heading (0..360, 0 = North)
    alphaLP: null,         // Low-pass filter state for heading
    targetBearingDeg: null,// Target bearing (0..360) or null if not set

    init() {
        // Fullscreen AR-like layout
        DrawerUtils.setFullScreenMainContent();
        DrawerUtils.restoreTopBar();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="relative w-full h-full">
                <!-- Camera feed -->
                <video id="th-video" autoplay playsinline class="absolute inset-0 w-full h-full object-cover"></video>

                <!-- Overlay canvas for arrow rendering -->
                <canvas id="th-canvas" class="absolute inset-0 w-full h-full pointer-events-none"></canvas>

                <!-- Controls overlay -->
                <div class="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg space-y-3">
                    <div class="flex flex-wrap gap-2">
                        <button id="th-use-current" class="btn-primary text-sm px-3 py-2">🎯 Use Current</button>
                        <button id="th-enter-bearing" class="btn-primary text-sm px-3 py-2">🎯 Enter°</button>
                        <button id="th-clear-target" class="btn-primary text-sm px-3 py-2">✖ Clear</button>
                    </div>
                    <div class="text-sm grid grid-cols-2 gap-2">
                        <div>Heading: <span id="th-heading">--</span>°</div>
                        <div>Target: <span id="th-target">--</span>°</div>
                        <div>Delta: <span id="th-delta">--</span>°</div>
                        <div class="text-xs text-gray-500">Tip: keep phone upright; re-set target if it jitters.</div>
                    </div>
                    <div id="th-status" class="text-xs text-gray-600">Starting camera...</div>
                </div>
            </div>
        `;

        // Initialize elements and logic
        this.setupElements();
        this.startCamera();
        this.startOrientation();
        this.isRunning = true;
        this.renderLoop();
    },

    // Initialize DOM refs and UI handlers
    setupElements() {
        this.video = document.getElementById('th-video');
        this.canvas = document.getElementById('th-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Keep canvas size in sync with video
        const updateCanvasSize = () => {
            this.canvas.width = this.video.videoWidth || window.innerWidth;
            this.canvas.height = this.video.videoHeight || window.innerHeight;
        };
        this.video.onloadedmetadata = () => updateCanvasSize();
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        // Controls: set target bearing
        document.getElementById('th-use-current').onclick = () => {
            this.targetBearingDeg = ((this.headingDeg % 360) + 360) % 360;
            this.updateInfo();
            this.setStatus(`Target set to current: ${Math.round(this.targetBearingDeg)}°`);
        };
        document.getElementById('th-enter-bearing').onclick = () => {
            const v = prompt('Enter target bearing (0..360, 0=N, 90=E):', '0');
            if (v == null) return;
            const deg = parseFloat(v);
            if (!isNaN(deg)) {
                this.targetBearingDeg = ((deg % 360) + 360) % 360;
                this.updateInfo();
                this.setStatus(`Target set: ${Math.round(this.targetBearingDeg)}°`);
            }
        };
        document.getElementById('th-clear-target').onclick = () => {
            this.targetBearingDeg = null;
            this.updateInfo();
            this.setStatus('Target cleared');
        };
    },

    // Start environment/back camera
    startCamera() {
        this.setStatus('Requesting camera access...');
        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            this.setStatus('Camera API not supported in this browser.');
            return;
        }
        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        }).then(stream => {
            this.cameraStream = stream;
            this.video.srcObject = stream;
            this.video.onloadedmetadata = () => {
                this.video.play();
                this.setStatus('Camera active');
            };
        }).catch(err => {
            console.error('Camera error:', err);
            this.setStatus('Camera access denied. Please allow permissions.');
        });
    },

    // Device orientation handling (heading smoothing)
    startOrientation() {
        const handler = (event) => {
            const rawAlpha = (event.alpha || 0); // 0..360
            // Low-pass filter to reduce jitter
            this.alphaLP = this.lowPass(this.alphaLP, rawAlpha, 0.15);
            this.headingDeg = ((this.alphaLP % 360) + 360) % 360;
            this.updateInfo();
        };

        // iOS permission gate
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission().then(res => {
                if (res === 'granted') {
                    window.addEventListener('deviceorientation', handler);
                    this.orientationHandler = handler;
                } else {
                    this.setStatus('Orientation permission denied');
                }
            }).catch(() => {
                window.addEventListener('deviceorientation', handler);
                this.orientationHandler = handler;
            });
        } else {
            window.addEventListener('deviceorientation', handler);
            this.orientationHandler = handler;
        }
    },

    // Rendering loop: draws arrow toward target (or heading if no target)
    renderLoop() {
        if (!this.isRunning) return;
        this.draw();
        requestAnimationFrame(() => this.renderLoop());
    },

    // Draw the arrow with rotation
    draw() {
        // Clear overlay
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Compute arrow rotation in degrees
        let arrowDeg;
        if (this.targetBearingDeg == null) {
            arrowDeg = this.headingDeg || 0; // show current heading if no target
        } else {
            const delta = this.normalizeDeg(this.targetBearingDeg - (this.headingDeg || 0));
            arrowDeg = delta; // [-180,180)
        }
        const rot = arrowDeg * (Math.PI / 180);

        // Arrow sizing
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const arrowLength = Math.max(80, Math.min(centerX, centerY) * 0.5);
        const arrowHead = arrowLength * 0.28;

        // Style
        this.ctx.fillStyle = '#ef4444';     // Tailwind red-500
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = Math.max(3, arrowLength / 20);

        // Draw rotated arrow (upwards = 0°)
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(rot);

        // Shaft
        this.ctx.beginPath();
        this.ctx.moveTo(0, arrowLength / 2);
        this.ctx.lineTo(0, -arrowLength / 2);
        this.ctx.stroke();

        // Head
        this.ctx.beginPath();
        this.ctx.moveTo(0, -arrowLength / 2);
        this.ctx.lineTo(-arrowHead, -arrowLength / 2 + arrowHead);
        this.ctx.lineTo(arrowHead, -arrowLength / 2 + arrowHead);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
    },

    // Update info display (heading, target, delta)
    updateInfo() {
        const h = document.getElementById('th-heading');
        const t = document.getElementById('th-target');
        const d = document.getElementById('th-delta');
        if (h) h.textContent = isFinite(this.headingDeg) ? Math.round(this.headingDeg) : '--';
        if (t) t.textContent = this.targetBearingDeg == null ? '--' : Math.round(this.targetBearingDeg);
        if (d) {
            if (this.targetBearingDeg == null) {
                d.textContent = '--';
            } else {
                const delta = this.normalizeDeg(this.targetBearingDeg - (this.headingDeg || 0));
                d.textContent = `${Math.round(delta)}`;
            }
        }
    },

    // Utility: normalize degrees to [-180, 180)
    normalizeDeg(deg) {
        let x = ((deg + 180) % 360 + 360) % 360 - 180;
        return x;
    },

    // Utility: simple low-pass filter
    lowPass(current, incoming, alpha = 0.15) {
        return current == null ? incoming : (1 - alpha) * current + alpha * incoming;
    },

    // Status helper
    setStatus(text) {
        const el = document.getElementById('th-status');
        if (el) el.textContent = text;
    },

    // Cleanup resources when leaving drawer
    cleanup() {
        this.isRunning = false;
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(t => t.stop());
            this.cameraStream = null;
        }
        if (this.orientationHandler) {
            window.removeEventListener('deviceorientation', this.orientationHandler);
            this.orientationHandler = null;
        }
    }
};


