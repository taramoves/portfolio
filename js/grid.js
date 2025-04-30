document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Add a timeout to ensure we show something if Airtable doesn't respond
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timed out')), 10000)
        );

        try {
            // Race between Airtable request and timeout
            const data = await Promise.race([
                fetchAirtableData({
                    table: AIRTABLE_CONFIG.TABLE_NAME,
                    view: AIRTABLE_CONFIG.VIEW_NAME
                }),
                timeoutPromise
            ]);
            
            // Store projects globally
            window.projects = data.records;
            
            // Debug output
            console.log('Projects loaded:', window.projects.length);

            // Check if we actually have data
            if (!window.projects || window.projects.length === 0) {
                throw new Error('No projects found in Airtable');
            }
        } catch (airtableError) {
            console.error('Airtable error:', airtableError);
            
            // Fallback to sample data
            window.projects = [{
                id: 'sample1',
                fields: {
                    Title: 'Sample Project',
                    Description: 'This is a sample project displayed when Airtable connection fails.',
                    Year: '2023',
                    Medium: 'Digital',
                    Tags: ['Sample'],
                    'Main Image': [{
                        url: 'https://placehold.co/600x400/000000/FFFFFF/png?text=Sample+Project'
                    }]
                }
            }];
            
            document.getElementById('projectsContainer').innerHTML = `
                <div style="padding: 20px; background: #fff3cd; color: #664d03; border: 1px solid #ffecb5; margin-bottom: 20px;">
                    <p><strong>Note:</strong> Using sample data because we couldn't connect to Airtable. Please check your API credentials.</p>
                </div>
            `;
            
            console.log('Using sample project data instead');
        }
        
        // Initialize modal
        setupModal();
        
        // Get initial filter from URL hash
        const initialFilter = window.location.hash.slice(1) || 'all';
        
        // Apply initial view and filter
        if (typeof applyFilterWithCurrentView === 'function') {
            // View switcher handles this
            applyFilterWithCurrentView(initialFilter);
        } else {
            // Fallback if view-switcher isn't loaded
            renderProjects(filterProjects(initialFilter));
            setupNavigation();
        }
    } catch (error) {
        console.error('Failed to load projects:', error);
        document.getElementById('projectsContainer').innerHTML = 
            '<p>Error loading projects. Please try again later.</p>';
    }
});

function filterProjects(filter) {
    const today = new Date();
    
    switch(filter) {
        case 'new-media':
            const newMediaProjects = window.projects.filter(project => {
                const tags = project.fields.Tags || [];
                return tags.includes('Portfolio') && 
                    (tags.includes('Video') || tags.includes('Installation') || tags.includes('Performance'));
            });

            // Group projects by type
            const groupedProjects = {
                video: newMediaProjects.filter(p => p.fields.Tags?.includes('Video')),
                performance: newMediaProjects.filter(p => p.fields.Tags?.includes('Performance')),
                installation: newMediaProjects.filter(p => p.fields.Tags?.includes('Installation'))
            };

            // Create section headers and combine all projects
            const container = document.getElementById('projectsContainer');
            container.innerHTML = ''; // Clear existing content

            // Add Video section
            if (groupedProjects.video.length > 0) {
                const videoHeader = document.createElement('h2');
                videoHeader.className = 'section-header';
                videoHeader.textContent = 'Video';
                container.appendChild(videoHeader);
                renderProjectGroup(groupedProjects.video);
            }

            // Add Performance section
            if (groupedProjects.performance.length > 0) {
                const performanceHeader = document.createElement('h2');
                performanceHeader.className = 'section-header';
                performanceHeader.textContent = 'Performance';
                container.appendChild(performanceHeader);
                renderProjectGroup(groupedProjects.performance);
            }

            // Add Installation section
            if (groupedProjects.installation.length > 0) {
                const installationHeader = document.createElement('h2');
                installationHeader.className = 'section-header';
                installationHeader.textContent = 'Installation';
                container.appendChild(installationHeader);
                renderProjectGroup(groupedProjects.installation);
            }

            return null; // Return null since we're handling rendering directly
        case 'design':
            return window.projects.filter(project => {
                const tags = project.fields.Tags || [];
                return tags.includes('Client Work');
            }).sort((a, b) => {
                const dateA = new Date(a.fields.Year || 0);
                const dateB = new Date(b.fields.Year || 0);
                return dateB - dateA;
            });
        case 'workshops':
            return window.projects.filter(project => {
                const tags = project.fields.Tags || [];
                return tags.includes('Workshops');
            });
        case 'writing':
            return window.projects.filter(project => {
                const tags = project.fields.Tags || [];
                return tags.includes('Writing');
            });
        case 'upcoming':
            return window.projects.filter(project => {
                const date = new Date(project.fields.Date || 0);
                return date > today;
            }).sort((a, b) => {
                const dateA = new Date(a.fields.Date || 0);
                const dateB = new Date(b.fields.Date || 0);
                return dateA - dateB;
            });
        case 'about':
            return []; // Handle about page separately
        default:
            return window.projects;
    }
}

function setupNavigation() {
    // Check if the navigation has already been set up by view-switcher.js
    if (window.navigationSetUp) {
        console.log('Navigation already set up by view-switcher');
        return;
    }

    const navLinks = document.querySelectorAll('.main-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = link.getAttribute('data-filter');
            window.location.hash = filter;
            renderProjects(filterProjects(filter));
        });
    });

    console.log('Navigation set up by grid.js');
}

