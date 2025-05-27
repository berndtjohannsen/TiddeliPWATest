import { DrawerUtils } from './utils.js';

export const QRCodesHandler = {
    init() {
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
    },
    initEvents() {
        // QR Generation
        const input = document.getElementById('qr-input');
        const btn = document.getElementById('qr-generate');
        const output = document.getElementById('qr-output');
        btn.addEventListener('click', () => {
            if (input.value.trim()) {
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
            }
        });
        // QR Scanning
        let html5Qr;
        const scanBtn = document.getElementById('qr-scan');
        const readerDiv = document.getElementById('qr-reader');
        const resultDiv = document.getElementById('qr-result');
        scanBtn.addEventListener('click', () => {
            if (!html5Qr) {
                html5Qr = new window.Html5Qrcode('qr-reader');
            }
            resultDiv.textContent = '';
            html5Qr.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: 200 },
                (decodedText) => {
                    resultDiv.textContent = `Result: ${decodedText}`;
                    html5Qr.stop();
                },
                (errorMsg) => {
                    // Optionally show scan errors
                }
            ).catch(err => {
                resultDiv.textContent = 'Camera error or permission denied.';
            });
        });
    }
}; 