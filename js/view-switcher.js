document.addEventListener('DOMContentLoaded', () => {
    console.log('View switcher loaded');

    try {
        // Initialize view preference from localStorage or default to grid
        window.currentView = localStorage.getItem('viewPreference') || 'grid';
        updateViewButtons();
        
        // Set up view toggle buttons
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');
        
        if (gridViewBtn && listViewBtn) {
            gridViewBtn.addEventListener('click', () => {
                setView('grid');
            });
            
            listViewBtn.addEventListener('click', () => {
                setView('list');
            });
        } else {
            console.error('View toggle buttons not found');
        }

        // Set up initial navigation with the current view
        setupNavigationWithViewSwitcher();
        
        // Wait a moment to make sure grid.js has loaded
        setTimeout(() => {
            // Handle initial page load based on hash
            const initialFilter = window.location.hash.slice(1) || 'all';
            
            // Make sure window.projects exists before using applyFilterWithCurrentView
            if (window.projects) {
                console.log('Applying initial filter:', initialFilter);
                applyFilterWithCurrentView(initialFilter);
            } else {
                console.warn('Projects data not available yet');
            }
        }, 500);
    } catch (error) {
        console.error('Error in view-switcher initialization:', error);
    }
});

function setView(viewType) {
    window.currentView = viewType;
    localStorage.setItem('viewPreference', viewType);
    updateViewButtons();
    
    // Re-render the current category in the new view
    const currentFilter = window.location.hash.slice(1) || 'all';
    applyFilterWithCurrentView(currentFilter);
}

function updateViewButtons() {
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    
    if (window.currentView === 'grid') {
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    } else {
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    }
}

function applyFilterWithCurrentView(filter) {
    if (filter === 'new-media' && window.currentView === 'list') {
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
        
        if (window.currentView === 'list') {
            renderProjectsList(filteredProjects);
        } else {
            // Reset to projects-grid class and render in grid view
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
        });
    });
    
    console.log('Navigation set up by view-switcher.js');
} 