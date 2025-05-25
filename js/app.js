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
    const dropdownOverlay = document.getElementById('dropdown-overlay');

    if (hamburgerMenuBtn && dropdownMenu && dropdownOverlay) {
        hamburgerMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !dropdownMenu.classList.contains('hidden');
            if (isOpen) {
                dropdownMenu.classList.add('hidden');
                dropdownOverlay.classList.add('hidden');
            } else {
                dropdownMenu.classList.remove('hidden');
                dropdownOverlay.classList.remove('hidden');
                // Always focus the first option in the dropdown
                const firstOption = dropdownMenu.querySelector('a');
                if (firstOption) firstOption.focus();
            }
        });
        dropdownOverlay.addEventListener('click', () => {
            dropdownMenu.classList.add('hidden');
            dropdownOverlay.classList.add('hidden');
        });
        // Optional: Hide dropdown if clicking anywhere else
        document.addEventListener('click', (e) => {
            if (!hamburgerMenuBtn.contains(e.target)) {
                dropdownMenu.classList.add('hidden');
                dropdownOverlay.classList.add('hidden');
            }
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