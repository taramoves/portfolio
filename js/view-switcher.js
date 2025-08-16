document.addEventListener('DOMContentLoaded', () => {
    console.log('View switcher loaded');

    try {
        // Force list view only
        window.currentView = 'list';
        updateViewButtons();
        
        // View toggle buttons removed - list view only

        // Set up initial navigation with the current view
        setupNavigationWithViewSwitcher();
        
        // Wait for projects to be loaded, then apply initial filter
        const waitForProjects = () => {
            if (window.projects && window.projects.length > 0) {
                // Handle initial page load based on hash
                const initialFilter = window.location.hash.slice(1) || 'home';
                console.log('Applying initial filter:', initialFilter);
                console.log('🔍 Available projects for filtering:', window.projects.length);
                applyFilterWithCurrentView(initialFilter);
            } else {
                console.log('🔍 Waiting for projects to load...');
                setTimeout(waitForProjects, 200);
            }
        };
        
        setTimeout(waitForProjects, 100);
    } catch (error) {
        console.error('Error in view-switcher initialization:', error);
    }
});

function setView(viewType) {
    // Force list view only
    window.currentView = 'list';
    
    // Re-render the current category in list view
    const currentFilter = window.location.hash.slice(1) || 'all';
    applyFilterWithCurrentView(currentFilter);
}

function updateViewButtons() {
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    
    // Check if buttons exist before trying to modify them
    if (!gridViewBtn || !listViewBtn) {
        // No view buttons found - likely in list-only mode
        return;
    }
    
    if (window.currentView === 'grid') {
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    } else {
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    }
}

function applyFilterWithCurrentView(filter) {
    console.log('🔍 applyFilterWithCurrentView called with:', filter, 'view:', window.currentView);
    
    if (filter === 'home' || filter === '') {
        // Show homepage
        renderHomepage();
        updateActiveNavigation('home');
    } else if (filter === 'portfolio') {
        // Show all projects in portfolio
        showPortfolio();
        updateActiveNavigation('portfolio');
    } else if (filter === 'about') {
        // About page works the same in both views
        loadAboutContent().then(content => {
            renderAboutPage(content);
        });
        updateActiveNavigation('about');
    } else if (filter === 'new-media' && window.currentView === 'list') {
        // Special handling for new-media in list view
        renderNewMediaListView();
    } else if (filter === 'new-media' && window.currentView === 'grid') {
        // Use the existing grouped rendering for new-media in grid view
        const container = document.getElementById('projectsContainer');
        container.className = 'projects-grid';
        filterProjects(filter); // This will handle the special case internally
    } else {
        // For all other categories, use the appropriate view renderer
        const filteredProjects = filterProjects(filter);
        console.log('🔍 Filtered projects:', filteredProjects?.length || 0);
        
        if (window.currentView === 'list') {
            console.log('🔍 Rendering in list view');
            renderProjectsList(filteredProjects);
        } else {
            // Reset to projects-grid class and render in grid view
            console.log('🔍 Rendering in grid view');
            const container = document.getElementById('projectsContainer');
            container.className = 'projects-grid';
            renderProjects(filteredProjects);
        }
    }

    // After any view or filter change, we need to make sure the modal works
    // Note: we're not setting it up again, just ensuring any new elements
    // will be handled by the global click handler
}

// Override the setupNavigation function from grid.js to use our view switching logic
function setupNavigationWithViewSwitcher() {
    // Mark that we're setting up navigation to avoid duplication
    window.navigationSetUp = true;
    
    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = link.getAttribute('data-filter');
            window.location.hash = filter;
            
            // Use the view switcher to apply the filter with current view
            applyFilterWithCurrentView(filter);
            updateActiveNavigation(filter);
        });
    });
    
    console.log('Navigation set up by view-switcher.js');
}

function updateActiveNavigation(filter) {
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-filter') === filter) {
            link.classList.add('active');
        }
    });
} 