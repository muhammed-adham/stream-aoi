// Event categories and their Arabic translations
const eventCategories = {
    en: {
        'Diplomatic': 'Diplomatic',
        'Partnership': 'Partnership',
        'Conference': 'Conference',
        'Exhibition': 'Exhibition',
        'Education': 'Education'
    },
    ar: {
        'Diplomatic': 'دبلوماسي',
        'Partnership': 'شراكة',
        'Conference': 'مؤتمر',
        'Exhibition': 'معرض',
        'Education': 'تعليم'
    }
};

// Event locations and their Arabic translations
const eventLocations = {
    en: {
        'AOI Headquarters': 'AOI Headquarters',
        'Convention Center': 'Convention Center',
        'International Conference Center': 'International Conference Center',
        'Defense Exhibition Center': 'Defense Exhibition Center',
        'AOI Training Center': 'AOI Training Center'
    },
    ar: {
        'AOI Headquarters': 'مقر الهيئة',
        'Convention Center': 'مركز المؤتمرات',
        'International Conference Center': 'المركز الدولي للمؤتمرات',
        'Defense Exhibition Center': 'مركز المعارض الدفاعية',
        'AOI Training Center': 'مركز تدريب الهيئة'
    }
};

// Generate events with varied content
function generateEvents() {
    const events = {
        en: [],
        ar: []
    };

    const baseDate = new Date('2024-01-01');
    const imageUrls = [
        'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80',
        'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&q=80',
        'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=800&q=80',
        'https://images.unsplash.com/photo-1581092921461-39b9d08a9b21?w=800&q=80',
        'https://images.unsplash.com/photo-1581092160607-ee284c4d9cc7?w=800&q=80'
    ];

    const videoUrl = 'https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=164&oauth2_token_id=57447761';

    // Generate events
    for (let i = 1; i <= 10; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i * 3); // Space events 3 days apart

        const category = Object.keys(eventCategories.en)[Math.floor(Math.random() * Object.keys(eventCategories.en).length)];
        const location = Object.keys(eventLocations.en)[Math.floor(Math.random() * Object.keys(eventLocations.en).length)];
        const imageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];

        // English event
        events.en.push({
            id: i,
            date: date.toISOString().split('T')[0],
            title: `Event ${i}: ${eventCategories.en[category]} Meeting`,
            description: `Important ${eventCategories.en[category].toLowerCase()} event at ${eventLocations.en[location]}`,
            image: imageUrl,
            video: videoUrl,
            article: `Detailed coverage of the ${eventCategories.en[category].toLowerCase()} event...`,
            category: eventCategories.en[category],
            location: eventLocations.en[location]
        });

        // Arabic event
        events.ar.push({
            id: i,
            date: date.toISOString().split('T')[0],
            title: `فعالية ${i}: اجتماع ${eventCategories.ar[category]}`,
            description: `فعالية ${eventCategories.ar[category]} مهمة في ${eventLocations.ar[location]}`,
            image: imageUrl,
            video: videoUrl,
            article: `تغطية تفصيلية لفعالية ${eventCategories.ar[category]}...`,
            category: eventCategories.ar[category],
            location: eventLocations.ar[location]
        });
    }

    return events;
}

// Export the generated events
const eventsData = generateEvents(); 