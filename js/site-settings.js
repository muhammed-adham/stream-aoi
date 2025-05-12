document.addEventListener('DOMContentLoaded', () => {
    // Check for language redirect
    checkLanguageRedirect();
    
    // Handle theme settings
    initializeTheme();
    
    // Handle language settings
    initializeLanguage();
    
    // Function to check if we need to redirect based on language preference
    function checkLanguageRedirect() {
        // Get current page info
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop();
        const urlParams = new URLSearchParams(window.location.search);
        const currentLang = document.documentElement.lang || 'en';
        const preferredLang = localStorage.getItem('preferred-language');
        
        // Only process if we have a preferred language that differs from current
        if (!preferredLang || preferredLang === currentLang) return;
        
        // Handle event pages with id parameter
        if (urlParams.has('id')) {
            const eventId = urlParams.get('id');
            
            // If we're on an event page but in the wrong language, redirect
            if ((pageName === 'event.html' && preferredLang === 'ar') || 
                (pageName === 'event-ar.html' && preferredLang === 'en')) {
                
                // Redirect to the preferred language event page with the same ID
                const targetPage = preferredLang === 'ar' ? 'event-ar.html' : 'event.html';
                window.location.href = `${targetPage}?id=${eventId}`;
                return;
            }
        }
        // Handle regular pages
        else {
            // Check if we're on a page that has language variants
            if (pageName === 'index.html' && preferredLang === 'ar') {
                window.location.href = 'index-ar.html';
            } else if (pageName === 'index-ar.html' && preferredLang === 'en') {
                window.location.href = 'index.html';
            }
            // Add other page redirects as needed
        }
    }
    
    // Theme initialization
    function initializeTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;
        
        if (!themeToggle) return;
        
        // Set default theme class if missing
        if (!body.classList.contains('light-theme') && !body.classList.contains('dark-theme')) {
            body.classList.add('light-theme');
        }
        
        // Load saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light-theme';
        
        // Apply saved theme
        if (savedTheme === 'dark-theme') {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        // Theme toggle click handler
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-theme');
            body.classList.toggle('light-theme');
            
            const isDark = body.classList.contains('dark-theme');
            themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            
            // Save theme preference
            localStorage.setItem('theme', isDark ? 'dark-theme' : 'light-theme');
        });
    }
    
    // Language initialization
    function initializeLanguage() {
        // Store current page's language
        const currentLang = document.documentElement.lang || 'en';
        localStorage.setItem('preferred-language', currentLang);
        
        // Update language switch links
        const langSwitchLinks = document.querySelectorAll('.lang-switch, #lang-switch');
        
        langSwitchLinks.forEach(link => {
            // When a language switch link is clicked
            link.addEventListener('click', function(e) {
                const targetLang = currentLang === 'ar' ? 'en' : 'ar';
                localStorage.setItem('preferred-language', targetLang);
            });
        });
    }
}); 