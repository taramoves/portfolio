// Simple project rendering without built-in filtering
// Use this when you've already filtered projects and don't want additional filtering applied

function renderProjectsSimple(projects, container) {
    if (!container) {
        container = document.getElementById('projectsContainer');
    }
    
    if (!Array.isArray(projects)) {
        container.innerHTML = '<p>No projects found.</p>';
        return;
    }
    
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
        
        // Skip projects without titles
        if (!fields.Title) {
            return;
        }
        
        const projectItem = document.createElement('div');
        projectItem.className = 'project-list-item';
        projectItem.dataset.projectId = project.id;
        projectItem.style.cursor = 'pointer';
        
        // Format date information - show only year
        let dateDisplay = '';
        if (fields.Date) {
            const projectDate = new Date(fields.Date);
            dateDisplay = projectDate.getFullYear().toString();
        } else if (fields.Year) {
            dateDisplay = fields.Year;
        }
        
        // Enhanced subheading information
        const subheadingInfo = [];
        const medium = fields['Primary Medium'] || fields.Medium || '';
        const dimensions = fields.Dimensions || fields['Space Requirements'] || '';
        
        if (dateDisplay) subheadingInfo.push(dateDisplay);
        if (medium) subheadingInfo.push(medium);
        if (fields.Duration) {
            const minutes = Math.floor(fields.Duration / 60);
            const formattedDuration = minutes >= 1 ? 
                (minutes === 1 ? `${minutes} Minute` : `${minutes} Minutes`) :
                (fields.Duration === 1 ? `${fields.Duration} Second` : `${fields.Duration} Seconds`);
            subheadingInfo.push(formattedDuration);
        }
        if (dimensions) subheadingInfo.push(dimensions);
        
        const subheadingText = subheadingInfo.join(' | ');
        
        // Enhanced description handling
        const description = fields['Project Statement'] || fields.Description || '';
        const shortDescription = fields.Description || description;
        
        // Tags
        const tagsHTML = fields.Tags && Array.isArray(fields.Tags) 
            ? fields.Tags.map(tag => `<span class="tag">${tag}</span>`).join('')
            : '';
        
        // Handle image
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
                ${tagsHTML ? `<div class="project-list-tags">${tagsHTML}</div>` : ''}
            </div>
        `;
        
        // Add click handler to open modal
        projectItem.addEventListener('click', () => {
            if (typeof showEnhancedProjectModal === 'function') {
                showEnhancedProjectModal(project.id);
            }
        });
        
        container.appendChild(projectItem);
    });
}

// Export
window.renderProjectsSimple = renderProjectsSimple;
