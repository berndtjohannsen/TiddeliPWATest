// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    console.log('Tiddeli PWA initialized');
    
    // Version management
    checkAppVersion();

    // Display app version in UI
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
            
            // TODO: Add page content switching logic
            console.log(`Navigated to: ${pageName}`);
        });
    });

    // Set initial active state
    updateActiveState(navItems[0]);

    // TODO: Add mobile feature handlers
    // TODO: Add UI interactions

    // Dropdown menu logic
    const hamburgerMenuBtn = document.getElementById('hamburger-menu');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const topBar = document.querySelector('nav.top-bar');
    const mainContent = document.querySelector('main');

    // Hamburger menu open/close logic (overlay removed)
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

    // Add event listeners to drawer options
    if (dropdownMenu) {
        dropdownMenu.querySelectorAll('a').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Hide the drawer immediately
                dropdownMenu.classList.add('hidden');
                const text = option.textContent.trim();
                if (text === 'Test GPS') {
                    // Hide top bar
                    if (topBar) topBar.style.display = 'none';
                    // Remove padding and set overflow-hidden from main content
                    mainContent.classList.remove('px-4', 'py-8', 'overflow-auto');
                    mainContent.classList.add('overflow-hidden');
                    // Show map in main content
                    mainContent.innerHTML = '<div id="map" style="width:100%;height:calc(100vh - 4rem);border-radius:1rem;"></div>';
                    setTimeout(() => {
                        if (window.L && document.getElementById('map')) {
                            const map = L.map('map').setView([59.3293, 18.0686], 13); // Stockholm as default
                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                maxZoom: 19,
                                attribution: '© OpenStreetMap'
                            }).addTo(map);
                            // Optionally, add a marker for current location if available
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(pos => {
                                    const lat = pos.coords.latitude;
                                    const lng = pos.coords.longitude;
                                    L.marker([lat, lng]).addTo(map).bindPopup('You are here').openPopup();
                                    map.setView([lat, lng], 15);
                                });
                            }
                        }
                    }, 100);
                } else if (text === 'Data Entry') {
                    // Restore top bar
                    if (topBar) topBar.style.display = '';
                    // Restore padding and overflow to main content
                    mainContent.classList.add('px-4', 'py-8', 'overflow-auto');
                    mainContent.classList.remove('overflow-hidden');
                    // Show data entry form
                    mainContent.innerHTML = `
                        <form id="data-entry-form" class="space-y-6">
                          <div>
                            <label class="block text-sm font-medium mb-1">Name</label>
                            <input type="text" name="name" class="block w-full border rounded px-3 py-2" placeholder="Enter your name" required>
                          </div>
                          <div>
                            <label class="block text-sm font-medium mb-1">Age</label>
                            <input type="number" name="age" class="block w-full border rounded px-3 py-2" placeholder="Enter your age" min="0" max="120">
                          </div>
                          <div>
                            <label class="block text-sm font-medium mb-1">Email</label>
                            <input type="email" name="email" class="block w-full border rounded px-3 py-2" placeholder="Enter your email">
                          </div>
                          <div class="flex items-center">
                            <input type="checkbox" name="subscribe" id="subscribe" class="mr-2">
                            <label for="subscribe" class="text-sm">Subscribe to newsletter</label>
                          </div>
                          <div>
                            <label class="block text-sm font-medium mb-1">Favorite Color</label>
                            <select name="color" class="block w-full border rounded px-3 py-2">
                              <option value="">Select a color</option>
                              <option value="red">Red</option>
                              <option value="green">Green</option>
                              <option value="blue">Blue</option>
                              <option value="yellow">Yellow</option>
                            </select>
                          </div>
                          <div>
                            <label class="block text-sm font-medium mb-1">Comments</label>
                            <textarea name="comments" class="block w-full border rounded px-3 py-2" rows="3" placeholder="Your comments..."></textarea>
                          </div>
                          <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded">Submit</button>
                        </form>
                    `;
                    // Restore form data from localStorage
                    const saved = JSON.parse(localStorage.getItem('dataEntryForm') || '{}');
                    const form = document.getElementById('data-entry-form');
                    if (form) {
                        Object.keys(saved).forEach(key => {
                            const field = form.elements[key];
                            if (field) {
                                if (field.type === 'checkbox') {
                                    field.checked = !!saved[key];
                                } else {
                                    field.value = saved[key];
                                }
                            }
                        });
                        // Auto-save on input/change
                        form.addEventListener('input', () => {
                            const data = {
                                name: form.elements['name'].value,
                                age: form.elements['age'].value,
                                email: form.elements['email'].value,
                                subscribe: form.elements['subscribe'].checked,
                                color: form.elements['color'].value,
                                comments: form.elements['comments'].value
                            };
                            localStorage.setItem('dataEntryForm', JSON.stringify(data));
                        });
                        // Clear saved data on submit
                        form.addEventListener('submit', (e) => {
                            e.preventDefault();
                            localStorage.removeItem('dataEntryForm');
                            alert('Form submitted! (Data cleared from storage)');
                            form.reset();
                        });
                    }
                } else if (text === 'Camera') {
                    // Restore top bar
                    if (topBar) topBar.style.display = '';
                    // Restore padding and overflow to main content
                    mainContent.classList.add('px-4', 'py-8', 'overflow-auto');
                    mainContent.classList.remove('overflow-hidden');
                    // Show camera UI
                    mainContent.innerHTML = `
                        <div class="space-y-4">
                          <video id="camera-video" autoplay playsinline class="w-full rounded border"></video>
                          <button id="capture-btn" class="bg-indigo-600 text-white px-4 py-2 rounded">Capture Photo</button>
                          <div id="photo-preview" class="mt-4"></div>
                        </div>
                    `;
                    // Camera logic
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
                } else if (text === 'Sensors') {
                    // Restore top bar
                    if (topBar) topBar.style.display = '';
                    // Restore padding and overflow to main content
                    mainContent.classList.add('px-4', 'py-8', 'overflow-auto');
                    mainContent.classList.remove('overflow-hidden');
                    // Build sensor UI
                    mainContent.innerHTML = `
                        <div class="space-y-4">
                          <h2 class="text-lg font-semibold mb-2">Available Sensors & Live Values</h2>
                          <ul class="list-disc pl-6 text-base" id="sensor-list">
                            <li id="sensor-accel">Accelerometer: <span class="sensor-value">Checking...</span></li>
                            <li id="sensor-gyro">Gyroscope: <span class="sensor-value">Checking...</span></li>
                            <li id="sensor-geo">Geolocation: <span class="sensor-value">Checking...</span></li>
                            <li id="sensor-battery">Battery: <span class="sensor-value">Checking...</span></li>
                            <li id="sensor-light">Ambient Light: <span class="sensor-value">Checking...</span></li>
                            <li id="sensor-magnet">Magnetometer: <span class="sensor-value">Checking...</span></li>
                            <li id="sensor-absori">Absolute Orientation: <span class="sensor-value">Checking...</span></li>
                            <li id="sensor-relori">Relative Orientation: <span class="sensor-value">Checking...</span></li>
                            <li id="sensor-linaccel">Linear Acceleration: <span class="sensor-value">Checking...</span></li>
                            <li id="sensor-gravity">Gravity: <span class="sensor-value">Checking...</span></li>
                            <li id="sensor-camera">Camera/Microphone: <span class="sensor-value">Checking...</span></li>
                          </ul>
                          <p class="text-xs text-gray-500 mt-2">
                            Note: Some sensors may require permission or may not be supported on all devices/browsers.
                          </p>
                        </div>
                    `;
                    // Accelerometer (DeviceMotion)
                    const accelEl = document.querySelector('#sensor-accel .sensor-value');
                    if ('ondevicemotion' in window) {
                        window.addEventListener('devicemotion', function handler(e) {
                            if (e.acceleration && (e.acceleration.x || e.acceleration.y || e.acceleration.z)) {
                                accelEl.textContent = `x: ${e.acceleration.x?.toFixed(2)}, y: ${e.acceleration.y?.toFixed(2)}, z: ${e.acceleration.z?.toFixed(2)}`;
                                window.removeEventListener('devicemotion', handler);
                            }
                        });
                        setTimeout(() => { if (accelEl.textContent === 'Checking...') accelEl.textContent = 'No data (try on mobile)'; }, 2000);
                    } else {
                        accelEl.textContent = 'Not available';
                    }
                    // Gyroscope (DeviceOrientation)
                    const gyroEl = document.querySelector('#sensor-gyro .sensor-value');
                    if ('ondeviceorientation' in window) {
                        window.addEventListener('deviceorientation', function handler(e) {
                            if (e.alpha || e.beta || e.gamma) {
                                gyroEl.textContent = `α: ${e.alpha?.toFixed(1)}, β: ${e.beta?.toFixed(1)}, γ: ${e.gamma?.toFixed(1)}`;
                                window.removeEventListener('deviceorientation', handler);
                            }
                        });
                        setTimeout(() => { if (gyroEl.textContent === 'Checking...') gyroEl.textContent = 'No data (try on mobile)'; }, 2000);
                    } else {
                        gyroEl.textContent = 'Not available';
                    }
                    // Geolocation
                    const geoEl = document.querySelector('#sensor-geo .sensor-value');
                    if ('geolocation' in navigator) {
                        navigator.geolocation.getCurrentPosition(
                            pos => geoEl.textContent = `lat: ${pos.coords.latitude.toFixed(5)}, lon: ${pos.coords.longitude.toFixed(5)}`,
                            err => geoEl.textContent = 'Permission denied or unavailable'
                        );
                    } else {
                        geoEl.textContent = 'Not available';
                    }
                    // Battery
                    const batteryEl = document.querySelector('#sensor-battery .sensor-value');
                    if ('getBattery' in navigator) {
                        navigator.getBattery().then(bat => {
                            batteryEl.textContent = `${(bat.level * 100).toFixed(0)}%`;
                        });
                    } else {
                        batteryEl.textContent = 'Not available';
                    }
                    // Ambient Light
                    const lightEl = document.querySelector('#sensor-light .sensor-value');
                    if ('AmbientLightSensor' in window) {
                        try {
                            const sensor = new window.AmbientLightSensor();
                            sensor.addEventListener('reading', () => {
                                lightEl.textContent = `${sensor.illuminance} lux`;
                            });
                            sensor.addEventListener('error', () => {
                                lightEl.textContent = 'Permission denied or unavailable';
                            });
                            sensor.start();
                        } catch {
                            lightEl.textContent = 'Not available';
                        }
                    } else {
                        lightEl.textContent = 'Not available';
                    }
                    // Magnetometer
                    const magnetEl = document.querySelector('#sensor-magnet .sensor-value');
                    if ('Magnetometer' in window) {
                        try {
                            const sensor = new window.Magnetometer();
                            sensor.addEventListener('reading', () => {
                                magnetEl.textContent = `x: ${sensor.x?.toFixed(2)}, y: ${sensor.y?.toFixed(2)}, z: ${sensor.z?.toFixed(2)}`;
                            });
                            sensor.addEventListener('error', () => {
                                magnetEl.textContent = 'Permission denied or unavailable';
                            });
                            sensor.start();
                        } catch {
                            magnetEl.textContent = 'Not available';
                        }
                    } else {
                        magnetEl.textContent = 'Not available';
                    }
                    // Absolute Orientation
                    const absoriEl = document.querySelector('#sensor-absori .sensor-value');
                    if ('AbsoluteOrientationSensor' in window) {
                        try {
                            const sensor = new window.AbsoluteOrientationSensor();
                            sensor.addEventListener('reading', () => {
                                absoriEl.textContent = 'Available';
                            });
                            sensor.addEventListener('error', () => {
                                absoriEl.textContent = 'Permission denied or unavailable';
                            });
                            sensor.start();
                        } catch {
                            absoriEl.textContent = 'Not available';
                        }
                    } else {
                        absoriEl.textContent = 'Not available';
                    }
                    // Relative Orientation
                    const reloriEl = document.querySelector('#sensor-relori .sensor-value');
                    if ('RelativeOrientationSensor' in window) {
                        try {
                            const sensor = new window.RelativeOrientationSensor();
                            sensor.addEventListener('reading', () => {
                                reloriEl.textContent = 'Available';
                            });
                            sensor.addEventListener('error', () => {
                                reloriEl.textContent = 'Permission denied or unavailable';
                            });
                            sensor.start();
                        } catch {
                            reloriEl.textContent = 'Not available';
                        }
                    } else {
                        reloriEl.textContent = 'Not available';
                    }
                    // Linear Acceleration
                    const linaccelEl = document.querySelector('#sensor-linaccel .sensor-value');
                    if ('LinearAccelerationSensor' in window) {
                        try {
                            const sensor = new window.LinearAccelerationSensor();
                            sensor.addEventListener('reading', () => {
                                linaccelEl.textContent = `x: ${sensor.x?.toFixed(2)}, y: ${sensor.y?.toFixed(2)}, z: ${sensor.z?.toFixed(2)}`;
                            });
                            sensor.addEventListener('error', () => {
                                linaccelEl.textContent = 'Permission denied or unavailable';
                            });
                            sensor.start();
                        } catch {
                            linaccelEl.textContent = 'Not available';
                        }
                    } else {
                        linaccelEl.textContent = 'Not available';
                    }
                    // Gravity Sensor
                    const gravityEl = document.querySelector('#sensor-gravity .sensor-value');
                    if ('GravitySensor' in window) {
                        try {
                            const sensor = new window.GravitySensor();
                            sensor.addEventListener('reading', () => {
                                gravityEl.textContent = `x: ${sensor.x?.toFixed(2)}, y: ${sensor.y?.toFixed(2)}, z: ${sensor.z?.toFixed(2)}`;
                            });
                            sensor.addEventListener('error', () => {
                                gravityEl.textContent = 'Permission denied or unavailable';
                            });
                            sensor.start();
                        } catch {
                            gravityEl.textContent = 'Not available';
                        }
                    } else {
                        gravityEl.textContent = 'Not available';
                    }
                    // Camera/Microphone
                    const camEl = document.querySelector('#sensor-camera .sensor-value');
                    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                        camEl.textContent = 'Available (see Camera option)';
                    } else {
                        camEl.textContent = 'Not available';
                    }
                } else {
                    // Restore top bar for other options
                    if (topBar) topBar.style.display = '';
                    // Restore padding and overflow to main content
                    mainContent.classList.add('px-4', 'py-8', 'overflow-auto');
                    mainContent.classList.remove('overflow-hidden');
                    // You can add logic for other drawer options here
                }
            });
        });
    }

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