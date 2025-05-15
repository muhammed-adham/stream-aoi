// Constants
const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let filteredEvents = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Remove duplicate theme handling as it's now in site-settings.js
    
    // Make sure to attach event listener to clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        console.log("Attaching event listener to clear filters button");
        clearFiltersBtn.addEventListener('click', (e) => {
            console.log("Clear filters button clicked");
            clearAllFilters();
        });
    } else {
        console.log("Clear filters button not found on page load");
    }

    // Initialize Events
    initializeEvents();
});

// Initialize Events
function initializeEvents() {
    // Get filter elements
    const categoryFilter = document.getElementById('category-filter');
    const locationFilter = document.getElementById('location-filter');
    const sortBy = document.getElementById('sort-by');
    const searchInput = document.getElementById('search-input');
    
    // For date picker - these will be handled by the date-range-picker.js
    // The events will still be triggered by the date picker
    const startDate = document.getElementById('start-date');
    const endDate = document.getElementById('end-date');
    
    // Get clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }

    // Initialize filters
    initializeFilters();

    // Add event listeners
    categoryFilter.addEventListener('change', () => {
        filterEvents();
        updateFilterButtonOnChange();
    });
    
    locationFilter.addEventListener('change', () => {
        filterEvents();
        updateFilterButtonOnChange();
    });
    
    sortBy.addEventListener('change', () => {
        filterEvents();
        updateFilterButtonOnChange();
    });
    
    searchInput.addEventListener('input', () => {
        filterEvents();
        updateFilterButtonOnChange();
    });
    
    // For date picker - date-range-picker.js will trigger these events
    if (startDate) {
        startDate.addEventListener('change', () => {
            filterEvents();
            updateFilterButtonOnChange();
        });
    }
    
    if (endDate) {
        endDate.addEventListener('change', () => {
            filterEvents();
            updateFilterButtonOnChange();
        });
    }

    // Initial load
    filterEvents();

    // Add keyboard listener for the entire document to handle keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// Handle keyboard navigation
function handleKeyboardNavigation(event) {
    // Handle Enter key for interactive elements
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains('event-card')) {
            // If an event card has focus and Enter is pressed, navigate to its details page
            const eventLink = activeElement.querySelector('.event-link');
            if (eventLink) {
                window.location.href = eventLink.href;
            }
        }
    }
    
    // Handle arrow keys for pagination
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const pagination = document.querySelector('.pagination');
        if (pagination && document.activeElement.closest('.pagination')) {
            // If focus is in the pagination area
            const buttons = Array.from(pagination.querySelectorAll('button:not([disabled])'));
            const currentIndex = buttons.indexOf(document.activeElement);
            
            if (currentIndex !== -1) {
                let newIndex;
                if (event.key === 'ArrowLeft') {
                    newIndex = Math.max(0, currentIndex - 1);
                } else { // ArrowRight
                    newIndex = Math.min(buttons.length - 1, currentIndex + 1);
                }
                buttons[newIndex].focus();
                event.preventDefault();
            }
        }
    }
}

// Initialize Filters
function initializeFilters() {
    const events = eventsData[document.documentElement.lang];
    const categories = [...new Set(events.map(event => event.category))];
    const locations = [...new Set(events.map(event => event.location))];

    const categoryFilter = document.getElementById('category-filter');
    const locationFilter = document.getElementById('location-filter');

    // Update category options
    categories.forEach(category => {
        if (!categoryFilter.querySelector(`option[value="${category}"]`)) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        }
    });

    // Update location options
    locations.forEach(location => {
        if (!locationFilter.querySelector(`option[value="${location}"]`)) {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        }
    });
}

// Function to normalize Arabic text for search purposes
function normalizeArabicText(text) {
    if (!text) return text;
    
    // Convert to lowercase for case-insensitive search
    text = text.toLowerCase();
    
    // Only normalize Arabic if the page language is Arabic
    if (document.documentElement.lang === 'ar') {
        // Replace different forms of Alef (أإآا) with basic Alef (ا)
        text = text.replace(/[أإآ]/g, 'ا');
        
        // Normalize Yaa forms
        text = text.replace(/[ىی]/g, 'ي');
        
        // Normalize Hamza forms
        text = text.replace(/[ؤئ]/g, 'ء');
        
        // Handle Taa Marbuta (ة) and Haa (ه) - treat them as the same character for search
        // This is crucial for words like "زيارة" vs "زياره"
        text = text.replace(/[ةه]/g, '8');  // Replace both with a temporary character
        
        // Remove diacritics (tashkeel)
        text = text.replace(/[\u064B-\u065F]/g, '');
        
        // Remove tatweel (kashida)
        text = text.replace(/\u0640/g, '');
    }
    
    return text;
}

