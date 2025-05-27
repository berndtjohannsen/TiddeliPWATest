// Common UI operations for drawer options
export const DrawerUtils = {
    restoreTopBar() {
        const topBar = document.querySelector('nav.top-bar');
        if (topBar) topBar.style.display = '';
    },

    restoreMainContent() {
        const mainContent = document.querySelector('main');
        mainContent.classList.add('px-4', 'py-8', 'overflow-auto');
        mainContent.classList.remove('overflow-hidden');
    },

    setFullScreenMainContent() {
        const mainContent = document.querySelector('main');
        mainContent.classList.remove('px-4', 'py-8', 'overflow-auto');
        mainContent.classList.add('overflow-hidden');
    },

    getMainContent() {
        return document.querySelector('main');
    }
}; 