import { DrawerUtils } from './utils.js';

export const VideoHandler = {
    player: null,
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">Video Player</h2>
                <div class="card">
                    <h3 class="card-title">YouTube Video</h3>
                    <div class="mb-4">
                        <input type="text" id="video-url" class="input-primary w-full mb-2" 
                            placeholder="Enter YouTube video URL or ID (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)" />
                        <button id="load-video" class="btn-primary">Load Video</button>
                    </div>
                    <div id="player-container" class="relative w-full" style="padding-top: 56.25%;">
                        <div id="player" class="absolute top-0 left-0 w-full h-full"></div>
                    </div>
                    <div class="mt-4 text-sm text-gray-600">
                        <p>Enter a YouTube video URL or just the video ID.</p>
                        <p>Example URLs:</p>
                        <ul class="list-disc list-inside">
                            <li>https://www.youtube.com/watch?v=dQw4w9WgXcQ</li>
                            <li>https://youtu.be/dQw4w9WgXcQ</li>
                            <li>dQw4w9WgXcQ</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        // Load the YouTube IFrame Player API
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // Initialize the player when the API is ready
        window.onYouTubeIframeAPIReady = () => {
            this.initPlayer();
        };

        this.initEvents();
    },

    initPlayer() {
        // Get the current origin, handling both http and https
        const origin = window.location.protocol + '//' + window.location.host;
        
        this.player = new YT.Player('player', {
            height: '100%',
            width: '100%',
            videoId: '',
            playerVars: {
                'playsinline': 1,
                'rel': 0,
                'modestbranding': 1,
                'controls': 1,
                'enablejsapi': 1,
                'origin': origin,
                'widget_referrer': window.location.href,
                'iv_load_policy': 3,  // Hide video annotations
                'fs': 1,  // Allow fullscreen
                'autoplay': 0,  // Don't autoplay
                'mute': 0  // Start unmuted
            },
            events: {
                'onReady': (event) => {
                    console.log('YouTube player ready');
                },
                'onStateChange': (event) => {
                    // Log player state changes for debugging
                    const states = {
                        '-1': 'unstarted',
                        '0': 'ended',
                        '1': 'playing',
                        '2': 'paused',
                        '3': 'buffering',
                        '5': 'video cued'
                    };
                    console.log('Player state changed:', states[event.data]);
                },
                'onError': (event) => {
                    console.error('YouTube player error:', event.data);
                    alert('Error loading video. Please check the URL and try again.');
                }
            }
        });
    },

    initEvents() {
        const urlInput = document.getElementById('video-url');
        const loadBtn = document.getElementById('load-video');

        loadBtn.onclick = () => {
            const url = urlInput.value.trim();
            if (!url) return;

            // Extract video ID from various YouTube URL formats
            let videoId = this.extractVideoId(url);
            if (!videoId) {
                alert('Invalid YouTube URL. Please enter a valid YouTube video URL or ID.');
                return;
            }

            if (this.player && this.player.loadVideoById) {
                this.player.loadVideoById(videoId);
            } else {
                console.error('YouTube player not initialized');
                alert('Video player not ready. Please try again.');
            }
        };
    },

    extractVideoId(url) {
        // If it's just the video ID
        if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
            return url;
        }

        // Try to extract from various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/watch\?.*&v=([a-zA-Z0-9_-]{11})/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        return null;
    }
}; 