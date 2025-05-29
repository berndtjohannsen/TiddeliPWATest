import { DrawerUtils } from './utils.js';

export const GyroscopeHandler = {
    gyroListener: null,
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">Gyroscope Demo</h2>
                <div class="card flex flex-col gap-6 items-center">
                    <div>
                        <h3 class="card-title mb-2">3D Cube (Device Rotation)</h3>
                        <div class="flex justify-center">
                            <div id="gyro-cube" style="width:120px; height:120px; perspective:600px;">
                                <div id="cube-inner" style="width:100%; height:100%; position:relative; transform-style:preserve-3d; transition:transform 0.1s;"></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 class="card-title mb-2">Gyroscope Data Visualizer</h3>
                        <div class="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div class="font-bold">X</div>
                                <div id="gyro-x-bar" class="h-16 w-4 mx-auto bg-indigo-200 rounded transition-all"></div>
                                <div id="gyro-x-val" class="mt-1 text-sm">--</div>
                            </div>
                            <div>
                                <div class="font-bold">Y</div>
                                <div id="gyro-y-bar" class="h-16 w-4 mx-auto bg-indigo-200 rounded transition-all"></div>
                                <div id="gyro-y-val" class="mt-1 text-sm">--</div>
                            </div>
                            <div>
                                <div class="font-bold">Z</div>
                                <div id="gyro-z-bar" class="h-16 w-4 mx-auto bg-indigo-200 rounded transition-all"></div>
                                <div id="gyro-z-val" class="mt-1 text-sm">--</div>
                            </div>
                        </div>
                        <div id="gyro-error" class="text-red-600 text-sm mt-2"></div>
                    </div>
                </div>
            </div>
        `;
        this.initCube();
        this.startGyro();
    },
    initCube() {
        // Create cube faces
        const cube = document.getElementById('cube-inner');
        const size = 120;
        const faceStyle = 'position:absolute;width:100%;height:100%;background:#6366f1;opacity:0.85;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;';
        const faces = [
            { t: `translateZ(${size/2}px)`, label: 'F' },
            { t: `rotateY(180deg) translateZ(${size/2}px)`, label: 'B' },
            { t: `rotateY(90deg) translateZ(${size/2}px)`, label: 'R' },
            { t: `rotateY(-90deg) translateZ(${size/2}px)`, label: 'L' },
            { t: `rotateX(90deg) translateZ(${size/2}px)`, label: 'T' },
            { t: `rotateX(-90deg) translateZ(${size/2}px)`, label: 'D' },
        ];
        cube.innerHTML = faces.map(f => `<div style="${faceStyle}transform:${f.t}">${f.label}</div>`).join('');
    },
    startGyro() {
        const cube = document.getElementById('cube-inner');
        const xBar = document.getElementById('gyro-x-bar');
        const yBar = document.getElementById('gyro-y-bar');
        const zBar = document.getElementById('gyro-z-bar');
        const xVal = document.getElementById('gyro-x-val');
        const yVal = document.getElementById('gyro-y-val');
        const zVal = document.getElementById('gyro-z-val');
        const errorDiv = document.getElementById('gyro-error');
        let alpha = 0, beta = 0, gamma = 0;
        let lastTime = Date.now();

        if ('DeviceOrientationEvent' in window && 'DeviceMotionEvent' in window) {
            errorDiv.textContent = '';
            // DeviceOrientation for cube rotation
            this.gyroListener = (event) => {
                alpha = event.alpha || 0; // z axis
                beta = event.beta || 0;   // x axis
                gamma = event.gamma || 0; // y axis
                // Rotate cube: X = beta, Y = gamma, Z = alpha
                cube.style.transform = `rotateX(${beta}deg) rotateY(${gamma}deg) rotateZ(${alpha}deg)`;
            };
            window.addEventListener('deviceorientation', this.gyroListener);
            // DeviceMotion for angular velocity
            this.motionListener = (event) => {
                const g = event.rotationRate;
                if (!g) return;
                // g.alpha (z), g.beta (x), g.gamma (y) in deg/sec
                // Clamp for bar display
                const clamp = v => Math.max(-180, Math.min(180, v || 0));
                const x = clamp(g.beta);
                const y = clamp(g.gamma);
                const z = clamp(g.alpha);
                // Bar heights: map -180..180 to -64..64px
                xBar.style.height = (64 + (x/180)*64) + 'px';
                yBar.style.height = (64 + (y/180)*64) + 'px';
                zBar.style.height = (64 + (z/180)*64) + 'px';
                xBar.style.background = x > 0 ? '#34d399' : '#f87171';
                yBar.style.background = y > 0 ? '#34d399' : '#f87171';
                zBar.style.background = z > 0 ? '#34d399' : '#f87171';
                xVal.textContent = x.toFixed(1) + '°/s';
                yVal.textContent = y.toFixed(1) + '°/s';
                zVal.textContent = z.toFixed(1) + '°/s';
            };
            window.addEventListener('devicemotion', this.motionListener);
        } else {
            errorDiv.textContent = 'DeviceOrientation/DeviceMotion not supported on this device/browser.';
        }
    },
    destroy() {
        if (this.gyroListener) window.removeEventListener('deviceorientation', this.gyroListener);
        if (this.motionListener) window.removeEventListener('devicemotion', this.motionListener);
        this.gyroListener = null;
        this.motionListener = null;
    }
}; 