function renderProjectGroup(projects) {
    const container = document.getElementById('projectsContainer');
    const groupContainer = document.createElement('div');
    groupContainer.className = 'project-group';
    
    projects.forEach(project => {
        const fields = project.fields;
        if (!fields['Main Image']?.[0]) return;
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.dataset.projectId = project.id;
        
        // Safely handle tags whether they exist or not
        const tagsHTML = fields.Tags && Array.isArray(fields.Tags) 
            ? fields.Tags.map(tag => `<span class="tag">${tag}</span>`).join('')
            : '';

        // Format subheading information
        const subheadingInfo = [];
        if (fields.Year) subheadingInfo.push(fields.Year);
        if (fields.Medium) subheadingInfo.push(fields.Medium);
        if (fields.Dimensions) subheadingInfo.push(fields.Dimensions);
        const subheadingText = subheadingInfo.join(' | ');
        
        projectCard.innerHTML = `
            <img src="${fields['Main Image'][0].url}" alt="${fields.Title}" class="project-image">
            <div class="project-info">
                <h3>${fields.Title || 'Untitled Project'}</h3>
                ${subheadingText ? `<div class="subheading">${subheadingText}</div>` : ''}
                <p>${fields.Description || ''}</p>
                ${tagsHTML ? `<div class="project-tags">${tagsHTML}</div>` : ''}
            </div>
        `;
        
        groupContainer.appendChild(projectCard);
    });
    
    container.appendChild(groupContainer);
}

function renderProjects(projects) {
    const container = document.getElementById('projectsContainer');
    
    if (projects === null) {
        return; // Skip rendering if it's already handled (like in new-media case)
    }
    
    container.innerHTML = ''; // Clear existing content
    
    if (projects.length === 0) {
        container.innerHTML = '<p>No projects found in this category.</p>';
        return;
    }
    
    projects.forEach(project => {
        const fields = project.fields;
        if (!fields['Main Image']?.[0]) return;
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.dataset.projectId = project.id;
        
        // Safely handle tags whether they exist or not
        const tagsHTML = fields.Tags && Array.isArray(fields.Tags) 
            ? fields.Tags.map(tag => `<span class="tag">${tag}</span>`).join('')
            : '';

        // Format date information
        let dateDisplay = '';
        if (fields.Date) {
            const projectDate = new Date(fields.Date);
            const today = new Date();
            
            if (projectDate > today) {
                // Future date - show full date
                dateDisplay = projectDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            } else {
                // Past date - show just the year
                dateDisplay = projectDate.getFullYear().toString();
            }
        } else if (fields.Year) {
            // If no specific date but a year is provided
            dateDisplay = fields.Year;
        }

        // Format subheading information
        const subheadingInfo = [];
        if (dateDisplay) subheadingInfo.push(dateDisplay);
        if (fields.Medium) subheadingInfo.push(fields.Medium);
        if (fields.Dimensions) subheadingInfo.push(fields.Dimensions);
        const subheadingText = subheadingInfo.join(' | ');
        
        projectCard.innerHTML = `
            <img src="${fields['Main Image'][0].url}" alt="${fields.Title}" class="project-image">
            <div class="project-info">
                <h3>${fields.Title || 'Untitled Project'}</h3>
                ${subheadingText ? `<div class="subheading">${subheadingText}</div>` : ''}
                <p>${fields.Description || ''}</p>
                ${tagsHTML ? `<div class="project-tags">${tagsHTML}</div>` : ''}
            </div>
        `;
        
        container.appendChild(projectCard);
    });
}

function setupModal() {
    const modal = document.getElementById('projectModal');
    const closeButton = modal.querySelector('.close-button');

    // Close modal when clicking the close button
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside the content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Add global click handler for project cards
    document.addEventListener('click', (event) => {
        // Find the clicked project card or list item
        const projectElement = event.target.closest('.project-card, .project-list-item');
        
        if (projectElement) {
            const projectId = projectElement.dataset.projectId;
            
            // Find the matching project data
            const projectData = window.projects.find(p => p.id === projectId);
            
            if (projectData) {
                const fields = projectData.fields;
                
                // Format date information for the modal
                let dateDisplay = '';
                if (fields.Date) {
                    const projectDate = new Date(fields.Date);
                    const today = new Date();
                    
                    if (projectDate > today) {
                        // Future date - show full date
                        dateDisplay = projectDate.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        });
                    } else {
                        // Past date - show just the year
                        dateDisplay = projectDate.getFullYear().toString();
                    }
                } else if (fields.Year) {
                    // If no specific date but a year is provided
                    dateDisplay = fields.Year;
                }
                
                // Format subheading information
                const subheadingInfo = [];
                if (dateDisplay) subheadingInfo.push(dateDisplay);
                if (fields.Medium) subheadingInfo.push(fields.Medium);
                if (fields.Dimensions) subheadingInfo.push(fields.Dimensions);
                const subheadingText = subheadingInfo.join(' | ');
                
                // Find the info section (different in grid vs list)
                const infoElement = projectElement.querySelector('.project-info, .project-list-info');
                const imageElement = projectElement.querySelector('.project-image, .project-list-image');
                
                if (infoElement && imageElement) {
                    // Update modal content
                    modal.querySelector('.modal-image').src = imageElement.src;
                    modal.querySelector('.modal-title').textContent = fields.Title || 'Untitled Project';
                    modal.querySelector('.modal-subheading').textContent = subheadingText;
                    modal.querySelector('.modal-description').textContent = fields.Description || '';
                    
                    // Handle tags - they could be in different containers
                    const tagsHTML = fields.Tags && Array.isArray(fields.Tags) 
                        ? fields.Tags.map(tag => `<span class="tag">${tag}</span>`).join('')
                        : '';
                    modal.querySelector('.modal-tags').innerHTML = tagsHTML;
                    
                    // Show modal
                    modal.style.display = 'block';
                }
            }
        }
    });
}