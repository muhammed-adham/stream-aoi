document.addEventListener('DOMContentLoaded', () => {
    // Get event ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = parseInt(urlParams.get('id'));
    const lang = document.documentElement.lang;

    // Get event data
    const event = getEventById(eventId, lang);
    if (!event) {
        window.location.href = lang === 'ar' ? 'index-ar.html' : 'index.html';
        return;
    }

    // Initialize search functionality
    const searchInput = document.getElementById('search-input');
    const contentTypeSelect = document.getElementById('content-type');
    const mainImage = document.getElementById('event-main-image');
    const thumbnailsContainer = document.getElementById('image-thumbnails');
    const videosContainer = document.getElementById('event-videos');
    const descriptionText = document.getElementById('event-description-text');
    const articleText = document.getElementById('event-article-text');

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

    function filterContent() {
        const searchTerm = searchInput.value.toLowerCase();
        const contentType = contentTypeSelect.value;
        
        // Normalize search term for better matching
        const normalizedSearchTerm = normalizeArabicText(searchTerm);

        // Hide all content sections first
        mainImage.parentElement.parentElement.style.display = 'none';
        videosContainer.style.display = 'none';
        descriptionText.parentElement.style.display = 'none';
        articleText.parentElement.style.display = 'none';

        // Show and filter content based on selection
        if (contentType === 'all' || contentType === 'images') {
            mainImage.parentElement.parentElement.style.display = 'block';
            if (searchTerm) {
                const hasMatchingImage = event.images.some(img => {
                    const normalizedImg = normalizeArabicText(img);
                    return normalizedImg.includes(normalizedSearchTerm);
                });
                mainImage.parentElement.parentElement.style.display = hasMatchingImage ? 'block' : 'none';
            }
        }

        if (contentType === 'all' || contentType === 'videos') {
            videosContainer.style.display = 'grid';
            if (searchTerm) {
                const hasMatchingVideo = event.videos.some(video => {
                    const normalizedVideo = normalizeArabicText(video);
                    return normalizedVideo.includes(normalizedSearchTerm);
                });
                videosContainer.style.display = hasMatchingVideo ? 'grid' : 'none';
            }
        }

        if (contentType === 'all' || contentType === 'description') {
            descriptionText.parentElement.style.display = 'block';
            if (searchTerm) {
                const normalizedDescription = normalizeArabicText(event.description);
                const hasMatch = normalizedDescription.includes(normalizedSearchTerm);
                descriptionText.parentElement.style.display = hasMatch ? 'block' : 'none';
            }
        }

        if (contentType === 'all' || contentType === 'article') {
            articleText.parentElement.style.display = 'block';
            if (searchTerm) {
                const normalizedArticle = normalizeArabicText(event.article);
                const hasMatch = normalizedArticle.includes(normalizedSearchTerm);
                articleText.parentElement.style.display = hasMatch ? 'block' : 'none';
            }
        }
    }

    // Add event listeners for search
    searchInput.addEventListener('input', filterContent);
    contentTypeSelect.addEventListener('change', filterContent);

    // Update page title and breadcrumb
    document.title = `${event.title} - Stream AOI`;
    document.getElementById('event-title').textContent = event.title;
    document.getElementById('event-title-large').textContent = event.title;

    // Update event meta information
    document.getElementById('event-date').textContent = new Date(event.date).toLocaleDateString(
        lang === 'ar' ? 'ar-SA' : 'en-US',
        {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }
    );
    document.getElementById('event-location').textContent = event.location;
    document.getElementById('event-category').textContent = event.category;

    // Update description and article
    document.getElementById('event-description-text').textContent = event.description;
    document.getElementById('event-article-text').textContent = event.article;

    // Handle images
    if (event.images && event.images.length > 0) {
        // Set main image
        mainImage.src = event.images[0];
        mainImage.alt = event.title;

        // Create thumbnails
        event.images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = image;
            thumbnail.alt = `${event.title} - ${lang === 'ar' ? 'صورة' : 'Image'} ${index + 1}`;
            thumbnail.className = 'thumbnail' + (index === 0 ? ' active' : '');
            thumbnail.addEventListener('click', () => {
                // Update main image
                mainImage.src = image;
                // Update active thumbnail
                document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
                thumbnail.classList.add('active');
            });
            thumbnailsContainer.appendChild(thumbnail);
        });
    }

    // Handle videos
    if (event.videos && event.videos.length > 0) {
        event.videos.forEach((video, index) => {
            const videoWrapper = document.createElement('div');
            videoWrapper.className = 'video-wrapper';
            
            const videoElement = document.createElement('video');
            videoElement.controls = true;
            videoElement.className = 'event-video';
            
            const source = document.createElement('source');
            source.src = video;
            source.type = 'video/mp4';
            
            videoElement.appendChild(source);
            videoWrapper.appendChild(videoElement);
            videosContainer.appendChild(videoWrapper);
        });
    }
}); 