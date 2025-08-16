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

function renderProjectsList(projects) {
    const container = document.getElementById('projectsContainer');
    
    if (projects === null) {
        return; // Skip rendering if it's already handled (like in new-media case with custom handling)
    }
    
    container.innerHTML = ''; // Clear existing content
    container.className = 'projects-list'; // Change to list layout
    
    if (projects.length === 0) {
        container.innerHTML = '<p>No projects found in this category.</p>';
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
        
        // Only show projects with Display checkbox checked
        if (!fields.Display) {
            console.log('🔍 Skipping project without Display checkbox:', fields.Title);
            return;
        }
        
        // Log if project has no image (but still render it)
        if (!fields['Main Image']?.[0]) {
            console.log('🔍 Project has no main image:', fields.Title);
        }
        
        const projectItem = document.createElement('div');
        projectItem.className = 'project-list-item';
        projectItem.dataset.projectId = project.id;
        projectItem.style.cursor = 'pointer'; // Make it look clickable
        
        // Safely handle tags whether they exist or not
        const tagsHTML = fields.Tags && Array.isArray(fields.Tags) 
            ? fields.Tags.map(tag => `<span class="tag">${tag}</span>`).join('')
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
        if (fields.Duration) {
            const formattedDuration = formatDuration(fields.Duration);
            subheadingInfo.push(formattedDuration);
        }
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
            ? `<img src="${fields['Main Image'][0].url}" alt="${fields.Title}" class="project-list-image">`
            : `<div class="project-list-image-placeholder">
                <div class="placeholder-content">
                    <span class="placeholder-text">${fields.Title}</span>
                    <small>No image</small>
                </div>
               </div>`;
        
        projectItem.innerHTML = `
            ${imageHtml}
            <div class="project-list-info">
                <h3>${fields.Title || 'Untitled Project'}</h3>
                ${subheadingText ? `<div class="subheading">${subheadingText}</div>` : ''}
                <p>${shortDescription}</p>
                ${shortDescription ? '<div class="read-more"><em>Read More</em></div>' : ''}
                ${durationHtml}
                ${projectUrlHtml}
                ${tagsHTML ? `<div class="project-list-tags">${tagsHTML}</div>` : ''}
            </div>
        `;
        
        container.appendChild(projectItem);
    });
}

function renderProjectGroupList(projects) {
    const container = document.getElementById('projectsContainer');
    const groupContainer = document.createElement('div');
    groupContainer.className = 'project-group-list';
    
    projects.forEach(project => {
        const fields = project.fields;
        if (!fields['Main Image']?.[0]) return;
        
        const projectItem = document.createElement('div');
        projectItem.className = 'project-list-item';
        projectItem.dataset.projectId = project.id;
        projectItem.style.cursor = 'pointer'; // Make it look clickable
        
        // Safely handle tags whether they exist or not
        const tagsHTML = fields.Tags && Array.isArray(fields.Tags) 
            ? fields.Tags.map(tag => `<span class="tag">${tag}</span>`).join('')
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

        // Format subheading information
        const subheadingInfo = [];
        if (dateDisplay) subheadingInfo.push(dateDisplay);
        if (fields.Medium) subheadingInfo.push(fields.Medium);
        if (fields.Dimensions) subheadingInfo.push(fields.Dimensions);
        const subheadingText = subheadingInfo.join(' | ');
        
        // Project URL removed from portfolio display
        let projectUrlHtml = '';
        
        projectItem.innerHTML = `
            <img src="${fields['Main Image'][0].url}" alt="${fields.Title}" class="project-list-image">
            <div class="project-list-info">
                <h3>${fields.Title || 'Untitled Project'}</h3>
                ${subheadingText ? `<div class="subheading">${subheadingText}</div>` : ''}
                <p>${fields.Description || ''}</p>
                ${projectUrlHtml}
                ${tagsHTML ? `<div class="project-list-tags">${tagsHTML}</div>` : ''}
            </div>
        `;
        
        groupContainer.appendChild(projectItem);
    });
    
    container.appendChild(groupContainer);
}

function renderNewMediaListView() {
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
    container.className = 'projects-list'; // Change to list layout

    // Add Video section
    if (groupedProjects.video.length > 0) {
        const videoHeader = document.createElement('h2');
        videoHeader.className = 'list-section-header';
        videoHeader.textContent = 'Video';
        container.appendChild(videoHeader);
        renderProjectGroupList(groupedProjects.video);
    }

    // Add Performance section
    if (groupedProjects.performance.length > 0) {
        const performanceHeader = document.createElement('h2');
        performanceHeader.className = 'list-section-header';
        performanceHeader.textContent = 'Performance';
        container.appendChild(performanceHeader);
        renderProjectGroupList(groupedProjects.performance);
    }

    // Add Installation section
    if (groupedProjects.installation.length > 0) {
        const installationHeader = document.createElement('h2');
        installationHeader.className = 'list-section-header';
        installationHeader.textContent = 'Installation';
        container.appendChild(installationHeader);
        renderProjectGroupList(groupedProjects.installation);
    }
} 