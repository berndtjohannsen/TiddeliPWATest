/**
 * Web Proxy Handler
 * Provides functionality to test web access through a configurable proxy
 * The proxy handles CORS and adds specified request parameters and headers
 */
export const WebProxyHandler = {
    // Default proxy configuration
    config: {
        proxyUrl: 'http://localhost:8080', // Default proxy URL
    },

    /**
     * Initialize the web proxy drawer
     */
    init() {
        console.log('Initializing Web Proxy drawer...');
        this.createDrawer();
        this.setupEventListeners();
    },

    /**
     * Create the drawer UI
     */
    createDrawer() {
        const drawer = document.createElement('div');
        drawer.className = 'p-4 space-y-4';
        drawer.innerHTML = `
            <h2 class="text-xl font-bold mb-4">Web Proxy Test</h2>
            
            <!-- Proxy Configuration -->
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Proxy URL</label>
                    <input type="text" id="proxyUrl" 
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                           value="${this.config.proxyUrl}"
                           placeholder="http://your-proxy:port">
                    <p class="mt-1 text-sm text-gray-500">The proxy server that will handle the request</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700">Target URL</label>
                    <input type="text" id="targetUrl" 
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                           placeholder="https://api.example.com/data">
                    <p class="mt-1 text-sm text-gray-500">The URL you want to access (proxy will handle CORS)</p>
                </div>

                <!-- Request Parameters -->
                <div>
                    <label class="block text-sm font-medium text-gray-700">Request Parameters</label>
                    <div id="parametersList" class="space-y-2">
                        <!-- Parameters will be added here -->
                    </div>
                    <button id="addParameter" 
                            class="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Add Parameter
                    </button>
                    <p class="mt-1 text-sm text-gray-500">Add parameters to be included in the target URL</p>
                </div>

                <!-- Request Headers -->
                <div>
                    <label class="block text-sm font-medium text-gray-700">Request Headers</label>
                    <div id="headersList" class="space-y-2">
                        <!-- Headers will be added here -->
                    </div>
                    <button id="addHeader" 
                            class="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Add Header
                    </button>
                    <p class="mt-1 text-sm text-gray-500">Add headers to be included in the request</p>
                </div>

                <!-- Prepared URL Preview -->
                <div>
                    <label class="block text-sm font-medium text-gray-700">Prepared URL</label>
                    <div id="preparedUrl" class="mt-1 p-2 bg-gray-50 rounded-md">
                        <pre class="text-sm text-gray-700 whitespace-pre-wrap">Enter target URL and parameters to see the prepared URL</pre>
                    </div>
                </div>
            </div>

            <!-- Test Button -->
            <button id="testProxy" 
                    class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Test Connection
            </button>

            <!-- Results Section -->
            <div class="mt-4">
                <h3 class="text-lg font-medium text-gray-900">Results</h3>
                <div id="results" class="mt-2 p-4 bg-gray-50 rounded-md">
                    <pre class="text-sm text-gray-700 whitespace-pre-wrap">No results yet</pre>
                </div>
            </div>
        `;

        // Add to main content
        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = '';
            main.appendChild(drawer);
        }
    },

    /**
     * Set up event listeners for the drawer
     */
    setupEventListeners() {
        const testButton = document.getElementById('testProxy');
        const addParameterButton = document.getElementById('addParameter');
        const addHeaderButton = document.getElementById('addHeader');
        const targetUrlInput = document.getElementById('targetUrl');
        
        if (testButton) {
            testButton.addEventListener('click', () => this.testConnection());
        }
        
        if (addParameterButton) {
            addParameterButton.addEventListener('click', () => {
                this.addParameterField();
                this.updatePreparedUrl();
            });
        }

        if (addHeaderButton) {
            addHeaderButton.addEventListener('click', () => {
                this.addHeaderField();
                this.updatePreparedUrl();
            });
        }

        if (targetUrlInput) {
            targetUrlInput.addEventListener('input', () => this.updatePreparedUrl());
        }
    },

    /**
     * Add a new parameter input field
     */
    addParameterField() {
        const parametersList = document.getElementById('parametersList');
        const paramId = Date.now(); // Unique ID for this parameter

        const paramDiv = document.createElement('div');
        paramDiv.className = 'flex items-center space-x-2';
        paramDiv.innerHTML = `
            <input type="text" 
                   class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                   placeholder="Parameter name"
                   id="paramName_${paramId}">
            <input type="text" 
                   class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                   placeholder="Parameter value"
                   id="paramValue_${paramId}">
            <button class="text-red-600 hover:text-red-800" onclick="document.getElementById('param_${paramId}').remove(); WebProxyHandler.updatePreparedUrl();">
                Remove
            </button>
        `;
        paramDiv.id = `param_${paramId}`;
        parametersList.appendChild(paramDiv);

        // Add input event listeners to update prepared URL
        const nameInput = paramDiv.querySelector(`#paramName_${paramId}`);
        const valueInput = paramDiv.querySelector(`#paramValue_${paramId}`);
        nameInput.addEventListener('input', () => this.updatePreparedUrl());
        valueInput.addEventListener('input', () => this.updatePreparedUrl());
    },

    /**
     * Add a new header input field
     */
    addHeaderField() {
        const headersList = document.getElementById('headersList');
        const headerId = Date.now(); // Unique ID for this header

        const headerDiv = document.createElement('div');
        headerDiv.className = 'flex items-center space-x-2';
        headerDiv.innerHTML = `
            <input type="text" 
                   class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                   placeholder="Header name"
                   id="headerName_${headerId}">
            <input type="text" 
                   class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                   placeholder="Header value"
                   id="headerValue_${headerId}">
            <button class="text-red-600 hover:text-red-800" onclick="document.getElementById('header_${headerId}').remove(); WebProxyHandler.updatePreparedUrl();">
                Remove
            </button>
        `;
        headerDiv.id = `header_${headerId}`;
        headersList.appendChild(headerDiv);

        // Add input event listeners to update prepared URL
        const nameInput = headerDiv.querySelector(`#headerName_${headerId}`);
        const valueInput = headerDiv.querySelector(`#headerValue_${headerId}`);
        nameInput.addEventListener('input', () => this.updatePreparedUrl());
        valueInput.addEventListener('input', () => this.updatePreparedUrl());
    },

    /**
     * Update the prepared URL preview
     */
    updatePreparedUrl() {
        const targetUrl = document.getElementById('targetUrl').value;
        const newParameters = this.getParameters();
        const headers = this.getHeaders();
        
        const preparedUrlDiv = document.getElementById('preparedUrl');
        
        if (!targetUrl) {
            preparedUrlDiv.innerHTML = '<pre class="text-sm text-gray-700">Enter target URL and parameters to see the prepared URL</pre>';
            return;
        }

        try {
            // 1. Parse target URL into base URL and existing parameters
            const [baseUrl, existingQueryString] = targetUrl.split('?');
            
            // 2. Parse existing parameters if any
            const existingParameters = {};
            if (existingQueryString) {
                existingQueryString.split('&').forEach(param => {
                    const [key, value] = param.split('=');
                    if (key && value) {
                        existingParameters[key] = value;
                    }
                });
            }

            // 3. Combine existing and new parameters
            const allParameters = { ...existingParameters, ...newParameters };
            
            // 4. Build final URL
            let finalUrl = baseUrl;
            const paramEntries = Object.entries(allParameters);
            
            if (paramEntries.length > 0) {
                finalUrl += '?' + paramEntries.map(([key, value]) => `${key}=${value}`).join('&');
            }

            // Format the display
            let display = `URL: ${finalUrl}\n\n`;
            
            if (Object.keys(headers).length > 0) {
                display += 'Headers:\n';
                Object.entries(headers).forEach(([key, value]) => {
                    display += `${key}: ${value}\n`;
                });
            }

            preparedUrlDiv.innerHTML = `<pre class="text-sm text-gray-700 whitespace-pre-wrap">${display}</pre>`;
        } catch (error) {
            preparedUrlDiv.innerHTML = `<pre class="text-sm text-red-700 whitespace-pre-wrap">Invalid URL: ${error.message}</pre>`;
        }
    },

    /**
     * Get all parameters from the UI
     */
    getParameters() {
        const parameters = {};
        const paramElements = document.querySelectorAll('[id^="param_"]');
        
        paramElements.forEach(paramDiv => {
            const paramId = paramDiv.id.split('_')[1];
            const name = document.getElementById(`paramName_${paramId}`).value;
            const value = document.getElementById(`paramValue_${paramId}`).value;
            
            if (name && value) {
                parameters[name] = value;
            }
        });
        
        return parameters;
    },

    /**
     * Get all headers from the UI
     */
    getHeaders() {
        const headers = {};
        const headerElements = document.querySelectorAll('[id^="header_"]');
        
        headerElements.forEach(headerDiv => {
            const headerId = headerDiv.id.split('_')[1];
            const name = document.getElementById(`headerName_${headerId}`).value;
            const value = document.getElementById(`headerValue_${headerId}`).value;
            
            if (name && value) {
                headers[name] = value;
            }
        });
        
        return headers;
    },

    /**
     * Test the connection through the proxy
     */
    async testConnection() {
        // Get current configuration
        this.config.proxyUrl = document.getElementById('proxyUrl').value;
        const targetUrl = document.getElementById('targetUrl').value;
        const parameters = this.getParameters();
        const headers = this.getHeaders();
        
        if (!targetUrl) {
            alert('Please enter a target URL');
            return;
        }

        try {
            // Show loading state
            const results = document.getElementById('results');
            results.innerHTML = '<pre class="text-sm text-gray-700">Testing connection...</pre>';

            // Make the request through the proxy
            const response = await this.makeRequest(targetUrl, parameters, headers);
            
            // Display results
            results.innerHTML = `
                <pre class="text-sm text-gray-700 whitespace-pre-wrap">
Status: ${response.status}
Headers: ${JSON.stringify(response.headers, null, 2)}
Body: ${JSON.stringify(response.data, null, 2)}
                </pre>
            `;
        } catch (error) {
            // Display error
            const results = document.getElementById('results');
            results.innerHTML = `
                <pre class="text-sm text-red-700 whitespace-pre-wrap">
Error: ${error.message}
                </pre>
            `;
        }
    },

    /**
     * Make the actual request through the proxy
     */
    async makeRequest(targetUrl, parameters, headers) {
        try {
            // Validate target URL first
            if (!targetUrl) {
                throw new Error('Target URL is required');
            }

            // Build the URL with parameters
            const [baseUrl, existingQueryString] = targetUrl.split('?');
            
            // Parse existing parameters if any
            const existingParameters = {};
            if (existingQueryString) {
                existingQueryString.split('&').forEach(param => {
                    const [key, value] = param.split('=');
                    if (key && value) {
                        existingParameters[key] = value;
                    }
                });
            }

            // Combine existing and new parameters
            const allParameters = { ...existingParameters, ...parameters };
            
            // Build final URL
            let finalUrl = baseUrl;
            const paramEntries = Object.entries(allParameters);
            
            if (paramEntries.length > 0) {
                finalUrl += '?' + paramEntries.map(([key, value]) => `${key}=${value}`).join('&');
            }

            // Parse the target URL to get its components
            let targetUrlObj;
            try {
                targetUrlObj = new URL(finalUrl);
            } catch (error) {
                throw new Error(`Invalid URL: ${finalUrl}`);
            }
            
            // Send request to proxy with standard proxy headers
            const response = await fetch(this.config.proxyUrl, {
                method: 'GET',  // Explicitly using GET
                headers: {
                    'X-Forwarded-Host': targetUrlObj.host,
                    'X-Forwarded-Proto': targetUrlObj.protocol.replace(':', ''),
                    'X-Forwarded-Path': targetUrlObj.pathname + targetUrlObj.search,
                    ...headers
                }
            });

            if (!response.ok) {
                // Try to get the error text
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}\nResponse: ${errorText}`);
            }

            // Check content type to ensure we're getting JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Expected JSON response but got: ${contentType}\nResponse: ${text}`);
            }

            const data = await response.json();
            return {
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                data
            };
        } catch (error) {
            // Enhance error message with more context
            const enhancedError = new Error(
                `Failed to make request through proxy:\n` +
                `Proxy URL: ${this.config.proxyUrl}\n` +
                `Target URL: ${targetUrl}\n` +
                `Error: ${error.message}`
            );
            throw enhancedError;
        }
    }
}; 