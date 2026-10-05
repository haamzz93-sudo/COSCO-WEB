<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>PDF Viewer</title>
    
    <style>
        /* Reset & Base */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f0f2f5;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        /* Header */
        .pdf-header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            padding: 16px 30px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            z-index: 100;
        }

        .pdf-header .brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .pdf-header .brand .logo {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .pdf-header .brand h1 {
            color: #fff;
            font-size: 20px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }

        .pdf-header .brand .subtitle {
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
            font-weight: 400;
            margin-top: 2px;
        }

        .pdf-header .header-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .pdf-header .header-actions .file-info {
            color: rgba(255, 255, 255, 0.7);
            font-size: 13px;
            padding: 6px 14px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .pdf-header .header-actions .file-info strong {
            color: #fff;
        }

        /* Toolbar */
        .pdf-toolbar {
            background: #ffffff;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
            border-bottom: 1px solid #e4e7ec;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
            flex-wrap: wrap;
            gap: 8px;
        }

        .pdf-toolbar .toolbar-group {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .pdf-toolbar .toolbar-divider {
            width: 1px;
            height: 28px;
            background: #e4e7ec;
            margin: 0 8px;
        }

        .pdf-toolbar button {
            background: transparent;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            color: #4a5568;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 500;
        }

        .pdf-toolbar button:hover {
            background: #f0f4ff;
            color: #2563eb;
        }

        .pdf-toolbar button:active {
            transform: scale(0.95);
        }

        .pdf-toolbar button:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            transform: none;
        }

        .pdf-toolbar button.active {
            background: #2563eb;
            color: #fff;
        }

        .pdf-toolbar .page-info {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #1a202c;
            font-weight: 500;
            padding: 0 12px;
        }

        .pdf-toolbar .page-info input {
            width: 50px;
            padding: 4px 8px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            text-align: center;
            font-size: 14px;
            font-weight: 600;
            color: #1a202c;
            background: #f7fafc;
        }

        .pdf-toolbar .page-info input:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .pdf-toolbar .page-info span {
            color: #718096;
        }

        .pdf-toolbar .zoom-control {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .pdf-toolbar .zoom-control .zoom-level {
            font-size: 13px;
            font-weight: 600;
            color: #1a202c;
            min-width: 48px;
            text-align: center;
        }

        .pdf-toolbar .zoom-control input[type="range"] {
            width: 100px;
            height: 4px;
            -webkit-appearance: none;
            background: #e2e8f0;
            border-radius: 2px;
            outline: none;
            transition: background 0.2s;
        }

        .pdf-toolbar .zoom-control input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #2563eb;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
        }

        .pdf-toolbar .zoom-control input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        .pdf-toolbar .zoom-control input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #2563eb;
            cursor: pointer;
            border: none;
        }

        /* Main Content */
        .pdf-main {
            flex: 1;
            display: flex;
            overflow: hidden;
            background: #e8eaed;
            position: relative;
        }

        /* Sidebar Thumbnail */
        .pdf-sidebar {
            width: 200px;
            background: #f8f9fa;
            border-right: 1px solid #e4e7ec;
            overflow-y: auto;
            padding: 16px;
            flex-shrink: 0;
            display: none;
        }

        .pdf-sidebar.show {
            display: block;
        }

        .pdf-sidebar::-webkit-scrollbar {
            width: 4px;
        }

        .pdf-sidebar::-webkit-scrollbar-thumb {
            background: #c1c7cd;
            border-radius: 2px;
        }

        .pdf-sidebar .thumbnail-item {
            margin-bottom: 12px;
            cursor: pointer;
            border-radius: 8px;
            overflow: hidden;
            border: 2px solid transparent;
            transition: all 0.2s ease;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
        }

        .pdf-sidebar .thumbnail-item:hover {
            border-color: #2563eb;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .pdf-sidebar .thumbnail-item.active {
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
        }

        .pdf-sidebar .thumbnail-item canvas {
            width: 100%;
            height: auto;
            display: block;
            background: #fff;
        }

        .pdf-sidebar .thumbnail-item .page-label {
            text-align: center;
            padding: 4px 0;
            font-size: 11px;
            color: #718096;
            background: #fff;
            font-weight: 500;
        }

        /* PDF Container */
        #pdf-container {
            flex: 1;
            padding: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            overflow: auto;
            background: #e8eaed;
            position: relative;
        }

        #pdf-container::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        #pdf-container::-webkit-scrollbar-track {
            background: #e8eaed;
        }

        #pdf-container::-webkit-scrollbar-thumb {
            background: #c1c7cd;
            border-radius: 4px;
        }

        #pdf-container::-webkit-scrollbar-thumb:hover {
            background: #a0a7b0;
        }

        #pdf-container canvas {
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
            border-radius: 8px;
            background: #fff;
            max-width: 100%;
            height: auto;
            transition: all 0.3s ease;
        }

        /* Loading */
        .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            color: #4a5568;
        }

        .loading-state .spinner {
            width: 56px;
            height: 56px;
            border: 4px solid #e2e8f0;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 20px;
        }

        .loading-state .loading-text {
            font-size: 16px;
            font-weight: 500;
            color: #4a5568;
        }

        .loading-state .loading-subtext {
            font-size: 13px;
            color: #a0aec0;
            margin-top: 4px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Error */
        .error-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            padding: 40px;
            text-align: center;
        }

        .error-state .error-icon {
            font-size: 64px;
            margin-bottom: 20px;
        }

        .error-state h3 {
            color: #e53e3e;
            font-size: 22px;
            margin-bottom: 8px;
        }

        .error-state p {
            color: #718096;
            font-size: 15px;
            max-width: 500px;
            line-height: 1.6;
        }

        .error-state .error-details {
            margin-top: 16px;
            padding: 12px 20px;
            background: #fed7d7;
            border-radius: 8px;
            color: #c53030;
            font-size: 13px;
            max-width: 600px;
            word-break: break-all;
        }

        /* Empty State */
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            color: #a0aec0;
        }

        .empty-state .empty-icon {
            font-size: 64px;
            margin-bottom: 16px;
        }

        .empty-state h3 {
            color: #4a5568;
            font-size: 20px;
        }

        .empty-state p {
            font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
            .pdf-sidebar {
                width: 160px;
            }
        }

        @media (max-width: 768px) {
            .pdf-header {
                padding: 12px 16px;
            }

            .pdf-header .brand h1 {
                font-size: 16px;
            }

            .pdf-header .header-actions .file-info {
                font-size: 11px;
                padding: 4px 10px;
            }

            .pdf-toolbar {
                padding: 8px 12px;
                justify-content: center;
            }

            .pdf-toolbar .toolbar-group {
                flex-wrap: wrap;
                justify-content: center;
            }

            .pdf-toolbar .toolbar-divider {
                display: none;
            }

            .pdf-toolbar .page-info input {
                width: 40px;
            }

            .pdf-toolbar .zoom-control input[type="range"] {
                width: 60px;
            }

            #pdf-container {
                padding: 12px;
            }

            .pdf-sidebar {
                width: 120px;
                padding: 8px;
            }

            .pdf-sidebar .thumbnail-item .page-label {
                font-size: 9px;
            }
        }

        @media (max-width: 480px) {
            .pdf-header .brand .logo {
                width: 32px;
                height: 32px;
                font-size: 16px;
            }

            .pdf-header .brand h1 {
                font-size: 14px;
            }

            .pdf-header .header-actions .file-info {
                display: none;
            }

            .pdf-toolbar button {
                padding: 4px 8px;
                font-size: 12px;
            }

            .pdf-toolbar .page-info {
                font-size: 12px;
                padding: 0 6px;
            }

            #pdf-container {
                padding: 8px;
            }
        }

        /* Scrollbar for WebKit */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        ::-webkit-scrollbar-thumb {
            background: #c1c7cd;
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #a0a7b0;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <header class="pdf-header">
        <div class="brand">
            <div class="logo">📄</div>
            <div>
                <h1>PDF Viewer</h1>
                <div class="subtitle">Dokumen Viewer</div>
            </div>
        </div>
        <div class="header-actions">
            <span class="file-info">
                📁 <strong id="file-name">document.pdf</strong>
            </span>
        </div>
    </header>

    <!-- Toolbar -->
    <div class="pdf-toolbar">
        <!-- Left Group -->
        <div class="toolbar-group">
            <button onclick="toggleSidebar()" id="sidebar-toggle" title="Toggle Thumbnail">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <line x1="9" y1="3" x2="9" y2="21"/>
                </svg>
                Thumbnail
            </button>
            <div class="toolbar-divider"></div>
            <button onclick="firstPage()" id="first-btn" title="Halaman Pertama">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/>
                </svg>
            </button>
            <button onclick="prevPage()" id="prev-btn" title="Halaman Sebelumnya">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 19l-7-7 7-7"/>
                </svg>
            </button>
            <div class="page-info">
                <input type="number" id="page-input" value="1" min="1" onchange="goToPage(this.value)">
                <span>/ <span id="total-pages">0</span></span>
            </div>
            <button onclick="nextPage()" id="next-btn" title="Halaman Selanjutnya">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 19l7-7-7-7"/>
                </svg>
            </button>
            <button onclick="lastPage()" id="last-btn" title="Halaman Terakhir">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 5l7 7-7 7M6 5l7 7-7 7"/>
                </svg>
            </button>
        </div>

        <!-- Right Group -->
        <div class="toolbar-group">
            <div class="zoom-control">
                <button onclick="zoomOut()" title="Perkecil">−</button>
                <span class="zoom-level" id="zoom-level">100%</span>
                <button onclick="zoomIn()" title="Perbesar">+</button>
                <input type="range" id="zoom-range" min="25" max="300" value="100" oninput="changeZoom(this.value)">
            </div>
            <div class="toolbar-divider"></div>
            <button onclick="fitToWidth()" title="Sesuaikan Lebar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 3v18h18"/>
                    <path d="M8 9l4-4 4 4"/>
                    <path d="M8 15l4 4 4-4"/>
                </svg>
            </button>
            <button onclick="fitToPage()" title="Sesuaikan Halaman">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 3v18h18"/>
                    <path d="M7 7l10 10"/>
                    <path d="M17 7l-10 10"/>
                </svg>
            </button>
            <div class="toolbar-divider"></div>
            <button onclick="downloadPDF()" title="Download PDF">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download
            </button>
            <button onclick="printPDF()" title="Cetak PDF">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 6 2 18 2 18 9"/>
                    <path d="M18 9h3v6h-3"/>
                    <path d="M6 15H3V9h3"/>
                    <rect x="6" y="13" width="12" height="8"/>
                    <line x1="9" y1="17" x2="15" y2="17"/>
                </svg>
                Cetak
            </button>
        </div>
    </div>

    <!-- Main Content -->
    <div class="pdf-main">
        <!-- Sidebar Thumbnail -->
        <div class="pdf-sidebar" id="sidebar">
            <div id="thumbnails"></div>
        </div>

        <!-- PDF Container -->
        <div id="pdf-container">
            <div class="loading-state" id="loading-state">
                <div class="spinner"></div>
                <div class="loading-text">Memuat PDF...</div>
                <div class="loading-subtext">Mohon tunggu sebentar</div>
            </div>
        </div>
    </div>

    <!-- PDF.js Library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    
    <script>
        // ==================== CONFIGURATION ====================
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        // PDF URL - Ganti dengan path PDF Anda
        const PDF_URL = '/storage/{{ $file_spj }}';
        const FILE_NAME = '{{ $file_spj }}';

        // ==================== STATE ====================
        let pdfDoc = null;
        let currentPage = 1;
        let scale = 1.0;
        let totalPages = 0;
        let isSidebarOpen = false;
        let isRendering = false;

        // ==================== DOM REFS ====================
        const container = document.getElementById('pdf-container');
        const loadingState = document.getElementById('loading-state');
        const sidebar = document.getElementById('sidebar');
        const thumbnailsContainer = document.getElementById('thumbnails');

        // ==================== INIT ====================
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('file-name').textContent = FILE_NAME;
            loadPDF();
        });

        // ==================== LOAD PDF ====================
        function loadPDF() {
            const loadingTask = pdfjsLib.getDocument(PDF_URL);
            
            loadingTask.promise.then(function(pdf) {
                pdfDoc = pdf;
                totalPages = pdf.numPages;
                
                document.getElementById('total-pages').textContent = totalPages;
                document.getElementById('page-input').max = totalPages;
                
                loadingState.style.display = 'none';
                
                renderPage(currentPage);
                generateThumbnails();
                updateButtons();
                
                console.log('✅ PDF loaded successfully. Total pages:', totalPages);
            }).catch(function(error) {
                console.error('❌ Error loading PDF:', error);
                loadingState.innerHTML = `
                    <div class="error-state">
                        <div class="error-icon">⚠️</div>
                        <h3>Gagal Memuat PDF</h3>
                        <p>Terjadi kesalahan saat memuat file PDF.</p>
                        <div class="error-details">${error.message || 'Unknown error'}</div>
                        <p style="margin-top:16px;font-size:12px;color:#a0aec0;">
                            Path: ${PDF_URL}
                        </p>
                    </div>
                `;
            });
        }

        // ==================== RENDER PAGE ====================
        function renderPage(pageNum) {
            if (!pdfDoc || isRendering) return;
            isRendering = true;

            pdfDoc.getPage(pageNum).then(function(page) {
                const viewport = page.getViewport({ scale: scale });
                
                // Remove existing canvas
                const existingCanvas = container.querySelector('canvas');
                if (existingCanvas) {
                    container.removeChild(existingCanvas);
                }

                // Create new canvas
                const canvas = document.createElement('canvas');
                canvas.style.maxWidth = '100%';
                canvas.style.height = 'auto';
                container.appendChild(canvas);

                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                page.render(renderContext).promise.then(function() {
                    document.getElementById('current-page').textContent = pageNum;
                    document.getElementById('page-input').value = pageNum;
                    updateButtons();
                    updateActiveThumbnail(pageNum);
                    isRendering = false;
                });
            }).catch(function(error) {
                console.error('Error rendering page:', error);
                isRendering = false;
            });
        }

        // ==================== THUMBNAILS ====================
        function generateThumbnails() {
            if (!pdfDoc) return;
            
            thumbnailsContainer.innerHTML = '';
            
            for (let i = 1; i <= totalPages; i++) {
                const item = document.createElement('div');
                item.className = 'thumbnail-item' + (i === 1 ? ' active' : '');
                item.dataset.page = i;
                
                const canvas = document.createElement('canvas');
                canvas.width = 150;
                canvas.height = 212;
                
                const label = document.createElement('div');
                label.className = 'page-label';
                label.textContent = 'Halaman ' + i;
                
                item.appendChild(canvas);
                item.appendChild(label);
                
                item.addEventListener('click', function() {
                    const page = parseInt(this.dataset.page);
                    if (page !== currentPage) {
                        currentPage = page;
                        renderPage(currentPage);
                    }
                });
                
                thumbnailsContainer.appendChild(item);
                
                // Render thumbnail
                pdfDoc.getPage(i).then(function(page) {
                    const viewport = page.getViewport({ scale: 0.3 });
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    
                    page.render({
                        canvasContext: context,
                        viewport: viewport
                    });
                });
            }
        }

        function updateActiveThumbnail(pageNum) {
            const items = thumbnailsContainer.querySelectorAll('.thumbnail-item');
            items.forEach(function(item) {
                const page = parseInt(item.dataset.page);
                item.classList.toggle('active', page === pageNum);
            });
        }

        // ==================== NAVIGATION ====================
        function nextPage() {
            if (currentPage < totalPages) {
                currentPage++;
                renderPage(currentPage);
            }
        }

        function prevPage() {
            if (currentPage > 1) {
                currentPage--;
                renderPage(currentPage);
            }
        }

        function firstPage() {
            if (currentPage !== 1) {
                currentPage = 1;
                renderPage(currentPage);
            }
        }

        function lastPage() {
            if (currentPage !== totalPages) {
                currentPage = totalPages;
                renderPage(currentPage);
            }
        }

        function goToPage(value) {
            let page = parseInt(value);
            if (isNaN(page) || page < 1) page = 1;
            if (page > totalPages) page = totalPages;
            
            if (page !== currentPage) {
                currentPage = page;
                renderPage(currentPage);
            } else {
                document.getElementById('page-input').value = page;
            }
        }

        // ==================== ZOOM ====================
        function zoomIn() {
            scale = Math.min(scale + 0.1, 3.0);
            updateZoomUI();
            renderPage(currentPage);
        }

        function zoomOut() {
            scale = Math.max(scale - 0.1, 0.25);
            updateZoomUI();
            renderPage(currentPage);
        }

        function changeZoom(value) {
            scale = parseFloat(value) / 100;
            updateZoomUI();
            renderPage(currentPage);
        }

        function fitToWidth() {
            const containerWidth = container.clientWidth - 60;
            if (pdfDoc) {
                pdfDoc.getPage(currentPage).then(function(page) {
                    const viewport = page.getViewport({ scale: 1 });
                    scale = containerWidth / viewport.width;
                    scale = Math.max(0.25, Math.min(3.0, scale));
                    updateZoomUI();
                    renderPage(currentPage);
                });
            }
        }

        function fitToPage() {
            const containerWidth = container.clientWidth - 60;
            const containerHeight = container.clientHeight - 60;
            if (pdfDoc) {
                pdfDoc.getPage(currentPage).then(function(page) {
                    const viewport = page.getViewport({ scale: 1 });
                    const scaleX = containerWidth / viewport.width;
                    const scaleY = containerHeight / viewport.height;
                    scale = Math.min(scaleX, scaleY);
                    scale = Math.max(0.25, Math.min(3.0, scale));
                    updateZoomUI();
                    renderPage(currentPage);
                });
            }
        }

        function updateZoomUI() {
            const percent = Math.round(scale * 100);
            document.getElementById('zoom-level').textContent = percent + '%';
            document.getElementById('zoom-range').value = percent;
        }

        // ==================== SIDEBAR ====================
        function toggleSidebar() {
            isSidebarOpen = !isSidebarOpen;
            sidebar.classList.toggle('show', isSidebarOpen);
            document.getElementById('sidebar-toggle').classList.toggle('active', isSidebarOpen);
        }

        // ==================== BUTTONS ====================
        function updateButtons() {
            document.getElementById('prev-btn').disabled = (currentPage <= 1);
            document.getElementById('first-btn').disabled = (currentPage <= 1);
            document.getElementById('next-btn').disabled = (currentPage >= totalPages);
            document.getElementById('last-btn').disabled = (currentPage >= totalPages);
        }

        // ==================== DOWNLOAD & PRINT ====================
        function downloadPDF() {
            const link = document.createElement('a');
            link.href = PDF_URL;
            link.download = FILE_NAME;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        function printPDF() {
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.top = '-9999px';
            iframe.style.left = '-9999px';
            iframe.src = PDF_URL;
            document.body.appendChild(iframe);
            
            iframe.onload = function() {
                setTimeout(function() {
                    iframe.contentWindow.print();
                    setTimeout(function() {
                        document.body.removeChild(iframe);
                    }, 1000);
                }, 500);
            };
        }

        // ==================== KEYBOARD SHORTCUTS ====================
        document.addEventListener('keydown', function(e) {
            // Don't trigger if typing in input
            if (e.target.tagName === 'INPUT') return;
            
            switch(e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    nextPage();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    prevPage();
                    break;
                case 'Home':
                    e.preventDefault();
                    firstPage();
                    break;
                case 'End':
                    e.preventDefault();
                    lastPage();
                    break;
                case '+':
                case '=':
                    e.preventDefault();
                    zoomIn();
                    break;
                case '-':
                    e.preventDefault();
                    zoomOut();
                    break;
                case 't':
                case 'T':
                    e.preventDefault();
                    toggleSidebar();
                    break;
                case 'p':
                case 'P':
                    e.preventDefault();
                    printPDF();
                    break;
                case 'd':
                case 'D':
                    e.preventDefault();
                    downloadPDF();
                    break;
            }
        });

        // ==================== RESIZE HANDLER ====================
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                if (container.querySelector('canvas')) {
                    renderPage(currentPage);
                }
            }, 300);
        });

        // ==================== PAGE INPUT VALIDATION ====================
        document.getElementById('page-input').addEventListener('blur', function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) value = 1;
            if (value > totalPages) value = totalPages;
            this.value = value;
            if (value !== currentPage) {
                currentPage = value;
                renderPage(currentPage);
            }
        });

        // ==================== EXPOSE FUNCTIONS GLOBALLY ====================
        window.nextPage = nextPage;
        window.prevPage = prevPage;
        window.firstPage = firstPage;
        window.lastPage = lastPage;
        window.goToPage = goToPage;
        window.zoomIn = zoomIn;
        window.zoomOut = zoomOut;
        window.changeZoom = changeZoom;
        window.fitToWidth = fitToWidth;
        window.fitToPage = fitToPage;
        window.toggleSidebar = toggleSidebar;
        window.downloadPDF = downloadPDF;
        window.printPDF = printPDF;

        console.log('✅ PDF Viewer ready!');
        console.log('📖 Keyboard shortcuts: ← → ↑ ↓ Home End + - T P D');
    </script>

</body>
</html>