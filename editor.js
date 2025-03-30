/* Image Combiner Pro - CodeEditor
 * Version: 1.0.1
 * Author: skoki
 * GitHub: https://github.com/skokivPr
 */

class CodeEditor {
            constructor() {
                this.isDarkMode = localStorage.getItem('theme') === 'dark';
                this.initMonaco();
                this.bindEvents();
                this.loadSavedState();
            }

            getEditorSettings() {
                return {
                    appearance: {
                        fontFamily: { default: "'Cascadia Code', Consolas, 'Courier New', monospace" },
                        fontSize: { default: 14 },
                        lineHeight: { default: 1.5 },
                        letterSpacing: { default: 0 }
                    },
                    advanced: {
                        formatOnPaste: { default: true },
                        cursorBlinking: { default: 'smooth' },
                        cursorStyle: { default: 'line' },
                        scrollBeyondLastLine: { default: true },
                        renderWhitespace: { default: true },
                        linkedEditing: { default: true }
                    },
                    features: {
                        formatOnType: { default: true },
                        autoClosingBrackets: { default: true },
                        bracketPairs: { default: true },
                        hover: { default: true },
                        suggestions: { default: true },
                        lineNumbers: { default: true },
                        minimap: { default: true },
                        wordWrap: { default: true }
                    },
                    indentation: {
                        tabSize: { default: 4 },
                        insertSpaces: { default: true }
                    }
                };
            }

            getDefaultEditorOptions() {
                const settings = this.getEditorSettings();
                return {
                    value: this.getDefaultContent(),
                    language: 'html',
                    theme: this.isDarkMode ? 'vs-dark' : 'vs-light',
                    fontFamily: settings.appearance.fontFamily.default,
                    fontSize: settings.appearance.fontSize.default,
                    lineHeight: settings.appearance.lineHeight.default,
                    letterSpacing: settings.appearance.letterSpacing.default,
                    fontLigatures: true,
                    formatOnPaste: settings.advanced.formatOnPaste.default,
                    formatOnType: settings.features.formatOnType.default,
                    autoClosingBrackets: settings.features.autoClosingBrackets.default ? 'always' : 'never',
                    autoClosingQuotes: 'always',
                    autoIndent: 'full',
                    autoSurround: 'quotes',
                    bracketPairColorization: {
                        enabled: settings.features.bracketPairs.default,
                        independentColorPoolPerBracketType: true,
                    },
                    guides: {
                        bracketPairs: settings.features.bracketPairs.default,
                        indentation: true,
                        highlightActiveIndentation: true,
                        highlightActiveBracketPair: true
                    },
                    hover: { enabled: settings.features.hover.default, delay: 300 },
                    inlineSuggest: { enabled: settings.features.suggestions.default, mode: 'prefix' },
                    lineNumbers: settings.features.lineNumbers.default ? 'on' : 'off',
                    minimap: {
                        enabled: settings.features.minimap.default,
                        maxColumn: 120,
                        renderCharacters: true,
                        scale: 1,
                        showSlider: 'mouseover',
                        side: 'right',
                        size: 'proportional'
                    },
                    wordWrap: settings.features.wordWrap.default ? 'on' : 'off',
                    automaticLayout: true,
                    tabSize: parseInt(settings.indentation.tabSize.default),
                    insertSpaces: settings.indentation.insertSpaces.default,
                    cursorBlinking: settings.advanced.cursorBlinking.default,
                    cursorStyle: settings.advanced.cursorStyle.default,
                    scrollBeyondLastLine: settings.advanced.scrollBeyondLastLine.default,
                    renderWhitespace: settings.advanced.renderWhitespace.default ? 'all' : 'none',
                    linkedEditing: settings.advanced.linkedEditing.default
                };
            }

            initMonaco() {
                require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' } });
                require(['vs/editor/editor.main'], () => {
                    this.editor = monaco.editor.create(document.getElementById('editor'), this.getDefaultEditorOptions());
                    this.setupAutoSave();
                });
            }

            getDefaultContent() {
                return localStorage.getItem('editorContent') || '<!DOCTYPE html>\n<html>\n<head>\n <title>Preview</title>\n</head>\n<body>\n <h1>Hello, World!</h1>\n</body>\n</html>';
            }

