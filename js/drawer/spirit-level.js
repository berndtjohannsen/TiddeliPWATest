import { DrawerUtils } from './utils.js';

export const SpiritLevelHandler = {
    listener: null,
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">Spirit Level Demo</h2>
                <div class="card flex flex-col items-center gap-6">
                    <div>
                        <h3 class="card-title mb-2">Dual-Axis Bubble Level</h3>
                        <canvas id="level-canvas" width="200" height="200" class="bg-gray-100 rounded shadow"></canvas>
                        <div class="flex gap-4 mt-2 text-sm">
                            <span>Pitch: <span id="level-pitch">--</span>°</span>
                            <span>Roll: <span id="level-roll">--</span>°</span>
                        </div>
                        <div id="level-center" class="mt-2 text-green-600 font-bold hidden">Level!</div>
                        <div id="level-error" class="text-red-600 text-sm mt-2"></div>
                    </div>
                </div>
            </div>
        `;
        this.startLevel();
    },
    startLevel() {
        const canvas = document.getElementById('level-canvas');
        const ctx = canvas.getContext('2d');
        const pitchSpan = document.getElementById('level-pitch');
        const rollSpan = document.getElementById('level-roll');
        const centerDiv = document.getElementById('level-center');
        const errorDiv = document.getElementById('level-error');
        const R = 80; // radius of level circle
        const bubbleR = 20; // radius of bubble

        function drawLevel(pitch, roll) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Draw outer circle
            ctx.beginPath();
            ctx.arc(100, 100, R, 0, 2 * Math.PI);
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 4;
            ctx.stroke();
            // Draw cross lines
            ctx.beginPath();
            ctx.moveTo(100, 100 - R);
            ctx.lineTo(100, 100 + R);
            ctx.moveTo(100 - R, 100);
            ctx.lineTo(100 + R, 100);
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Calculate bubble position
            // Max tilt shown: 20° (bubble hits edge)
            const maxTilt = 20;
            const x = 100 + (R - bubbleR) * Math.sin(roll * Math.PI / 180) / Math.sin(maxTilt * Math.PI / 180);
            const y = 100 - (R - bubbleR) * Math.sin(pitch * Math.PI / 180) / Math.sin(maxTilt * Math.PI / 180);
            // Draw bubble
            ctx.beginPath();
            ctx.arc(x, y, bubbleR, 0, 2 * Math.PI);
            ctx.fillStyle = '#fbbf24';
            ctx.globalAlpha = 0.8;
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            // Draw center dot
            ctx.beginPath();
            ctx.arc(100, 100, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#6366f1';
            ctx.fill();
        }

        function setLevel(pitch, roll) {
            drawLevel(pitch, roll);
            pitchSpan.textContent = pitch.toFixed(1);
            rollSpan.textContent = roll.toFixed(1);
            // Show 'Level!' if both pitch and roll are within 1 degree
            if (Math.abs(pitch) < 1 && Math.abs(roll) < 1) {
                centerDiv.classList.remove('hidden');
            } else {
                centerDiv.classList.add('hidden');
            }
        }

        // Try DeviceOrientation first
        if ('DeviceOrientationEvent' in window) {
            errorDiv.textContent = '';
            this.listener = (event) => {
                // event.beta: front-back tilt (pitch), -180 to 180
                // event.gamma: left-right tilt (roll), -90 to 90
                let pitch = event.beta || 0;
                let roll = event.gamma || 0;
                // Clamp to [-20, 20] for display
                pitch = Math.max(-20, Math.min(20, pitch));
                roll = Math.max(-20, Math.min(20, roll));
                setLevel(pitch, roll);
            };
            window.addEventListener('deviceorientation', this.listener);
        } else if ('DeviceMotionEvent' in window) {
            errorDiv.textContent = '';
            this.listener = (event) => {
                // Fallback: use accelerationIncludingGravity
                const g = event.accelerationIncludingGravity;
                if (!g) return;
                // Calculate pitch/roll from gravity vector
                let pitch = Math.atan2(-g.x, Math.sqrt(g.y * g.y + g.z * g.z)) * 180 / Math.PI;
                let roll = Math.atan2(g.y, g.z) * 180 / Math.PI;
                pitch = Math.max(-20, Math.min(20, pitch));
                roll = Math.max(-20, Math.min(20, roll));
                setLevel(pitch, roll);
            };
            window.addEventListener('devicemotion', this.listener);
        } else {
            errorDiv.textContent = 'DeviceOrientation/DeviceMotion not supported on this device/browser.';
        }
    },
    destroy() {
        if (this.listener) {
            window.removeEventListener('deviceorientation', this.listener);
            window.removeEventListener('devicemotion', this.listener);
            this.listener = null;
        }
    }
}; 