// Homepage/Landing page functionality
async function renderHomepage() {
    const container = document.getElementById('projectsContainer');
    container.className = 'homepage';
    
    // Get featured projects or recent projects for homepage
    const featuredProjects = getFeaturedProjectsForHomepage();
    
    container.innerHTML = `
        <div class="hero-section">
            <div class="hero-content">
                <div class="hero-actions">
                    <a href="#portfolio" class="cta-button primary">Portfolio</a>
                    <a href="#about" class="cta-button secondary">About</a>
                </div>
            </div>
        </div>
    `;
}

function getFeaturedProjectsForHomepage() {
    if (!window.projects) return [];
    
    // Get featured projects or fall back to recent projects
    let featured = window.projects.filter(project => {
        const fields = project.fields;
        return fields.Status === 'Featured' || 
               (fields.Tags && fields.Tags.includes('Featured'));
    });
    
    // If no featured projects, get recent projects
    if (featured.length === 0) {
        featured = window.projects
            .sort((a, b) => {
                const dateA = new Date(a.fields.Date || a.fields.Year || 0);
                const dateB = new Date(b.fields.Date || b.fields.Year || 0);
                return dateB - dateA;
            })
            .slice(0, 6); // Show 6 most recent
    } else {
        featured = featured.slice(0, 6); // Limit to 6 featured
    }
    
    return featured;
}

function createFeaturedProjectCard(project) {
    const fields = project.fields;
    
    // Get project year
    const year = fields.Year || (fields.Date ? new Date(fields.Date).getFullYear() : '');
    
    // Get primary medium
    const medium = fields['Primary Medium'] || fields.Medium || '';
    
    // Handle image
    const imageHtml = fields['Main Image']?.[0] 
        ? `<img src="${fields['Main Image'][0].url}" alt="${fields.Title}" class="featured-image">`
        : `<div class="featured-image-placeholder">
            <div class="placeholder-content">
                <span class="placeholder-text">${fields.Title}</span>
            </div>
           </div>`;
    
    return `
        <div class="featured-card" data-project-id="${project.id}">
            ${imageHtml}
            <div class="featured-info">
                <h3 class="featured-title">${fields.Title || 'Untitled Project'}</h3>
                <div class="featured-meta">
                    ${year ? `<span class="featured-year">${year}</span>` : ''}
                    ${medium ? `<span class="featured-medium">${medium}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Setup homepage navigation
function setupHomepageNavigation() {
    // Handle homepage navigation clicks
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href="#portfolio"], a[href="#about"], a[href="#home"]');
        if (link) {
            event.preventDefault();
            const filter = link.getAttribute('href').slice(1);
            window.location.hash = filter;
            
            if (filter === 'home') {
                renderHomepage();
            } else if (filter === 'portfolio') {
                showPortfolio();
            } else if (filter === 'about') {
                loadAboutContent().then(content => {
                    renderAboutPage(content);
                });
            }
            
            updateActiveNavigation(filter);
        }
    });
}

function showPortfolio() {
    // Show all projects in list view only
    const container = document.getElementById('projectsContainer');
    container.className = 'projects-list';
    renderProjectsList(window.projects);
}

function updateActiveNavigation(activeFilter) {
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-filter') === activeFilter) {
            link.classList.add('active');
        }
    });
}

// Initialize homepage
document.addEventListener('DOMContentLoaded', () => {
    setupHomepageNavigation();
    
    // Handle featured card clicks
    document.addEventListener('click', (event) => {
        const featuredCard = event.target.closest('.featured-card');
        if (featuredCard) {
            const projectId = featuredCard.dataset.projectId;
            if (typeof showEnhancedProjectModal === 'function') {
                showEnhancedProjectModal(projectId);
            }
        }
    });
});

// Export functions
window.renderHomepage = renderHomepage;
window.showPortfolio = showPortfolio; 