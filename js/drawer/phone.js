import { DrawerUtils } from './utils.js';

export const PhoneHandler = {
    // Phone number validation regex - allows common formats
    phoneRegex: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,

    // Validate phone number format
    validatePhoneNumber(number) {
        const cleanNumber = number.replace(/[\s-()]/g, '');
        if (!this.phoneRegex.test(cleanNumber)) {
            return {
                valid: false,
                message: 'Please enter a valid phone number (e.g., 123-456-7890 or +1 (123) 456-7890)'
            };
        }
        return { valid: true };
    },

    // Show error message in a user-friendly way
    showError(element, message) {
        element.textContent = message;
        element.classList.add('text-red-500');
        element.classList.remove('text-gray-600');
        // Clear error after 3 seconds
        setTimeout(() => {
            element.textContent = '';
            element.classList.remove('text-red-500');
            element.classList.add('text-gray-600');
        }, 3000);
    },

    async init() {
        try {
            console.log('Initializing Phone handler...');
            DrawerUtils.restoreTopBar();
            DrawerUtils.restoreMainContent();
            const mainContent = DrawerUtils.getMainContent();
            
            mainContent.innerHTML = `
                <div class="space-y-8">
                    <h2 class="text-xl font-semibold mb-4">Phone Demo</h2>
                    
                    <div class="card">
                        <h3 class="card-title">Make a Call</h3>
                        <div class="flex flex-col gap-2">
                            <input id="call-number" type="tel" class="input-primary" placeholder="Enter phone number (e.g., 123-456-7890)">
                            <button id="make-call" class="btn-primary w-fit">Call</button>
                            <div id="call-status" class="mt-2 text-gray-600"></div>
                        </div>
                    </div>

                    <div class="card">
                        <h3 class="card-title">Send SMS</h3>
                        <div class="flex flex-col gap-2">
                            <input id="sms-number" type="tel" class="input-primary" placeholder="Enter phone number (e.g., 123-456-7890)">
                            <textarea id="sms-message" class="input-primary" placeholder="Enter message" rows="3"></textarea>
                            <button id="send-sms" class="btn-primary w-fit">Send SMS</button>
                            <div id="sms-status" class="mt-2 text-gray-600"></div>
                        </div>
                    </div>

                    <div class="card">
                        <h3 class="card-title">Contacts</h3>
                        <div class="flex flex-col gap-2">
                            <div class="flex gap-2">
                                <input id="contact-name" type="text" class="input-primary flex-1" placeholder="Contact name">
                                <input id="contact-number" type="tel" class="input-primary flex-1" placeholder="Phone number (e.g., 123-456-7890)">
                            </div>
                            <button id="add-contact" class="btn-primary w-fit">Add Contact</button>
                        </div>
                    </div>

                    <div class="card">
                        <h3 class="card-title">Browse Contacts</h3>
                        <div class="flex flex-col gap-2">
                            <input id="search-contacts" type="text" class="input-primary" placeholder="Search contacts...">
                            <div id="contacts-list" class="mt-4 space-y-2 max-h-96 overflow-y-auto">
                                <!-- Contacts will be added here -->
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <h3 class="card-title">Call History</h3>
                        <div class="flex flex-col gap-2">
                            <div id="call-history" class="space-y-2">
                                <!-- Call history will be added here -->
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <h3 class="card-title">Incoming Call Simulator</h3>
                        <div class="flex flex-col gap-2">
                            <input id="incoming-number" type="tel" class="input-primary" placeholder="Simulate incoming call from (e.g., 123-456-7890)">
                            <button id="simulate-call" class="btn-primary w-fit">Simulate Incoming Call</button>
                        </div>
                    </div>
                </div>
            `;

            this.initEvents();
            this.loadContacts();
            this.loadCallHistory();
        } catch (error) {
            console.error('Error initializing Phone handler:', error);
            const mainContent = DrawerUtils.getMainContent();
            mainContent.innerHTML = `
                <div class="card">
                    <div class="p-4 text-center">
                        <svg class="w-12 h-12 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Phone Feature</h3>
                        <p class="text-gray-600">
                            There was an error loading the phone feature.
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
            console.log('Initializing phone event handlers...');

            // Search contacts
            const searchContacts = document.getElementById('search-contacts');
            searchContacts.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const contacts = JSON.parse(localStorage.getItem('phone_contacts') || '[]');
                const filteredContacts = contacts.filter(contact => 
                    contact.name.toLowerCase().includes(searchTerm) || 
                    contact.number.includes(searchTerm)
                );
                this.renderContacts(filteredContacts);
            });

            // Make a call
            const makeCallBtn = document.getElementById('make-call');
            const callNumber = document.getElementById('call-number');
            const callStatus = document.getElementById('call-status');

            makeCallBtn.addEventListener('click', () => {
                const number = callNumber.value.trim();
                if (!number) {
                    this.showError(callStatus, 'Please enter a phone number');
                    return;
                }

                const validation = this.validatePhoneNumber(number);
                if (!validation.valid) {
                    this.showError(callStatus, validation.message);
                    return;
                }

                callStatus.textContent = `Calling ${number}...`;
                this.simulateCall(number, 'outgoing');
            });

            // Send SMS
            const sendSmsBtn = document.getElementById('send-sms');
            const smsNumber = document.getElementById('sms-number');
            const smsMessage = document.getElementById('sms-message');
            const smsStatus = document.getElementById('sms-status');

            sendSmsBtn.addEventListener('click', () => {
                const number = smsNumber.value.trim();
                const message = smsMessage.value.trim();

                if (!number) {
                    this.showError(smsStatus, 'Please enter a phone number');
                    return;
                }

                const validation = this.validatePhoneNumber(number);
                if (!validation.valid) {
                    this.showError(smsStatus, validation.message);
                    return;
                }

                if (!message) {
                    this.showError(smsStatus, 'Please enter a message');
                    return;
                }

                smsStatus.textContent = `Sending SMS to ${number}...`;
                this.simulateSMS(number, message);
            });

            // Add contact
            const addContactBtn = document.getElementById('add-contact');
            const contactName = document.getElementById('contact-name');
            const contactNumber = document.getElementById('contact-number');

            addContactBtn.addEventListener('click', () => {
                const name = contactName.value.trim();
                const number = contactNumber.value.trim();

                if (!name) {
                    alert('Please enter a contact name');
                    return;
                }

                if (!number) {
                    alert('Please enter a phone number');
                    return;
                }

                const validation = this.validatePhoneNumber(number);
                if (!validation.valid) {
                    alert(validation.message);
                    return;
                }

                this.addContact(name, number);
                contactName.value = '';
                contactNumber.value = '';
            });

            // Simulate incoming call
            const simulateCallBtn = document.getElementById('simulate-call');
            const incomingNumber = document.getElementById('incoming-number');

            simulateCallBtn.addEventListener('click', () => {
                const number = incomingNumber.value.trim();
                if (!number) {
                    alert('Please enter a phone number');
                    return;
                }

                const validation = this.validatePhoneNumber(number);
                if (!validation.valid) {
                    alert(validation.message);
                    return;
                }

                this.simulateCall(number, 'incoming');
            });

        } catch (error) {
            console.error('Error setting up phone event handlers:', error);
            throw error;
        }
    },

    // Simulate a phone call
    simulateCall(number, type) {
        const callStatus = document.getElementById('call-status');
        const duration = Math.floor(Math.random() * 60) + 30; // Random duration between 30-90 seconds

        if (type === 'incoming') {
            // Show incoming call UI
            const incomingCallUI = document.createElement('div');
            incomingCallUI.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            incomingCallUI.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-xl text-center">
                    <h3 class="text-xl font-semibold mb-2">Incoming Call</h3>
                    <p class="text-gray-600 mb-4">${number}</p>
                    <div class="flex gap-4 justify-center">
                        <button class="bg-red-500 text-white px-6 py-2 rounded-lg" id="reject-call">Reject</button>
                        <button class="bg-green-500 text-white px-6 py-2 rounded-lg" id="accept-call">Accept</button>
                    </div>
                </div>
            `;

            document.body.appendChild(incomingCallUI);

            // Handle call actions
            document.getElementById('reject-call').addEventListener('click', () => {
                incomingCallUI.remove();
                this.addToCallHistory(number, 'rejected');
            });

            document.getElementById('accept-call').addEventListener('click', () => {
                incomingCallUI.remove();
                this.addToCallHistory(number, 'completed', duration);
            });
        } else {
            // Simulate outgoing call
            setTimeout(() => {
                callStatus.textContent = `Call ended (${duration}s)`;
                this.addToCallHistory(number, 'completed', duration);
            }, duration * 1000);
        }
    },

    // Simulate sending an SMS
    simulateSMS(number, message) {
        const smsStatus = document.getElementById('sms-status');
        
        // Simulate network delay
        setTimeout(() => {
            smsStatus.textContent = 'SMS sent successfully';
            this.addToCallHistory(number, 'sms', null, message);
        }, 1000);
    },

    // Add a contact
    addContact(name, number) {
        const contacts = JSON.parse(localStorage.getItem('phone_contacts') || '[]');
        contacts.push({ name, number });
        localStorage.setItem('phone_contacts', JSON.stringify(contacts));
        this.loadContacts();
    },

    // Load contacts from storage
    loadContacts() {
        const contacts = JSON.parse(localStorage.getItem('phone_contacts') || '[]');
        this.renderContacts(contacts);
    },

    // Render contacts list
    renderContacts(contacts) {
        const contactsList = document.getElementById('contacts-list');
        
        if (contacts.length === 0) {
            contactsList.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    No contacts found
                </div>
            `;
            return;
        }

        contactsList.innerHTML = contacts.map(contact => `
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                    <div class="font-medium">${contact.name}</div>
                    <div class="text-sm text-gray-600">${contact.number}</div>
                </div>
                <div class="flex gap-2">
                    <button class="text-blue-500 hover:text-blue-700" onclick="window.phoneHandler.simulateCall('${contact.number}', 'outgoing')">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                    </button>
                    <button class="text-green-500 hover:text-green-700" onclick="window.phoneHandler.simulateSMS('${contact.number}', '')">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Add to call history
    addToCallHistory(number, type, duration = null, message = null) {
        const history = JSON.parse(localStorage.getItem('phone_history') || '[]');
        const entry = {
            number,
            type,
            timestamp: new Date().toISOString(),
            duration,
            message
        };
        history.unshift(entry);
        localStorage.setItem('phone_history', JSON.stringify(history.slice(0, 50))); // Keep last 50 entries
        this.loadCallHistory();
    },

    // Load call history
    loadCallHistory() {
        const callHistory = document.getElementById('call-history');
        const history = JSON.parse(localStorage.getItem('phone_history') || '[]');

        callHistory.innerHTML = history.map(entry => `
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                    <div class="font-medium">${entry.number}</div>
                    <div class="text-sm text-gray-600">
                        ${new Date(entry.timestamp).toLocaleString()}
                        ${entry.duration ? ` (${entry.duration}s)` : ''}
                        ${entry.message ? ` - ${entry.message}` : ''}
                    </div>
                </div>
                <div class="text-sm text-gray-500">
                    ${entry.type === 'completed' ? '✓' : 
                      entry.type === 'rejected' ? '✕' : 
                      entry.type === 'sms' ? '💬' : ''}
                </div>
            </div>
        `).join('');
    }
};

// Make the handler available globally for the contact buttons
window.phoneHandler = PhoneHandler; 