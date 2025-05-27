import { DrawerUtils } from './utils.js';

export const UIDemoHandler = {
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">UI Components Demo</h2>
                
                <!-- Text Inputs -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium mb-3">Text Inputs</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Standard Input</label>
                            <input type="text" class="w-full border rounded px-3 py-2" placeholder="Enter text...">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">With Icon</label>
                            <div class="relative">
                                <input type="text" class="w-full border rounded pl-10 pr-3 py-2" placeholder="Search...">
                                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Selection Controls -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium mb-3">Selection Controls</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Dropdown Select</label>
                            <select class="w-full border rounded px-3 py-2">
                                <option value="">Select an option</option>
                                <option value="1">Option 1</option>
                                <option value="2">Option 2</option>
                                <option value="3">Option 3</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Multi-select</label>
                            <select multiple class="w-full border rounded px-3 py-2">
                                <option value="1">Option 1</option>
                                <option value="2">Option 2</option>
                                <option value="3">Option 3</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Toggle Controls -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium mb-3">Toggle Controls</h3>
                    <div class="space-y-4">
                        <div class="flex items-center">
                            <input type="checkbox" id="toggle1" class="w-4 h-4 text-indigo-600">
                            <label for="toggle1" class="ml-2 text-sm">Standard Checkbox</label>
                        </div>
                        <div class="flex items-center">
                            <input type="radio" id="radio1" name="radio" class="w-4 h-4 text-indigo-600">
                            <label for="radio1" class="ml-2 text-sm">Radio Option 1</label>
                        </div>
                        <div class="flex items-center">
                            <input type="radio" id="radio2" name="radio" class="w-4 h-4 text-indigo-600">
                            <label for="radio2" class="ml-2 text-sm">Radio Option 2</label>
                        </div>
                    </div>
                </div>

                <!-- Range Controls -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium mb-3">Range Controls</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Slider</label>
                            <input type="range" min="0" max="100" class="w-full">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Color Picker</label>
                            <input type="color" class="w-full h-10">
                        </div>
                    </div>
                </div>

                <!-- Date & Time -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium mb-3">Date & Time</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Date Picker</label>
                            <input type="date" class="w-full border rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Time Picker</label>
                            <input type="time" class="w-full border rounded px-3 py-2">
                        </div>
                    </div>
                </div>

                <!-- File Upload -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium mb-3">File Upload</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">File Input</label>
                            <input type="file" class="w-full border rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Multiple Files</label>
                            <input type="file" multiple class="w-full border rounded px-3 py-2">
                        </div>
                    </div>
                </div>

                <!-- Buttons -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium mb-3">Buttons</h3>
                    <div class="space-y-4">
                        <div class="flex space-x-4">
                            <button class="bg-indigo-600 text-white px-4 py-2 rounded">Primary</button>
                            <button class="bg-gray-200 text-gray-800 px-4 py-2 rounded">Secondary</button>
                        </div>
                        <div class="flex space-x-4">
                            <button class="bg-indigo-600 text-white px-4 py-2 rounded flex items-center">
                                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                </svg>
                                With Icon
                            </button>
                            <button class="border border-indigo-600 text-indigo-600 px-4 py-2 rounded">Outline</button>
                        </div>
                    </div>
                </div>

                <!-- Text Area -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium mb-3">Text Area</h3>
                    <div>
                        <label class="block text-sm font-medium mb-1">Multi-line Input</label>
                        <textarea class="w-full border rounded px-3 py-2" rows="4" placeholder="Enter multiple lines..."></textarea>
                    </div>
                </div>

                <!-- Progress Indicators -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium mb-3">Progress Indicators</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Progress Bar</label>
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="bg-indigo-600 h-2.5 rounded-full" style="width: 45%"></div>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Spinner</label>
                            <div class="flex justify-center">
                                <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tags/Chips -->
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="text-lg font-medium mb-3">Tags/Chips</h3>
                    <div class="flex flex-wrap gap-2">
                        <span class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">Tag 1</span>
                        <span class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">Tag 2</span>
                        <span class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">Tag 3</span>
                        <span class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">+ Add</span>
                    </div>
                </div>
            </div>
        `;

        this.initEventListeners();
    },

    initEventListeners() {
        // Add any interactive functionality here
        const rangeInput = document.querySelector('input[type="range"]');
        if (rangeInput) {
            rangeInput.addEventListener('input', (e) => {
                // You could add a value display or other feedback here
            });
        }
    }
}; 