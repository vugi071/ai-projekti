// Admin Script - SVG Figure Management with LocalStorage
class AdminManager {
    constructor() {
        this.figuresList = [];
        this.storageKey = 'admin_figures_list';
        this.isUploading = false; // Flag to prevent concurrent uploads
        this.init();
    }

    // Initialize admin system
    init() {
        this.loadFiguresFromStorage();
        this.setupEventListeners();
        this.renderFigures();
        this.updateMainAppFigures(); // Sync with main app on init
        // Note: No longer using localStorage sync
    }

    // Load figures from memory (no localStorage)
    loadFiguresFromStorage() {
        try {
            // Start with default figures if none exist
            if (this.figuresList.length === 0) {
                this.figuresList = [
                    {
                        id: 'bbplayer',
                        name: 'Basketball Player',
                        filename: 'bbplayer.svg',
                        type: 'Player',
                        viewBox: "40 30 130 150",
                        thumbnailGenerated: true,
                        dateAdded: new Date().toISOString()
                    },
                    {
                        id: 'bbball',
                        name: 'Basketball',
                        filename: 'bbball.svg',
                        type: 'Ball',
                        viewBox: "400 40 130 130",
                        thumbnailGenerated: true,
                        dateAdded: new Date().toISOString()
                    }
                ];
            }
        } catch (error) {
            console.error('Error loading figures:', error);
            this.figuresList = [];
        }
    }

    // Generate JavaScript code for figureDefinitions.js
    saveFiguresToStorage() {
        try {
            // Generate the JavaScript code that should be copied to figureDefinitions.js
            this.generateJavaScriptCode();
        } catch (error) {
            console.error('Error generating JavaScript code:', error);
            this.showStatus('Error generating JavaScript code', 'error');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // File input change
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Drag and drop
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        }
    }

    // Handle file selection
    handleFileSelect(event) {
        console.log('=== HANDLE FILE SELECT CALLED ===');
        const files = Array.from(event.target.files);
        this.uploadFiles(files);
        
        // Clear the input to prevent duplicate triggers
        event.target.value = '';
    }

    // Handle drag over
    handleDragOver(e) {
        e.preventDefault();
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.classList.add('dragover');
    }

    // Handle drag leave
    handleDragLeave(e) {
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.classList.remove('dragover');
    }

