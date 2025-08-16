// Enhanced display functionality for new database structure
// This file handles rich project displays with media assets, exhibitions, collaborators, etc.

// Enhanced modal display with all related data
async function showEnhancedProjectModal(projectId) {
    const modal = document.getElementById('projectModal');
    
    try {
        // Skip extra Airtable calls for sample fallback project
        if (projectId && String(projectId).startsWith('sample')) {
            const projectData = (window.projects || []).find(p => p.id === projectId);
            if (!projectData) return;
            const fields = projectData.fields;
            const modalImage = modal.querySelector('.modal-image');
            if (fields['Main Image']?.[0]?.url) {
                modalImage.src = fields['Main Image'][0].url;
                modalImage.style.display = 'block';
            } else {
                modalImage.style.display = 'none';
            }
            modal.querySelector('.modal-title').textContent = fields.Title || 'Untitled Project';
            const subheadingInfo = [];
            const year = fields.Year || (fields.Date ? new Date(fields.Date).getFullYear() : '');
            const medium = fields['Primary Medium'] || fields.Medium || '';
            const dimensions = fields.Dimensions || fields['Space Requirements'] || '';
            if (year) subheadingInfo.push(year);
            if (medium) subheadingInfo.push(medium);
            if (dimensions) subheadingInfo.push(dimensions);
            modal.querySelector('.modal-subheading').textContent = subheadingInfo.join(' | ');
            const description = fields['Project Statement'] || fields.Description || '';
            modal.querySelector('.modal-description').textContent = description;
            // Clear optional sections for sample
            const clearSel = ['.modal-additional-images', '.modal-exhibitions', '.modal-collaborators', '.modal-workshops', '.modal-video', '.modal-link', '.modal-tags'];
            clearSel.forEach(sel => { const el = modal.querySelector(sel); if (el) el.innerHTML = ''; });
            modal.style.display = 'block';
            return;
        }

        // Fetch all related data in parallel for better performance
        const [projectData, mediaAssets, exhibitions, collaborators, workshops] = await Promise.all([
            fetchProjects().then(data => data.records.find(p => p.id === projectId)),
            fetchMediaAssets(projectId).catch(() => ({ records: [] })),
            fetchExhibitions(projectId).catch(() => ({ records: [] })),
            fetchCollaborators(projectId).catch(() => ({ records: [] })),
            fetchWorkshops(projectId).catch(() => ({ records: [] }))
        ]);

        if (!projectData) {
            console.error('Project not found');
            return;
        }

        const fields = projectData.fields;
        
        // Enhanced modal content with all the rich data
        const modalImage = modal.querySelector('.modal-image');
        if (fields['Main Image']?.[0]?.url) {
            modalImage.src = fields['Main Image'][0].url;
            modalImage.style.display = 'block';
        } else {
            modalImage.style.display = 'none';
        }
        modal.querySelector('.modal-title').textContent = fields.Title || 'Untitled Project';
        
        // Enhanced subheading with new fields
        const subheadingInfo = [];
        const year = fields.Year || (fields.Date ? new Date(fields.Date).getFullYear() : '');
        const medium = fields['Primary Medium'] || fields.Medium || '';
        const dimensions = fields.Dimensions || fields['Space Requirements'] || '';
        
        if (year) subheadingInfo.push(year);
        if (medium) subheadingInfo.push(medium);
        if (dimensions) subheadingInfo.push(dimensions);
        
        modal.querySelector('.modal-subheading').textContent = subheadingInfo.join(' | ');
        
        // Use Project Statement if available, fallback to Description
        const description = fields['Project Statement'] || fields.Description || '';
        modal.querySelector('.modal-description').textContent = description;
        
        // Enhanced project details
        updateModalDetails(modal, fields);
        
        // Enhanced media gallery
        updateModalMediaGallery(modal, fields, mediaAssets.records);
        
        // Video embedding
        updateModalVideo(modal, fields);
        
        // Professional context
        updateModalExhibitions(modal, exhibitions.records);
        updateModalCollaborators(modal, collaborators.records);
        updateModalWorkshops(modal, workshops.records);
        
        // Show modal
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading project details:', error);
        // Fallback to basic modal
        showBasicProjectModal(projectId);
    }
}

