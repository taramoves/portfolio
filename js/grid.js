// Format duration from seconds to "X Minutes" format
function formatDuration(duration) {
    // Convert string to number if it's a string number
    let totalSeconds;
    if (typeof duration === 'string' && /^\d+$/.test(duration)) {
        totalSeconds = parseInt(duration);
    } else if (typeof duration === 'number') {
        totalSeconds = Math.floor(duration);
    } else if (typeof duration === 'string') {
        // If it's already formatted, return as is
        return duration;
    } else {
        return duration;
    }
    
    const minutes = Math.floor(totalSeconds / 60);
    
    if (minutes >= 1) {
        return minutes === 1 ? `${minutes} Minute` : `${minutes} Minutes`;
    } else {
        // For durations under a minute, show seconds
        return totalSeconds === 1 ? `${totalSeconds} Second` : `${totalSeconds} Seconds`;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Add a timeout to ensure we show something if Airtable doesn't respond
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timed out')), 10000)
        );

        try {
            // Race between Airtable request and timeout
            const data = await Promise.race([
                fetchProjects(),
                timeoutPromise
            ]);
            
            // Store projects globally
            window.projects = data.records;
            
            // Debug output
            console.log('Projects loaded:', window.projects.length);
            console.log('🔍 First project fields:', window.projects[0]?.fields);
            console.log('🔍 Current URL hash:', window.location.hash);

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
        
        // Note: view-switcher.js handles initial page rendering
        // We just store projects here and let view-switcher determine what to show
        console.log('✅ Projects loaded and ready for view-switcher.js');
    } catch (error) {
        console.error('Failed to load projects:', error);
        document.getElementById('projectsContainer').innerHTML = 
            '<p>Error loading projects. Please try again later.</p>';
    }
});

function filterProjects(filter) {
    // Use enhanced filtering if available, fallback to legacy
    if (typeof enhancedFilterProjects === 'function') {
        return enhancedFilterProjects(filter);
    }
    
    // Legacy filtering function (keeping for compatibility)
    return legacyFilterProjects(filter);
}

function legacyFilterProjects(filter) {
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
            }).sort((a, b) => {
                const dateA = new Date(a.fields.Date || a.fields.Year || 0);
                const dateB = new Date(b.fields.Date || b.fields.Year || 0);
                return dateB - dateA;
            });
        case 'writing':
            return window.projects.filter(project => {
                const tags = project.fields.Tags || [];
                return tags.includes('Writing');
            }).sort((a, b) => {
                const dateA = new Date(a.fields.Date || a.fields.Year || 0);
                const dateB = new Date(b.fields.Date || b.fields.Year || 0);
                return dateB - dateA;
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
            // Load and render about page content
            loadAboutContent().then(content => {
                renderAboutPage(content);
            });
            return null; // Return null since we're handling rendering directly
        default:
            return window.projects.sort((a, b) => {
                const dateA = new Date(a.fields.Date || a.fields.Year || 0);
                const dateB = new Date(b.fields.Date || b.fields.Year || 0);
                return dateB - dateA;
            });
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
        
        // Skip projects without titles, but allow projects without images
        if (!fields.Title) {
            console.log('🔍 Skipping project without title:', project.id);
            return;
        }
        
        // Log if project has no image (but still render it)
        if (!fields['Main Image']?.[0]) {
            console.log('🔍 Project has no main image:', fields.Title);
        }
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.dataset.projectId = project.id;
        
        // Enhanced tag handling - supports both legacy Tags and new media classification
        let allTags = [];
        
        // Legacy tags
        if (fields.Tags && Array.isArray(fields.Tags)) {
            allTags = [...fields.Tags];
        }
        
        // Add new classification fields if available
        if (fields['Primary Medium']) allTags.push(fields['Primary Medium']);
        if (fields['Secondary Media'] && Array.isArray(fields['Secondary Media'])) {
            allTags = [...allTags, ...fields['Secondary Media']];
        }
        if (fields['Interaction Type']) allTags.push(fields['Interaction Type']);
        
        // Remove duplicates and create HTML
        const uniqueTags = [...new Set(allTags)];
        const tagsHTML = uniqueTags.length > 0 
            ? uniqueTags.map(tag => `<span class="tag">${tag}</span>`).join('')
            : '';

        // Format subheading information - enhanced for new database structure
        const subheadingInfo = [];
        
        // Use enhanced fields if available, fallback to legacy fields
        const year = fields.Year || (fields.Date ? new Date(fields.Date).getFullYear() : '');
        const medium = fields['Primary Medium'] || fields.Medium || '';
        const dimensions = fields.Dimensions || fields['Space Requirements'] || '';
        
        if (year) subheadingInfo.push(year);
        if (medium) subheadingInfo.push(medium);
        if (fields.Duration) {
            const formattedDuration = formatDuration(fields.Duration);
            subheadingInfo.push(formattedDuration);
        }
        if (dimensions) subheadingInfo.push(dimensions);
        
        const subheadingText = subheadingInfo.join(' | ');
        
        // Project URL removed from portfolio display
        let projectUrlHtml = '';
        
        // Enhanced description - use Project Statement if available, fallback to Description
        const description = fields['Project Statement'] || fields.Description || '';
        const shortDescription = fields.Description || description;
        
        // Duration is now included in subheading, so no separate duration HTML needed
        let durationHtml = '';
        
        projectCard.innerHTML = `
            <img src="${fields['Main Image'][0].url}" alt="${fields.Title}" class="project-image">
            <div class="project-info">
                <h3>${fields.Title || 'Untitled Project'}</h3>
                ${subheadingText ? `<div class="subheading">${subheadingText}</div>` : ''}
                <p>${shortDescription}</p>
                ${durationHtml}
                ${projectUrlHtml}
                ${tagsHTML ? `<div class="project-tags">${tagsHTML}</div>` : ''}
            </div>
        `;
        
        groupContainer.appendChild(projectCard);
    });
    
    container.appendChild(groupContainer);
}

