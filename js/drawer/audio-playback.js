import { DrawerUtils } from './utils.js';

export const AudioPlaybackHandler = {
    audio: null,
    timer: null,
    playlist: [],
    currentTrackIndex: 0,
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">Audio Playback</h2>
                
                <!-- Bluetooth Media Session Info -->
                <div class="card bg-blue-50">
                    <h3 class="card-title">🚗 Bluetooth Media Player</h3>
                    <p class="text-sm text-gray-600 mb-2">This feature sends track info to your car's Bluetooth display and responds to steering wheel controls.</p>
                    <div id="media-session-status" class="text-xs text-gray-500">Media Session API: <span id="media-session-support">Checking...</span></div>
                </div>

                <!-- Playlist Manager -->
                <div class="card">
                    <h3 class="card-title">Playlist</h3>
                    <div class="space-y-2 mb-4">
                        <input type="text" id="track-url" class="input-primary w-full" placeholder="Audio URL" />
                        <input type="text" id="track-title" class="input-primary w-full" placeholder="Track Title" />
                        <input type="text" id="track-artist" class="input-primary w-full" placeholder="Artist" />
                        <input type="text" id="track-album" class="input-primary w-full" placeholder="Album (optional)" />
                        <button id="add-to-playlist" class="btn-primary w-full">Add to Playlist</button>
                    </div>
                    <div id="playlist-container" class="space-y-1 max-h-60 overflow-y-auto">
                        <p class="text-sm text-gray-500">No tracks in playlist. Add some tracks above!</p>
                    </div>
                </div>

                <!-- Audio Player -->
                <div class="card">
                    <h3 class="card-title">Audio Player</h3>
                    <input type="text" id="audio-url" class="input-primary w-full mb-2" placeholder="Enter audio stream URL (e.g. https://.../audio.mp3)" value="https://sverigesradio.se/topsy/direkt/132-hi-mp3" />
                    <button id="load-audio" class="btn-primary mb-4">Load Audio</button>
                    <div id="audio-player-controls" class="hidden flex flex-col gap-2 items-center">
                        <div class="w-full flex flex-col items-center">
                            <div id="current-track-info" class="text-center mb-2">
                                <div id="track-display-title" class="font-semibold text-lg"></div>
                                <div id="track-display-artist" class="text-sm text-gray-600"></div>
                                <div id="track-display-album" class="text-xs text-gray-500"></div>
                            </div>
                            <span id="audio-current-url" class="text-xs text-gray-500 mb-1"></span>
                            <audio id="audio-element" preload="none" class="w-full mb-2"></audio>
                        </div>
                        <div class="flex gap-2 items-center flex-wrap justify-center">
                            <button id="audio-prev-track" class="btn-primary px-3">⏮️ Prev</button>
                            <button id="audio-rev" class="btn-primary px-2">&#x23EA; 30s</button>
                            <button id="audio-play" class="btn-primary px-3">▶️ Play</button>
                            <button id="audio-pause" class="btn-primary px-3">⏸️ Pause</button>
                            <button id="audio-stop" class="btn-primary px-2">⏹️ Stop</button>
                            <button id="audio-ffwd" class="btn-primary px-2">30s &#x23E9;</button>
                            <button id="audio-next-track" class="btn-primary px-3">Next ⏭️</button>
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
        this.initDefaultPlaylist();
        this.initEvents();
        this.checkMediaSessionSupport();
    },
    
    // Initialize playlist with default tracks for testing
    initDefaultPlaylist() {
        this.playlist = [
            {
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                title: 'Electronic Symphony',
                artist: 'SoundHelix',
                album: 'Generated Music Vol. 1'
            },
            {
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                title: 'Digital Dreams',
                artist: 'SoundHelix',
                album: 'Generated Music Vol. 1'
            },
            {
                url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                title: 'Algorithmic Beats',
                artist: 'SoundHelix',
                album: 'Generated Music Vol. 1'
            }
        ];
        this.currentTrackIndex = 0;
        // Render the default playlist
        setTimeout(() => this.renderPlaylist(), 100);
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
        const nextTrackBtn = document.getElementById('audio-next-track');
        const prevTrackBtn = document.getElementById('audio-prev-track');
        
        // Playlist management elements
        const addToPlaylistBtn = document.getElementById('add-to-playlist');
        const trackUrlInput = document.getElementById('track-url');
        const trackTitleInput = document.getElementById('track-title');
        const trackArtistInput = document.getElementById('track-artist');
        const trackAlbumInput = document.getElementById('track-album');

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

        // Playlist management: Add track to playlist
        addToPlaylistBtn.onclick = () => {
            const url = trackUrlInput.value.trim();
            const title = trackTitleInput.value.trim();
            const artist = trackArtistInput.value.trim();
            const album = trackAlbumInput.value.trim();
            
            if (!url || !title || !artist) {
                alert('Please fill in at least URL, Title, and Artist');
                return;
            }
            
            this.playlist.push({ url, title, artist, album });
            this.renderPlaylist();
            
            // Clear inputs
            trackUrlInput.value = '';
            trackTitleInput.value = '';
            trackArtistInput.value = '';
            trackAlbumInput.value = '';
        };

        // Next/Previous track handlers
        nextTrackBtn.onclick = () => {
            if (this.playlist.length === 0) {
                alert('No tracks in playlist');
                return;
            }
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
            this.loadTrackFromPlaylist();
        };

        prevTrackBtn.onclick = () => {
            if (this.playlist.length === 0) {
                alert('No tracks in playlist');
                return;
            }
            this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
            this.loadTrackFromPlaylist();
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
            // Update Media Session playback state
            this.updateMediaSessionPlaybackState('playing');
        };
        pauseBtn.onclick = () => {
            audioEl.pause();
            this.updateMediaSessionPlaybackState('paused');
        };
        stopBtn.onclick = () => {
            audioEl.pause();
            audioEl.currentTime = 0;
            this.updateMediaSessionPlaybackState('paused');
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
            // Auto-play next track if in playlist
            if (this.playlist.length > 0) {
                this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
                this.loadTrackFromPlaylist();
            }
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
        
        // Setup Media Session API handlers for car controls
        this.setupMediaSessionHandlers();
    },
    
    // Check if Media Session API is supported
    checkMediaSessionSupport() {
        const supportSpan = document.getElementById('media-session-support');
        if ('mediaSession' in navigator) {
            supportSpan.textContent = '✅ Supported - Your car can show track info!';
            supportSpan.className = 'text-green-600 font-semibold';
        } else {
            supportSpan.textContent = '❌ Not supported in this browser';
            supportSpan.className = 'text-red-600';
        }
    },
    
    // Setup Media Session API handlers to respond to car controls
    setupMediaSessionHandlers() {
        if (!('mediaSession' in navigator)) {
            console.log('Media Session API not supported');
            return;
        }
        
        // Handle play/pause from car controls
        navigator.mediaSession.setActionHandler('play', () => {
            console.log('Media Session: play command from car');
            const audioEl = document.getElementById('audio-element');
            if (audioEl) {
                audioEl.play();
            }
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
            console.log('Media Session: pause command from car');
            const audioEl = document.getElementById('audio-element');
            if (audioEl) {
                audioEl.pause();
            }
        });
        
        // Handle next/previous track from car controls
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            console.log('Media Session: previous track command from car');
            if (this.playlist.length === 0) return;
            this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
            this.loadTrackFromPlaylist();
        });
        
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            console.log('Media Session: next track command from car');
            if (this.playlist.length === 0) return;
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
            this.loadTrackFromPlaylist();
        });
        
        // Handle seek forward/backward from car controls
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
            console.log('Media Session: seek backward from car');
            const audioEl = document.getElementById('audio-element');
            if (audioEl) {
                const skipTime = details.seekOffset || 10;
                audioEl.currentTime = Math.max(audioEl.currentTime - skipTime, 0);
            }
        });
        
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
            console.log('Media Session: seek forward from car');
            const audioEl = document.getElementById('audio-element');
            if (audioEl) {
                const skipTime = details.seekOffset || 10;
                audioEl.currentTime = Math.min(audioEl.currentTime + skipTime, audioEl.duration || audioEl.currentTime + skipTime);
            }
        });
        
        console.log('Media Session handlers registered successfully');
    },
    
    // Update Media Session metadata (shows on car display)
    updateMediaSessionMetadata(track) {
        if (!('mediaSession' in navigator)) return;
        
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title || 'Unknown Track',
            artist: track.artist || 'Unknown Artist',
            album: track.album || '',
            artwork: [
                // You can add album artwork URLs here if available
                { src: 'assets/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: 'assets/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
            ]
        });
        
        // Update on-screen display
        document.getElementById('track-display-title').textContent = track.title || 'Unknown Track';
        document.getElementById('track-display-artist').textContent = track.artist || 'Unknown Artist';
        document.getElementById('track-display-album').textContent = track.album || '';
        
        console.log('Media Session metadata updated:', track);
    },
    
    // Update playback state (playing/paused)
    updateMediaSessionPlaybackState(state) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = state;
            console.log('Media Session playback state:', state);
        }
    },
    
    // Render the playlist UI
    renderPlaylist() {
        const container = document.getElementById('playlist-container');
        if (this.playlist.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500">No tracks in playlist. Add some tracks above!</p>';
            return;
        }
        
        container.innerHTML = this.playlist.map((track, index) => `
            <div class="flex items-center gap-2 p-2 rounded ${index === this.currentTrackIndex ? 'bg-blue-100' : 'bg-gray-50'} hover:bg-gray-100">
                <span class="text-sm font-semibold">${index + 1}.</span>
                <div class="flex-1">
                    <div class="text-sm font-semibold">${track.title}</div>
                    <div class="text-xs text-gray-600">${track.artist}${track.album ? ' - ' + track.album : ''}</div>
                </div>
                <button class="btn-primary text-xs px-2 py-1" onclick="AudioPlaybackHandler.playTrackByIndex(${index})">Play</button>
                <button class="text-red-600 text-xs px-2" onclick="AudioPlaybackHandler.removeTrackByIndex(${index})">✕</button>
            </div>
        `).join('');
    },
    
    // Load a track from the playlist
    loadTrackFromPlaylist() {
        if (this.playlist.length === 0) return;
        
        const track = this.playlist[this.currentTrackIndex];
        const audioEl = document.getElementById('audio-element');
        const controls = document.getElementById('audio-player-controls');
        const urlSpan = document.getElementById('audio-current-url');
        
        // Load the audio
        audioEl.src = track.url;
        audioEl.load();
        controls.classList.remove('hidden');
        urlSpan.textContent = track.url;
        
        // Update Media Session metadata
        this.updateMediaSessionMetadata(track);
        
        // Update playlist UI to highlight current track
        this.renderPlaylist();
        
        // Auto-play
        audioEl.oncanplay = () => {
            audioEl.play();
        };
        
        console.log('Loaded track from playlist:', track);
    },
    
    // Play a specific track by index
    playTrackByIndex(index) {
        this.currentTrackIndex = index;
        this.loadTrackFromPlaylist();
    },
    
    // Remove a track by index
    removeTrackByIndex(index) {
        this.playlist.splice(index, 1);
        if (this.currentTrackIndex >= this.playlist.length) {
            this.currentTrackIndex = Math.max(0, this.playlist.length - 1);
        }
        this.renderPlaylist();
    }
}; 