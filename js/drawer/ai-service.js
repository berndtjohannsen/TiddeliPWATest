import { DrawerUtils } from './utils.js';

export const AIServiceHandler = {
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">AI Service Demo</h2>
                <div class="card">
                    <h3 class="card-title">Talk to an AI (LLM)</h3>
                    <div class="mb-2">
                        <label class="block text-sm font-medium mb-1">Service</label>
                        <select id="ai-service-select" class="input-primary w-full">
                            <option value="openai">OpenAI (ChatGPT, GPT-4)</option>
                            <option value="anthropic">Anthropic (Claude)</option>
                            <option value="gemini">Google Gemini (Bard)</option>
                            <option value="cohere">Cohere</option>
                            <option value="mistral">Mistral</option>
                            <option value="perplexity">Perplexity</option>
                            <option value="alephalpha">Aleph Alpha</option>
                            <option value="deepseek">DeepSeek</option>
                            <option value="writer">Writer</option>
                            <option value="bedrock">Amazon Bedrock</option>
                        </select>
                    </div>
                    <div class="mb-2">
                        <label class="block text-sm font-medium mb-1">API Key</label>
                        <input type="text" id="ai-api-key" class="input-primary w-full" placeholder="Paste your API key here (never stored)" />
                    </div>
                    <div class="mb-2">
                        <label class="block text-sm font-medium mb-1">Prompt</label>
                        <textarea id="ai-prompt" class="input-primary w-full" rows="4" placeholder="Ask anything..."></textarea>
                    </div>
                    <div class="mb-2" id="ai-model-group" style="display:none;">
                        <label class="block text-sm font-medium mb-1">Model (for Gemini)</label>
                        <input type="text" id="ai-model" class="input-primary w-full" value="gemini-pro" />
                    </div>
                    <button id="ai-send-btn" class="btn-primary">Send</button>
                    <button id="ai-list-models-btn" class="btn-primary ml-2">List Available Models (Gemini)</button>
                    <div id="ai-warning" class="mt-2 text-yellow-600 text-sm hidden"></div>
                    <div id="ai-response" class="mt-4 p-3 bg-gray-50 border rounded text-base whitespace-pre-line"></div>
                </div>
            </div>
        `;
        this.initEvents();
    },
    initEvents() {
        const sendBtn = document.getElementById('ai-send-btn');
        const apiKeyInput = document.getElementById('ai-api-key');
        const promptInput = document.getElementById('ai-prompt');
        const responseDiv = document.getElementById('ai-response');
        const warningDiv = document.getElementById('ai-warning');
        const serviceSelect = document.getElementById('ai-service-select');
        const listModelsBtn = document.getElementById('ai-list-models-btn');
        const modelGroup = document.getElementById('ai-model-group');
        const modelInput = document.getElementById('ai-model');

        sendBtn.onclick = async () => {
            const service = serviceSelect.value;
            const apiKey = apiKeyInput.value.trim();
            const prompt = promptInput.value.trim();
            responseDiv.textContent = '';
            warningDiv.classList.add('hidden');
            if (!prompt) {
                warningDiv.textContent = 'Please enter a prompt.';
                warningDiv.classList.remove('hidden');
                return;
            }
            if (!apiKey) {
                warningDiv.textContent = 'No API key provided. This is a UI demo only. Please paste your own API key to use the real service.';
                warningDiv.classList.remove('hidden');
                responseDiv.textContent = `\u{1F916} [MOCK] You asked: "${prompt}"\n\n(This is a demo. Enter your API key for real AI responses.)`;
                return;
            }
            // Real API integration would go here
            responseDiv.textContent = 'Loading...';
            try {
                let result = '';
                if (service === 'openai') {
                    result = await callOpenAI(apiKey, prompt);
                } else if (service === 'anthropic') {
                    result = await callAnthropic(apiKey, prompt);
                } else if (service === 'gemini') {
                    result = await callGemini(apiKey, prompt, modelInput.value.trim());
                } else if (service === 'cohere') {
                    result = await callCohere(apiKey, prompt);
                } else if (service === 'mistral') {
                    result = await callMistral(apiKey, prompt);
                } else if (service === 'perplexity') {
                    result = await callPerplexity(apiKey, prompt);
                } else if (service === 'alephalpha') {
                    result = await callAlephAlpha(apiKey, prompt);
                } else if (service === 'deepseek') {
                    result = await callDeepSeek(apiKey, prompt);
                } else if (service === 'writer') {
                    result = await callWriter(apiKey, prompt);
                } else if (service === 'bedrock') {
                    result = await callBedrock(apiKey, prompt);
                } else {
                    result = '[Unknown service]';
                }
                responseDiv.textContent = result;
            } catch (err) {
                responseDiv.textContent = '[Error] ' + err.message;
            }
        };

        listModelsBtn.onclick = async () => {
            const apiKey = apiKeyInput.value.trim();
            responseDiv.textContent = '';
            warningDiv.classList.add('hidden');
            if (!apiKey) {
                warningDiv.textContent = 'Please enter your Gemini API key to list models.';
                warningDiv.classList.remove('hidden');
                return;
            }
            responseDiv.textContent = 'Loading models...';
            try {
                const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
                const data = await response.json();
                if (data.models) {
                    // Show models as clickable list
                    responseDiv.innerHTML = 'Available models:<br>' + data.models.map(m => `<span class="ai-model-choice cursor-pointer text-blue-700 hover:underline" style="display:block; margin-bottom:2px;">${m.name.replace('models/','')}</span>`).join('');
                    // Add click handlers
                    Array.from(responseDiv.querySelectorAll('.ai-model-choice')).forEach(el => {
                        el.onclick = () => {
                            modelInput.value = el.textContent;
                            responseDiv.innerHTML = `<span class='text-green-700'>Model selected: ${el.textContent}</span>`;
                        };
                    });
                } else {
                    responseDiv.textContent = 'No models found or error: ' + JSON.stringify(data);
                }
            } catch (err) {
                responseDiv.textContent = '[Error] ' + err.message;
            }
        };

        // Show/hide model input for Gemini
        serviceSelect.onchange = () => {
            if (serviceSelect.value === 'gemini') {
                modelGroup.style.display = '';
            } else {
                modelGroup.style.display = 'none';
            }
        };
        // Initialize visibility
        serviceSelect.onchange();

        // --- Service call stubs ---
        async function callOpenAI(apiKey, prompt) {
            // Example: POST to https://api.openai.com/v1/chat/completions
            // (You would need to implement the real call here)
            return '[OpenAI] (Demo) This is where the real response would appear.';
        }
        async function callAnthropic(apiKey, prompt) {
            return '[Anthropic] (Demo) This is where the real response would appear.';
        }
        async function callGemini(apiKey, prompt, model) {
            // WARNING: This exposes your API key in the browser. For demo only!
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
            const data = await response.json();
            // Try to extract the text response
            return data.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data);
        }
        async function callCohere(apiKey, prompt) {
            return '[Cohere] (Demo) This is where the real response would appear.';
        }
        async function callMistral(apiKey, prompt) {
            return '[Mistral] (Demo) This is where the real response would appear.';
        }
        async function callPerplexity(apiKey, prompt) {
            return '[Perplexity] (Demo) This is where the real response would appear.';
        }
        async function callAlephAlpha(apiKey, prompt) {
            return '[Aleph Alpha] (Demo) This is where the real response would appear.';
        }
        async function callDeepSeek(apiKey, prompt) {
            return '[DeepSeek] (Demo) This is where the real response would appear.';
        }
        async function callWriter(apiKey, prompt) {
            return '[Writer] (Demo) This is where the real response would appear.';
        }
        async function callBedrock(apiKey, prompt) {
            return '[Amazon Bedrock] (Demo) This is where the real response would appear.';
        }
    }
}; 