            bindEvents() {
                const buttonBindings = {
                    core: [
                        { id: 'run', method: 'runCode' },
                        { id: 'clearBtn', method: 'clearEditor' },
                        { id: 'formatBtn', method: 'formatCode' },
                        { id: 'darkModeToggle', method: 'toggleTheme' },
                        { id: 'cardBodyThemeToggle', method: 'toggleCardBodyTheme' }
                    ],
                    toolbar: [
                        { selector: 'button[onclick="newFile()"]', method: 'newFile' },
                        { selector: 'button[onclick="openFile()"]', method: 'openFile' },
                        { selector: 'button[onclick="saveFile()"]', method: 'saveFile' },
                        { selector: 'button[onclick="undo()"]', method: 'undo' },
                        { selector: 'button[onclick="redo()"]', method: 'redo' },
                        { selector: 'button[onclick="formatCode()"]', method: 'formatCode' },
                        { selector: 'button[onclick="toggleComment()"]', method: 'toggleComment' },
                        { selector: 'button[onclick="copyCode()"]', method: 'copyCode' },
                        { selector: 'button[onclick="find()"]', method: 'find' },
                        { selector: 'button[onclick="replace()"]', method: 'replace' },
                        { selector: 'button[onclick="executeCommand()"]', method: 'executeCommand' },
                        { selector: 'button[onclick="toggleConsole()"]', method: 'toggleConsole' },
                        { selector: 'button[onclick="clearConsole()"]', method: 'clearConsole' },
                        { selector: 'button[onclick="toggleSettingsPanel()"]', method: 'toggleSettingsPanel' }
                    ],
                    preview: [
                        { id: 'split-mode-btn', mode: 'split' },
                        { id: 'editor-mode-btn', mode: 'editor' },
                        { id: 'preview-mode-btn', mode: 'full' }
                    ]
                };

                // Bind all button types
                Object.values(buttonBindings).forEach(type => {
                    type.forEach(button => {
                        const element = button.id ? document.getElementById(button.id) : document.querySelector(button.selector);
                        if (element) {
                            element.addEventListener('click', () => button.mode ? this.setPreviewMode(button.mode) : this[button.method]());
                        }
                    });
                });

                // Bind language selector
                const languageSelector = document.getElementById('language-selector');
                if (languageSelector) {
                    languageSelector.addEventListener('change', (e) => this.changeLanguage(e.target.value));
                }

                this.addKeyboardShortcuts();
            }

            addKeyboardShortcuts() {
                const shortcuts = {
                    'n': 'newFile',
                    'o': 'openFile',
                    's': 'saveFile',
                    'z': 'undo',
                    'y': 'redo',
                    'f': 'find',
                    'h': 'replace',
                    'e': 'executeCommand'
                };

                document.addEventListener('keydown', (e) => {
                    if (e.ctrlKey && shortcuts[e.key]) {
                        e.preventDefault();
                        this[shortcuts[e.key]]();
                    }
                });
            }

            setupAutoSave() {
                this.editor.onDidChangeModelContent(() => {
                    localStorage.setItem('editorContent', this.editor.getValue());
                });
            }

            runCode() {
                document.getElementById('preview').srcdoc = this.editor.getValue();
            }

            clearEditor() {
                this.editor.setValue('<!-- Your HTML code here -->');
                localStorage.removeItem('editorContent');
                document.getElementById('preview').srcdoc = '';
            }

            formatCode() {
                try {
                    const code = this.editor.getValue();
                    const selection = this.editor.getSelection();
                    const scrollPosition = this.editor.getScrollTop();

                    const formattedCode = prettier.format(code, {
                        parser: "html",
                        plugins: [prettierPlugins.html],
                        tabWidth: 2,
                        useTabs: false,
                        semi: true,
                        singleQuote: true,
                        trailingComma: "es5",
                        bracketSpacing: true,
                        arrowParens: "avoid",
                        printWidth: 100,
                        htmlWhitespaceSensitivity: 'css'
                    });

                    this.editor.setValue(formattedCode);
                    if (selection) this.editor.setSelection(selection);
                    this.editor.setScrollTop(scrollPosition);

                    this.showNotification('success', 'Code Formatting Complete', 'Code successfully formatted');
                } catch (error) {
                    console.error('Formatting error:', error);
                    this.showNotification('error', 'Formatting Error', 'Could not format the code');
                }
            }

