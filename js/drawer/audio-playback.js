import { DrawerUtils } from './utils.js';

export const AudioPlaybackHandler = {
    audio: null,
    timer: null,
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">Audio Playback</h2>
                <div class="card">
                    <h3 class="card-title">Audio Player</h3>
                    <input type="text" id="audio-url" class="input-primary w-full mb-2" placeholder="Enter audio stream URL (e.g. https://.../audio.mp3)" value="https://sverigesradio.se/topsy/direkt/132-hi-mp3" />
                    <button id="load-audio" class="btn-primary mb-4">Load Audio</button>
                    <div id="audio-player-controls" class="hidden flex flex-col gap-2 items-center">
                        <div class="w-full flex flex-col items-center">
                            <span id="audio-current-url" class="text-xs text-gray-500 mb-1"></span>
                            <audio id="audio-element" preload="none" class="w-full mb-2"></audio>
                        </div>
                        <div class="flex gap-2 items-center">
                            <button id="audio-rev" class="btn-primary px-2">&#x23EA; 30s</button>
                            <button id="audio-play" class="btn-primary px-2">Play</button>
                            <button id="audio-pause" class="btn-primary px-2">Pause</button>
                            <button id="audio-stop" class="btn-primary px-2">Stop</button>
                            <button id="audio-ffwd" class="btn-primary px-2">30s &#x23E9;</button>
                        </div>
                        <div class="flex items-center gap-2 w-full mt-2">
                            <input type="range" id="audio-volume" min="0" max="1" step="0.01" value="1" class="flex-1" />
                            <span class="text-xs">Volume</span>
                        </div>
                        <div class="flex gap-2 text-xs mt-2">
                            <span id="audio-current-time">0:00</span> / <span id="audio-duration">0:00</span>
                        </div>
                        <div class="flex flex-wrap gap-4 mb-2">
                            <label class="flex items-center gap-1"><input type="checkbox" id="audio-echo"> Echo</label>
                            <label class="flex items-center gap-1"><input type="checkbox" id="audio-reverb"> Reverb</label>
                            <label class="flex items-center gap-1"><input type="checkbox" id="audio-distortion"> Distortion</label>
                            <label class="flex items-center gap-1"><input type="checkbox" id="audio-lowpass"> Low-pass</label>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.initEvents();
    },
    initEvents() {
        const urlInput = document.getElementById('audio-url');
        const loadBtn = document.getElementById('load-audio');
        const controls = document.getElementById('audio-player-controls');
        const audioEl = document.getElementById('audio-element');
        const playBtn = document.getElementById('audio-play');
        const pauseBtn = document.getElementById('audio-pause');
        const stopBtn = document.getElementById('audio-stop');
        const ffwdBtn = document.getElementById('audio-ffwd');
        const revBtn = document.getElementById('audio-rev');
        const volumeSlider = document.getElementById('audio-volume');
        const currentTimeSpan = document.getElementById('audio-current-time');
        const durationSpan = document.getElementById('audio-duration');
        const urlSpan = document.getElementById('audio-current-url');

        // --- Web Audio API for effects ---
        let audioCtx = null, sourceNode = null, delayNode = null, convolverNode = null, distortionNode = null, biquadNode = null;
        let effects = {
            echo: false,
            reverb: false,
            distortion: false,
            lowpass: false
        };
        let isUsingWebAudio = false;

        function ensureAudioContext() {
            if (!audioCtx) {
                try {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    console.log('AudioContext created successfully');
                } catch (e) {
                    console.error('Failed to create AudioContext:', e);
                }
            }
            return audioCtx;
        }

        function setupAudioGraph() {
            // If no effects are enabled, don't set up Web Audio API
            if (!Object.values(effects).some(e => e)) {
                console.log('No effects enabled, using direct audio playback');
                isUsingWebAudio = false;
                return;
            }

            const ctx = ensureAudioContext();
            if (!ctx) {
                console.error('No AudioContext available');
                return;
            }

            try {
                // Disconnect previous nodes
                if (sourceNode) {
                    try { 
                        sourceNode.disconnect(); 
                        console.log('Disconnected previous source node');
                    } catch (e) {
                        console.warn('Error disconnecting previous source:', e);
                    }
                }
                if (delayNode) try { delayNode.disconnect(); } catch (e) {}
                if (convolverNode) try { convolverNode.disconnect(); } catch (e) {}
                if (distortionNode) try { distortionNode.disconnect(); } catch (e) {}
                if (biquadNode) try { biquadNode.disconnect(); } catch (e) {}

                // Always create a new sourceNode for the current audio element
                sourceNode = ctx.createMediaElementSource(audioEl);
                console.log('Created new MediaElementSource');
                isUsingWebAudio = true;

                // Create effect nodes
                delayNode = ctx.createDelay();
                delayNode.delayTime.value = 0.3;
                convolverNode = ctx.createConvolver();
                convolverNode.buffer = impulseBuffer;
                distortionNode = ctx.createWaveShaper();
                distortionNode.curve = makeDistortionCurve(400);
                biquadNode = ctx.createBiquadFilter();
                biquadNode.type = 'lowpass';
                biquadNode.frequency.value = 1000;

                // Connect nodes based on effects
                let node = sourceNode;
                if (effects.echo) { node.connect(delayNode); node = delayNode; }
                if (effects.reverb && impulseBuffer) { node.connect(convolverNode); node = convolverNode; }
                if (effects.distortion) { node.connect(distortionNode); node = distortionNode; }
                if (effects.lowpass) { node.connect(biquadNode); node = biquadNode; }
                node.connect(ctx.destination);
                console.log('Audio graph setup complete');
            } catch (e) {
                console.error('Error setting up audio graph:', e);
                // If Web Audio API fails, fall back to direct playback
                isUsingWebAudio = false;
                alert('Audio effects are not available for this stream due to CORS restrictions. Audio will play without effects.');
            }
        }

        function makeDistortionCurve(amount) {
            const n_samples = 44100;
            const curve = new Float32Array(n_samples);
            for (let i = 0; i < n_samples; ++i) {
                const x = i * 2 / n_samples - 1;
                curve[i] = ((3 + amount) * x * 20 * Math.PI / 180) / (Math.PI + amount * Math.abs(x));
            }
            return curve;
        }

        // Load a simple impulse response for reverb (short, small file)
        let impulseBuffer = null;
        fetch('assets/impulse.wav')
            .then(r => r.arrayBuffer())
            .then(buf => {
                const ctx = ensureAudioContext();
                if (ctx) {
                    ctx.decodeAudioData(buf, b => { 
                        impulseBuffer = b;
                        console.log('Impulse response loaded');
                    });
                }
            })
            .catch(e => console.error('Failed to load impulse response:', e));

        // Effect toggles
        document.getElementById('audio-echo').onchange = e => { 
            effects.echo = e.target.checked; 
            if (e.target.checked) {
                // If enabling effects, need to set up Web Audio API
                setupAudioGraph();
            } else if (!Object.values(effects).some(e => e)) {
                // If no effects are enabled, reset to direct playback
                if (audioCtx) {
                    try {
                        audioCtx.close();
                    } catch (e) {
                        console.warn('Error closing audio context:', e);
                    }
                }
                audioCtx = null;
                sourceNode = null;
                isUsingWebAudio = false;
            }
        };
        document.getElementById('audio-reverb').onchange = e => { 
            effects.reverb = e.target.checked; 
            if (e.target.checked) {
                setupAudioGraph();
            } else if (!Object.values(effects).some(e => e)) {
                if (audioCtx) {
                    try {
                        audioCtx.close();
                    } catch (e) {
                        console.warn('Error closing audio context:', e);
                    }
                }
                audioCtx = null;
                sourceNode = null;
                isUsingWebAudio = false;
            }
        };
        document.getElementById('audio-distortion').onchange = e => { 
            effects.distortion = e.target.checked; 
            if (e.target.checked) {
                setupAudioGraph();
            } else if (!Object.values(effects).some(e => e)) {
                if (audioCtx) {
                    try {
                        audioCtx.close();
                    } catch (e) {
                        console.warn('Error closing audio context:', e);
                    }
                }
                audioCtx = null;
                sourceNode = null;
                isUsingWebAudio = false;
            }
        };
        document.getElementById('audio-lowpass').onchange = e => { 
            effects.lowpass = e.target.checked; 
            if (e.target.checked) {
                setupAudioGraph();
            } else if (!Object.values(effects).some(e => e)) {
                if (audioCtx) {
                    try {
                        audioCtx.close();
                    } catch (e) {
                        console.warn('Error closing audio context:', e);
                    }
                }
                audioCtx = null;
                sourceNode = null;
                isUsingWebAudio = false;
            }
        };

        // Re-setup graph on new audio
        loadBtn.onclick = () => {
            const url = urlInput.value.trim();
            if (!url) return;

            // Reset audio context and nodes
            if (audioCtx) {
                try {
                    audioCtx.close();
                } catch (e) {
                    console.warn('Error closing audio context:', e);
                }
            }
            audioCtx = null;
            sourceNode = null;
            isUsingWebAudio = false;
            
            audioEl.src = url;
            audioEl.load();
            controls.classList.remove('hidden');
            urlSpan.textContent = url;
            
            // Wait for audio element to be ready
            audioEl.oncanplay = () => {
                console.log('Audio element ready, setting up graph');
                setupAudioGraph();
            };

            // Add error handling
            audioEl.onerror = (e) => {
                console.error('Audio element error:', e);
            };
        };

        playBtn.onclick = () => {
            if (isUsingWebAudio && audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume().then(() => {
                    console.log('AudioContext resumed');
                    audioEl.play().catch(e => {
                        console.error('Error playing audio:', e);
                    });
                });
            } else {
                audioEl.play().catch(e => {
                    console.error('Error playing audio:', e);
                });
            }
        };
        pauseBtn.onclick = () => audioEl.pause();
        stopBtn.onclick = () => {
            audioEl.pause();
            audioEl.currentTime = 0;
        };
        ffwdBtn.onclick = () => {
            audioEl.currentTime = Math.min(audioEl.currentTime + 30, audioEl.duration || audioEl.currentTime + 30);
        };
        revBtn.onclick = () => {
            audioEl.currentTime = Math.max(audioEl.currentTime - 30, 0);
        };
        volumeSlider.oninput = () => {
            audioEl.volume = volumeSlider.value;
        };

        audioEl.ontimeupdate = () => {
            currentTimeSpan.textContent = formatTime(audioEl.currentTime);
        };
        audioEl.onloadedmetadata = () => {
            durationSpan.textContent = formatTime(audioEl.duration);
        };
        audioEl.onended = () => {
            playBtn.disabled = false;
        };

        // Add audio element event listeners for debugging
        audioEl.onplaying = () => console.log('Audio started playing');
        audioEl.onpause = () => console.log('Audio paused');
        audioEl.onended = () => console.log('Audio ended');
        audioEl.onstalled = () => console.log('Audio stalled');
        audioEl.onwaiting = () => console.log('Audio waiting for data');

        function formatTime(sec) {
            if (isNaN(sec)) return '0:00';
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        }
    }
}; 