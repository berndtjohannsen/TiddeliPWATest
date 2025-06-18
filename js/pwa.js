// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Check if we're in development mode (localhost)
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isDev) {
            // In development, unregister any existing service workers
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for (let registration of registrations) {
                    registration.unregister();
                }
                console.log('Service workers unregistered for development');
            });
        } else {
            // In production, register the service worker
            navigator.serviceWorker.register('/service-worker.js')
                .then((registration) => {
                    console.log('ServiceWorker registration successful');
                })
                .catch((err) => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        }
    });
}

// Handle PWA installation
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    // TODO: Add install button or notification
});

// Handle successful installation
window.addEventListener('appinstalled', (evt) => {
    console.log('App was installed');
}); 