function renderProjects(projects) {
    console.log('🔍 renderProjects called with:', projects?.length || 0, 'projects');
    const container = document.getElementById('projectsContainer');
    
    if (!container) {
        console.error('🔍 Container not found!');
        return;
    }
    
    if (projects === null) {
        console.log('🔍 Projects is null, skipping render');
        return; // Skip rendering if it's already handled (like in new-media case)
    }
    
    container.innerHTML = ''; // Clear existing content
    console.log('🔍 Container cleared, about to render', projects.length, 'projects');
    
    if (!Array.isArray(projects) || projects.length === 0) {
        container.innerHTML = '<p>No projects found in this category.</p>';
        console.log('🔍 No projects to display');
        return;
    }
    
    // Sort projects in reverse chronological order (newest first)
    const sortedProjects = [...projects].sort((a, b) => {
        const dateA = new Date(a.fields.Date || a.fields.Year || 0);
        const dateB = new Date(b.fields.Date || b.fields.Year || 0);
        return dateB - dateA;
    });
    
    sortedProjects.forEach(project => {
        const fields = project.fields;
        
        // Skip projects without titles, but allow projects without images
        if (!fields.Title) {
            console.log('🔍 Skipping project without title:', project.id);
            return;
        }
        
        // For real data, only show projects marked Display or Portfolio-tagged
        // Always show sample fallback data (no Display field)
        const isSample = project.id && project.id.startsWith('sample');
        if (!isSample) {
            const hasDisplayField = Object.prototype.hasOwnProperty.call(fields, 'Display');
            const isMarkedForDisplay = fields.Display === true || fields.Display === 'true' || fields.Display === 1;
            const isPortfolioTagged = Array.isArray(fields.Tags) && fields.Tags.includes('Portfolio');
            if (hasDisplayField) {
                if (!isMarkedForDisplay && !isPortfolioTagged) {
                    console.log('🔍 Skipping project (Display not checked and not Portfolio tag):', fields.Title);
                    return;
                }
            } else if (!isPortfolioTagged) {
                console.log('🔍 Skipping project (no Display field and not Portfolio tag):', fields.Title);
                return;
            }
        }
        
        // Log if project has no image (but still render it)
        if (!fields['Main Image']?.[0]) {
            console.log('🔍 Project has no main image:', fields.Title);
        }
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.dataset.projectId = project.id;
        
        // Enhanced tag handling - supports both legacy Tags and new media classification
        let allTags = [];
        
        // Legacy tags
        if (fields.Tags && Array.isArray(fields.Tags)) {
            allTags = [...fields.Tags];
        }
        
        // Add new classification fields if available
        if (fields['Primary Medium']) allTags.push(fields['Primary Medium']);
        if (fields['Secondary Media'] && Array.isArray(fields['Secondary Media'])) {
            allTags = [...allTags, ...fields['Secondary Media']];
        }
        if (fields['Interaction Type']) allTags.push(fields['Interaction Type']);
        
        // Remove duplicates and create HTML
        const uniqueTags = [...new Set(allTags)];
        const tagsHTML = uniqueTags.length > 0 
            ? uniqueTags.map(tag => `<span class="tag">${tag}</span>`).join('')
            : '';

        // Format date information - show only year
        let dateDisplay = '';
        if (fields.Date) {
            const projectDate = new Date(fields.Date);
            // Always show just the year, even for future dates
            dateDisplay = projectDate.getFullYear().toString();
        } else if (fields.Year) {
            // If no specific date but a year is provided
            dateDisplay = fields.Year;
        }

        // Enhanced subheading information
        const subheadingInfo = [];
        
        // Use enhanced fields if available, fallback to legacy fields
        const medium = fields['Primary Medium'] || fields.Medium || '';
        const dimensions = fields.Dimensions || fields['Space Requirements'] || '';
        
        if (dateDisplay) subheadingInfo.push(dateDisplay);
        if (medium) subheadingInfo.push(medium);
        if (dimensions) subheadingInfo.push(dimensions);
        
        const subheadingText = subheadingInfo.join(' | ');
        
        // Project URL removed from portfolio display
        let projectUrlHtml = '';
        
        // Enhanced description handling
        const description = fields['Project Statement'] || fields.Description || '';
        const shortDescription = fields.Description || description;
        
        // Duration is now included in subheading, so no separate duration HTML needed
        let durationHtml = '';
        
        // Handle missing images gracefully
        const imageHtml = fields['Main Image']?.[0] 
            ? `<img src="${fields['Main Image'][0].url}" alt="${fields.Title}" class="project-image">`
            : `<div class="project-image-placeholder">
                <div class="placeholder-content">
                    <span class="placeholder-text">${fields.Title}</span>
                    <small>No image</small>
                </div>
               </div>`;
        
        projectCard.innerHTML = `
            ${imageHtml}
            <div class="project-info">
                <h3>${fields.Title || 'Untitled Project'}</h3>
                ${subheadingText ? `<div class="subheading">${subheadingText}</div>` : ''}
                <p>${shortDescription}</p>
                ${shortDescription ? '<div class="read-more"><em>Read More</em></div>' : ''}
                ${durationHtml}
                ${projectUrlHtml}
                ${tagsHTML ? `<div class="project-tags">${tagsHTML}</div>` : ''}
            </div>
        `;
        
        container.appendChild(projectCard);
    });
    
    console.log('🔍 Finished rendering', sortedProjects.length, 'projects to container');
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
            
            // Try enhanced modal first, fallback to basic if needed
            if (typeof showEnhancedProjectModal === 'function') {
                showEnhancedProjectModal(projectId);
                return;
            }
            
            // Fallback to basic modal functionality
            const projectData = window.projects.find(p => p.id === projectId);
            
            if (projectData) {
                const fields = projectData.fields;
                
                // Format date information for the modal - show only year
                let dateDisplay = '';
                if (fields.Date) {
                    const projectDate = new Date(fields.Date);
                    // Always show just the year, even for future dates
                    dateDisplay = projectDate.getFullYear().toString();
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
                    
                    // Handle link field if available
                    const linkContainer = modal.querySelector('.modal-link');
                    linkContainer.innerHTML = '';
                    if (fields['Project URL']) {
                        const link = document.createElement('a');
                        link.href = fields['Project URL'];
                        link.textContent = 'Link';
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        linkContainer.appendChild(link);
                    } else if (fields.Link) {
                        // For backward compatibility
                        const link = document.createElement('a');
                        link.href = fields.Link;
                        link.textContent = fields.LinkText || 'View Project';
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        linkContainer.appendChild(link);
                    }
                    
                    // Handle video embed if available
                    const videoContainer = modal.querySelector('.modal-video');
                    videoContainer.innerHTML = '';
                    
                    // Only use the Video column, not alternate field names
                    const videoUrl = fields.Video || '';
                    
                    // Only try to embed if there's a video URL and it's from YouTube or Vimeo
                    if (videoUrl) {
                        // Check if it's YouTube
                        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                            // Extract video ID from YouTube URL
                            let videoId = '';
                            if (videoUrl.includes('youtube.com/watch?v=')) {
                                videoId = new URL(videoUrl).searchParams.get('v');
                            } else if (videoUrl.includes('youtu.be/')) {
                                videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
                            } else if (videoUrl.includes('youtube.com/embed/')) {
                                videoId = videoUrl.split('youtube.com/embed/')[1].split('?')[0];
                            }
                            
                            if (videoId) {
                                const iframe = document.createElement('iframe');
                                iframe.width = '100%';
                                iframe.height = '315';
                                iframe.src = `https://www.youtube.com/embed/${videoId}`;
                                iframe.title = fields.Title || 'Video';
                                iframe.frameBorder = '0';
                                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                                iframe.allowFullscreen = true;
                                videoContainer.appendChild(iframe);
                            }
                        } 
                        // Check if it's Vimeo
                        else if (videoUrl.includes('vimeo.com')) {
                            // Extract video ID from Vimeo URL
                            const vimeoId = videoUrl.split('vimeo.com/')[1].split('?')[0].split('/')[0];
                            
                            if (vimeoId) {
                                const iframe = document.createElement('iframe');
                                iframe.width = '100%';
                                iframe.height = '315';
                                iframe.src = `https://player.vimeo.com/video/${vimeoId}`;
                                iframe.title = fields.Title || 'Video';
                                iframe.frameBorder = '0';
                                iframe.allow = 'autoplay; fullscreen; picture-in-picture';
                                iframe.allowFullscreen = true;
                                videoContainer.appendChild(iframe);
                            }
                        }
                    }
                    
                    // Handle tags - they could be in different containers
                    const tagsHTML = fields.Tags && Array.isArray(fields.Tags) 
                        ? fields.Tags.map(tag => `<span class="tag">${tag}</span>`).join('')
                        : '';
                    modal.querySelector('.modal-tags').innerHTML = tagsHTML;
                    
                    // Handle additional images
                    const additionalImagesContainer = modal.querySelector('.modal-additional-images');
                    additionalImagesContainer.innerHTML = ''; // Clear previous images
                    
                    // Check if there are multiple images
                    if (fields['Main Image'] && fields['Main Image'].length > 1) {
                        // Skip the first image (it's already shown at the top)
                        for (let i = 1; i < fields['Main Image'].length; i++) {
                            const img = document.createElement('img');
                            img.src = fields['Main Image'][i].url;
                            img.alt = `${fields.Title || 'Project'} - Image ${i+1}`;
                            additionalImagesContainer.appendChild(img);
                        }
                    }
                    
                    // Check if there are additional image fields
                    if (fields['Additional Images'] && Array.isArray(fields['Additional Images']) && fields['Additional Images'].length > 0) {
                        fields['Additional Images'].forEach((imgData, index) => {
                            const img = document.createElement('img');
                            img.src = imgData.url;
                            img.alt = `${fields.Title || 'Project'} - Additional Image ${index+1}`;
                            additionalImagesContainer.appendChild(img);
                        });
                    }
                    
                    // Show modal
                    modal.style.display = 'block';
                }
            }
        }
    });
}