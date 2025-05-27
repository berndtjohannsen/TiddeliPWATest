import { DrawerUtils } from './utils.js';

export const MicrophoneHandler = {
    mediaRecorder: null,
    audioChunks: [],
    isRecording: false,
    audioBlob: null,
    audioContext: null,
    analyser: null,
    dataArray: null,
    animationFrame: null,

    async init() {
        try {
            console.log('Initializing Microphone handler...');
            DrawerUtils.restoreTopBar();
            DrawerUtils.restoreMainContent();
            const mainContent = DrawerUtils.getMainContent();
            
            mainContent.innerHTML = `
                <div class="space-y-8">
                    <h2 class="text-xl font-semibold mb-4">Microphone Demo</h2>
                    
                    <div class="card">
                        <h3 class="card-title">Record Audio</h3>
                        <div class="flex flex-col gap-4">
                            <div class="flex items-center gap-4">
                                <button id="record-button" class="btn-primary flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                                    </svg>
                                    Start Recording
                                </button>
                                <div id="recording-status" class="text-gray-600"></div>
                            </div>
                            
                            <div id="recording-controls" class="hidden">
                                <div class="flex flex-col gap-4">
                                    <div class="flex items-center gap-4">
                                        <button id="stop-recording" class="btn-primary bg-red-500 hover:bg-red-600 flex items-center gap-2">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
                                            </svg>
                                            Stop Recording
                                        </button>
                                        <div id="recording-timer" class="text-gray-600">00:00</div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span id="volume-indicator" class="font-mono text-lg text-gray-800">0</span>
                                        <div class="text-sm text-gray-600">Volume Level</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="playback-section" class="card hidden">
                        <h3 class="card-title">Playback</h3>
                        <div class="flex flex-col gap-4">
                            <audio id="audio-player" controls class="w-full"></audio>
                            <div class="flex gap-2">
                                <button id="save-recording" class="btn-primary flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                    </svg>
                                    Save Recording
                                </button>
                                <button id="delete-recording" class="btn-primary bg-red-500 hover:bg-red-600 flex items-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                    Delete Recording
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <h3 class="card-title">Saved Recordings</h3>
                        <div id="saved-recordings" class="space-y-2">
                            <!-- Saved recordings will be listed here -->
                        </div>
                    </div>
                </div>
            `;

            this.initEvents();
            this.loadSavedRecordings();
        } catch (error) {
            console.error('Error initializing Microphone handler:', error);
            const mainContent = DrawerUtils.getMainContent();
            mainContent.innerHTML = `
                <div class="card">
                    <div class="p-4 text-center">
                        <svg class="w-12 h-12 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Microphone Feature</h3>
                        <p class="text-gray-600">
                            There was an error loading the microphone feature.
                            <br><br>
                            Error details: ${error.message}
                            <br><br>
                            Please check the browser console for more information.
                        </p>
                    </div>
                </div>
            `;
        }
    },

    initEvents() {
        try {
            console.log('Initializing microphone event handlers...');

            const recordButton = document.getElementById('record-button');
            const stopRecordingButton = document.getElementById('stop-recording');
            const recordingControls = document.getElementById('recording-controls');
            const recordingStatus = document.getElementById('recording-status');
            const recordingTimer = document.getElementById('recording-timer');
            const playbackSection = document.getElementById('playback-section');
            const audioPlayer = document.getElementById('audio-player');
            const saveRecordingButton = document.getElementById('save-recording');
            const deleteRecordingButton = document.getElementById('delete-recording');
            const volumeIndicator = document.getElementById('volume-indicator');

            let timerInterval;
            let startTime;

            // Start recording
            recordButton.addEventListener('click', async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    
                    // Set up audio context and analyzer
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    await this.audioContext.resume(); // Ensure context is running
                    this.analyser = this.audioContext.createAnalyser();
                    this.analyser.fftSize = 256;
                    const bufferLength = this.analyser.frequencyBinCount;
                    this.dataArray = new Uint8Array(bufferLength);
                    
                    const source = this.audioContext.createMediaStreamSource(stream);
                    source.connect(this.analyser);
                    
                    // Start volume visualization
                    this.startVolumeVisualization(volumeIndicator);

                    this.mediaRecorder = new MediaRecorder(stream);
                    this.audioChunks = [];
                    
                    this.mediaRecorder.ondataavailable = (event) => {
                        this.audioChunks.push(event.data);
                    };

                    this.mediaRecorder.onstop = () => {
                        this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                        const audioUrl = URL.createObjectURL(this.audioBlob);
                        audioPlayer.src = audioUrl;
                        playbackSection.classList.remove('hidden');
                        
                        // Stop volume visualization
                        this.stopVolumeVisualization();
                    };

                    this.mediaRecorder.start();
                    this.isRecording = true;
                    
                    // Update UI
                    recordButton.classList.add('hidden');
                    recordingControls.classList.remove('hidden');
                    recordingStatus.textContent = 'Recording...';
                    recordingStatus.classList.add('text-red-500');
                    
                    // Start timer
                    startTime = Date.now();
                    timerInterval = setInterval(() => {
                        const elapsed = Math.floor((Date.now() - startTime) / 1000);
                        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                        const seconds = (elapsed % 60).toString().padStart(2, '0');
                        recordingTimer.textContent = `${minutes}:${seconds}`;
                    }, 1000);

                } catch (error) {
                    console.error('Error accessing microphone:', error);
                    recordingStatus.textContent = 'Error: Could not access microphone';
                    recordingStatus.classList.add('text-red-500');
                }
            });

            // Stop recording
            stopRecordingButton.addEventListener('click', () => {
                if (this.mediaRecorder && this.isRecording) {
                    this.mediaRecorder.stop();
                    this.isRecording = false;
                    
                    // Stop all tracks
                    this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
                    
                    // Update UI
                    recordButton.classList.remove('hidden');
                    recordingControls.classList.add('hidden');
                    recordingStatus.textContent = 'Recording stopped';
                    recordingStatus.classList.remove('text-red-500');
                    
                    // Stop timer
                    clearInterval(timerInterval);
                }
            });

            // Save recording
            saveRecordingButton.addEventListener('click', () => {
                if (this.audioBlob) {
                    const timestamp = new Date().toISOString();
                    const recordings = JSON.parse(localStorage.getItem('audio_recordings') || '[]');
                    recordings.push({
                        id: timestamp,
                        timestamp: timestamp,
                        blob: URL.createObjectURL(this.audioBlob)
                    });
                    localStorage.setItem('audio_recordings', JSON.stringify(recordings));
                    this.loadSavedRecordings();
                }
            });

            // Delete current recording
            deleteRecordingButton.addEventListener('click', () => {
                this.audioBlob = null;
                audioPlayer.src = '';
                playbackSection.classList.add('hidden');
            });

        } catch (error) {
            console.error('Error setting up microphone event handlers:', error);
            throw error;
        }
    },

    loadSavedRecordings() {
        const savedRecordings = document.getElementById('saved-recordings');
        const recordings = JSON.parse(localStorage.getItem('audio_recordings') || '[]');

        if (recordings.length === 0) {
            savedRecordings.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    No saved recordings
                </div>
            `;
            return;
        }

        savedRecordings.innerHTML = recordings.map(recording => `
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-4">
                    <audio src="${recording.blob}" controls class="w-64"></audio>
                    <div class="text-sm text-gray-600">
                        ${new Date(recording.timestamp).toLocaleString()}
                    </div>
                </div>
                <button class="text-red-500 hover:text-red-700" onclick="window.microphoneHandler.deleteSavedRecording('${recording.id}')">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        `).join('');
    },

    deleteSavedRecording(id) {
        const recordings = JSON.parse(localStorage.getItem('audio_recordings') || '[]');
        const updatedRecordings = recordings.filter(recording => recording.id !== id);
        localStorage.setItem('audio_recordings', JSON.stringify(updatedRecordings));
        this.loadSavedRecordings();
    },

    startVolumeVisualization(volumeIndicator) {
        const updateVolume = () => {
            if (!this.analyser || !this.isRecording) return;
            this.analyser.getByteTimeDomainData(this.dataArray);
            // Calculate RMS (root mean square) for volume
            let sumSquares = 0;
            for (let i = 0; i < this.dataArray.length; i++) {
                const val = (this.dataArray[i] - 128) / 128;
                sumSquares += val * val;
            }
            const rms = Math.sqrt(sumSquares / this.dataArray.length);
            const volume = Math.round(rms * 100); // 0-100 scale
            volumeIndicator.textContent = volume;
            this.animationFrame = requestAnimationFrame(updateVolume);
        };
        updateVolume();
    },

    stopVolumeVisualization() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
};

// Make the handler available globally for the delete button
window.microphoneHandler = MicrophoneHandler; 