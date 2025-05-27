import { DrawerUtils } from './utils.js';

export const CameraHandler = {
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        
        mainContent.innerHTML = `
            <div class="space-y-4">
                <video id="camera-video" autoplay playsinline class="w-full rounded border"></video>
                <button id="capture-btn" class="bg-indigo-600 text-white px-4 py-2 rounded">Capture Photo</button>
                <div id="photo-preview" class="mt-4"></div>
            </div>
        `;

        this.initCamera();
    },

    initCamera() {
        const video = document.getElementById('camera-video');
        const captureBtn = document.getElementById('capture-btn');
        const photoPreview = document.getElementById('photo-preview');

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    video.srcObject = stream;
                    video.onloadedmetadata = () => video.play();
                    
                    captureBtn.onclick = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        
                        const img = document.createElement('img');
                        img.src = canvas.toDataURL('image/png');
                        img.className = 'w-full rounded border mt-2';
                        
                        photoPreview.innerHTML = '';
                        photoPreview.appendChild(img);
                    };
                })
                .catch(err => {
                    video.style.display = 'none';
                    captureBtn.style.display = 'none';
                    photoPreview.innerHTML = '<div class="text-red-500">Camera access denied or not available.</div>';
                });
        } else {
            video.style.display = 'none';
            captureBtn.style.display = 'none';
            photoPreview.innerHTML = '<div class="text-red-500">Camera not supported in this browser.</div>';
        }
    }
}; 