// Filter Events
function filterEvents() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const selectedCategory = document.getElementById('category-filter').value;
    const selectedLocation = document.getElementById('location-filter').value;
    const sortValue = document.getElementById('sort-by').value;
    
    // Check if any filter is applied
    updateClearFiltersButtonState(searchTerm, startDate, endDate, selectedCategory, selectedLocation);

    // Convert dates for comparison
    const startDateObj = new Date(startDate || '1970-01-01');
    const endDateObj = new Date(endDate || '2100-12-31');

    let events = eventsData[document.documentElement.lang];

    // Normalize search term for better matching
    const normalizedSearchTerm = normalizeArabicText(searchTerm);

    // Apply filters
    events = events.filter(event => {
        // Normalize event title and description for better matching
        const normalizedTitle = normalizeArabicText(event.title);
        const normalizedDescription = normalizeArabicText(event.description);
        
        const matchesSearch = normalizedTitle.includes(normalizedSearchTerm) ||
                            normalizedDescription.includes(normalizedSearchTerm);
        
        const eventDate = new Date(event.date);
        const matchesDate = eventDate >= startDateObj && eventDate <= endDateObj;
        const matchesCategory = !selectedCategory || event.category === selectedCategory;
        const matchesLocation = !selectedLocation || event.location === selectedLocation;

        return matchesSearch && matchesDate && matchesCategory && matchesLocation;
    });

    // Sort events
    events.sort((a, b) => {
        switch (sortValue) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });

    filteredEvents = events;
    currentPage = 1;
    
    // Update events count display
    updateEventsCount(filteredEvents.length);
    
    renderEvents();
    renderPagination();
}

// Update events count display
function updateEventsCount(count) {
    const countElement = document.getElementById('events-count-number');
    if (countElement) {
        countElement.textContent = count;
    }
}

// Update Clear Filters Button State
function updateClearFiltersButtonState(searchTerm, startDate, endDate, category, location) {
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (!clearFiltersBtn) {
        console.log("Clear filters button not found"); // Debug
        return;
    }
    
    // Default sort value doesn't count as a filter
    const sortBy = document.getElementById('sort-by');
    const isDefaultSort = sortBy ? sortBy.value === 'date-desc' : true;
    
    // Check if any filter is active
    const isAnyFilterActive = 
        searchTerm !== '' || 
        startDate !== '' || 
        endDate !== '' || 
        category !== '' || 
        location !== '' ||
        !isDefaultSort;
    
    // Enable/disable button based on filter state
    clearFiltersBtn.disabled = !isAnyFilterActive;
    
    console.log(`Filters state: search=${!!searchTerm}, startDate=${!!startDate}, endDate=${!!endDate}, category=${!!category}, location=${!!location}, nonDefaultSort=${!isDefaultSort}, buttonDisabled=${clearFiltersBtn.disabled}`); // Debug
}

// Render Events
function renderEvents() {
    const eventsGrid = document.querySelector('.events-grid');
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const eventsToShow = filteredEvents.slice(startIndex, endIndex);
    
    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;
    
    // Clear the events grid
    eventsGrid.innerHTML = '';

    if (eventsToShow.length === 0) {
        const noEventsDiv = document.createElement('div');
        noEventsDiv.className = 'no-events';
        noEventsDiv.setAttribute('role', 'alert');
        noEventsDiv.innerHTML = `<p>${document.documentElement.lang === 'ar' ? 
            'لا توجد فعاليات متاحة' : 
            'No events available'}</p>`;
        eventsGrid.appendChild(noEventsDiv);
        return;
    }

    // Get current language
    const currentLang = document.documentElement.lang || 'en';
    
    eventsToShow.forEach((event, index) => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.setAttribute('data-testid', 'glastonbury-card');
        eventCard.setAttribute('data-indexcard', 'true');
        eventCard.setAttribute('role', 'article');
        eventCard.setAttribute('aria-labelledby', `event-title-${event.id}`);
        eventCard.setAttribute('tabindex', '0'); // Make card focusable for keyboard navigation
        
        // Use proper language-specific event page URL
        const eventPageUrl = currentLang === 'ar' ? `event-ar.html?id=${event.id}` : `event.html?id=${event.id}`;
        
        eventCard.innerHTML = `
            <div data-testid="glastonbury-content" class="event-content">
                <div data-testid="glastonbury-title-section">
                    <p class="event-description" aria-label="Event date">${event.date}</p>
                    <h2 data-testid="glastonbury-title" class="event-title" id="event-title-${event.id}">${event.title}</h2>
                </div>
                <div data-testid="glastonbury-description-section">
                    <span data-testid="glastonbury-description" class="event-description" aria-label="Event description">${event.description}</span>
                </div>
                <div data-testid="glastonbury-button">
                    <a href="${eventPageUrl}" class="event-link" aria-label="${event.title} - ${currentLang === 'ar' ? 'عرض التفاصيل' : 'View Details'}">
                        ${currentLang === 'ar' ? 
                            'عرض التفاصيل' : 
                            'View Details'}
                    </a>
                </div>
            </div>
            <div data-testid="glastonbury-image-wrapper" class="event-image">
                <img src="${event.images[0]}" 
                     alt="${event.title}" 
                     loading="lazy"
                     sizes="(min-width: 1008px) 20vw, (min-width: 600px) 33vw, 96vw"
                     srcset="${event.images[0]} 480w">
            </div>
        `;
        
        // Add event handler for keyboard navigation (Enter key)
        eventCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                window.location.href = eventPageUrl;
            }
        });
        
        eventsGrid.appendChild(eventCard);
    });
    
    // Add window resize listener to rerender cards when switching between mobile and desktop
    if (!window.hasResizeListener) {
        window.addEventListener('resize', () => {
            const wasMobile = window.innerWidth <= 768 ? false : true;
            const isMobileNow = window.innerWidth <= 768 ? true : false;
            
            // Only rerender if we're crossing the mobile threshold
            if (wasMobile !== isMobileNow) {
                renderEvents();
            }
        });
        window.hasResizeListener = true;
    }
}

