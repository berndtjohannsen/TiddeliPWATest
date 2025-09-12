import { DrawerUtils } from './utils.js';

export const TextToSpeechHandler = {
    isSpeaking: false,
    voices: [],
    currentVoice: null,

    async init() {
        // Check if speech synthesis is supported
        if (!('speechSynthesis' in window)) {
            alert('Text-to-Speech is not supported in this browser.');
            return;
        }

        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">Text-to-Speech</h2>
                
                <div class="card">
                    <h3 class="card-title">Speak Text</h3>
                    <div class="space-y-4">
                        <div>
                            <label for="tts-text" class="block text-sm font-medium text-gray-700 mb-2">
                                Text to speak:
                            </label>
                            <textarea 
                                id="tts-text" 
                                class="input-primary w-full h-24 resize-none" 
                                placeholder="Enter text to convert to speech..."
                            >Hello! This is a test of the text-to-speech functionality.</textarea>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="tts-voice" class="block text-sm font-medium text-gray-700 mb-2">
                                    Voice:
                                </label>
                                <select id="tts-voice" class="input-primary w-full">
                                    <option value="">Loading voices...</option>
                                </select>
                            </div>
                            
                            <div>
                                <label for="tts-language" class="block text-sm font-medium text-gray-700 mb-2">
                                    Language:
                                </label>
                                <select id="tts-language" class="input-primary w-full">
                                    <option value="">All languages</option>
                                    <option value="en">English</option>
                                    <option value="sv">Swedish</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="it">Italian</option>
                                    <option value="pt">Portuguese</option>
                                    <option value="ru">Russian</option>
                                    <option value="ja">Japanese</option>
                                    <option value="ko">Korean</option>
                                    <option value="zh">Chinese</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="flex gap-2">
                            <button id="tts-speak" class="btn-primary flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                                </svg>
                                Speak
                            </button>
                            
                            <button id="tts-stop" class="btn-primary bg-red-500 hover:bg-red-600 flex items-center gap-2" disabled>
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
                                </svg>
                                Stop
                            </button>
                        </div>
                        
                        <div id="tts-status" class="text-sm text-gray-600">
                            Ready to speak
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <h3 class="card-title">Quick Examples</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <button class="tts-example btn-secondary text-left" data-text="Hello! Welcome to the text-to-speech demo.">
                            English Greeting
                        </button>
                        <button class="tts-example btn-secondary text-left" data-text="Hej! Välkommen till text-till-tal demonstrationen.">
                            Swedish Greeting
                        </button>
                        <button class="tts-example btn-secondary text-left" data-text="The weather today is sunny with a temperature of 25 degrees Celsius.">
                            Weather Report
                        </button>
                        <button class="tts-example btn-secondary text-left" data-text="This is a test of the speech synthesis engine.">
                            Test Message
                        </button>
                        <button class="tts-example btn-secondary text-left" data-text="Text-to-speech is a great accessibility feature.">
                            Accessibility Info
                        </button>
                        <button class="tts-example btn-secondary text-left" data-text="¡Hola! Bienvenido a la demostración de texto a voz.">
                            Spanish Greeting
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.initEvents();
        await this.loadVoices();
    },

    initEvents() {
        // Speech controls
        document.getElementById('tts-speak').addEventListener('click', () => this.speak());
        document.getElementById('tts-stop').addEventListener('click', () => this.stop());
        
        // Voice selection
        document.getElementById('tts-voice').addEventListener('change', (e) => {
            this.currentVoice = this.voices.find(voice => voice.name === e.target.value);
        });
        
        // Language filter
        document.getElementById('tts-language').addEventListener('change', (e) => {
            this.filterVoicesByLanguage(e.target.value);
        });
        
        // Example buttons
        document.querySelectorAll('.tts-example').forEach(button => {
            button.addEventListener('click', (e) => {
                const text = e.target.getAttribute('data-text');
                document.getElementById('tts-text').value = text;
                this.speak();
            });
        });
    },

    async loadVoices() {
        return new Promise((resolve) => {
            // Load voices immediately if available
            this.voices = speechSynthesis.getVoices();
            
            if (this.voices.length > 0) {
                this.populateVoiceList();
                resolve();
            } else {
                // Wait for voices to load
                speechSynthesis.addEventListener('voiceschanged', () => {
                    this.voices = speechSynthesis.getVoices();
                    this.populateVoiceList();
                    resolve();
                });
            }
        });
    },

    populateVoiceList() {
        const voiceSelect = document.getElementById('tts-voice');
        
        // Clear existing options
        voiceSelect.innerHTML = '';
        
        if (this.voices.length === 0) {
            voiceSelect.innerHTML = '<option value="">No voices available</option>';
            return;
        }
        
        // Add voices to select
        this.voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice.default) {
                option.textContent += ' - Default';
                this.currentVoice = voice;
            }
            voiceSelect.appendChild(option);
        });
        
        // Set default voice
        if (this.currentVoice) {
            voiceSelect.value = this.currentVoice.name;
        } else if (this.voices.length > 0) {
            this.currentVoice = this.voices[0];
            voiceSelect.value = this.currentVoice.name;
        }
    },

    filterVoicesByLanguage(languageCode) {
        const voiceSelect = document.getElementById('tts-voice');
        
        // Clear existing options
        voiceSelect.innerHTML = '';
        
        if (!languageCode) {
            // Show all voices
            this.populateVoiceList();
            return;
        }
        
        // Filter voices by language
        const filteredVoices = this.voices.filter(voice => 
            voice.lang.startsWith(languageCode)
        );
        
        if (filteredVoices.length === 0) {
            voiceSelect.innerHTML = '<option value="">No voices for this language</option>';
            return;
        }
        
        // Add filtered voices
        filteredVoices.forEach((voice) => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            if (voice.default) {
                option.textContent += ' - Default';
                this.currentVoice = voice;
            }
            voiceSelect.appendChild(option);
        });
        
        // Set first voice as current if none selected
        if (!this.currentVoice && filteredVoices.length > 0) {
            this.currentVoice = filteredVoices[0];
            voiceSelect.value = this.currentVoice.name;
        }
    },

    speak() {
        const text = document.getElementById('tts-text').value.trim();
        
        if (!text) {
            alert('Please enter some text to speak.');
            return;
        }
        
        // Stop any current speech
        speechSynthesis.cancel();
        
        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice if one is selected
        if (this.currentVoice) {
            utterance.voice = this.currentVoice;
        }
        
        // Event handlers
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.updateStatus('Speaking...');
            this.updateButtons();
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            this.updateStatus('Ready to speak');
            this.updateButtons();
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            this.isSpeaking = false;
            this.updateStatus('Error occurred');
            this.updateButtons();
        };
        
        // Start speaking
        speechSynthesis.speak(utterance);
    },

    stop() {
        speechSynthesis.cancel();
        this.isSpeaking = false;
        this.updateStatus('Stopped');
        this.updateButtons();
    },

    updateStatus(message) {
        const status = document.getElementById('tts-status');
        if (status) {
            status.textContent = message;
        }
    },

    updateButtons() {
        const speakBtn = document.getElementById('tts-speak');
        const stopBtn = document.getElementById('tts-stop');
        
        if (this.isSpeaking) {
            speakBtn.disabled = true;
            stopBtn.disabled = false;
        } else {
            speakBtn.disabled = false;
            stopBtn.disabled = true;
        }
    }
};
