/* ==========================================================================
   KRISHI MITTRA - Interactive Documentation JavaScript
   Features: Search modal, dark/light theme toggle, scroll tracking, code copy
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Theme Switcher (Dark/Light Mode) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    
    // Check saved theme or default to 'light'
    const savedTheme = localStorage.getItem('krishi_doc_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('krishi_doc_theme', newTheme);
            updateThemeIcon(newTheme);
            showToast(`Switched to ${newTheme.toUpperCase()} theme`);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }

    // --- 2. Mobile Sidebar Toggle & Backdrop Overlay ---
    const menuToggleBtn = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    function toggleSidebar() {
        if (sidebar) sidebar.classList.toggle('active');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('active');
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('active');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }

    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', toggleSidebar);
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Close sidebar on link click (mobile)
    if (sidebar) {
        const sidebarLinks = sidebar.querySelectorAll('a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    closeSidebar();
                }
            });
        });
    }

    // --- 3. Scroll Tracking & Active Navigation Link ---
    const sections = document.querySelectorAll('.doc-section');
    const navLinks = document.querySelectorAll('.nav-item a');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // --- 4. Code Block Copy to Clipboard ---
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const codeWrapper = btn.closest('.code-wrapper');
            const codeEl = codeWrapper ? codeWrapper.querySelector('code') : null;
            if (codeEl) {
                navigator.clipboard.writeText(codeEl.innerText.trim()).then(() => {
                    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    showToast('Code snippet copied to clipboard');
                    setTimeout(() => {
                        btn.innerHTML = '<i class="far fa-copy"></i> Copy';
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            }
        });
    });

    // --- 5. FAQ Accordions ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            // Close other FAQs
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- 6. Quick Search Modal (`Ctrl + K` / `Cmd + K`) ---
    const searchTrigger = document.getElementById('search-trigger');
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    // Collect search index from headings and cards
    const searchIndex = [];
    document.querySelectorAll('.doc-section').forEach(sec => {
        const secId = sec.getAttribute('id');
        const secTitle = sec.querySelector('.section-title')?.innerText || '';
        
        sec.querySelectorAll('h3, .feature-title, .api-path, .step-title, p').forEach(el => {
            const text = el.innerText.trim();
            if (text.length > 5) {
                searchIndex.push({
                    sectionId: secId,
                    sectionTitle: secTitle,
                    title: text.length > 60 ? text.substring(0, 60) + '...' : text,
                    fullText: text.toLowerCase()
                });
            }
        });
    });

    function openSearchModal() {
        if (searchModal) {
            searchModal.classList.add('active');
            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
            }
            renderSearchResults('');
        }
    }

    function closeSearchModal() {
        if (searchModal) {
            searchModal.classList.remove('active');
        }
    }

    if (searchTrigger) {
        searchTrigger.addEventListener('click', openSearchModal);
    }

    // Modal background click to close
    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                closeSearchModal();
            }
        });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }
        if (e.key === 'Escape') {
            closeSearchModal();
            closeApkModal();
        }
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderSearchResults(e.target.value.trim().toLowerCase());
        });
    }

    function renderSearchResults(query) {
        if (!searchResults) return;
        searchResults.innerHTML = '';

        if (!query) {
            searchResults.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-muted);">Type something to search documentation...</div>`;
            return;
        }

        const filtered = searchIndex.filter(item => item.fullText.includes(query)).slice(0, 8);

        if (filtered.length === 0) {
            searchResults.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-muted);">No matching results found for "${query}"</div>`;
            return;
        }

        filtered.forEach(item => {
            const resItem = document.createElement('a');
            resItem.className = 'search-result-item';
            resItem.href = `#${item.sectionId}`;
            resItem.innerHTML = `
                <div class="search-result-title">${item.title}</div>
                <div class="search-result-snippet">In: ${item.sectionTitle}</div>
            `;
            resItem.addEventListener('click', () => {
                closeSearchModal();
            });
            searchResults.appendChild(resItem);
        });
    }

    // --- 7. Download APK Modal Handler ---
    // 💡 GOOGLE DRIVE APK CONFIGURATION:
    // Replace the URL below with your Google Drive share link!
    // Example: 'https://drive.google.com/uc?export=download&id=YOUR_FILE_ID'
    const APK_DOWNLOAD_URL = 'assets/krishi-mittra-v1.0.apk'; 

    const apkModal = document.getElementById('apk-modal');
    const downloadApkBtns = document.querySelectorAll('.download-apk-trigger');
    const closeApkModalBtn = document.getElementById('close-apk-modal');
    const confirmDownloadBtn = document.getElementById('confirm-download-btn');

    downloadApkBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openApkModal();
        });
    });

    function openApkModal() {
        if (apkModal) apkModal.classList.add('active');
    }

    function closeApkModal() {
        if (apkModal) apkModal.classList.remove('active');
    }

    if (closeApkModalBtn) closeApkModalBtn.addEventListener('click', closeApkModal);
    if (apkModal) {
        apkModal.addEventListener('click', (e) => {
            if (e.target === apkModal) closeApkModal();
        });
    }

    if (confirmDownloadBtn) {
        confirmDownloadBtn.addEventListener('click', () => {
            closeApkModal();
            showToast('Opening KRISHI MITTRA APK Download...');
            
            if (APK_DOWNLOAD_URL.startsWith('http://') || APK_DOWNLOAD_URL.startsWith('https://')) {
                // External link (e.g. Google Drive link)
                window.open(APK_DOWNLOAD_URL, '_blank');
            } else {
                // Local APK file fallback
                const a = document.createElement('a');
                a.href = APK_DOWNLOAD_URL;
                a.download = 'krishi-mittra-v1.0.apk';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        });
    }

    // --- 8. Toast Helper ---
    function showToast(message) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.innerText = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
