/* Image Combiner Pro - project loader.js
 * Version: 1.0.1
 * Author: skoki
 * GitHub: https://github.com/skokivPr
 */

function toggleSidebar() {
    const aside = document.querySelector('aside');
    if (aside.style.display === 'none' || aside.style.display === '') {
        aside.style.display = 'flex';
    } else {
        aside.style.display = 'none';
    }
}

function loadUrl() {
    const urlInput = document.getElementById('iframeUrlInput');
    const iframe = document.getElementById('previewFrame');
    const activityLed = document.getElementById('activityLed');
    const url = urlInput.value.trim();

    if (url) {
        let fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
        iframe.src = fullUrl;
        activityLed.classList.add('loading');
    } else {
        showError('Wprowadź prawidłowy adres URL');
    }
}

function zoomInIframe() {
    const iframe = document.getElementById('previewFrame');
    const currentZoom = iframe.style.zoom ? parseFloat(iframe.style.zoom) : 1;
    iframe.style.zoom = (currentZoom + 0.1).toFixed(1);
}

function zoomOutIframe() {
    const iframe = document.getElementById('previewFrame');
    const currentZoom = iframe.style.zoom ? parseFloat(iframe.style.zoom) : 1;
    iframe.style.zoom = (currentZoom - 0.1).toFixed(1);
}

function resetZoom() {
    const iframe = document.getElementById('previewFrame');
    iframe.style.zoom = '1';
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Add event listener for URL input
    const urlInput = document.getElementById('iframeUrlInput');
    urlInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            loadUrl();
        }
    });

    // Auto-select input on page load
    urlInput.focus();
    urlInput.select();

    // Add event listener for iframe load
    document.getElementById('previewFrame').addEventListener('load', function () {
        const activityLed = document.getElementById('activityLed');
        activityLed.classList.remove('loading');
        activityLed.classList.add('active');
    });

    // Add event listener for iframe error
    document.getElementById('previewFrame').addEventListener('error', function () {
        const activityLed = document.getElementById('activityLed');
        activityLed.classList.remove('loading', 'active');
        showError('Nie udało się załadować strony');
    });

    // Add event listener for close button
    document.getElementById('closeIframe').addEventListener('click', closeIframe);

    // Add event listener for folder input
    document.getElementById('folderInput').addEventListener('change', function (e) {
        const files = e.target.files;
        if (files.length > 0) {
            const folderContent = document.getElementById('folderNavContent');
            const activityLed = document.getElementById('activityLed');
            folderContent.innerHTML = `
                        <div class="loading">
                            <i class="fas fa-spinner"></i>
                            Loading folder structure...
                        </div>
                    `;
            activityLed.classList.add('loading');

            setTimeout(() => {
                displayFolderContent(files, []);
                activityLed.classList.remove('loading');
                activityLed.classList.add('active');
            }, 0);
        }
    });

    // Initialize view mode
    updatePreviewVisibility();
});

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    // Get all existing error messages
    const existingErrors = document.querySelectorAll('.error-message');

    // Calculate position based on number of existing errors
    const offset = existingErrors.length * 30; // 30px spacing between messages

    // Apply offset to position
    errorDiv.style.marginTop = `${offset}px`;

    document.body.appendChild(errorDiv);

    // Trigger reflow to enable transition
    const height = errorDiv.offsetHeight;
    errorDiv.classList.add('show');

    setTimeout(() => {
        errorDiv.classList.remove('show');
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

let currentViewMode = 'iframe'; // 'iframe' or 'window'
let currentFiles = [];
let currentPath = [];
let currentActiveFile = null;

function toggleViewMode() {
    const toggle = document.getElementById('viewModeToggle');
    currentViewMode = toggle.checked ? 'window' : 'iframe';
    updatePreviewVisibility();
}

function updatePreviewVisibility() {
    const previewPanel = document.querySelector('.project-preview-panel');
    if (currentViewMode === 'iframe') {
        previewPanel.classList.add('active');
    } else {
        previewPanel.classList.remove('active');
    }
}

function loadProjectFromPath() {
    const pathInput = document.getElementById('projectPathInput');
    const path = pathInput.value.trim();

    if (!path) {
        showError('Please enter a project path');
        return;
    }

    if (currentViewMode === 'iframe') {
        loadInIframe(path);
    } else {
        loadInNewWindow(path);
    }
}

function loadInIframe(path) {
    fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error('Project not found');
            }
            return response.text();
        })
        .then(html => {
            const previewFrame = document.getElementById('previewFrame');
            previewFrame.srcdoc = html;
        })
        .catch(error => {
            showError('Error loading project: ' + error.message);
        });
}

