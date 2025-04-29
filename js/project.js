document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectSlug = urlParams.get('slug');
    
    if (!projectSlug) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const data = await fetchAirtableData({
            table: AIRTABLE_CONFIG.TABLE_NAME,
            filterByFormula: `{Slug}='${projectSlug}'`
        });
        
        if (data.records.length === 0) {
            window.location.href = 'index.html';
            return;
        }
        
        renderProject(data.records[0]);
    } catch (error) {
        console.error('Failed to load project:', error);
        window.location.href = 'index.html';
    }
});

function renderProject(project) {
    const header = document.getElementById('projectHeader');
    const contentContainer = document.getElementById('projectContent');
    
    // Render header
    header.innerHTML = `
        <h1>${project.fields.Title || 'Untitled Project'}</h1>
        ${project.fields.Subheading ? `<div class="subheading">${project.fields.Subheading}</div>` : ''}
        ${project.fields.Description ? `<p class="project-description">${project.fields.Description}</p>` : ''}
        ${project.fields.Tags ? `
            <div class="project-tags">
                ${project.fields.Tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        ` : ''}
    `;
    
    // Render content
    if (project.fields.Content) {
        project.fields.Content.forEach((file, index) => {
            const contentItem = document.createElement('div');
            contentItem.className = 'content-item';
            
            const fileExt = file.url.split('.').pop().toLowerCase();
            const isVideo = ['mp4', 'mov', 'webm'].includes(fileExt);
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt);
            const description = project.fields['Content Descriptions']?.[index];
            
            if (isImage) {
                contentItem.innerHTML = `
                    <img src="${file.url}" alt="${description || ''}">
                    ${description ? `<p class="caption">${description}</p>` : ''}
                `;
            } else if (isVideo) {
                contentItem.innerHTML = `
                    <video controls>
                        <source src="${file.url}" type="video/${fileExt}">
                        Your browser doesn't support this video format.
                    </video>
                    ${description ? `<p class="caption">${description}</p>` : ''}
                `;
            } else {
                contentItem.innerHTML = `
                    <a href="${file.url}" target="_blank" class="file-link">
                        Download ${file.filename || 'file'}
                    </a>
                    ${description ? `<p class="caption">${description}</p>` : ''}
                `;
            }
            
            contentContainer.appendChild(contentItem);
        });
    }
}