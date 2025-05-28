import { DrawerUtils } from './utils.js';

export const BiometricHandler = {
    credentialId: null,
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">Biometric Auth Demo (WebAuthn)</h2>
                <div class="card">
                    <h3 class="card-title">Try Biometric Authentication</h3>
                    <div class="mb-4 text-gray-700 text-sm">
                        <p>This demo uses your device's fingerprint, face, or PIN via the Web Authentication API (WebAuthn).</p>
                        <ul class="list-disc list-inside mt-2 mb-2">
                            <li>No fingerprint or biometric data is ever accessed or changed.</li>
                            <li>Works on most Android, Windows Hello, and some Mac devices.</li>
                            <li>Each registration is unique to this app and device.</li>
                        </ul>
                    </div>
                    <div class="flex gap-2 mb-4">
                        <button class="btn-primary" id="bio-register">Register</button>
                        <button class="btn-primary" id="bio-auth" disabled>Authenticate</button>
                    </div>
                    <div id="bio-status" class="text-gray-600"></div>
                </div>
            </div>
        `;
        this.initEvents();
    },
    initEvents() {
        const registerBtn = document.getElementById('bio-register');
        const authBtn = document.getElementById('bio-auth');
        const statusDiv = document.getElementById('bio-status');
        let credentialId = null;

        registerBtn.onclick = async () => {
            statusDiv.textContent = 'Requesting registration...';
            try {
                const publicKey = {
                    challenge: BiometricHandler._randomBuffer(32),
                    rp: { name: 'Tiddeli PWA Demo' },
                    user: {
                        id: BiometricHandler._randomBuffer(16),
                        name: 'demo-user',
                        displayName: 'Demo User'
                    },
                    pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
                    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
                    timeout: 60000,
                    attestation: 'none'
                };
                const cred = await navigator.credentials.create({ publicKey });
                credentialId = cred.rawId;
                BiometricHandler.credentialId = credentialId;
                statusDiv.textContent = 'Registration successful! You can now authenticate.';
                authBtn.disabled = false;
            } catch (err) {
                statusDiv.textContent = 'Registration failed: ' + err.message;
                authBtn.disabled = true;
            }
        };

        authBtn.onclick = async () => {
            statusDiv.textContent = 'Requesting authentication...';
            try {
                const publicKey = {
                    challenge: BiometricHandler._randomBuffer(32),
                    allowCredentials: [{
                        id: BiometricHandler.credentialId,
                        type: 'public-key',
                        transports: ['internal']
                    }],
                    userVerification: 'required',
                    timeout: 60000
                };
                const assertion = await navigator.credentials.get({ publicKey });
                statusDiv.textContent = 'Authentication successful!';
            } catch (err) {
                statusDiv.textContent = 'Authentication failed: ' + err.message;
            }
        };
    },
    _randomBuffer(len) {
        const buf = new Uint8Array(len);
        window.crypto.getRandomValues(buf);
        return buf;
    }
}; 