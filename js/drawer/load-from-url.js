import { DrawerUtils } from './utils.js';

export const LoadFromURLHandler = {
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">Load from URL</h2>
                <div class="card">
                    <h3 class="card-title">Show Web Page</h3>
                    <input type="text" id="url-input" class="input-primary w-full mb-2" placeholder="Enter URL (e.g. https://example.com)" />
                    <button id="load-url-btn" class="btn-primary mb-2">Load Page</button>
                    <div id="iframe-container" class="mt-4 w-full" style="min-height: 400px;"></div>
                </div>
            </div>
        `;
        this.initEvents();
    },
    initEvents() {
        document.getElementById('load-url-btn').onclick = () => {
            let url = document.getElementById('url-input').value.trim();
            const container = document.getElementById('iframe-container');
            container.innerHTML = '';
            if (!url) return;
            // Add https:// if missing
            if (!/^https?:\/\//i.test(url)) {
                url = 'https://' + url;
            }
            // Try to load in iframe
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.width = '100%';
            iframe.height = '400';
            iframe.style.border = '1px solid #ccc';
            iframe.onload = function() {
                // If loaded, do nothing (success)
            };
            container.appendChild(iframe);
            // Always show a warning below the iframe
            const warning = document.createElement('div');
            warning.className = 'mt-2 text-gray-500 text-xs';
            warning.innerHTML = 'If the page does not appear above, it is likely blocked by browser security (X-Frame-Options or Content-Security-Policy). Most modern websites block embedding for security reasons. Also, it is not possible to lazy-load or paginate external web pages due to browser sandboxing and cross-origin restrictions.';
            container.appendChild(warning);
        };
    }
}; 