function updateModalDetails(modal, fields) {
    const detailsContainer = modal.querySelector('.modal-details') || createModalDetailsSection(modal);
    
    let detailsHTML = '';
    
    // Duration for time-based works
    if (fields.Duration) {
        detailsHTML += `<div class="modal-detail"><strong>Duration:</strong> ${fields.Duration}</div>`;
    }
    
    // Technical information
    if (fields['Technical Stack'] && Array.isArray(fields['Technical Stack'])) {
        detailsHTML += `<div class="modal-detail"><strong>Technology:</strong> ${fields['Technical Stack'].join(', ')}</div>`;
    }
    
    // Interaction type
    if (fields['Interaction Type']) {
        detailsHTML += `<div class="modal-detail"><strong>Interaction:</strong> ${fields['Interaction Type']}</div>`;
    }
    
    // Collaboration info
    if (fields['Collaboration Type']) {
        detailsHTML += `<div class="modal-detail"><strong>Collaboration:</strong> ${fields['Collaboration Type']}</div>`;
    }
    
    // Edition information
    if (fields['Edition Info']) {
        detailsHTML += `<div class="modal-detail"><strong>Edition:</strong> ${fields['Edition Info']}</div>`;
    }
    
    detailsContainer.innerHTML = detailsHTML;
}

function updateModalMediaGallery(modal, fields, mediaAssets) {
    const galleryContainer = modal.querySelector('.modal-additional-images');
    galleryContainer.innerHTML = '';
    
    // Group media by type for better organization
    const mediaByType = {
        artwork: [],
        documentation: [],
        process: [],
        archive: []
    };
    
    mediaAssets.forEach(asset => {
        const type = asset.fields['Asset Type']?.toLowerCase() || 'documentation';
        const category = mediaByType[type] ? type : 'documentation';
        mediaByType[category].push(asset);
    });
    
    // Display organized media sections
    Object.entries(mediaByType).forEach(([type, assets]) => {
        if (assets.length > 0) {
            const section = document.createElement('div');
            section.className = 'media-section';
            section.innerHTML = `
                <h4 class="media-section-title">${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                <div class="media-grid">
                    ${assets.map(asset => createMediaElement(asset)).join('')}
                </div>
            `;
            galleryContainer.appendChild(section);
        }
    });
    
    // Also handle legacy additional images
    if (fields['Main Image'] && fields['Main Image'].length > 1) {
        const legacySection = document.createElement('div');
        legacySection.className = 'media-section';
        legacySection.innerHTML = `
            <h4 class="media-section-title">Additional Images</h4>
            <div class="media-grid">
                ${fields['Main Image'].slice(1).map((img, index) => `
                    <img src="${img.url}" alt="${fields.Title} - Image ${index + 2}" class="modal-gallery-image">
                `).join('')}
            </div>
        `;
        galleryContainer.appendChild(legacySection);
    }
}

function createMediaElement(asset) {
    const fields = asset.fields;
    const format = fields['Media Format'] || 'Photo';
    
    if (format === 'Video') {
        return `
            <div class="media-item video-item">
                <video controls>
                    <source src="${fields['File']?.[0]?.url}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                ${fields.Caption ? `<p class="media-caption">${fields.Caption}</p>` : ''}
            </div>
        `;
    } else if (format === 'Photo') {
        return `
            <div class="media-item">
                <img src="${fields['File']?.[0]?.url}" alt="${fields['Alt Text'] || 'Project media'}" class="modal-gallery-image">
                ${fields.Caption ? `<p class="media-caption">${fields.Caption}</p>` : ''}
            </div>
        `;
    } else {
        return `
            <div class="media-item document-item">
                <a href="${fields['File']?.[0]?.url}" target="_blank" class="document-link">
                    📄 ${fields['Asset Name'] || 'Document'}
                </a>
                ${fields.Caption ? `<p class="media-caption">${fields.Caption}</p>` : ''}
            </div>
        `;
    }
}

function updateModalExhibitions(modal, exhibitions) {
    const exhibitionsContainer = modal.querySelector('.modal-exhibitions') || createModalExhibitionsSection(modal);
    
    if (exhibitions.length === 0) {
        exhibitionsContainer.style.display = 'none';
        return;
    }
    
    exhibitionsContainer.style.display = 'block';
    
    const exhibitionsHTML = exhibitions
        .sort((a, b) => new Date(b.fields['Start Date']) - new Date(a.fields['Start Date']))
        .map(exhibition => {
            const fields = exhibition.fields;
            const year = fields['Start Date'] ? new Date(fields['Start Date']).getFullYear() : '';
            return `
                <div class="exhibition-item">
                    <div class="exhibition-main">
                        <strong>${fields['Exhibition Name']}</strong>
                        ${fields.Venue ? `, ${fields.Venue}` : ''}
                        ${fields.City ? `, ${fields.City}` : ''}
                        ${year ? ` (${year})` : ''}
                    </div>
                    ${fields['Exhibition Type'] ? `<div class="exhibition-type">${fields['Exhibition Type']}</div>` : ''}
                </div>
            `;
        }).join('');
    
    exhibitionsContainer.querySelector('.exhibitions-list').innerHTML = exhibitionsHTML;
}

