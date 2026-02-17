// Homepage/Landing page functionality
async function renderHomepage() {
    const container = document.getElementById('projectsContainer');
    container.className = 'homepage';
    
    // Get featured projects or recent projects for homepage
    const featuredProjects = getFeaturedProjectsForHomepage();
    
    // Hide main header on homepage
    document.body.classList.remove('has-header');
    
    container.innerHTML = `
        <div class="hero-section">
            <div class="homepage-header">
                <h1 class="homepage-title">TARAMOVES</h1>
                <nav class="homepage-nav">
                    <a href="#portfolio" class="homepage-link" data-button-index="0">art</a>
                    <a href="#work" class="homepage-link" data-button-index="1">work</a>
                    <a href="#about" class="homepage-link" data-button-index="2">about</a>
                    <a href="./everythingunderthedome/" class="homepage-link" data-bypass>blog</a>
                </nav>
            </div>
        </div>
    `;
    
    // Initialize interactive background
    if (window.interactiveBackground) {
        window.interactiveBackground.destroy();
    }
    window.interactiveBackground = new InteractiveBackground();
    window.interactiveBackground.init(container);
    
    // Setup button hover effects on point cloud
    setupButtonPointCloudInteraction();
}

function setupButtonPointCloudInteraction() {
    // No longer needed - removed mouse interaction
}

