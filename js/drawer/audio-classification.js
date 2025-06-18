import { DrawerUtils } from './utils.js';

// Get global TensorFlow and speechCommands objects
const tf = window.tf;
const speechCommands = window.speechCommands;

export const AudioClassificationHandler = {
    model: null,
    audioContext: null,
    analyser: null,
    microphone: null,
    isListening: false,
    animationFrame: null,
    // Add DOM element references
    volumeIndicator: null,
    volumeBar: null,

    async init() {
        if (!tf || !speechCommands) {
            console.error('TensorFlow.js or Speech Commands not loaded');
            alert('Failed to load required libraries. Please check your internet connection and try again.');
            return;
        }

        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">Audio Classification</h2>
                
                <div class="card">
                    <h3 class="card-title">Real-time Voice Command Recognition</h3>
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center gap-4">
                            <button id="start-listening" class="btn-primary flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                                </svg>
                                Start Listening
                            </button>
                            <div id="listening-status" class="text-gray-600">Not listening</div>
                        </div>

                        <div class="flex flex-col gap-1 w-full">
                            <div class="flex items-center gap-2">
                                <span id="volume-indicator" class="font-mono text-lg text-gray-800">0</span>
                                <div class="text-sm text-gray-600">Volume Level</div>
                            </div>
                            <div class="w-full h-3 bg-gray-200 rounded overflow-hidden">
                                <div id="volume-bar" class="h-3 rounded transition-all duration-100" style="width:0%;background:linear-gradient(90deg,#22c55e,#facc15,#ef4444);"></div>
                            </div>
                        </div>

                        <div class="mt-4">
                            <h4 class="text-sm font-medium mb-2">Current Prediction</h4>
                            <div id="prediction" class="text-lg font-semibold">-</div>
                            <div id="confidence" class="text-sm">Confidence: -</div>
                        </div>

                        <div class="mt-4">
                            <h4 class="text-sm font-medium mb-2">Supported Commands</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div class="p-2 bg-gray-50 rounded">up</div>
                                <div class="p-2 bg-gray-50 rounded">down</div>
                                <div class="p-2 bg-gray-50 rounded">left</div>
                                <div class="p-2 bg-gray-50 rounded">right</div>
                                <div class="p-2 bg-gray-50 rounded">go</div>
                                <div class="p-2 bg-gray-50 rounded">stop</div>
                                <div class="p-2 bg-gray-50 rounded">yes</div>
                                <div class="p-2 bg-gray-50 rounded">no</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3 class="card-title">About</h3>
                    <div class="text-sm text-gray-600 space-y-2">
                        <p>This demo uses TensorFlow.js and the Speech Commands model to recognize voice commands in real-time.</p>
                        <p>The model can recognize basic commands like "up", "down", "left", "right", "go", "stop", "yes", and "no".</p>
                        <p>Note: The model works best in quiet environments and with clear pronunciation.</p>
                    </div>
                </div>
            </div>
        `;

        // Store DOM element references
        this.volumeIndicator = document.getElementById('volume-indicator');
        this.volumeBar = document.getElementById('volume-bar');
        
        // Debug DOM elements
        console.log('DOM Elements initialized:', {
            volumeIndicator: this.volumeIndicator,
            volumeBar: this.volumeBar,
            volumeIndicatorText: this.volumeIndicator?.textContent,
            volumeBarStyle: this.volumeBar?.style.width
        });

        await this.loadModel();
        this.initEvents();
    },

    async loadModel() {
        try {
            // Clean up any existing model
            if (this.model) {
                await this.model.stopListening();
                this.model = null;
            }

            // Load TensorFlow.js and the Speech Commands model
            await tf.ready();
            this.model = await speechCommands.create('BROWSER_FFT');
            await this.model.ensureModelLoaded();
            console.log('Model loaded successfully');
        } catch (error) {
            console.error('Error loading model:', error);
            alert('Failed to load the speech recognition model. Please check your internet connection and try again.');
        }
    },

    initEvents() {
        const startButton = document.getElementById('start-listening');
        const statusEl = document.getElementById('listening-status');
        const predictionEl = document.getElementById('prediction');
        const confidenceEl = document.getElementById('confidence');

        startButton.addEventListener('click', async () => {
            if (this.isListening) {
                this.stopListening();
                startButton.textContent = 'Start Listening';
                statusEl.textContent = 'Not listening';
                statusEl.classList.remove('text-green-500');
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Start listening for commands
                this.isListening = true;
                startButton.textContent = 'Stop Listening';
                statusEl.textContent = 'Listening...';
                statusEl.classList.add('text-green-500');

                // Start prediction loop
                this.startPredictionLoop(predictionEl, confidenceEl);

            } catch (error) {
                console.error('Error accessing microphone:', error);
                alert('Could not access microphone. Please ensure you have granted microphone permissions.');
            }
        });
    },

    async startPredictionLoop(predictionEl, confidenceEl) {
        if (!this.isListening) return;
        
        try {
            console.log('Starting prediction loop...');
            
            // Set up audio analysis
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            // Create and connect the audio source
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioSource = this.audioContext.createMediaStreamSource(stream);
            audioSource.connect(this.analyser);
            
            // Start volume visualization
            const updateVolume = () => {
                if (!this.isListening) return;
                
                this.analyser.getByteTimeDomainData(dataArray);
                const all128 = dataArray.every(v => v === 128);
                if (all128) {
                    const volumeIndicator = document.getElementById('volume-indicator');
                    const volumeBar = document.getElementById('volume-bar');
                    if (volumeIndicator) volumeIndicator.textContent = '0';
                    if (volumeBar) volumeBar.style.width = '0%';
                } else {
                    let sumSquares = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        const val = (dataArray[i] - 128) / 128;
                        sumSquares += val * val;
                    }
                    const rms = Math.sqrt(sumSquares / dataArray.length);
                    const volume = Math.round(Math.min(100, rms * 200));
                    
                    const volumeIndicator = document.getElementById('volume-indicator');
                    const volumeBar = document.getElementById('volume-bar');
                    if (volumeIndicator) volumeIndicator.textContent = volume.toString();
                    if (volumeBar) volumeBar.style.width = `${volume}%`;
                }
                
                this.animationFrame = requestAnimationFrame(updateVolume);
            };
            
            // Start the volume visualization
            updateVolume();
            
            // Start the prediction loop
            await this.model.listen(result => {
                if (!this.isListening) return;
                
                const scores = result.scores;
                const maxScore = Math.max(...scores);
                const maxIndex = scores.indexOf(maxScore);
                const wordLabels = this.model.wordLabels();
                const predictedClass = wordLabels[maxIndex];
                
                console.log('Prediction:', predictedClass, 'Confidence:', maxScore);
                
                // Only show prediction if confidence is high enough AND it's not an unknown command
                if (maxScore > 0.80 && predictedClass !== '_unknown_') {
                    predictionEl.innerHTML = `<span class="text-green-600">${predictedClass}</span>`;
                    confidenceEl.innerHTML = `<span class="text-green-600">Confidence: ${(maxScore * 100).toFixed(1)}%</span>`;
                } else {
                    predictionEl.textContent = '-';
                    confidenceEl.textContent = 'Confidence: -';
                }
            }, {
                includeSpectrogram: true,
                includeRawAudio: false,
                overlapFactor: 0.5
            });
        } catch (error) {
            console.error('Error in prediction loop:', error);
            this.stopListening();
        }
    },

    stopListening() {
        this.isListening = false;
        if (this.model) {
            this.model.stopListening();
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        if (this.microphone) {
            this.microphone.stop();
            this.microphone = null;
        }
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    },

    startVolumeVisualization() {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        
        const updateVolume = () => {
            if (!this.isListening) return;
            
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const volume = Math.min(100, Math.round(average * 0.5));
            
            console.log('Volume update:', {
                volume,
                indicator: this.volumeIndicator,
                bar: this.volumeBar
            });
            
            if (this.volumeIndicator) {
                this.volumeIndicator.textContent = volume.toString();
            }
            if (this.volumeBar) {
                this.volumeBar.style.width = `${volume}%`;
            }
            
            this.animationFrame = requestAnimationFrame(updateVolume);
        };
        
        updateVolume();
    }
}; 