import { DrawerUtils } from './utils.js';

export const EmailHandler = {
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">Send Email</h2>
                <div class="card">
                    <h3 class="card-title">Compose Email</h3>
                    <form id="email-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">To</label>
                            <input type="email" id="email-to" class="input-primary w-full" placeholder="recipient@example.com" required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Subject</label>
                            <input type="text" id="email-subject" class="input-primary w-full" placeholder="Subject" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Body</label>
                            <textarea id="email-body" class="input-primary w-full" rows="6" placeholder="Write your message..."></textarea>
                        </div>
                        <button type="submit" class="btn-primary">Open Email App</button>
                    </form>
                </div>
            </div>
        `;
        this.initEvents();
    },
    initEvents() {
        document.getElementById('email-form').onsubmit = (e) => {
            e.preventDefault();
            const to = encodeURIComponent(document.getElementById('email-to').value);
            const subject = encodeURIComponent(document.getElementById('email-subject').value);
            const body = encodeURIComponent(document.getElementById('email-body').value);
            const mailto = `mailto:${to}?subject=${subject}&body=${body}`;
            window.location.href = mailto;
        };
    }
}; 