function loadInNewWindow(path) {
    window.open(path, '_blank');
}

function refreshPreview() {
    const previewFrame = document.getElementById('previewFrame');
    if (previewFrame.srcdoc) {
        const currentContent = previewFrame.srcdoc;
        previewFrame.srcdoc = '';
        previewFrame.srcdoc = currentContent;
    } else if (previewFrame.src) {
        const currentSrc = previewFrame.src;
        previewFrame.src = '';
        previewFrame.src = currentSrc;
    }
}

function openInNewWindow() {
    const previewFrame = document.getElementById('previewFrame');
    const newWindow = window.open('', '_blank');
    newWindow.document.write(previewFrame.srcdoc);
    newWindow.document.close();
}

function closeIframe() {
    const previewFrame = document.getElementById('previewFrame');
    previewFrame.srcdoc = '';
    previewFrame.src = 'about:blank';

    // Remove active class from current file
    if (currentActiveFile) {
        currentActiveFile.classList.remove('active');
        currentActiveFile = null;
    }

    // Update activity LED
    const activityLed = document.getElementById('activityLed');
    activityLed.classList.remove('active', 'loading');
}

function selectFolder() {
    const folderInput = document.getElementById('folderInput');
    folderInput.click();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getImageIcon(extension) {
    const imageIcons = {
        'svg': 'bi-filetype-svg',
        'gif': 'bi-filetype-gif',
        'webp': 'bi-filetype-webp'
    };
    return imageIcons[extension] || 'bi-filetype-jpg';
}

function getDocumentIcon(extension) {
    const documentIcons = {
        'pdf': 'bi-filetype-pdf',
        'doc': 'bi-filetype-doc',
        'docx': 'bi-filetype-doc',
        'xls': 'bi-filetype-xls',
        'xlsx': 'bi-filetype-xls',
        'ppt': 'bi-filetype-ppt',
        'pptx': 'bi-filetype-ppt',
        'txt': 'bi-filetype-txt',
        'md': 'bi-filetype-md'
    };
    return documentIcons[extension] || null;
}

function getJavaScriptIcon(fileName) {
    const jsIcons = {
        'react': 'bi-filetype-jsx',
        'vue': 'bi-filetype-vue',
        'angular': 'bi-filetype-angular',
        'jquery': 'bi-filetype-jquery',
        'node': 'bi-filetype-node',
        'webpack': 'bi-filetype-webpack',
        'babel': 'bi-filetype-babel',
        'typescript': 'bi-filetype-ts'
    };

    for (const [key, icon] of Object.entries(jsIcons)) {
        if (fileName.includes(key)) return icon;
    }
    return 'bi-filetype-js';
}

function getCssIcon(fileName) {
    const cssIcons = {
        'scss': 'bi-filetype-scss',
        'sass': 'bi-filetype-scss',
        'less': 'bi-filetype-less',
        'stylus': 'bi-filetype-stylus',
        'tailwind': 'bi-filetype-tailwind',
        'bootstrap': 'bi-filetype-bootstrap'
    };

    for (const [key, icon] of Object.entries(cssIcons)) {
        if (fileName.includes(key)) return icon;
    }
    return 'bi-filetype-css';
}

function getCodeIcon(extension) {
    const codeIcons = {
        'html': 'bi-filetype-html',
        'ts': 'bi-filetype-ts',
        'json': 'bi-filetype-json',
        'xml': 'bi-filetype-xml',
        'php': 'bi-filetype-php',
        'py': 'bi-filetype-py',
        'java': 'bi-filetype-java',
        'c': 'bi-filetype-c',
        'cpp': 'bi-filetype-c',
        'h': 'bi-filetype-c'
    };
    return codeIcons[extension] || null;
}

function getArchiveIcon(extension) {
    const archiveIcons = {
        'zip': 'bi-filetype-zip',
        'rar': 'bi-filetype-rar',
        '7z': 'bi-filetype-7z',
        'tar': 'bi-filetype-tar'
    };
    return archiveIcons[extension] || null;
}

function getFileIcon(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    const type = file.type.split('/')[0];
    const fileName = file.name.toLowerCase();

    // Check image files
    if (type === 'image') {
        return getImageIcon(extension);
    }

    // Check document files
    const documentIcon = getDocumentIcon(extension);
    if (documentIcon) return documentIcon;

    // Check JavaScript files
    if (extension === 'js') {
        return getJavaScriptIcon(fileName);
    }

    // Check CSS files
    if (extension === 'css') {
        return getCssIcon(fileName);
    }

    // Check code files
    const codeIcon = getCodeIcon(extension);
    if (codeIcon) return codeIcon;

    // Check archive files
    const archiveIcon = getArchiveIcon(extension);
    if (archiveIcon) return archiveIcon;

    // Default icon
    return 'bi-file-earmark';
}

function createFolderTree(files, path = []) {
    const tree = document.createElement('ul');
    tree.className = 'folder-tree';

    // Get unique folders at current level
    const folders = new Set();
    const fileArray = Array.from(files);

    fileArray.forEach(file => {
        const filePath = file.webkitRelativePath.split('/');
        if (filePath.length > path.length) {
            folders.add(filePath[path.length]);
        }
    });

    // Sort folders alphabetically
    const sortedFolders = Array.from(folders).toSorted((a, b) => a.localeCompare(b));
    sortedFolders.forEach(folder => {
        const item = document.createElement('li');
        item.className = 'folder-tree-item';

        const content = document.createElement('div');
        content.className = 'folder-tree-content';
        content.innerHTML = `
                    <span class="folder-tree-icon">📁</span>
                    <span class="folder-tree-name">${folder}</span>
                `;

        const children = createFolderTree(files, [...path, folder]);
        if (children.children.length > 0) {
            item.classList.add('has-children');
            item.appendChild(content);
            item.appendChild(children);
            content.onclick = () => {
                item.classList.toggle('expanded');
            };
        } else {
            item.appendChild(content);
            content.onclick = () => {
                displayFolderContent(files, [...path, folder]);
            };
        }

        tree.appendChild(item);
    });

    return tree;
}

function displayFolderContent(files, path = []) {
    currentFiles = files;
    currentPath = path;
    const folderContent = document.getElementById('folderNavContent');
    const fileList = document.createElement('ul');
    fileList.className = 'file-list';

    // Remove description when showing content
    const description = folderContent.querySelector('.folder-nav-description');
    if (description) {
        description.remove();
    }

    // Add back button if we're in a subfolder
    if (path.length > 0) {
        const backItem = document.createElement('li');
        backItem.className = 'folder-item back-item';
        backItem.onclick = () => displayFolderContent(files, path.slice(0, -1));
        backItem.innerHTML = `
                    <span class="folder-icon"><i class="bi bi-arrow-left"></i></span>
                    <span class="file-name">Back to parent folder</span>
                `;
        fileList.appendChild(backItem);
    }

    // Display current path
    const pathDisplay = document.createElement('div');
    pathDisplay.className = 'current-path';
    pathDisplay.innerHTML = `
                <i class="bi bi-folder"></i>
                ${path.length === 0 ? 'Root Directory' : path.join(' / ')}
            `;
    folderContent.innerHTML = '';
    folderContent.appendChild(pathDisplay);

    // Sort files and folders
    const folders = [];
    const filesList = [];

    Array.from(files).forEach(file => {
        const filePath = file.webkitRelativePath.split('/');
        const currentFolderPath = path.join('/');

        if (filePath.slice(0, path.length).join('/') === currentFolderPath) {
            const remainingPath = filePath.slice(path.length);
            if (remainingPath.length === 1) {
                filesList.push(file);
            } else if (remainingPath.length > 1) {
                const folderName = remainingPath[0];
                if (!folders.includes(folderName)) {
                    folders.push(folderName);
                }
            }
        }
    });

    // Display folders first
    const sortedFolders = folders.toSorted((a, b) => a.localeCompare(b));
    sortedFolders.forEach(folder => {
        const folderItem = document.createElement('li');
        folderItem.className = 'folder-item';
        folderItem.onclick = () => displayFolderContent(files, [...path, folder]);
        folderItem.innerHTML = `
                    <span class="folder-icon"><i class="bi bi-folder"></i></span>
                    <span class="file-name">${folder}</span>
                `;
        fileList.appendChild(folderItem);
    });

    // Then display files
    const sortedFiles = filesList.toSorted((a, b) => a.name.localeCompare(b.name));
    sortedFiles.forEach(file => {
        const fileItem = document.createElement('li');
        fileItem.className = 'file-item';
        fileItem.onclick = (event) => handleFileClick(file, event);

        const iconClass = getFileIcon(file);
        fileItem.innerHTML = `
                    <span class="file-icon"><i class="bi ${iconClass}"></i></span>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${formatFileSize(file.size)}</span>
                `;
        fileList.appendChild(fileItem);
    });

    folderContent.appendChild(fileList);
}

function handleFileClick(file, event) {
    const activityLed = document.getElementById('activityLed');
    activityLed.classList.add('loading');

    // Remove active class from previous file
    if (currentActiveFile) {
        currentActiveFile.classList.remove('active');
    }

    // Add active class to clicked file
    const fileItem = event.currentTarget;
    fileItem.classList.add('active');
    currentActiveFile = fileItem;

    // Handle image files
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const previewFrame = document.getElementById('previewFrame');
            const result = e.target.result;
            previewFrame.srcdoc = `<img src="${result}" style="max-width: 100%; height: auto;">`;
            activityLed.classList.remove('loading');
            activityLed.classList.add('active');
        };
        reader.readAsDataURL(file);
    }
    // Handle text and HTML files
    else if (file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.html')) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const previewFrame = document.getElementById('previewFrame');
            const result = e.target.result;
            if (file.type === 'text/html' || file.name.toLowerCase().endsWith('.html')) {
                previewFrame.srcdoc = result;
            } else {
                const escapedContent = result
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
                previewFrame.srcdoc = `<pre style="padding: 20px; background: #f5f5f5; overflow: auto;">${escapedContent}</pre>`;
            }
            activityLed.classList.remove('loading');
            activityLed.classList.add('active');
        };
        reader.readAsText(file);
    }
    // Handle other file types
    else {
        const reader = new FileReader();
        reader.onload = function (e) {
            const previewFrame = document.getElementById('previewFrame');
            const result = e.target.result;
            const escapedContent = result
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
            previewFrame.srcdoc = `<pre style="padding: 20px; background: #f5f5f5; overflow: auto;">${escapedContent}</pre>`;
            activityLed.classList.remove('loading');
            activityLed.classList.add('active');
        };
        reader.onerror = function () {
            showError('Nie można załadować tego pliku');
            activityLed.classList.remove('loading', 'active');
            fileItem.classList.remove('active');
            currentActiveFile = null;
        };
        reader.readAsText(file);
    }
}

function updateFolderNavigation(files) {
    const navContent = document.getElementById('folderNavContent');
    navContent.innerHTML = '';
    navContent.appendChild(createFolderTree(files));
}

function navigateToFolder(path) {
    displayFolderContent(currentFiles, path);
}

function resetUrl() {
    const urlInput = document.getElementById('iframeUrlInput');
    urlInput.value = '';
    urlInput.focus();
    urlInput.select();
}