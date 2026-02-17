// About page functionality
function loadAboutContent() {
    // Return the data directly from about-data.js - no CORS issues!
    return Promise.resolve(window.aboutData || null);
}

function renderAboutPage(content) {
    // Show main header on non-homepage pages
    document.body.classList.add('has-header');
    
    const container = document.getElementById('projectsContainer');
    
    if (!content) {
        container.innerHTML = '<p>Error loading about content.</p>';
        return;
    }

    container.className = 'about-page';
    
    // Build contact HTML from contact object
    let contactHTML = '';
    if (content.contact) {
        if (content.contact.email) {
            contactHTML += `<p><strong>Email:</strong> <a href="mailto:${content.contact.email}">${content.contact.email}</a></p>`;
        }
        if (content.contact.instagram) {
            contactHTML += `<p><strong>Instagram:</strong> <a href="${content.contact.instagram}" target="_blank" rel="noopener noreferrer">@taramoves</a></p>`;
        }
    }

    container.innerHTML = `
        <div class="about-content">
            <div class="about-header">
                <div class="about-photo">
                    <img src="${content.photoUrl}" alt="${content.artistName}" onerror="this.style.display='none'">
                </div>
                <div class="about-intro">
                    ${content.artistStatement ? `<div class="artist-statement"><h2>Artist Statement</h2><p>${content.artistStatement}</p></div>` : ''}
                </div>
            </div>
            
            ${content.bio ? `
                <div class="about-bio">
                    <h2>Biography</h2>
                    <div class="bio-text">${formatBioText(content.bio)}</div>
                </div>
            ` : ''}
            
            ${content.contact ? `
                <div class="about-contact">
                    <h2>Contact</h2>
                    <div class="contact-info">
                        ${contactHTML}
                    </div>
                </div>
            ` : ''}
            
            <div class="about-section">
                <h2>Education</h2>
                <p><strong>2023</strong> — MSc Fiction & Entertainment, SCIArc. Los Angeles, CA</p>
                <p><strong>2017</strong> — BA Media Studies, Pomona College, Claremont, CA</p>
            </div>
            
            <div class="about-section">
                <h2>Exhibitions & Performances</h2>
                <div class="section-content">
                    <p><strong>2025</strong><br>
                    Nuit Blanche, Toronto, Canada (Forthcoming)<br>
                    Doors Open Toronto, InterAccess, Toronto, Canada (Forthcoming)<br>
                    flashDrive, InterAccess, Toronto, Canada (Forthcoming)<br>
                    Open HDMI, Long Winter, Toronto, Canada<br>
                    Phantasia, It's OK Studios, Toronto, Canada<br>
                    Mane Course, Ponyhaus, Toronto, Canada</p>
                    
                    <p><strong>2024</strong><br>
                    P2P, InterAccess, Toronto, Canada<br>
                    In Bloom Gala, Toronto Arts Foundation, Toronto, Canada<br>
                    Low Resolution GIF Screening, Postmasters 5.0 & TRANSFER. New York, NY.<br>
                    Signals with DigiBC & VIFF, Signals Studio. Vancouver, BC.<br>
                    The Net Gala. New York, NY.<br>
                    Catalyst LA, El Cid, Los Angeles, CA<br>
                    SXSW XR Experience, The Fairmont Hotel. Austin, TX.</p>
                    
                    <p><strong>2023</strong><br>
                    Gateway, NFT Now. Miami, FL.<br>
                    The Edge of Surveillance, NeueHouse. Los Angeles, CA.<br>
                    Fiction & Entertainment Showcase, SCIArc. Los Angeles, CA.</p>
                    
                    <p><strong>2022</strong><br>
                    Zoratopia. Miami, FL.<br>
                    Meta Masquerade, 50MM Collective. Los Angeles, CA.<br>
                    Loud Cinema, Smartbomb. Oakland, CA.<br>
                    Evolution, Umba Daima. Atlanta, GA.</p>
                    
                    <p><strong>2021</strong><br>
                    Family Style, Medicine for Nightmares. San Francisco, CA.<br>
                    Meta Masquerade, 50MM Collective. Los Angeles, CA.</p>
                    
                    <p><strong>2020</strong><br>
                    Pastures, Bandcamp Live & Gray Area, San Francisco, CA.</p>
                    
                    <p><strong>2019</strong><br>
                    Artist Showcase, Gray Area. San Francisco, CA.</p>
                </div>
            </div>
            
            <div class="about-section">
                <h2>Fellowships, Residencies, and Awards</h2>
                <div class="section-content">
                    <p><strong>2024</strong><br>
                    Art & Code Y11, NEW INC x Rhizome, New York, NY<br>
                    Base Builders Hackathon Creative Awardee, Base X FWB, Idyllwild, CA<br>
                    Art Farm Nebraska, Marquette, NE</p>
                    
                    <p><strong>2022</strong><br>
                    Avaissance Residency, Art on Avax, Digital</p>
                    
                    <p><strong>2021</strong><br>
                    FWB Fellowship, FWB, Digital</p>
                </div>
            </div>
            
            <div class="about-section">
                <h2>Workshops and Talks</h2>
                <div class="section-content">
                    <p><strong>2025</strong><br>
                    Co-Creative Code, Vector Festival, Toronto, Canada (Forthcoming)<br>
                    Motion Capture, DEMO 2025, New York, NY (Forthcoming)</p>
                    
                    <p><strong>2024</strong><br>
                    Co-Creative Code, InterAccess, Toronto, Canada<br>
                    Artist Talk & FaceMesh Micro Workshop, SITHUB, Toronto, Canada<br>
                    Artist Talk, Signals, Vancouver, Canada<br>
                    Artist Talk, Disney Imagineering, Los Angeles, CA<br>
                    Generating the Moving Image Workshop, NeueHouse, Los Angeles, CA</p>
                    
                    <p><strong>2023</strong><br>
                    Generating the Image Workshop, NeueHouse, Los Angeles, CA<br>
                    Edge of Surveillance Presentation & Panel, NeueHouse, Los Angeles, CA<br>
                    Introduction to Video Generation with AI Workshop, SCIArc, Los Angeles, CA</p>
                    
                    <p><strong>2022</strong><br>
                    Moves into Web3 Workshop, NFT Oakland, Oakland, CA<br>
                    Moves into Web3 Workshop, Bay Area Mural Program, Oakland, CA</p>
                </div>
            </div>
            
            <div class="about-section">
                <h2>Professional</h2>
                <p><strong>2019 - Present</strong> — Motion Graphics, Web Design & Live Visuals, Freelance, Remote</p>
                <p><strong>2021 - 2023</strong> — Zoratopia Live Visuals Director, Zora, Remote</p>
                <p><strong>2019 - 2020</strong> — Animation & Creative Coding Instructor, David E Glover Center, Oakland, CA</p>
                <p><strong>2018 - 2019</strong> — Director of Creative Operations, Kapwing, San Francisco, CA</p>
            </div>
        </div>
    `;
}

function formatBioText(bioText) {
    // Split by double line breaks to create paragraphs
    const paragraphs = bioText.split('\n\n').filter(p => p.trim());
    return paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
}

// Export function to be used by the main filtering logic
window.renderAboutPage = renderAboutPage;
window.loadAboutContent = loadAboutContent; 