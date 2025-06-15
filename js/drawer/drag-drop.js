/**
 * Drag and Drop Demo Handler
 * Demonstrates various drag and drop use cases:
 * 1. File upload with drag and drop
 * 2. Reorderable list
 * 3. Drag and drop between containers
 */
export const DragDropHandler = {
    init() {
        // Clear existing content
        const mainContent = document.querySelector('main');
        mainContent.innerHTML = `
            <div class="demo-container">
                <div class="demo-section">
                    <h2>File Upload</h2>
                    <div class="file-drop-zone" id="fileDropZone">
                        <p>Drag and drop files here or click to select</p>
                        <input type="file" id="fileInput" style="display: none">
                    </div>
                    <div id="fileList"></div>
                </div>

                <div class="demo-section">
                    <h2>Reorderable List</h2>
                    <ul class="reorderable-list" id="reorderableList">
                        <li class="reorderable-item" draggable="true">Item 1</li>
                        <li class="reorderable-item" draggable="true">Item 2</li>
                        <li class="reorderable-item" draggable="true">Item 3</li>
                        <li class="reorderable-item" draggable="true">Item 4</li>
                        <li class="reorderable-item" draggable="true">Item 5</li>
                    </ul>
                </div>

                <div class="demo-section">
                    <h2>Container Transfer</h2>
                    <div class="container-transfer">
                        <div class="transfer-container" id="container1">
                            <div class="transfer-item" draggable="true">Task 1</div>
                            <div class="transfer-item" draggable="true">Task 2</div>
                            <div class="transfer-item" draggable="true">Task 3</div>
                        </div>
                        <div class="transfer-container" id="container2">
                            <div class="transfer-item" draggable="true">Task 4</div>
                            <div class="transfer-item" draggable="true">Task 5</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .demo-container {
                max-width: 800px;
                margin: 0 auto;
            }

            .demo-section {
                margin-bottom: 30px;
                padding: 20px;
                border: 1px solid #ccc;
                border-radius: 8px;
            }

            h2 {
                color: #333;
                margin-bottom: 15px;
            }

            /* File Upload Styles */
            .file-drop-zone {
                border: 2px dashed #ccc;
                padding: 20px;
                text-align: center;
                background: #f9f9f9;
                border-radius: 4px;
                transition: all 0.3s ease;
            }

            .file-drop-zone.dragover {
                background: #e1f5fe;
                border-color: #2196f3;
            }

            /* Reorderable List Styles */
            .reorderable-list {
                list-style: none;
                padding: 0;
            }

            .reorderable-item {
                padding: 10px;
                margin: 5px 0;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: move;
                transition: all 0.2s ease;
            }

            .reorderable-item.dragging {
                opacity: 0.5;
                background: #f5f5f5;
            }

            /* Container Transfer Styles */
            .container-transfer {
                display: flex;
                gap: 20px;
            }

            .transfer-container {
                flex: 1;
                min-height: 200px;
                padding: 10px;
                background: #f5f5f5;
                border-radius: 4px;
            }

            .transfer-item {
                padding: 8px;
                margin: 5px 0;
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: move;
            }

            .transfer-item.dragging {
                opacity: 0.5;
            }
        `;
        document.head.appendChild(style);

        // Setup event listeners
        this.setupFileUpload();
        this.setupReorderableList();
        this.setupContainerTransfer();
    },

    setupFileUpload() {
        const fileDropZone = document.getElementById('fileDropZone');
        const fileInput = document.getElementById('fileInput');
        const fileList = document.getElementById('fileList');

        fileDropZone.addEventListener('click', () => fileInput.click());
        fileDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileDropZone.classList.add('dragover');
        });
        fileDropZone.addEventListener('dragleave', () => {
            fileDropZone.classList.remove('dragover');
        });
        fileDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            fileDropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    },

    setupReorderableList() {
        const reorderableList = document.getElementById('reorderableList');
        let draggedItem = null;

        reorderableList.addEventListener('dragstart', (e) => {
            draggedItem = e.target;
            e.target.classList.add('dragging');
        });

        reorderableList.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });

        reorderableList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(reorderableList, e.clientY);
            if (afterElement) {
                reorderableList.insertBefore(draggedItem, afterElement);
            } else {
                reorderableList.appendChild(draggedItem);
            }
        });
    },

    setupContainerTransfer() {
        const containers = document.querySelectorAll('.transfer-container');
        let draggedTask = null;

        containers.forEach(container => {
            container.addEventListener('dragstart', (e) => {
                if (e.target.classList.contains('transfer-item')) {
                    draggedTask = e.target;
                    e.target.classList.add('dragging');
                }
            });

            container.addEventListener('dragend', (e) => {
                if (e.target.classList.contains('transfer-item')) {
                    e.target.classList.remove('dragging');
                }
            });

            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(container, e.clientY);
                if (afterElement) {
                    container.insertBefore(draggedTask, afterElement);
                } else {
                    container.appendChild(draggedTask);
                }
            });
        });
    },

    handleFiles(files) {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';
        
        Array.from(files).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.textContent = `${file.name} (${this.formatFileSize(file.size)})`;
            fileList.appendChild(fileItem);
        });
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.reorderable-item, .transfer-item')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}; 