            showNotification(icon, title, text) {
                Swal.fire({
                    icon,
                    title,
                    text,
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
            }

            toggleTheme() {
                this.isDarkMode = !this.isDarkMode;
                const icon = document.getElementById('darkModeIcon');

                monaco.editor.setTheme(this.isDarkMode ? 'vs-dark' : 'vs-light');
                document.documentElement.setAttribute('theme', this.isDarkMode ? 'dark' : 'light');
                localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');

                icon.classList.replace(
                    this.isDarkMode ? 'bi-moon-stars' : 'bi-brightness-high',
                    this.isDarkMode ? 'bi-brightness-high' : 'bi-moon-stars'
                );

                this.showThemeAlert(
                    this.isDarkMode ? 'Dark Mode' : 'Light Mode',
                    this.isDarkMode ? '🌙 Night owl workspace activated' : '✨ Refreshing workspace activated'
                );
            }

            showThemeAlert(title, message) {
                const isDark = document.documentElement.getAttribute('theme') === 'dark';
                Swal.fire({
                    title,
                    html: `Switched to a ${isDark ? 'sleek dark' : 'bright and clean'} interface<br>${message}`,
                    icon: 'info',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true,
                    background: isDark ? '#253137' : '#f4f4f4',
                    color: isDark ? '#ffffff' : undefined,
                    iconColor: isDark ? '#ffffff' : '#253137'
                });
            }

            setPreviewMode(mode, ratio) {
                const editorContainer = document.querySelector('.uk-width-1-2@m:first-child');
                const previewContainer = document.querySelector('.uk-width-1-2@m:last-child');
                const container = document.querySelector('.uk-grid');
                const body = document.body;

                // Remove all mode classes
                ['split-mode', 'editor-mode', 'preview-mode', 'ratio-30-70', 'ratio-70-30'].forEach(cls => {
                    body.classList.remove(cls);
                    container.classList.remove(cls);
                });

                // Update button states
                document.querySelectorAll('.preview-mode-btn').forEach(btn => {
                    btn.classList.remove('uk-active', 'active');
                });
                const modeButton = document.getElementById(`${mode}-mode-btn`);
                if (modeButton) modeButton.classList.add('uk-active', 'active');

                // Apply mode-specific styles
                const modeStyles = {
                    split: {
                        container: ['split-mode'],
                        editor: { display: 'block', width: ratio === '30-70' ? '30%' : ratio === '70-30' ? '70%' : '50%' },
                        preview: { display: 'block', width: ratio === '30-70' ? '70%' : ratio === '70-30' ? '30%' : '50%' }
                    },
                    editor: {
                        container: ['editor-mode'],
                        editor: { display: 'block', width: '100%' },
                        preview: { display: 'none', width: '0' }
                    },
                    full: {
                        container: ['full-preview'],
                        editor: { display: 'none', width: '0' },
                        preview: { display: 'block', width: '100%' }
                    }
                };

                const style = modeStyles[mode];
                container.classList.add(...style.container);
                Object.assign(editorContainer.style, style.editor);
                Object.assign(previewContainer.style, style.preview);

                // Update preview if needed
                if (mode === 'full' || mode === 'split') {
                    this.runCode();
                }

                // Save mode to localStorage
                localStorage.setItem('previewMode', mode);
                if (ratio) localStorage.setItem('previewRatio', ratio);
                else localStorage.removeItem('previewRatio');

                // Show notification
                const modeLabel = mode === 'split' ?
                    `Podzielony (${ratio === '30-70' ? '30/70' : ratio === '70-30' ? '70/30' : '50/50'})` :
                    mode === 'editor' ? 'Tylko edytor' : 'Tylko podgląd';

                this.showNotification('info', modeLabel, `Przełączono na tryb: ${modeLabel.toLowerCase()}`);
            }

            loadSavedState() {
                const theme = localStorage.getItem('theme') || 'light';
                document.documentElement.setAttribute('theme', theme);

                const icon = document.getElementById('darkModeIcon');
                if (theme === 'dark') {
                    icon.classList.replace('bi-moon-stars', 'bi-brightness-high');
                }

                const savedSettings = JSON.parse(localStorage.getItem('editorSettings'));
                if (savedSettings) {
                    this.applyEditorSettings(savedSettings);
                }

                this.loadSavedPreviewMode();
                this.addCodeEditorPanel();
            }

            loadSavedPreviewMode() {
                const savedMode = localStorage.getItem('previewMode');
                const savedRatio = localStorage.getItem('previewRatio');
                if (savedMode) {
                    this.setPreviewMode(savedMode, savedRatio);
                }
            }

            // Core editor functions
            undo() { this.editor.trigger('', 'undo', ''); }
            redo() { this.editor.trigger('', 'redo', ''); }
            toggleComment() { this.editor.trigger('', 'editor.action.commentLine', ''); }
            find() { this.editor.trigger('', 'actions.find', ''); }
            replace() { this.editor.trigger('', 'editor.action.startFindReplaceAction', ''); }
            changeLanguage(language) { monaco.editor.setModelLanguage(this.editor.getModel(), language); }

            // File operations
            newFile() {
                Swal.fire({
                    title: 'Nowy plik',
                    text: 'Czy chcesz utworzyć nowy plik? Niezapisane zmiany zostaną utracone.',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Tak, utwórz nowy plik',
                    cancelButtonText: 'Anuluj'
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.editor.setValue('<!DOCTYPE html>\n<html>\n<head>\n <title>Nowy dokument</title>\n</head>\n<body>\n\n</body>\n</html>');
                        document.getElementById('preview').srcdoc = '';
                        document.getElementById('language-selector').value = 'html';
                    }
                });
            }

            openFile() {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.html,.js,.css,.txt,.json';
                input.onchange = (event) => {
                    const file = event.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.editor.setValue(e.target.result);
                        const ext = file.name.split('.').pop().toLowerCase();
                        const languageMap = {
                            'html': 'html',
                            'js': 'javascript',
                            'css': 'css',
                            'json': 'json',
                            'txt': 'text'
                        };
                        document.getElementById('language-selector').value = languageMap[ext] || 'html';
                        this.showNotification('success', 'Plik otwarty', `Plik ${file.name} został wczytany`);
                    };
                    reader.readAsText(file);
                };
                input.click();
            }