// Work page with video background
async function renderWorkPage() {
    console.log('🔍 renderWorkPage called');
    
    // Show main header on non-homepage pages
    document.body.classList.add('has-header');
    
    const container = document.getElementById('projectsContainer');
    container.className = 'work-page';
    
    // Destroy interactive background if it exists
    if (window.interactiveBackground) {
        window.interactiveBackground.destroy();
        window.interactiveBackground = null;
    }
    
    // Check if projects are loaded
    if (!window.projects || window.projects.length === 0) {
        console.log('⚠️ Projects not loaded yet, waiting...');
        container.innerHTML = `
            <div class="work-hero-section">
                <div class="hero-video-background">
                    <iframe 
                        src="https://www.youtube.com/embed/VMQPWjRT9U4?autoplay=1&mute=1&controls=0&loop=1&playlist=VMQPWjRT9U4&modestbranding=1&playsinline=1&rel=0&showinfo=0" 
                        frameborder="0" 
                        allow="autoplay; encrypted-media" 
                        allowfullscreen>
                    </iframe>
                </div>
                <div class="work-content">
                    <h1 class="work-title">Work</h1>
                    <p class="work-description">SELECTED PROFESSIONAL PROJECTS AND COLLABORATIONS</p>
                    <div class="scroll-indicator">
                        <span>Scroll</span>
                        <div class="arrow-down">↓</div>
                    </div>
                </div>
            </div>
            <div class="work-projects-section" id="work-projects">
                <p class="loading">Loading projects...</p>
            </div>
        `;
        // Wait for projects and try again
        setTimeout(() => renderWorkPage(), 500);
        return;
    }
    
    // Get work projects - filter by Work tag AND Display field
    console.log('🔍 Filtering work projects from:', window.projects.length, 'total projects');
    
    // First, let's see what projects have the Work or Client Work tag
    const projectsWithWorkTag = window.projects.filter(p => {
        const hasWorkTag = Array.isArray(p.fields?.Tags) && (p.fields.Tags.includes('Work') || p.fields.Tags.includes('Client Work'));
        if (hasWorkTag) {
            console.log('🔍 Project with Work/Client Work tag:', p.fields.Title, 'Display:', p.fields.Display, 'Tags:', p.fields.Tags);
        }
        return hasWorkTag;
    });
    console.log('🔍 Projects with Work/Client Work tag:', projectsWithWorkTag.length);
    
    const workProjects = projectsWithWorkTag.filter(project => {
        const fields = project.fields;
        
        // Check Display field
        const isSample = project.id && project.id.startsWith('sample');
        if (isSample) {
            console.log('🔍 Showing sample project:', fields.Title);
            return true; // Show sample projects
        }
        
        const hasDisplayField = Object.prototype.hasOwnProperty.call(fields, 'Display');
        const isMarkedForDisplay = fields.Display === true || fields.Display === 'true' || fields.Display === 1;
        
        if (hasDisplayField) {
            if (isMarkedForDisplay) {
                console.log('✅ Including work project (Display checked):', fields.Title);
            } else {
                console.log('❌ Skipping work project (Display not checked):', fields.Title);
            }
            return isMarkedForDisplay;
        } else {
            // If no Display field, show it (backward compatibility)
            console.log('✅ Including work project (no Display field):', fields.Title);
            return true;
        }
    });
    console.log('🔍 Final count:', workProjects.length, 'work projects to display');
    
    container.innerHTML = `
        <div class="work-hero-section">
            <div class="hero-video-background">
                <iframe 
                    src="https://www.youtube.com/embed/VMQPWjRT9U4?autoplay=1&mute=1&controls=0&loop=1&playlist=VMQPWjRT9U4&modestbranding=1&playsinline=1&rel=0&showinfo=0" 
                    frameborder="0" 
                    allow="autoplay; encrypted-media" 
                    allowfullscreen>
                </iframe>
            </div>
            <div class="work-content">
                <h1 class="work-title">Work</h1>
                <p class="work-description">SELECTED PROFESSIONAL PROJECTS AND COLLABORATIONS</p>
                <div class="scroll-indicator">
                    <span>Scroll</span>
                    <div class="arrow-down">↓</div>
                </div>
            </div>
        </div>
        <div class="work-projects-section" id="work-projects">
        </div>
    `;
    
    // Render work projects below the video
    const workProjectsContainer = container.querySelector('#work-projects');
    
    if (typeof renderProjectsSimple === 'function') {
        renderProjectsSimple(workProjects, workProjectsContainer);
    } else {
        // Fallback to manual rendering if renderProjectsSimple not loaded
        console.warn('renderProjectsSimple not available, using fallback');
        if (workProjects.length === 0) {
            workProjectsContainer.innerHTML = '<p class="no-projects">No work projects available.</p>';
        }
    }
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
        const link = event.target.closest('a[href="#portfolio"], a[href="#about"], a[href="#home"], a[href="#work"]');
        if (link) {
            event.preventDefault();
            const filter = link.getAttribute('href').slice(1);
            window.location.hash = filter;
            
            if (filter === 'home') {
                renderHomepage();
            } else if (filter === 'portfolio') {
                showPortfolio();
            } else if (filter === 'work') {
                renderWorkPage();
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
    console.log('🔍 showPortfolio called');
    
    // Show main header on non-homepage pages
    document.body.classList.add('has-header');
    
    // Destroy interactive background if it exists
    if (window.interactiveBackground) {
        window.interactiveBackground.destroy();
        window.interactiveBackground = null;
    }
    
    // Show projects tagged as Portfolio AND marked for display
    const container = document.getElementById('projectsContainer');
    container.className = 'projects-list';
    
    // Filter by Portfolio tag AND Display field
    console.log('🔍 Total projects available:', (window.projects || []).length);
    const portfolioProjects = (window.projects || []).filter(project => {
        const fields = project.fields;
        const hasPortfolioTag = Array.isArray(fields?.Tags) && fields.Tags.includes('Portfolio');
        
        if (!hasPortfolioTag) return false;
        
        // Check Display field
        const isSample = project.id && project.id.startsWith('sample');
        if (isSample) return true;
        
        const hasDisplayField = Object.prototype.hasOwnProperty.call(fields, 'Display');
        const isMarkedForDisplay = fields.Display === true || fields.Display === 'true' || fields.Display === 1;
        
        if (hasDisplayField) {
            if (isMarkedForDisplay) {
                console.log('✅ Including portfolio project:', fields.Title);
            } else {
                console.log('❌ Skipping portfolio project (Display not checked):', fields.Title);
            }
            return isMarkedForDisplay;
        } else {
            // If no Display field, show it (backward compatibility)
            console.log('✅ Including portfolio project (no Display field):', fields.Title);
            return true;
        }
    });
    
    console.log('🔍 Portfolio projects after filtering:', portfolioProjects.length);
    
    // Use simple renderer to avoid double-filtering
    container.innerHTML = ''; // Clear container
    if (typeof renderProjectsSimple === 'function') {
        renderProjectsSimple(portfolioProjects, container);
    } else {
        // Fallback to old method
        renderProjectsList(portfolioProjects);
    }
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
window.renderWorkPage = renderWorkPage; 