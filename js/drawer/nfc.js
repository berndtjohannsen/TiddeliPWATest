import { DrawerUtils } from './utils.js';

export const NFCHandler = {
    async init() {
        try {
            console.log('Initializing NFC handler...');
            DrawerUtils.restoreTopBar();
            DrawerUtils.restoreMainContent();
            const mainContent = DrawerUtils.getMainContent();

            // Check if Web NFC is supported
            const isNFCSupported = 'NDEFReader' in window;
            console.log('NFC Support Status:', isNFCSupported ? 'Supported' : 'Not Supported');
            
            mainContent.innerHTML = `
                <div class="space-y-8">
                    <h2 class="text-xl font-semibold mb-4">NFC Demo</h2>
                    
                    ${isNFCSupported ? `
                        <div class="card">
                            <h3 class="card-title">Read NFC Tags</h3>
                            <div class="flex flex-col gap-2">
                                <button id="nfc-read" class="btn-primary w-fit">Start Reading</button>
                                <div id="nfc-status" class="mt-2 text-gray-600"></div>
                                <div id="nfc-result" class="mt-2 p-4 bg-gray-50 rounded-lg"></div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <h3 class="card-title">Write to NFC Tags</h3>
                            <div class="flex flex-col gap-2">
                                <input id="nfc-write-input" type="text" class="input-primary" placeholder="Enter text to write...">
                                <button id="nfc-write" class="btn-primary w-fit">Write to Tag</button>
                                <div id="nfc-write-status" class="mt-2 text-gray-600"></div>
                            </div>
                        </div>
                    ` : `
                        <div class="card">
                            <div class="p-4 text-center">
                                <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                                <h3 class="text-lg font-medium text-gray-900 mb-2">NFC Not Supported</h3>
                                <p class="text-gray-600">
                                    Web NFC is currently only supported on Android devices with Chrome.
                                    <br><br>
                                    Please try this feature on an Android device with Chrome browser.
                                </p>
                            </div>
                        </div>
                    `}
                </div>
            `;

            if (isNFCSupported) {
                console.log('Setting up NFC event handlers...');
                this.initEvents();
            }
        } catch (error) {
            console.error('Error initializing NFC handler:', error);
            const mainContent = DrawerUtils.getMainContent();
            mainContent.innerHTML = `
                <div class="card">
                    <div class="p-4 text-center">
                        <svg class="w-12 h-12 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading NFC Feature</h3>
                        <p class="text-gray-600">
                            There was an error loading the NFC feature.
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
            console.log('Initializing NFC event handlers...');
            const readButton = document.getElementById('nfc-read');
            const writeButton = document.getElementById('nfc-write');
            const writeInput = document.getElementById('nfc-write-input');
            const statusDiv = document.getElementById('nfc-status');
            const resultDiv = document.getElementById('nfc-result');
            const writeStatusDiv = document.getElementById('nfc-write-status');

            if (!readButton || !writeButton || !writeInput || !statusDiv || !resultDiv || !writeStatusDiv) {
                throw new Error('Required DOM elements not found');
            }

            // Read NFC
            readButton.addEventListener('click', async () => {
                try {
                    console.log('Starting NFC read operation...');
                    statusDiv.textContent = 'Waiting for NFC tag...';
                    resultDiv.textContent = '';

                    const ndef = new NDEFReader();
                    await ndef.scan();
                    console.log('NFC scan started successfully');

                    ndef.addEventListener('reading', ({ message }) => {
                        console.log('NFC tag detected:', message);
                        const decoder = new TextDecoder();
                        for (const record of message.records) {
                            if (record.recordType === 'text') {
                                const textDecoder = new TextDecoder(record.encoding);
                                const text = textDecoder.decode(record.data);
                                resultDiv.textContent = `Read: ${text}`;
                                console.log('Successfully decoded NFC text:', text);
                            }
                        }
                        statusDiv.textContent = 'Tag read successfully!';
                    });

                    ndef.addEventListener('error', (error) => {
                        console.error('NFC read error:', error);
                        statusDiv.textContent = `Error: ${error.message}`;
                    });

                } catch (error) {
                    console.error('Error during NFC read operation:', error);
                    statusDiv.textContent = `Error: ${error.message}`;
                }
            });

            // Write NFC
            writeButton.addEventListener('click', async () => {
                if (!writeInput.value.trim()) {
                    writeStatusDiv.textContent = 'Please enter text to write';
                    return;
                }

                try {
                    console.log('Starting NFC write operation...');
                    writeStatusDiv.textContent = 'Waiting for NFC tag...';

                    const ndef = new NDEFReader();
                    await ndef.scan();
                    console.log('NFC scan started successfully');

                    const encoder = new TextEncoder();
                    const text = writeInput.value.trim();
                    console.log('Preparing to write text:', text);
                    
                    await ndef.write({
                        records: [{
                            recordType: 'text',
                            data: encoder.encode(text)
                        }]
                    });

                    console.log('Successfully wrote to NFC tag');
                    writeStatusDiv.textContent = 'Successfully wrote to tag!';
                    writeInput.value = '';

                } catch (error) {
                    console.error('Error during NFC write operation:', error);
                    writeStatusDiv.textContent = `Error: ${error.message}`;
                }
            });
        } catch (error) {
            console.error('Error setting up NFC event handlers:', error);
            throw error; // Re-throw to be caught by the main try-catch
        }
    }
}; 