import { DrawerUtils } from './utils.js';

export const NotificationsHandler = {
    async init() {
        try {
            console.log('Initializing Notifications handler...');
            DrawerUtils.restoreTopBar();
            DrawerUtils.restoreMainContent();
            const mainContent = DrawerUtils.getMainContent();

            // Check if notifications are supported
            const isSupported = 'Notification' in window;
            console.log('Notifications Support Status:', isSupported ? 'Supported' : 'Not Supported');
            
            mainContent.innerHTML = `
                <div class="space-y-8">
                    <h2 class="text-xl font-semibold mb-4">Notifications Demo</h2>
                    
                    ${isSupported ? `
                        <div class="card">
                            <h3 class="card-title">Permission Status</h3>
                            <div class="flex flex-col gap-2">
                                <div id="permission-status" class="mt-2 text-gray-600">
                                    Current status: ${Notification.permission}
                                </div>
                                <button id="request-permission" class="btn-primary w-fit">
                                    Request Permission
                                </button>
                            </div>
                        </div>

                        <div class="card">
                            <h3 class="card-title">Basic Notification</h3>
                            <div class="flex flex-col gap-2">
                                <input id="basic-title" type="text" class="input-primary" placeholder="Notification title" value="Hello!">
                                <input id="basic-body" type="text" class="input-primary" placeholder="Notification body" value="This is a basic notification">
                                <button id="send-basic" class="btn-primary w-fit">Send Basic Notification</button>
                            </div>
                        </div>

                        <div class="card">
                            <h3 class="card-title">Notification with Actions</h3>
                            <div class="flex flex-col gap-2">
                                <input id="action-title" type="text" class="input-primary" placeholder="Notification title" value="Action Required">
                                <input id="action-body" type="text" class="input-primary" placeholder="Notification body" value="Click an action below">
                                <button id="send-action" class="btn-primary w-fit">Send Action Notification</button>
                            </div>
                        </div>

                        <div class="card">
                            <h3 class="card-title">Notification with Image</h3>
                            <div class="flex flex-col gap-2">
                                <input id="image-title" type="text" class="input-primary" placeholder="Notification title" value="Image Notification">
                                <input id="image-body" type="text" class="input-primary" placeholder="Notification body" value="Check out this image">
                                <input id="image-url" type="text" class="input-primary" placeholder="Image URL" value="https://picsum.photos/200">
                                <button id="send-image" class="btn-primary w-fit">Send Image Notification</button>
                            </div>
                        </div>

                        <div class="card">
                            <h3 class="card-title">Notification with Badge</h3>
                            <div class="flex flex-col gap-2">
                                <input id="badge-title" type="text" class="input-primary" placeholder="Notification title" value="New Message">
                                <input id="badge-body" type="text" class="input-primary" placeholder="Notification body" value="You have a new message">
                                <input id="badge-icon" type="text" class="input-primary" placeholder="Badge icon URL" value="https://picsum.photos/64">
                                <button id="send-badge" class="btn-primary w-fit">Send Badge Notification</button>
                            </div>
                        </div>
                    ` : `
                        <div class="card">
                            <div class="p-4 text-center">
                                <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                                <h3 class="text-lg font-medium text-gray-900 mb-2">Notifications Not Supported</h3>
                                <p class="text-gray-600">
                                    Your browser does not support the Notifications API.
                                    <br><br>
                                    Please try a different browser.
                                </p>
                            </div>
                        </div>
                    `}
                </div>
            `;

            if (isSupported) {
                console.log('Setting up notification event handlers...');
                this.initEvents();
            }
        } catch (error) {
            console.error('Error initializing Notifications handler:', error);
            const mainContent = DrawerUtils.getMainContent();
            mainContent.innerHTML = `
                <div class="card">
                    <div class="p-4 text-center">
                        <svg class="w-12 h-12 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Notifications Feature</h3>
                        <p class="text-gray-600">
                            There was an error loading the notifications feature.
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
            console.log('Initializing notification event handlers...');
            
            // Permission request
            const requestPermissionBtn = document.getElementById('request-permission');
            const permissionStatus = document.getElementById('permission-status');
            
            requestPermissionBtn.addEventListener('click', async () => {
                try {
                    const permission = await Notification.requestPermission();
                    permissionStatus.textContent = `Current status: ${permission}`;
                    console.log('Notification permission:', permission);
                } catch (error) {
                    console.error('Error requesting notification permission:', error);
                }
            });

            // Basic notification
            const sendBasicBtn = document.getElementById('send-basic');
            sendBasicBtn.addEventListener('click', () => {
                const title = document.getElementById('basic-title').value;
                const body = document.getElementById('basic-body').value;
                
                try {
                    const notification = new Notification(title, {
                        body: body,
                        icon: 'assets/icons/icon-192x192.png'
                    });
                    console.log('Basic notification sent:', notification);
                } catch (error) {
                    console.error('Error sending basic notification:', error);
                }
            });

            // Action notification
            const sendActionBtn = document.getElementById('send-action');
            sendActionBtn.addEventListener('click', async () => {
                const title = document.getElementById('action-title').value;
                const body = document.getElementById('action-body').value;
                
                try {
                    // Get the service worker registration
                    const registration = await navigator.serviceWorker.ready;
                    
                    // Show notification through service worker
                    await registration.showNotification(title, {
                        body: body,
                        icon: 'assets/icons/icon-192x192.png',
                        actions: [
                            {
                                action: 'accept',
                                title: 'Accept'
                            },
                            {
                                action: 'reject',
                                title: 'Reject'
                            }
                        ]
                    });

                    console.log('Action notification sent through service worker');
                } catch (error) {
                    console.error('Error sending action notification:', error);
                    // Fallback to basic notification if service worker fails
                    try {
                        const notification = new Notification(title, {
                            body: body + ' (Action buttons not available)',
                            icon: 'assets/icons/icon-192x192.png'
                        });
                        console.log('Fallback basic notification sent');
                    } catch (fallbackError) {
                        console.error('Fallback notification also failed:', fallbackError);
                    }
                }
            });

            // Image notification
            const sendImageBtn = document.getElementById('send-image');
            sendImageBtn.addEventListener('click', () => {
                const title = document.getElementById('image-title').value;
                const body = document.getElementById('image-body').value;
                const imageUrl = document.getElementById('image-url').value;
                
                try {
                    const notification = new Notification(title, {
                        body: body,
                        icon: 'assets/icons/icon-192x192.png',
                        image: imageUrl
                    });
                    console.log('Image notification sent:', notification);
                } catch (error) {
                    console.error('Error sending image notification:', error);
                }
            });

            // Badge notification
            const sendBadgeBtn = document.getElementById('send-badge');
            sendBadgeBtn.addEventListener('click', () => {
                const title = document.getElementById('badge-title').value;
                const body = document.getElementById('badge-body').value;
                const badgeIcon = document.getElementById('badge-icon').value;
                
                try {
                    const notification = new Notification(title, {
                        body: body,
                        icon: 'assets/icons/icon-192x192.png',
                        badge: badgeIcon
                    });
                    console.log('Badge notification sent:', notification);
                } catch (error) {
                    console.error('Error sending badge notification:', error);
                }
            });

        } catch (error) {
            console.error('Error setting up notification event handlers:', error);
            throw error;
        }
    }
}; 