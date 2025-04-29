document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await fetchAirtableData({
            table: AIRTABLE_CONFIG.TABLE_NAME,
            view: AIRTABLE_CONFIG.VIEW_NAME
        });
        
        renderProjects(data.records);
        setupModal();
    } catch (error) {
        console.error('Failed to load projects:', error);
        document.getElementById('projectsContainer').innerHTML = 
            '<p>Error loading projects. Please try again later.</p>';
    }
});

function renderProjects(projects) {
    const container = document.getElementById('projectsContainer');
    
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
        
        container.appendChild(projectCard);
    });
}

function setupModal() {
    const modal = document.getElementById('projectModal');
    const closeButton = modal.querySelector('.close-button');
    const projectCards = document.querySelectorAll('.project-card');

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

    // Add click handlers to project cards
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.dataset.projectId;
            const fields = card.querySelector('.project-info');
            
            // Update modal content
            modal.querySelector('.modal-image').src = card.querySelector('.project-image').src;
            modal.querySelector('.modal-title').textContent = fields.querySelector('h3').textContent;
            modal.querySelector('.modal-subheading').textContent = fields.querySelector('.subheading')?.textContent || '';
            modal.querySelector('.modal-description').textContent = fields.querySelector('p').textContent;
            modal.querySelector('.modal-tags').innerHTML = fields.querySelector('.project-tags')?.innerHTML || '';
            
            // Show modal
            modal.style.display = 'block';
        });
    });
}