            saveFile() {
                const content = this.editor.getValue();
                const language = document.getElementById('language-selector').value;
                const ext = {
                    'html': 'html',
                    'javascript': 'js',
                    'css': 'css',
                    'python': 'py',
                    'typescript': 'ts',
                    'java': 'java',
                    'csharp': 'cs',
                    'php': 'php'
                }[language] || 'txt';

                const blob = new Blob([content], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `document.${ext}`;
                a.click();
                URL.revokeObjectURL(a.href);

                this.showNotification('success', 'Plik zapisany', `Plik został zapisany jako document.${ext}`);
            }

            copyCode() {
                navigator.clipboard.writeText(this.editor.getValue())
                    .then(() => this.showNotification('success', 'Skopiowano', 'Kod został skopiowany do schowka'))
                    .catch(err => {
                        console.error('Błąd kopiowania:', err);
                        this.showNotification('error', 'Błąd', 'Nie udało się skopiować kodu');
                    });
            }
        }

        // Initialize editor when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            const codeEditor = new CodeEditor();
        });

        // Add these to your existing script section
        document.addEventListener('DOMContentLoaded', function () {
            // Remove draggable attribute from all elements
            document.querySelectorAll('[draggable="true"]').forEach(el => {
                el.removeAttribute('draggable');
            });

            // Prevent dragstart event
            document.addEventListener('dragstart', function (e) {
                e.preventDefault();
                return false;
            });

            // Prevent drop event
            document.addEventListener('drop', function (e) {
                e.preventDefault();
                return false;
            });

            // Prevent dragover event
            document.addEventListener('dragover', function (e) {
                e.preventDefault();
                return false;
            });
        });

        function setPreviewMode(mode) {
            const editorContainer = document.querySelector('.uk-width-1-2\\@m:first-child');
            const previewContainer = document.querySelector('.uk-width-1-2\\@m:last-child');
            const previewButtons = document.querySelectorAll('.preview-mode-btn');
            const container = document.querySelector('.uk-grid');
            const body = document.body;

            // Remove all mode classes first
            container.classList.remove('split-mode', 'editor-mode', 'full-preview');
            body.classList.remove('split-mode', 'editor-mode', 'preview-mode');

            // Add transition class if not present
            if (!container.classList.contains('view-transition')) {
                container.classList.add('view-transition');
            }

            // Remove active class from all buttons and add to current
            previewButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.opacity = '0.7';
            });
            const activeButton = document.getElementById(`${mode}-mode-btn`);
            if (activeButton) {
                activeButton.classList.add('active');
                activeButton.style.opacity = '1';
            }

            // Handle different modes with smooth transitions
            switch (mode) {
                case 'split':
                    container.classList.add('split-mode');
                    body.classList.add('split-mode');
                    requestAnimationFrame(() => {
                        editorContainer.style.cssText = `
                            width: 50%;
                            opacity: 1;
                            transform: translateX(0);
                            display: block;
                        `;
                        previewContainer.style.cssText = `
                            width: 50%;
                            opacity: 1;
                            transform: translateX(0);
                            display: block;
                        `;
                    });
                    break;

                case 'editor':
                    container.classList.add('editor-mode');
                    body.classList.add('editor-mode');
                    requestAnimationFrame(() => {
                        editorContainer.style.cssText = `
                            width: 100%;
                            opacity: 1;
                            transform: translateX(0);
                            display: block;
                        `;
                        previewContainer.style.cssText = `
                            width: 0;
                            opacity: 0;
                            transform: translateX(100%);
                            display: none;
                        `;
                    });
                    break;

                case 'full':
                    container.classList.add('full-preview');
                    body.classList.add('preview-mode');
                    requestAnimationFrame(() => {
                        editorContainer.style.cssText = `
                            width: 0;
                            opacity: 0;
                            transform: translateX(-100%);
                            display: none;
                        `;
                        previewContainer.style.cssText = `
                            width: 100%;
                            opacity: 1;
                            transform: translateX(0);
                            display: block;
                            flex: 0 0 100%;
                            max-width: 100%;
                        `;
                    });
                    break;
            }

            // Save current mode to localStorage
            localStorage.setItem('previewMode', mode);

            // Update preview content
            if (mode === 'full' || mode === 'split') {
                const editor = monaco.editor.getModels()[0];
                if (editor) {
                    const content = editor.getValue();
                    const preview = document.getElementById('preview');
                    if (preview) {
                        preview.srcdoc = content;
                    }
                }
            }

            // Show notification
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
            });

            Toast.fire({
                icon: 'success',
                title: 'Tryb widoku zmieniony',
                text: `Przełączono na tryb: ${mode === 'split' ? 'podzielony' : mode === 'editor' ? 'tylko edytor' : 'tylko podgląd'}`,
                background: 'rgba(0, 0, 0, 0.9)',
                color: '#fff',
                iconColor: '#00ff00'
            });

            // Update editor layout
            if (typeof monaco !== 'undefined') {
                setTimeout(() => {
                    const editor = monaco.editor.getEditors()[0];
                    if (editor) {
                        editor.layout();
                    }
                }, 350);
            }
        }

        // Load saved preview mode on page load
        document.addEventListener('DOMContentLoaded', () => {
            const savedMode = localStorage.getItem('previewMode');
            if (savedMode) {
                setPreviewMode(savedMode);
            }

            // Add keyboard shortcuts for preview modes
            document.addEventListener('keydown', (e) => {
                // Alt + 1: Split mode
                if (e.altKey && e.key === '1') {
                    e.preventDefault();
                    setPreviewMode('split');
                }
                // Alt + 2: Editor mode
                else if (e.altKey && e.key === '2') {
                    e.preventDefault();
                    setPreviewMode('editor');
                }
                // Alt + 3: Full preview mode
                else if (e.altKey && e.key === '3') {
                    e.preventDefault();
                    setPreviewMode('full');
                }
            });
        });

        // Add theme toggle functionality
        document.addEventListener('DOMContentLoaded', function () {
            const darkModeToggle = document.getElementById('darkModeToggle');
            const darkModeIcon = document.getElementById('darkModeIcon');

            // Check for saved theme preference
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                document.documentElement.setAttribute('data-theme', savedTheme);
                updateThemeIcon(savedTheme === 'dark');
            }

            // Theme toggle handler
            darkModeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                updateThemeIcon(newTheme === 'dark');
            });

            function updateThemeIcon(isDark) {
                darkModeIcon.className = isDark ? 'bi bi-sun' : 'bi bi-moon-stars';
            }
        });