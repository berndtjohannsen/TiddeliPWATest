import { DrawerUtils } from './utils.js';

export const QRCodesHandler = {
    async init() {
        console.log('QR Codes Handler: Initializing...');
        
        // Dynamically load QR libraries
        await this.loadQRLibraries();
        
        console.log('QRCode available:', !!window.QRCode);
        console.log('Html5Qrcode available:', !!window.Html5Qrcode);
        
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">QR Codes</h2>
                <div class="card">
                    <h3 class="card-title">Generate QR Code</h3>
                    <div class="flex flex-col gap-2">
                        <input id="qr-input" type="text" class="input-primary" placeholder="Enter text or URL...">
                        <button id="qr-generate" class="btn-primary w-fit">Generate</button>
                        <div id="qr-output" class="mt-4 mx-auto"></div>
                    </div>
                </div>
                <div class="card">
                    <h3 class="card-title">Scan QR Code</h3>
                    <div class="flex flex-col gap-2">
                        <button id="qr-scan" class="btn-primary w-fit">Start Scanning</button>
                        <div id="qr-reader" style="width: 300px; max-width: 100%; margin: 0 auto;"></div>
                        <div id="qr-result" class="mt-2 text-green-700 font-semibold"></div>
                    </div>
                </div>
            </div>
        `;
        this.initEvents();
        console.log('QR Codes Handler: Initialization complete');
    },

    async loadQRLibraries() {
        return new Promise((resolve, reject) => {
            // Check if libraries are already loaded
            if (window.QRCode && window.Html5Qrcode) {
                console.log('QR libraries already loaded');
                resolve();
                return;
            }

            console.log('Loading QR libraries...');
            let loadedCount = 0;
            const totalLibraries = 2;

            const checkAllLoaded = () => {
                loadedCount++;
                if (loadedCount === totalLibraries) {
                    console.log('All QR libraries loaded');
                    resolve();
                }
            };

            // Load QRCode library
            const qrcodeScript = document.createElement('script');
            qrcodeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
            qrcodeScript.onload = () => {
                console.log('QRCode library loaded');
                checkAllLoaded();
            };
            qrcodeScript.onerror = (error) => {
                console.error('Error loading QRCode library:', error);
                reject(error);
            };
            document.body.appendChild(qrcodeScript);

            // Load Html5Qrcode library
            const html5qrcodeScript = document.createElement('script');
            html5qrcodeScript.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
            html5qrcodeScript.onload = () => {
                console.log('Html5Qrcode library loaded');
                checkAllLoaded();
            };
            html5qrcodeScript.onerror = (error) => {
                console.error('Error loading Html5Qrcode library:', error);
                reject(error);
            };
            document.body.appendChild(html5qrcodeScript);
        });
    },

    initEvents() {
        console.log('QR Codes Handler: Setting up events...');
        // QR Generation
        const input = document.getElementById('qr-input');
        const btn = document.getElementById('qr-generate');
        const output = document.getElementById('qr-output');
        
        if (!input || !btn || !output) {
            console.error('QR Codes Handler: Could not find required elements');
            return;
        }
        
        btn.addEventListener('click', () => {
            console.log('Generate button clicked');
            if (input.value.trim()) {
                try {
                    // Clear previous QR code
                    output.innerHTML = '';
                    // Create new QR code
                    new window.QRCode(output, {
                        text: input.value.trim(),
                        width: 220,
                        height: 220,
                        colorDark: "#000000",
                        colorLight: "#ffffff",
                        correctLevel: window.QRCode.CorrectLevel.H
                    });
                    console.log('QR code generated successfully');
                } catch (error) {
                    console.error('Error generating QR code:', error);
                    alert('Error generating QR code. Please try again.');
                }
            }
        });
        
        // QR Scanning
        let html5Qr;
        const scanBtn = document.getElementById('qr-scan');
        const readerDiv = document.getElementById('qr-reader');
        const resultDiv = document.getElementById('qr-result');
        
        if (!scanBtn || !readerDiv || !resultDiv) {
            console.error('QR Codes Handler: Could not find required elements for scanning');
            return;
        }
        
        scanBtn.addEventListener('click', () => {
            console.log('Scan button clicked');
            if (!html5Qr) {
                try {
                    html5Qr = new window.Html5Qrcode('qr-reader');
                    console.log('QR scanner initialized');
                } catch (error) {
                    console.error('Error initializing QR scanner:', error);
                    resultDiv.textContent = 'Error initializing camera. Please try again.';
                    return;
                }
            }
            resultDiv.textContent = '';
            html5Qr.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: 200 },
                (decodedText) => {
                    console.log('QR code scanned:', decodedText);
                    resultDiv.textContent = `Result: ${decodedText}`;
                    html5Qr.stop();
                },
                (errorMsg) => {
                    console.log('Scan error:', errorMsg);
                }
            ).catch(err => {
                console.error('Camera error:', err);
                resultDiv.textContent = 'Camera error or permission denied.';
            });
        });
        console.log('QR Codes Handler: Events setup complete');
    }
}; 