function updateModalCollaborators(modal, collaborators) {
    const collaboratorsContainer = modal.querySelector('.modal-collaborators') || createModalCollaboratorsSection(modal);
    
    if (collaborators.length === 0) {
        collaboratorsContainer.style.display = 'none';
        return;
    }
    
    collaboratorsContainer.style.display = 'block';
    
    const collaboratorsHTML = collaborators.map(collaborator => {
        const fields = collaborator.fields;
        const roles = Array.isArray(fields['Role/Specialty']) ? fields['Role/Specialty'].join(', ') : fields['Role/Specialty'] || '';
        return `
            <div class="collaborator-item">
                <strong>${fields.Name}</strong>
                ${roles ? ` - ${roles}` : ''}
                ${fields.Website ? ` <a href="${fields.Website}" target="_blank">↗</a>` : ''}
            </div>
        `;
    }).join('');
    
    collaboratorsContainer.querySelector('.collaborators-list').innerHTML = collaboratorsHTML;
}

function updateModalWorkshops(modal, workshops) {
    const workshopsContainer = modal.querySelector('.modal-workshops') || createModalWorkshopsSection(modal);
    
    if (workshops.length === 0) {
        workshopsContainer.style.display = 'none';
        return;
    }
    
    workshopsContainer.style.display = 'block';
    
    const workshopsHTML = workshops.map(workshop => {
        const fields = workshop.fields;
        const year = fields.Date ? new Date(fields.Date).getFullYear() : '';
        return `
            <div class="workshop-item">
                <strong>${fields.Title}</strong>
                ${fields.Venue ? `, ${fields.Venue}` : ''}
                ${year ? ` (${year})` : ''}
                ${fields.Type ? ` - ${fields.Type}` : ''}
            </div>
        `;
    }).join('');
    
    workshopsContainer.querySelector('.workshops-list').innerHTML = workshopsHTML;
}

// Helper functions to create modal sections
function createModalDetailsSection(modal) {
    const section = document.createElement('div');
    section.className = 'modal-details';
    modal.querySelector('.modal-info').appendChild(section);
    return section;
}

function createModalExhibitionsSection(modal) {
    const section = document.createElement('div');
    section.className = 'modal-exhibitions';
    section.innerHTML = `
        <h3>Exhibitions</h3>
        <div class="exhibitions-list"></div>
    `;
    modal.querySelector('.modal-content').appendChild(section);
    return section;
}

function createModalCollaboratorsSection(modal) {
    const section = document.createElement('div');
    section.className = 'modal-collaborators';
    section.innerHTML = `
        <h3>Collaborators</h3>
        <div class="collaborators-list"></div>
    `;
    modal.querySelector('.modal-content').appendChild(section);
    return section;
}

function createModalWorkshopsSection(modal) {
    const section = document.createElement('div');
    section.className = 'modal-workshops';
    section.innerHTML = `
        <h3>Related Workshops</h3>
        <div class="workshops-list"></div>
    `;
    modal.querySelector('.modal-content').appendChild(section);
    return section;
}

// Video embedding functions
function updateModalVideo(modal, fields) {
    const videoContainer = modal.querySelector('.modal-video');
    if (!videoContainer) return;
    
    videoContainer.innerHTML = '';
    
    const videoUrl = fields['Video URL'] || fields.Video || '';
    if (!videoUrl) return;
    
    const embedUrl = getVideoEmbedUrl(videoUrl);
    if (embedUrl) {
        videoContainer.innerHTML = `
            <div class="video-wrapper iframe-container">
                <iframe 
                    src="${embedUrl}" 
                    frameborder="0" 
                    allowfullscreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                </iframe>
            </div>
        `;
    } else {
        // For direct video files or unsupported formats, try video element
        const fileExt = videoUrl.split('.').pop().toLowerCase();
        if (['mp4', 'mov', 'webm', 'avi'].includes(fileExt)) {
            videoContainer.innerHTML = `
                <div class="video-wrapper">
                    <video controls>
                        <source src="${videoUrl}" type="video/${fileExt}">
                        Your browser doesn't support this video format.
                    </video>
                </div>
            `;
        }
    }
}

function getVideoEmbedUrl(url) {
    // YouTube URLs
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo URLs
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // Return null for other formats (will be handled as direct video)
    return null;
}

// Fallback to basic modal for compatibility
function showBasicProjectModal(projectId) {
    // Use existing modal functionality as fallback
    console.log('Using basic modal fallback for project:', projectId);
}

// Export functions
window.showEnhancedProjectModal = showEnhancedProjectModal; 