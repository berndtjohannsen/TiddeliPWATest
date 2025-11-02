import { DrawerUtils } from './utils.js';

export const SimpleARHandler = {
    video: null,
    canvas: null,
    ctx: null,
    cameraStream: null,
    shapes: [], // Array of {type, x, y, color, text, size}
    isRunning: false,
    orientationHandler: null,
    
    init() {
        // Use full screen for better AR experience
        DrawerUtils.setFullScreenMainContent();
        DrawerUtils.restoreTopBar();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="relative w-full h-full">
                <!-- Camera video feed -->
                <video id="ar-video" autoplay playsinline class="absolute inset-0 w-full h-full object-cover"></video>
                
                <!-- AR overlay canvas -->
                <canvas id="ar-canvas" class="absolute inset-0 w-full h-full pointer-events-none"></canvas>
                
                <!-- Control panel (overlay on top) -->
                <div id="ar-controls" class="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg space-y-3">
                    <div class="flex gap-2 flex-wrap">
                        <button id="ar-add-circle" class="btn-primary text-sm px-3 py-2">➕ Circle</button>
                        <button id="ar-add-square" class="btn-primary text-sm px-3 py-2">⬜ Square</button>
                        <button id="ar-add-arrow" class="btn-primary text-sm px-3 py-2">➡️ Arrow</button>
                        <button id="ar-add-text" class="btn-primary text-sm px-3 py-2">📝 Text</button>
                        <button id="ar-clear" class="btn-primary text-sm px-3 py-2 bg-red-600">🗑️ Clear</button>
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="text-sm">Color:</label>
                        <input type="color" id="ar-color" value="#ff0000" class="w-12 h-8 rounded border">
                        <label class="text-sm">Size:</label>
                        <input type="range" id="ar-size" min="20" max="200" value="50" class="flex-1">
                        <span id="ar-size-value" class="text-sm w-12">50</span>
                    </div>
                    <div id="ar-status" class="text-xs text-gray-600">Starting...</div>
                </div>
            </div>
        `;
        
        this.initAR();
    },
    
    initAR() {
        // Get elements
        this.video = document.getElementById('ar-video');
        this.canvas = document.getElementById('ar-canvas');
        this.ctx = this.canvas.getContext('2d');
        const colorInput = document.getElementById('ar-color');
        const sizeInput = document.getElementById('ar-size');
        const sizeValue = document.getElementById('ar-size-value');
        const statusDiv = document.getElementById('ar-status');
        
        // Set canvas size to match video
        const updateCanvasSize = () => {
            this.canvas.width = this.video.videoWidth || window.innerWidth;
            this.canvas.height = this.video.videoHeight || window.innerHeight;
        };
        this.video.onloadedmetadata = () => {
            updateCanvasSize();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        
        // Control button handlers
        document.getElementById('ar-add-circle').onclick = () => {
            this.addShape('circle', colorInput.value, parseInt(sizeInput.value));
        };
        
        document.getElementById('ar-add-square').onclick = () => {
            this.addShape('square', colorInput.value, parseInt(sizeInput.value));
        };
        
        document.getElementById('ar-add-arrow').onclick = () => {
            this.addShape('arrow', colorInput.value, parseInt(sizeInput.value));
        };
        
        document.getElementById('ar-add-text').onclick = () => {
            const text = prompt('Enter text to display:', 'Hello AR!');
            if (text) {
                this.addShape('text', colorInput.value, parseInt(sizeInput.value), text);
            }
        };
        
        document.getElementById('ar-clear').onclick = () => {
            this.shapes = [];
            this.draw();
        };
        
        // Size slider update
        sizeInput.oninput = () => {
            sizeValue.textContent = sizeInput.value;
        };
        
        // Start camera
        this.startCamera();
        
        // Start device orientation tracking
        this.startOrientationTracking();
        
        // Start render loop
        this.isRunning = true;
        this.renderLoop();
    },
    
    startCamera() {
        const statusDiv = document.getElementById('ar-status');
        statusDiv.textContent = 'Requesting camera access...';
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment', // Use back camera for AR
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            })
            .then(stream => {
                this.cameraStream = stream;
                this.video.srcObject = stream;
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    statusDiv.textContent = `Camera active - ${this.shapes.length} objects`;
                };
            })
            .catch(err => {
                console.error('Camera error:', err);
                statusDiv.textContent = 'Camera access denied. Please allow camera permissions.';
                statusDiv.className = 'text-xs text-red-600';
            });
        } else {
            statusDiv.textContent = 'Camera API not supported in this browser.';
            statusDiv.className = 'text-xs text-red-600';
        }
    },
    
    startOrientationTracking() {
        // Check if DeviceOrientationEvent is supported
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ requires permission
            DeviceOrientationEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        this.setupOrientationListener();
                    } else {
                        document.getElementById('ar-status').textContent += ' - Orientation permission denied';
                    }
                })
                .catch(err => {
                    console.error('Orientation permission error:', err);
                    this.setupOrientationListener(); // Try anyway
                });
        } else {
            // Android/other browsers
            this.setupOrientationListener();
        }
    },
    
    setupOrientationListener() {
        // Track device orientation (beta = pitch, gamma = roll)
        this.orientationHandler = (event) => {
            // Store orientation data for use in rendering
            this.deviceOrientation = {
                beta: event.beta || 0,   // Pitch: -180 to 180 (forward/backward tilt)
                gamma: event.gamma || 0, // Roll: -90 to 90 (left/right tilt)
                alpha: event.alpha || 0  // Yaw: 0 to 360 (compass direction)
            };
        };
        
        window.addEventListener('deviceorientation', this.orientationHandler);
    },
    
    addShape(type, color, size, text = '') {
        // Add shape at center of screen initially
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.shapes.push({
            type: type,
            x: centerX,
            y: centerY,
            color: color,
            size: size,
            text: text || 'AR Text',
            // Store initial position relative to center
            offsetX: 0,
            offsetY: 0
        });
        
        document.getElementById('ar-status').textContent = `Camera active - ${this.shapes.length} objects`;
        this.draw();
    },
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Get current device orientation
        const orientation = this.deviceOrientation || { beta: 0, gamma: 0, alpha: 0 };
        
        // Calculate offset based on device tilt
        // gamma affects horizontal position (left/right tilt)
        // beta affects vertical position (forward/backward tilt)
        const maxOffset = 200; // Maximum pixels to shift
        const gammaOffset = (orientation.gamma || 0) * (maxOffset / 90); // -90 to 90 maps to -maxOffset to maxOffset
        const betaOffset = ((orientation.beta || 0) - 90) * (maxOffset / 90); // Normalize beta
        
        // Draw each shape
        this.shapes.forEach(shape => {
            // Calculate position with device orientation offset
            const x = this.canvas.width / 2 + gammaOffset + shape.offsetX;
            const y = this.canvas.height / 2 + betaOffset + shape.offsetY;
            
            this.ctx.fillStyle = shape.color;
            this.ctx.strokeStyle = shape.color;
            this.ctx.lineWidth = 3;
            
            switch (shape.type) {
                case 'circle':
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, shape.size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.stroke();
                    break;
                    
                case 'square':
                    const halfSize = shape.size / 2;
                    this.ctx.fillRect(x - halfSize, y - halfSize, shape.size, shape.size);
                    this.ctx.strokeRect(x - halfSize, y - halfSize, shape.size, shape.size);
                    break;
                    
                case 'arrow':
                    // Draw arrow that rotates based on device compass direction (alpha)
                    // Arrow points in the direction the device is facing
                    const arrowRotation = (orientation.alpha || 0) * (Math.PI / 180); // Convert degrees to radians
                    const arrowLength = shape.size;
                    const arrowHeadSize = arrowLength * 0.3;
                    
                    // Save context to apply rotation
                    this.ctx.save();
                    
                    // Move to arrow position and rotate
                    this.ctx.translate(x, y);
                    this.ctx.rotate(arrowRotation);
                    
                    // Draw arrow shaft (line pointing up)
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, arrowLength / 2);
                    this.ctx.lineTo(0, -arrowLength / 2);
                    this.ctx.lineWidth = Math.max(3, shape.size / 15);
                    this.ctx.stroke();
                    
                    // Draw arrowhead (triangle at the top)
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, -arrowLength / 2); // Tip of arrow
                    this.ctx.lineTo(-arrowHeadSize, -arrowLength / 2 + arrowHeadSize); // Bottom left of head
                    this.ctx.lineTo(arrowHeadSize, -arrowLength / 2 + arrowHeadSize); // Bottom right of head
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.stroke();
                    
                    // Restore context
                    this.ctx.restore();
                    break;
                    
                case 'text':
                    this.ctx.font = `bold ${shape.size}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    // Add text stroke for visibility
                    this.ctx.strokeStyle = '#000000';
                    this.ctx.lineWidth = shape.size / 10;
                    this.ctx.strokeText(shape.text, x, y);
                    this.ctx.fillText(shape.text, x, y);
                    break;
            }
        });
    },
    
    renderLoop() {
        if (!this.isRunning) return;
        
        // Redraw on each frame to update positions based on orientation
        this.draw();
        
        requestAnimationFrame(() => this.renderLoop());
    },
    
    // Cleanup when leaving
    cleanup() {
        this.isRunning = false;
        
        // Stop camera
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        // Remove orientation listener
        if (this.orientationHandler) {
            window.removeEventListener('deviceorientation', this.orientationHandler);
            this.orientationHandler = null;
        }
        
        // Clear shapes
        this.shapes = [];
    }
};

