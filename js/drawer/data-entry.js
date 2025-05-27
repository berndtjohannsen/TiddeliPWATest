import { DrawerUtils } from './utils.js';

export const DataEntryHandler = {
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        
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

        this.initForm();
    },

    initForm() {
        const form = document.getElementById('data-entry-form');
        if (!form) return;

        // Restore form data from localStorage
        const saved = JSON.parse(localStorage.getItem('dataEntryForm') || '{}');
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
}; 