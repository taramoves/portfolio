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
        
        // Add Project URL if available
        let projectUrlHtml = '';
        if (fields['Project URL']) {
            projectUrlHtml = `<div class="project-link"><a href="${fields['Project URL']}" target="_blank" rel="noopener noreferrer">Link</a></div>`;
        }
        
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
        
        // Add Project URL if available
        let projectUrlHtml = '';
        if (fields['Project URL']) {
            projectUrlHtml = `<div class="project-link"><a href="${fields['Project URL']}" target="_blank" rel="noopener noreferrer">Link</a></div>`;
        }
        
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