    // Handle drop
    handleDrop(e) {
        e.preventDefault();
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
        );
        this.uploadFiles(files);
    }

    // Upload and process files
    uploadFiles(files) {
        console.log('=== UPLOAD FILES CALLED ===', 'Files:', files.length, 'isUploading:', this.isUploading);
        
        // Prevent concurrent uploads
        if (this.isUploading) {
            console.log('Upload already in progress, skipping...');
            return;
        }
        
        if (files.length === 0) {
            this.showStatus('Please select SVG files only.', 'error');
            return;
        }

        this.isUploading = true; // Set upload flag
        let processedCount = 0;
        let successCount = 0;
        const totalFiles = files.length;

        files.forEach((file, index) => {
            if (!file.type.includes('svg') && !file.name.toLowerCase().endsWith('.svg')) {
                this.showStatus(`${file.name} is not a valid SVG file.`, 'error');
                processedCount++;
                this.checkUploadComplete(processedCount, totalFiles, successCount);
                return;
            }

            // Check if figure already exists
            const figureId = this.generateFigureId(file.name);
            if (this.figureExists(figureId)) {
                this.showStatus(`Figure ${figureId} already exists. Skipping.`, 'error');
                processedCount++;
                this.checkUploadComplete(processedCount, totalFiles, successCount);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const svgContent = e.target.result;
                    const newFigure = this.createFigureObject(file, svgContent);
                    
                    // Double-check if figure already exists before adding
                    if (this.figureExists(newFigure.id)) {
                        console.log('Figure already exists, skipping add:', newFigure.id);
                        processedCount++;
                        this.checkUploadComplete(processedCount, totalFiles, successCount);
                        return;
                    }
                    
                    // Add to figures list
                    console.log('Adding figure:', newFigure.id, 'Total figures before:', this.figuresList.length);
                    this.figuresList.push(newFigure);
                    console.log('Total figures after:', this.figuresList.length);
                    
                    // Save to storage
                    this.saveFiguresToStorage();
                    
                    // Generate thumbnail
                    this.generateThumbnail(newFigure);
                    
                    processedCount++;
                    successCount++;
                    
                    this.showStatus(`${file.name} uploaded successfully!`, 'success');
                    this.checkUploadComplete(processedCount, totalFiles, successCount);
                } catch (error) {
                    console.error('Error processing file:', error);
                    this.showStatus(`Error processing ${file.name}`, 'error');
                    processedCount++;
                    this.checkUploadComplete(processedCount, totalFiles, successCount);
                }
            };
            
            reader.onerror = () => {
                this.showStatus(`Error reading ${file.name}`, 'error');
                processedCount++;
                this.checkUploadComplete(processedCount, totalFiles, successCount);
            };
            
            reader.readAsText(file);
        });
    }

    // Check if upload is complete and show summary
    checkUploadComplete(processedCount, totalFiles, successCount) {
        if (processedCount === totalFiles) {
            // Reset upload flag
            this.isUploading = false;
            
            // Update main app once after all files are processed
            this.updateMainAppFigures();
            
            setTimeout(() => {
                this.renderFigures();
                // Note: No longer using localStorage sync
                
                if (totalFiles > 1) {
                    this.showStatus(`Upload complete! ${successCount}/${totalFiles} files processed successfully.`, successCount > 0 ? 'success' : 'error');
                }
            }, 500);
        }
    }

    // Generate unique figure ID
    generateFigureId(filename) {
        return filename.replace('.svg', '').toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }

    // Check if figure already exists
    figureExists(figureId) {
        const exists = this.figuresList.some(figure => figure.id === figureId);
        console.log(`Checking if figure ${figureId} exists:`, exists, 'Current figures:', this.figuresList.map(f => f.id));
        return exists;
    }

    // Create figure object
    createFigureObject(file, svgContent) {
        const figureId = this.generateFigureId(file.name);
        const figureName = file.name.replace('.svg', '')
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
        
        // Extract viewBox from SVG content
        const viewBox = this.extractViewBox(svgContent);
        
        return {
            id: figureId,
            name: figureName,
            filename: file.name,
            type: 'Custom',
            viewBox: viewBox,
            content: svgContent,
            thumbnailGenerated: false,
            dateAdded: new Date().toISOString(),
            fileSize: file.size
        };
    }

    // Extract viewBox from SVG content
    extractViewBox(svgContent) {
        try {
            const viewBoxMatch = svgContent.match(/viewBox\s*=\s*["']([^"']+)["']/i);
            if (viewBoxMatch) {
                return viewBoxMatch[1];
            }
            
            // If no viewBox, try to extract width/height
            const widthMatch = svgContent.match(/width\s*=\s*["']?([^"'\s>]+)["']?/i);
            const heightMatch = svgContent.match(/height\s*=\s*["']?([^"'\s>]+)["']?/i);
            
            if (widthMatch && heightMatch) {
                const width = parseFloat(widthMatch[1]);
                const height = parseFloat(heightMatch[1]);
                return `0 0 ${width} ${height}`;
            }
            
            // Default viewBox
            return "0 0 120 120";
        } catch (error) {
            console.error('Error extracting viewBox:', error);
            return "0 0 120 120";
        }
    }

    // Generate thumbnail for figure
    generateThumbnail(figure) {
        try {
            // Create a temporary SVG element to generate thumbnail
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = figure.content;
            const svgElement = tempDiv.querySelector('svg');
            
            if (svgElement) {
                // Optimize SVG for thumbnail
                svgElement.setAttribute('width', '60');
                svgElement.setAttribute('height', '60');
                svgElement.style.maxWidth = '60px';
                svgElement.style.maxHeight = '60px';
                
                // Store optimized thumbnail content
                figure.thumbnailContent = svgElement.outerHTML;
                figure.thumbnailGenerated = true;
                
                // Update in storage
                this.saveFiguresToStorage();
                
                // Don't re-render here to avoid duplication - it will be handled by checkUploadComplete
            }
        } catch (error) {
            console.error('Error generating thumbnail for', figure.name, error);
            figure.thumbnailGenerated = false;
        }
    }

    // Render all figures in grid
    renderFigures() {
        const grid = document.getElementById('figuresGrid');
        if (!grid) return;
        
        grid.innerHTML = '';

        if (this.figuresList.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No figures uploaded yet.</p>';
            return;
        }

        this.figuresList.forEach(figure => {
            const card = this.createFigureCard(figure);
            grid.appendChild(card);
        });
    }

    // Create figure card element
    createFigureCard(figure) {
        const card = document.createElement('div');
        card.className = 'figure-card';
        card.setAttribute('data-figure-id', figure.id);
        
        // Generate preview content
        let previewContent = '';
        if (figure.thumbnailGenerated && figure.thumbnailContent) {
            previewContent = figure.thumbnailContent;
        } else if (figure.content) {
            // Fallback: create basic preview from main content
            previewContent = `<div style="color: #999; font-size: 12px;">SVG</div>`;
        } else {
            // Try to load from file
            previewContent = `<img src="${figure.filename.replace('.svg', '-thumb.svg')}" 
                             alt="${figure.name}" 
                             style="max-width: 60px; max-height: 60px;"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                             <div style="color: #999; font-size: 12px; display: none;">No thumbnail</div>`;
        }
        
        card.innerHTML = `
            <div class="figure-preview">
                ${previewContent}
            </div>
            <div class="figure-info">
                <div class="figure-name">${figure.name}</div>
                <div class="figure-type">${figure.type} • ${figure.id}</div>
                ${figure.fileSize ? `<div class="figure-size">${this.formatFileSize(figure.fileSize)}</div>` : ''}
                ${figure.dateAdded ? `<div class="figure-date">${this.formatDate(figure.dateAdded)}</div>` : ''}
            </div>
            <div class="figure-actions">
                <button class="action-btn preview-btn" onclick="adminManager.previewFigure('${figure.id}')" title="Preview">
                    👁️
                </button>
                <button class="action-btn regenerate-btn" onclick="adminManager.regenerateThumbnail('${figure.id}')" title="Regenerate thumbnail">
                    🔄
                </button>
                <button class="delete-btn" onclick="adminManager.deleteFigure('${figure.id}')">Delete</button>
            </div>
        `;
        
        return card;
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Format date
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('sr-RS', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Unknown date';
        }
    }

    // Preview figure in modal
    previewFigure(figureId) {
        const figure = this.figuresList.find(f => f.id === figureId);
        if (!figure) return;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'preview-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${figure.name}</h3>
                    <button class="modal-close" onclick="this.closest('.preview-modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="preview-large">
                        ${figure.content || 'No content available'}
                    </div>
                    <div class="figure-details">
                        <p><strong>ID:</strong> ${figure.id}</p>
                        <p><strong>Type:</strong> ${figure.type}</p>
                        <p><strong>ViewBox:</strong> ${figure.viewBox}</p>
                        <p><strong>Date Added:</strong> ${this.formatDate(figure.dateAdded)}</p>
                        ${figure.fileSize ? `<p><strong>Size:</strong> ${this.formatFileSize(figure.fileSize)}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: white;
            border-radius: 10px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;
        
        const modalHeader = modal.querySelector('.modal-header');
        modalHeader.style.cssText = `
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const modalBody = modal.querySelector('.modal-body');
        modalBody.style.cssText = `
            padding: 20px;
        `;
        
        const previewLarge = modal.querySelector('.preview-large');
        previewLarge.style.cssText = `
            text-align: center;
            margin-bottom: 20px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background: #f9f9f9;
        `;
        
        document.body.appendChild(modal);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Regenerate thumbnail
    regenerateThumbnail(figureId) {
        const figure = this.figuresList.find(f => f.id === figureId);
        if (!figure) return;
        
        this.showStatus(`Regenerating thumbnail for ${figure.name}...`, 'success');
        this.generateThumbnail(figure);
        // Manually trigger re-render for regeneration
        setTimeout(() => {
            this.renderFigures();
            this.updateMainAppFigures();
        }, 100);
    }

    // Delete figure
    deleteFigure(figureId) {
        const figure = this.figuresList.find(f => f.id === figureId);
        if (!figure) return;
        
        if (confirm(`Are you sure you want to delete "${figure.name}"?\n\nThis action cannot be undone.`)) {
            this.figuresList = this.figuresList.filter(f => f.id !== figureId);
            this.saveFiguresToStorage();
            this.updateMainAppFigures(); // Update main app when deleting
            this.renderFigures();
            // Note: No longer using localStorage sync
            this.showStatus(`Figure "${figure.name}" deleted successfully!`, 'success');
        }
    }

    // Generate JavaScript code for figureDefinitions.js
    generateJavaScriptCode() {
        try {
            // Convert our figures to main app format
            const figureDefinitions = {};
            this.figuresList.forEach(figure => {
                if (figure.content) {
                    // Extract path from SVG content
                    const pathMatch = figure.content.match(/<path[^>]*d="([^"]+)"/i);
                    if (pathMatch) {
                        figureDefinitions[figure.id] = {
                            viewBox: figure.viewBox,
                            path: pathMatch[1]
                        };
                    }
                }
            });
            
            // Also prepare figure options for scroll menus
            const figureOptions = this.figuresList.map(figure => ({
                id: figure.id,
                name: figure.name,
                thumbnailContent: figure.thumbnailContent,
                filename: figure.filename
            }));
            
            // Generate the complete JavaScript file content
            const jsCode = this.createFigureDefinitionsJSContent(figureDefinitions, figureOptions);
            
            // Show the code to the user for manual copying
            this.showJavaScriptCodeModal(jsCode);
            
        } catch (error) {
            console.error('Error generating JavaScript code:', error);
        }
    }

    // Create the complete figureDefinitions.js file content
    createFigureDefinitionsJSContent(figureDefinitions, figureOptions) {
        const figureDefsString = JSON.stringify(figureDefinitions, null, 4);
        const figureOptsString = JSON.stringify(figureOptions, null, 4);
        
        return `// Figure Definitions - All SVG figures stored in static file
// Generated on: ${new Date().toISOString()}

window.figureDefinitions = ${figureDefsString};

window.figureOptions = ${figureOptsString};
`;
    }
    
    // Show modal with JavaScript code for copying
    showJavaScriptCodeModal(jsCode) {
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'js-code-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📄 figureDefinitions.js Content</h3>
                    <button class="modal-close" onclick="this.closest('.js-code-modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Instructions:</strong> Copy the code below and paste it into the <code>figureDefinitions.js</code> file to update the figures.</p>
                    <div class="code-container">
                        <textarea readonly class="js-code-textarea">${jsCode}</textarea>
                    </div>
                    <div class="modal-actions">
                        <button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest('.modal-content').querySelector('.js-code-textarea').value); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy Code', 2000)">Copy Code</button>
                        <button class="download-btn" onclick="adminManager.downloadJSFile('${jsCode.replace(/'/g, "\\'")}')">Download File</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: white;
            border-radius: 10px;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            width: 90%;
        `;
        
        const modalHeader = modal.querySelector('.modal-header');
        modalHeader.style.cssText = `
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const modalBody = modal.querySelector('.modal-body');
        modalBody.style.cssText = `
            padding: 20px;
        `;
        
        const codeContainer = modal.querySelector('.code-container');
        codeContainer.style.cssText = `
            margin: 15px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
        `;
        
        const textarea = modal.querySelector('.js-code-textarea');
        textarea.style.cssText = `
            width: 100%;
            height: 400px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            border: none;
            background: #f9f9f9;
            resize: none;
            outline: none;
        `;
        
        const modalActions = modal.querySelector('.modal-actions');
        modalActions.style.cssText = `
            display: flex;
            gap: 10px;
            margin-top: 15px;
        `;
        
        const buttons = modal.querySelectorAll('.copy-btn, .download-btn');
        buttons.forEach(btn => {
            btn.style.cssText = `
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            `;
            if (btn.classList.contains('copy-btn')) {
                btn.style.cssText += 'background: #007cba; color: white;';
            } else {
                btn.style.cssText += 'background: #28a745; color: white;';
            }
        });
        
        document.body.appendChild(modal);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // Download the JavaScript file
    downloadJSFile(jsCode) {
        try {
            const blob = new Blob([jsCode], {type: 'application/javascript'});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'figureDefinitions.js';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            this.showStatus('figureDefinitions.js downloaded successfully!', 'success');
        } catch (error) {
            console.error('Download error:', error);
            this.showStatus('Error downloading file', 'error');
        }
    }

    // Update main app figures (replaced with JavaScript generation)
    updateMainAppFigures() {
        // This method now generates JavaScript code instead of using localStorage
        this.generateJavaScriptCode();
    }

    // Show status message
    showStatus(message, type = 'info') {
        const status = document.getElementById('uploadStatus');
        if (!status) return;
        
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
        
        setTimeout(() => {
            status.style.display = 'none';
        }, type === 'error' ? 5000 : 3000);
    }

    // Clear all figures (for testing)
    clearAllFigures() {
        if (confirm('Are you sure you want to delete ALL figures?\n\nThis will remove all uploaded figures permanently!')) {
            this.figuresList = [];
            this.saveFiguresToStorage();
            this.updateMainAppFigures(); // Update main app
            this.renderFigures();
            this.showStatus('All figures cleared successfully!', 'success');
            
            // Note: No longer using localStorage sync
        }
    }

    // Note: No longer needed since we don't use localStorage events

    // Export figures data
    exportFigures() {
        try {
            const dataStr = JSON.stringify(this.figuresList, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `figures-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            this.showStatus('Figures data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showStatus('Error exporting figures data', 'error');
        }
    }
}

// Initialize admin manager when DOM is loaded
let adminManager;
document.addEventListener('DOMContentLoaded', function() {
    adminManager = new AdminManager();
    
    // Add export button functionality if it exists
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => adminManager.exportFigures());
    }
    
    // Add clear all button functionality if it exists  
    const clearBtn = document.getElementById('clearAllBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => adminManager.clearAllFigures());
    }
});

// Global functions for inline onclick handlers
function handleFileSelect(event) {
    if (adminManager) {
        adminManager.handleFileSelect(event);
    }
}

function deleteFigure(figureId) {
    if (adminManager) {
        adminManager.deleteFigure(figureId);
    }
}