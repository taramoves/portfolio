// Search functionality disabled - list view only portfolio
document.addEventListener('DOMContentLoaded', () => {
    // Search functionality removed
    console.log('Search functionality disabled - using list view only');
});
    
    function handleSearchInput(event) {
        const searchTerm = event.target.value.trim();
        
        // Show/hide clear button
        searchClear.style.display = searchTerm ? 'flex' : 'none';
        
        // Debounce search to avoid too many API calls
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(searchTerm);
        }, 300);
    }
    
    function handleSearchKeydown(event) {
        if (event.key === 'Escape') {
            clearSearch();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            clearTimeout(searchTimeout);
            performSearch(event.target.value.trim());
        }
    }
    
    function clearSearch() {
        searchInput.value = '';
        searchClear.style.display = 'none';
        
        // Reset to show all projects
        if (window.projects) {
            const currentView = window.currentView || 'grid';
            if (currentView === 'list') {
                renderProjectsList(window.projects);
            } else {
                renderProjects(window.projects);
            }
        }
        
        // Reset URL hash
        window.location.hash = 'all';
        updateActiveNavLink('all');
    }
    
    function performSearch(searchTerm) {
        if (!searchTerm) {
            clearSearch();
            return;
        }
        
        if (!window.projects) {
            console.warn('Projects not loaded yet');
            return;
        }
        
        // Use enhanced search if available
        let results;
        if (typeof searchProjects === 'function') {
            results = searchProjects(searchTerm);
        } else {
            // Fallback to basic search
            results = basicSearch(searchTerm);
        }
        
        // Render results in current view
        const currentView = window.currentView || 'grid';
        const container = document.getElementById('projectsContainer');
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="search-no-results">
                    <p>No projects found for "${searchTerm}"</p>
                    <button onclick="clearSearch()" class="search-clear-btn">Show all projects</button>
                </div>
            `;
            container.className = 'search-results';
        } else {
            if (currentView === 'list') {
                container.className = 'projects-list';
                renderProjectsList(results);
            } else {
                container.className = 'projects-grid';
                renderProjects(results);
            }
        }
        
        // Update URL and navigation
        window.location.hash = `search:${encodeURIComponent(searchTerm)}`;
        updateActiveNavLink(null); // Clear active nav since this is a search
    }
    
    function basicSearch(searchTerm) {
        const term = searchTerm.toLowerCase();
        return window.projects.filter(project => {
            const fields = project.fields;
            return (fields.Title && fields.Title.toLowerCase().includes(term)) ||
                   (fields.Description && fields.Description.toLowerCase().includes(term)) ||
                   (fields.Tags && fields.Tags.some(tag => tag.toLowerCase().includes(term)));
        });
    }
    
    function updateActiveNavLink(filter) {
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.classList.remove('active');
            if (filter && link.getAttribute('data-filter') === filter) {
                link.classList.add('active');
            }
        });
    }
    
    // Handle URL hash on page load
    function handleInitialSearch() {
        const hash = window.location.hash.slice(1);
        if (hash.startsWith('search:')) {
            const searchTerm = decodeURIComponent(hash.replace('search:', ''));
            searchInput.value = searchTerm;
            searchClear.style.display = 'flex';
            performSearch(searchTerm);
        }
    }
    
    // Wait for projects to load, then handle initial search
    const checkForProjects = setInterval(() => {
        if (window.projects) {
            clearInterval(checkForProjects);
            handleInitialSearch();
        }
    }, 100);
    
    // Export functions for global use
    window.clearSearch = clearSearch;
    window.performSearch = performSearch;
}); 