// Enhanced filtering functionality for new database structure
// Supports Primary Medium, Secondary Media, Interaction Type, etc.

// Enhanced filter function that works with new and legacy fields
function enhancedFilterProjects(filter) {
    const today = new Date();
    
    switch(filter) {
        case 'new-media':
            return filterNewMediaProjects();
        case 'design':
            return filterDesignProjects();
        case 'workshops':
            return filterWorkshopsCategory();
        case 'writing':
            return filterWritingProjects();
        case 'upcoming':
            return filterUpcomingProjects(today);
        case 'interactive':
            return filterInteractiveProjects();
        case 'performance':
            return filterPerformanceProjects();
        case 'installation':
            return filterInstallationProjects();
        case 'video':
            return filterVideoProjects();
        case 'collaborative':
            return filterCollaborativeProjects();
        case 'featured':
            return filterFeaturedProjects();
        case 'about':
            return null; // Handle about page separately
        default:
            console.log('🔍 Showing all projects:', window.projects?.length || 0);
            const allProjects = window.projects || [];
            console.log('🔍 Returning projects:', allProjects.length);
            return allProjects;
    }
}

function filterNewMediaProjects() {
    console.log('🔍 Filtering new media projects...');
    const filtered = window.projects.filter(project => {
        const fields = project.fields;
        const tags = fields.Tags || [];
        const primaryMedium = fields['Primary Medium'] || '';
        const secondaryMedia = fields['Secondary Media'] || [];
        const interactionType = fields['Interaction Type'] || '';
        
        // Check multiple criteria for new media classification
        const isNewMedia = 
            tags.includes('Portfolio') || 
            ['Installation', 'Performance', 'Interactive', 'VR/AR', 'Video'].includes(primaryMedium) ||
            secondaryMedia.some(medium => ['Video', 'Interactive', 'Performance', 'Installation'].includes(medium)) ||
            ['Interactive', 'Participatory', 'Generative', 'Responsive'].includes(interactionType);
            
        return isNewMedia;
    }).sort(sortByDateDescending);
    
    console.log('🔍 New media projects found:', filtered.length);
    return filtered;
}

function filterDesignProjects() {
    return window.projects.filter(project => {
        const fields = project.fields;
        const tags = fields.Tags || [];
        const primaryMedium = fields['Primary Medium'] || '';
        const collaborationType = fields['Collaboration Type'] || '';
        
        return tags.includes('Client Work') || 
               collaborationType === 'Commission' ||
               collaborationType === 'Client Work' ||
               primaryMedium === 'Digital' ||
               primaryMedium === 'Print';
    }).sort(sortByDateDescending);
}

function filterWorkshopsCategory() {
    return window.projects.filter(project => {
        const fields = project.fields;
        const tags = fields.Tags || [];
        const collaborationType = fields['Collaboration Type'] || '';
        
        return tags.includes('Workshops') || 
               collaborationType === 'Educational' ||
               (fields.Title && fields.Title.toLowerCase().includes('workshop'));
    }).sort(sortByDateDescending);
}

function filterWritingProjects() {
    return window.projects.filter(project => {
        const fields = project.fields;
        const tags = fields.Tags || [];
        const primaryMedium = fields['Primary Medium'] || '';
        
        return tags.includes('Writing') || 
               primaryMedium === 'Publication' ||
               primaryMedium === 'Text';
    }).sort(sortByDateDescending);
}

function filterUpcomingProjects(today) {
    return window.projects.filter(project => {
        const fields = project.fields;
        const status = fields.Status || '';
        const projectPhase = fields['Project Phase'] || '';
        const date = new Date(fields.Date || 0);
        
        return date > today || 
               status === 'Current' ||
               projectPhase === 'Development' ||
               projectPhase === 'Ongoing';
    }).sort(sortByDateAscending);
}

function filterInteractiveProjects() {
    return window.projects.filter(project => {
        const fields = project.fields;
        const primaryMedium = fields['Primary Medium'] || '';
        const secondaryMedia = fields['Secondary Media'] || [];
        const interactionType = fields['Interaction Type'] || '';
        const tags = fields.Tags || [];
        
        return primaryMedium === 'Interactive' ||
               secondaryMedia.includes('Interactive') ||
               ['Interactive', 'Participatory', 'Generative', 'Responsive'].includes(interactionType) ||
               tags.includes('Interactive');
    }).sort(sortByDateDescending);
}

function filterPerformanceProjects() {
    return window.projects.filter(project => {
        const fields = project.fields;
        const primaryMedium = fields['Primary Medium'] || '';
        const secondaryMedia = fields['Secondary Media'] || [];
        const tags = fields.Tags || [];
        
        return primaryMedium === 'Performance' ||
               secondaryMedia.includes('Performance') ||
               tags.includes('Performance');
    }).sort(sortByDateDescending);
}

function filterInstallationProjects() {
    return window.projects.filter(project => {
        const fields = project.fields;
        const primaryMedium = fields['Primary Medium'] || '';
        const secondaryMedia = fields['Secondary Media'] || [];
        const tags = fields.Tags || [];
        
        return primaryMedium === 'Installation' ||
               secondaryMedia.includes('Installation') ||
               tags.includes('Installation');
    }).sort(sortByDateDescending);
}

