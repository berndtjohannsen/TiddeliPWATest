// Import drawer handlers
import { GpsHandler } from './drawer/gps.js';
import { SensorsHandler } from './drawer/sensors.js';
import { CameraHandler } from './drawer/camera.js';
import { DataEntryHandler } from './drawer/data-entry.js';
import { CommunicationHandler } from './drawer/communication.js';
import { UIDemoHandler } from './drawer/ui-demo.js';
import { DrawerUtils } from './drawer/utils.js';
import { QRCodesHandler } from './drawer/qr-codes.js';
import { NFCHandler } from './drawer/nfc.js';
import { NotificationsHandler } from './drawer/notifications.js';
import { PhoneHandler } from './drawer/phone.js';
import { MicrophoneHandler } from './drawer/microphone.js';
import { GolfScoreCardHandler } from './drawer/golf-score-card.js';
import { PDFHandler } from './drawer/pdf.js';
import { EmailHandler } from './drawer/email.js';
import { LoadFromURLHandler } from './drawer/load-from-url.js';
import { AIServiceHandler } from './drawer/ai-service.js';
import { AudioPlaybackHandler } from './drawer/audio-playback.js';
import { VideoHandler } from './drawer/video.js';
import { ImageHandler } from './drawer/image.js';
import { BiometricHandler } from './drawer/biometric.js';
import { MagneticHandler } from './drawer/magnetic.js';
import { UIMetersHandler } from './drawer/ui-meters.js';
import { SpiritLevelHandler } from './drawer/spirit-level.js';
import { GyroscopeHandler } from './drawer/gyroscope.js';
import { SpeedHandler } from './drawer/speed.js';
import { PedometerHandler } from './drawer/pedometer.js';
import { ProximityHandler } from './drawer/proximity.js';
import { WebProxyHandler } from './drawer/web-proxy.js';
import { DragDropHandler } from './drawer/drag-drop.js';
import { AudioClassificationHandler } from './drawer/audio-classification.js';

// Drawer Option Manager
const DrawerOptions = {
    handlers: {
        'Test GPS': () => GpsHandler.init(),
        'Data Entry': () => DataEntryHandler.init(),
        'Camera': () => CameraHandler.init(),
        'Sensors': () => SensorsHandler.init(),
        'Communication': () => CommunicationHandler.init(),
        'UI Demo': () => UIDemoHandler.init(),
        'QR codes': () => QRCodesHandler.init(),
        'NFC Demo': () => NFCHandler.init(),
        'Notifications': () => NotificationsHandler.init(),
        'Phone Demo': () => PhoneHandler.init(),
        'Microphone': () => MicrophoneHandler.init(),
        'Golf Score Card': () => GolfScoreCardHandler.init(),
        'PDF': () => PDFHandler.init(),
        'Email': () => EmailHandler.init(),
        'Load from URL': () => LoadFromURLHandler.init(),
        'AI Service': () => AIServiceHandler.init(),
        'Audio Playback': () => AudioPlaybackHandler.init(),
        'Video': () => VideoHandler.init(),
        'Image': () => ImageHandler.init(),
        'Biometric Auth': () => BiometricHandler.init(),
        'Magnetic': () => MagneticHandler.init(),
        'UI Meters': () => UIMetersHandler.init(),
        'Spirit Level': () => SpiritLevelHandler.init(),
        'Gyroscope': () => GyroscopeHandler.init(),
        'Speed': () => SpeedHandler.init(),
        'Pedometer': () => PedometerHandler.init(),
        'Proximity': () => ProximityHandler.init(),
        'Web Proxy': () => WebProxyHandler.init(),
        'Drag and Drop': () => DragDropHandler.init(),
        'Audio Classification': () => AudioClassificationHandler.init()
    },

    init() {
        console.log('Initializing drawer options...');
        const dropdownMenu = document.getElementById('dropdown-menu');
        if (!dropdownMenu) {
            console.error('Dropdown menu not found!');
            return;
        }

        // Update dropdown menu structure for two columns, responsive
        dropdownMenu.className = 'absolute left-4 mt-2 max-w-xs w-[95vw] bg-white rounded-lg shadow-lg py-2 z-50 max-h-[70vh] overflow-y-auto';
        dropdownMenu.innerHTML = '<div class="grid grid-cols-1 sm:grid-cols-2 gap-1"></div>';
        const gridContainer = dropdownMenu.querySelector('.grid');

        // Ensure all menu items are present
        const requiredOptions = Object.keys(this.handlers);
        const existingOptions = Array.from(gridContainer.querySelectorAll('a')).map(opt => opt.textContent.trim());
        
        console.log('Required options:', requiredOptions);
        console.log('Existing options:', existingOptions);

        // Add any missing options
        requiredOptions.forEach(option => {
            if (!existingOptions.includes(option)) {
                console.log('Adding missing option:', option);
                const newOption = document.createElement('a');
                newOption.href = '#';
                newOption.className = 'flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-indigo-50 transition';
                newOption.textContent = option;
                gridContainer.appendChild(newOption);
            }
        });

        // Add event listeners to all options
        gridContainer.querySelectorAll('a').forEach(option => {
            const text = option.textContent.trim();
            console.log('Setting up handler for:', text);
            
            // Remove existing click listeners
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
            
            // Add new click listener
            newOption.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropdownMenu.classList.add('hidden');
                
                const handler = this.handlers[text];
                console.log('Handler found for', text, ':', !!handler);
                
                if (handler) {
                    handler();
                } else {
                    console.warn('No handler found for:', text);
                    DrawerUtils.restoreTopBar();
                    DrawerUtils.restoreMainContent();
                }
            });
        });
    }
};

// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    console.log('Tiddeli PWA initialized');
    
    // Version management
    checkAppVersion();
    displayAppVersion();

    // Navigation handling
    const navItems = document.querySelectorAll('nav a');
    let currentPage = 'home';

    // Function to update active state
    function updateActiveState(activeItem) {
        navItems.forEach(item => {
            const isActive = item === activeItem;
            item.classList.toggle('text-indigo-600', isActive);
            item.classList.toggle('text-gray-500', !isActive);
        });
    }

    // Add click handlers to navigation items
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            updateActiveState(item);
            
            // Get the page name from the text content
            const span = item.querySelector('span');
            const pageName = span ? span.textContent.toLowerCase() : item.textContent.toLowerCase();
            currentPage = pageName;
            
            console.log(`Navigated to: ${pageName}`);
        });
    });

    // Set initial active state
    updateActiveState(navItems[0]);

    // Dropdown menu logic
    const hamburgerMenuBtn = document.getElementById('hamburger-menu');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const topBar = document.querySelector('nav.top-bar');
    const mainContent = document.querySelector('main');

    // Hamburger menu open/close logic
    if (hamburgerMenuBtn && dropdownMenu) {
        hamburgerMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !dropdownMenu.classList.contains('hidden');
            if (isOpen) {
                dropdownMenu.classList.add('hidden');
            } else {
                dropdownMenu.classList.remove('hidden');
                // Always focus the first option in the dropdown
                const firstOption = dropdownMenu.querySelector('a');
                if (firstOption) firstOption.focus();
            }
        });
        // Hide dropdown if clicking anywhere else
        document.addEventListener('click', (e) => {
            if (!hamburgerMenuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.add('hidden');
            }
        });
    }

    // Initialize drawer options
    DrawerOptions.init();

    // Store the initial main content HTML for restoration
    const initialMainContent = `<div class="text-base text-gray-700">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquam nunc, eget aliquam massa nisl quis neque. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquam nunc, eget aliquam massa nisl quis neque. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquam nunc, eget aliquam massa nisl quis neque. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquam nunc, eget aliquam massa nisl quis neque. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquam nunc, eget aliquam massa nisl quis neque. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquam nunc, eget aliquam massa nisl quis neque. Sed euismod, nisl quis aliquam ultricies, nunc nisl aliquam nunc, eget aliquam massa nisl quis neque.
    </div>`;

    // Restore initial view when Home is clicked
    const homeBtn = document.querySelectorAll('.bottom-0 a')[0];
    if (homeBtn) {
        homeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Restore top bar
            if (topBar) topBar.style.display = '';
            // Restore main content and padding
            mainContent.innerHTML = initialMainContent;
            mainContent.classList.add('px-4', 'py-8', 'overflow-auto');
            mainContent.classList.remove('overflow-hidden');
        });
    }
});

function checkAppVersion() {
    fetch('version.json', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
            const currentVersion = data.version;
            const lastVersion = localStorage.getItem('app_version');
            if (lastVersion && lastVersion !== currentVersion) {
                showUpdatePrompt();
            }
            localStorage.setItem('app_version', currentVersion);
        })
        .catch(err => {
            console.warn('Could not check app version:', err);
        });
}

function showUpdatePrompt() {
    // Create a simple modal
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = 0;
    modal.style.left = 0;
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.4)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = 10000;
    modal.innerHTML = `
      <div style="background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 2px 16px rgba(0,0,0,0.15); text-align: center; max-width: 90vw;">
        <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">New Version Available</h2>
        <p style="margin-bottom: 1.5rem;">A new version of this app is available. Please refresh to update.</p>
        <button id="updateAppBtn" style="background: #6366f1; color: white; border: none; border-radius: 0.5rem; padding: 0.75rem 1.5rem; font-size: 1rem; cursor: pointer;">Refresh</button>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('updateAppBtn').onclick = () => {
        window.location.reload(true);
    };
}

function displayAppVersion() {
    fetch('version.json', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
            let versionDiv = document.getElementById('app-version');
            if (!versionDiv) {
                versionDiv = document.createElement('div');
                versionDiv.id = 'app-version';
                versionDiv.style.textAlign = 'center';
                versionDiv.style.fontSize = '0.85rem';
                versionDiv.style.color = '#9ca3af'; // Tailwind gray-400
                versionDiv.style.margin = '2rem 0 0 0';
                // Insert at the end of the main content
                const main = document.querySelector('main');
                if (main) main.appendChild(versionDiv);
            }
            versionDiv.textContent = `Version ${data.version}`;
        })
        .catch(() => {});
}

// End of file 