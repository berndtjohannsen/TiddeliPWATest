import { DrawerUtils } from './utils.js';

export const ImageHandler = {
    originalImage: null,
    currentImage: null,
    canvas: null,
    ctx: null,
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">Image Effects</h2>
                <div class="card">
                    <h3 class="card-title">Upload and Edit Image</h3>
                    <input type="file" id="image-upload" accept="image/*" class="mb-4" />
                    <div class="flex flex-col items-center">
                        <canvas id="image-canvas" class="border rounded mb-4" style="max-width:100%; max-height:300px;"></canvas>
                        <div class="flex flex-wrap gap-2 mb-2">
                            <button class="btn-primary" id="effect-grayscale">Grayscale</button>
                            <button class="btn-primary" id="effect-invert">Invert</button>
                            <button class="btn-primary" id="effect-brightness-up">Brightness +</button>
                            <button class="btn-primary" id="effect-brightness-down">Brightness -</button>
                            <button class="btn-secondary" id="effect-reset">Reset</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.canvas = document.getElementById('image-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.initEvents();
    },
    initEvents() {
        const upload = document.getElementById('image-upload');
        upload.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                const img = new Image();
                img.onload = () => {
                    this.canvas.width = img.width;
                    this.canvas.height = img.height;
                    this.ctx.drawImage(img, 0, 0);
                    this.originalImage = this.ctx.getImageData(0, 0, img.width, img.height);
                    this.currentImage = this.ctx.getImageData(0, 0, img.width, img.height);
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        };
        document.getElementById('effect-grayscale').onclick = () => this.applyEffect('grayscale');
        document.getElementById('effect-invert').onclick = () => this.applyEffect('invert');
        document.getElementById('effect-brightness-up').onclick = () => this.applyEffect('brightness', 20);
        document.getElementById('effect-brightness-down').onclick = () => this.applyEffect('brightness', -20);
        document.getElementById('effect-reset').onclick = () => this.resetImage();
    },
    applyEffect(type, value) {
        if (!this.originalImage) return;
        let imgData = new ImageData(
            new Uint8ClampedArray(this.currentImage.data),
            this.currentImage.width,
            this.currentImage.height
        );
        const data = imgData.data;
        switch(type) {
            case 'grayscale':
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i+1] + data[i+2]) / 3;
                    data[i] = data[i+1] = data[i+2] = avg;
                }
                break;
            case 'invert':
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];
                    data[i+1] = 255 - data[i+1];
                    data[i+2] = 255 - data[i+2];
                }
                break;
            case 'brightness':
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, Math.max(0, data[i] + value));
                    data[i+1] = Math.min(255, Math.max(0, data[i+1] + value));
                    data[i+2] = Math.min(255, Math.max(0, data[i+2] + value));
                }
                break;
        }
        this.ctx.putImageData(imgData, 0, 0);
        this.currentImage = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    },
    resetImage() {
        if (!this.originalImage) return;
        this.ctx.putImageData(this.originalImage, 0, 0);
        this.currentImage = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
}; 