function filterVideoProjects() {
    return window.projects.filter(project => {
        const fields = project.fields;
        const primaryMedium = fields['Primary Medium'] || '';
        const secondaryMedia = fields['Secondary Media'] || [];
        const tags = fields.Tags || [];
        
        return primaryMedium === 'Video' ||
               secondaryMedia.includes('Video') ||
               tags.includes('Video');
    }).sort(sortByDateDescending);
}

function filterCollaborativeProjects() {
    return window.projects.filter(project => {
        const fields = project.fields;
        const collaborationType = fields['Collaboration Type'] || '';
        
        return collaborationType === 'Collaborative' ||
               collaborationType === 'Commission' ||
               collaborationType === 'Residency';
    }).sort(sortByDateDescending);
}

function filterFeaturedProjects() {
    return window.projects.filter(project => {
        const fields = project.fields;
        const status = fields.Status || '';
        const tags = fields.Tags || [];
        
        return status === 'Featured' || tags.includes('Featured');
    }).sort(sortByDateDescending);
}

// Search functionality
function searchProjects(searchTerm) {
    if (!searchTerm || searchTerm.length < 2) {
        return window.projects || [];
    }
    
    const term = searchTerm.toLowerCase();
    
    return window.projects.filter(project => {
        const fields = project.fields;
        
        // Search in title
        if (fields.Title && fields.Title.toLowerCase().includes(term)) {
            return true;
        }
        
        // Search in description
        if (fields.Description && fields.Description.toLowerCase().includes(term)) {
            return true;
        }
        
        // Search in project statement
        if (fields['Project Statement'] && fields['Project Statement'].toLowerCase().includes(term)) {
            return true;
        }
        
        // Search in tags
        if (fields.Tags && fields.Tags.some(tag => tag.toLowerCase().includes(term))) {
            return true;
        }
        
        // Search in media classification
        if (fields['Primary Medium'] && fields['Primary Medium'].toLowerCase().includes(term)) {
            return true;
        }
        
        if (fields['Secondary Media'] && fields['Secondary Media'].some(medium => medium.toLowerCase().includes(term))) {
            return true;
        }
        
        // Search in technical stack
        if (fields['Technical Stack'] && fields['Technical Stack'].some(tech => tech.toLowerCase().includes(term))) {
            return true;
        }
        
        return false;
    }).sort(sortByRelevance(term));
}

// Multi-criteria filtering
function filterProjectsByCriteria(criteria) {
    return window.projects.filter(project => {
        const fields = project.fields;
        
        // Filter by medium
        if (criteria.medium) {
            const primaryMedium = fields['Primary Medium'] || fields.Medium || '';
            const secondaryMedia = fields['Secondary Media'] || [];
            
            if (primaryMedium !== criteria.medium && !secondaryMedia.includes(criteria.medium)) {
                return false;
            }
        }
        
        // Filter by interaction type
        if (criteria.interactionType && fields['Interaction Type'] !== criteria.interactionType) {
            return false;
        }
        
        // Filter by collaboration type
        if (criteria.collaborationType && fields['Collaboration Type'] !== criteria.collaborationType) {
            return false;
        }
        
        // Filter by status
        if (criteria.status && fields.Status !== criteria.status) {
            return false;
        }
        
        // Filter by year range
        if (criteria.yearFrom || criteria.yearTo) {
            const year = fields.Year || (fields.Date ? new Date(fields.Date).getFullYear() : null);
            if (!year) return false;
            
            if (criteria.yearFrom && year < criteria.yearFrom) return false;
            if (criteria.yearTo && year > criteria.yearTo) return false;
        }
        
        return true;
    });
}

// Sorting functions
function sortByDateDescending(a, b) {
    const dateA = new Date(a.fields.Date || a.fields.Year || 0);
    const dateB = new Date(b.fields.Date || b.fields.Year || 0);
    return dateB - dateA;
}

function sortByDateAscending(a, b) {
    const dateA = new Date(a.fields.Date || a.fields.Year || 0);
    const dateB = new Date(b.fields.Date || b.fields.Year || 0);
    return dateA - dateB;
}

function sortByRelevance(searchTerm) {
    return (a, b) => {
        const scoreA = getRelevanceScore(a.fields, searchTerm);
        const scoreB = getRelevanceScore(b.fields, searchTerm);
        return scoreB - scoreA;
    };
}

function getRelevanceScore(fields, term) {
    let score = 0;
    const lowerTerm = term.toLowerCase();
    
    // Title matches get highest score
    if (fields.Title && fields.Title.toLowerCase().includes(lowerTerm)) {
        score += 10;
    }
    
    // Primary medium matches
    if (fields['Primary Medium'] && fields['Primary Medium'].toLowerCase().includes(lowerTerm)) {
        score += 8;
    }
    
    // Tag matches
    if (fields.Tags && fields.Tags.some(tag => tag.toLowerCase().includes(lowerTerm))) {
        score += 6;
    }
    
    // Description matches
    if (fields.Description && fields.Description.toLowerCase().includes(lowerTerm)) {
        score += 4;
    }
    
    // Technical stack matches
    if (fields['Technical Stack'] && fields['Technical Stack'].some(tech => tech.toLowerCase().includes(lowerTerm))) {
        score += 3;
    }
    
    return score;
}

// Export enhanced filter function
window.enhancedFilterProjects = enhancedFilterProjects;
window.searchProjects = searchProjects;
window.filterProjectsByCriteria = filterProjectsByCriteria; 