import { DrawerUtils } from './utils.js';

export const PDFHandler = {
    init() {
        DrawerUtils.restoreTopBar();
        DrawerUtils.restoreMainContent();
        const mainContent = DrawerUtils.getMainContent();
        mainContent.innerHTML = `
            <div class="space-y-8">
                <h2 class="text-xl font-semibold mb-4">PDF Demo</h2>
                <div class="card">
                    <h3 class="card-title">Generate PDF from Text</h3>
                    <textarea id="pdf-text" class="input-primary w-full mb-2" rows="6" placeholder="Enter text to generate PDF..."></textarea>
                    <button id="generate-pdf" class="btn-primary">Generate PDF</button>
                </div>
                <div class="card">
                    <h3 class="card-title">Read PDF</h3>
                    <input type="file" id="pdf-file" accept="application/pdf" class="mb-2" />
                    <input type="text" id="pdf-url" class="input-primary w-full mb-2" placeholder="Or enter PDF URL..." />
                    <button id="load-pdf" class="btn-primary">Load PDF</button>
                    <div id="pdf-viewer" class="mt-4 border rounded bg-gray-50 p-2" style="height: 400px; overflow-y: auto; min-width: 100%; background: #f9fafb;"></div>
                </div>
            </div>
        `;
        this.initEvents();
    },
    initEvents() {
        // Generate PDF from text
        document.getElementById('generate-pdf').onclick = () => {
            const text = document.getElementById('pdf-text').value;
            if (!text.trim()) {
                alert('Please enter some text.');
                return;
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text(text, 10, 20);
            doc.save('generated.pdf');
        };

        // Read PDF from file
        document.getElementById('pdf-file').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    loadPdf(ev.target.result);
                };
                reader.readAsArrayBuffer(file);
            }
        };

        // Read PDF from URL
        document.getElementById('load-pdf').onclick = () => {
            const url = document.getElementById('pdf-url').value.trim();
            if (url) {
                loadPdf(url);
            }
        };

        // Helper to load and render PDF
        function loadPdf(src) {
            if (!window.pdfjsLib) {
                alert('PDF.js library is not loaded. Please check your internet connection or try again.');
                return;
            }
            const pdfjsLib = window.pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js';
            const loadingTask = pdfjsLib.getDocument(src);
            loadingTask.promise.then(function(pdf) {
                const viewer = document.getElementById('pdf-viewer');
                viewer.innerHTML = '';
                // Render all pages
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    pdf.getPage(pageNum).then(function(page) {
                        const scale = 1.2;
                        const viewport = page.getViewport({ scale });
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        const context = canvas.getContext('2d');
                        const renderContext = {
                            canvasContext: context,
                            viewport: viewport
                        };
                        page.render(renderContext).promise.then(function() {
                            viewer.appendChild(canvas);
                        });
                    });
                }
            }, function(reason) {
                alert('Error loading PDF: ' + reason);
            });
        }
    }
}; 