// Render Pagination
function renderPagination() {
    const paginationContainer = document.querySelector('.pagination');
    const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
    
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = document.documentElement.lang === 'ar' ? 'السابق' : 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.setAttribute('aria-label', document.documentElement.lang === 'ar' ? 'الصفحة السابقة' : 'Previous page');
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderEvents();
            renderPagination();
            // Announce page change to screen readers
            announcePageChange();
        }
    });
    paginationContainer.appendChild(prevButton);

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page
    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.textContent = '1';
        firstPageButton.setAttribute('aria-label', document.documentElement.lang === 'ar' ? 'الصفحة الأولى' : 'First page');
        firstPageButton.addEventListener('click', () => {
            currentPage = 1;
            renderEvents();
            renderPagination();
            announcePageChange();
        });
        paginationContainer.appendChild(firstPageButton);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.setAttribute('aria-hidden', 'true');
            paginationContainer.appendChild(ellipsis);
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = i === currentPage ? 'active' : '';
        pageButton.setAttribute('aria-label', document.documentElement.lang === 'ar' ? 
            `الصفحة ${i}${i === currentPage ? ' (الصفحة الحالية)' : ''}` : 
            `Page ${i}${i === currentPage ? ' (current page)' : ''}`);
        pageButton.setAttribute('aria-current', i === currentPage ? 'page' : 'false');
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderEvents();
            renderPagination();
            announcePageChange();
        });
        paginationContainer.appendChild(pageButton);
    }

    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.setAttribute('aria-hidden', 'true');
            paginationContainer.appendChild(ellipsis);
        }

        const lastPageButton = document.createElement('button');
        lastPageButton.textContent = totalPages;
        lastPageButton.setAttribute('aria-label', document.documentElement.lang === 'ar' ? 'الصفحة الأخيرة' : 'Last page');
        lastPageButton.addEventListener('click', () => {
            currentPage = totalPages;
            renderEvents();
            renderPagination();
            announcePageChange();
        });
        paginationContainer.appendChild(lastPageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = document.documentElement.lang === 'ar' ? 'التالي' : 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.setAttribute('aria-label', document.documentElement.lang === 'ar' ? 'الصفحة التالية' : 'Next page');
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderEvents();
            renderPagination();
            announcePageChange();
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Announce page change to screen readers
function announcePageChange() {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'assertive');
    announcer.setAttribute('role', 'status');
    announcer.className = 'sr-only';
    
    const message = document.documentElement.lang === 'ar' ?
        `تم الانتقال إلى الصفحة ${currentPage}` :
        `Navigated to page ${currentPage}`;
    
    announcer.textContent = message;
    document.body.appendChild(announcer);
    
    // Remove after announcement is made
    setTimeout(() => {
        document.body.removeChild(announcer);
    }, 1000);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const lang = document.documentElement.lang || 'en';
    return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', options);
}

// Clear All Filters
function clearAllFilters() {
    console.log("Clearing all filters"); // Debug

    // Reset search
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    // Reset category
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) categoryFilter.value = '';
    
    // Reset location
    const locationFilter = document.getElementById('location-filter');
    if (locationFilter) locationFilter.value = '';
    
    // Reset date range
    const startDate = document.getElementById('start-date');
    const endDate = document.getElementById('end-date');
    if (startDate) startDate.value = '';
    if (endDate) endDate.value = '';
    
    // Reset the date range picker display if it exists
    if (window.dateRangePicker) {
        window.dateRangePicker.clearDateRange();
    }
    
    // Reset sort to default
    const sortBy = document.getElementById('sort-by');
    if (sortBy) sortBy.value = 'date-desc';

    // Update button state
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.disabled = true;
    }
    
    // Reapply filters
    filterEvents();
    
    // Announce filter clearing to screen readers
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('role', 'status');
    announcer.className = 'sr-only';
    announcer.textContent = document.documentElement.lang === 'ar' ? 'تم مسح جميع الفلاتر' : 'All filters have been cleared';
    document.body.appendChild(announcer);
    
    // Remove announcer after it's read
    setTimeout(() => {
        document.body.removeChild(announcer);
    }, 1000);
}

// Update filter button state when any filter changes
function updateFilterButtonOnChange() {
    const searchTerm = document.getElementById('search-input').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const selectedCategory = document.getElementById('category-filter').value;
    const selectedLocation = document.getElementById('location-filter').value;
    
    updateClearFiltersButtonState(searchTerm, startDate, endDate, selectedCategory, selectedLocation);
} 