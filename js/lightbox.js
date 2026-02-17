// Lightbox Gallery for Project Images
class Lightbox {
    constructor() {
        this.currentIndex = 0;
        this.images = [];
        this.lightboxEl = null;
        this.init();
    }

    init() {
        // Create lightbox HTML
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-backdrop"></div>
            <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
            <button class="lightbox-prev" aria-label="Previous image">‹</button>
            <button class="lightbox-next" aria-label="Next image">›</button>
            <div class="lightbox-content">
                <img src="" alt="" class="lightbox-image">
                <div class="lightbox-caption"></div>
                <div class="lightbox-counter"></div>
            </div>
            <div class="lightbox-thumbnails"></div>
        `;
        document.body.appendChild(lightbox);
        this.lightboxEl = lightbox;

        // Event listeners
        this.lightboxEl.querySelector('.lightbox-close').addEventListener('click', () => this.close());
        this.lightboxEl.querySelector('.lightbox-prev').addEventListener('click', () => this.prev());
        this.lightboxEl.querySelector('.lightbox-next').addEventListener('click', () => this.next());
        this.lightboxEl.querySelector('.lightbox-backdrop').addEventListener('click', () => this.close());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightboxEl.classList.contains('active')) return;
            
            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });

        // Prevent body scroll when lightbox is open
        this.lightboxEl.addEventListener('transitionend', () => {
            if (this.lightboxEl.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    open(images, startIndex = 0) {
        this.images = images;
        this.currentIndex = startIndex;
        this.render();
        this.lightboxEl.classList.add('active');
    }

    close() {
        this.lightboxEl.classList.remove('active');
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.render();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.render();
    }

    goTo(index) {
        this.currentIndex = index;
        this.render();
    }

    render() {
        const current = this.images[this.currentIndex];
        const img = this.lightboxEl.querySelector('.lightbox-image');
        const caption = this.lightboxEl.querySelector('.lightbox-caption');
        const counter = this.lightboxEl.querySelector('.lightbox-counter');

        img.src = current.url;
        img.alt = current.alt || '';
        caption.textContent = current.caption || '';
        counter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;

        // Update thumbnails
        this.renderThumbnails();

        // Show/hide navigation buttons
        const prevBtn = this.lightboxEl.querySelector('.lightbox-prev');
        const nextBtn = this.lightboxEl.querySelector('.lightbox-next');
        
        if (this.images.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
        }
    }

    renderThumbnails() {
        if (this.images.length <= 1) return;

        const thumbnailsContainer = this.lightboxEl.querySelector('.lightbox-thumbnails');
        thumbnailsContainer.innerHTML = this.images.map((img, index) => `
            <div class="lightbox-thumbnail ${index === this.currentIndex ? 'active' : ''}" 
                 data-index="${index}">
                <img src="${img.url}" alt="${img.alt || ''}" loading="lazy">
            </div>
        `).join('');

        // Add click handlers to thumbnails
        thumbnailsContainer.querySelectorAll('.lightbox-thumbnail').forEach(thumb => {
            thumb.addEventListener('click', () => {
                this.goTo(parseInt(thumb.dataset.index));
            });
        });
    }
}

// Initialize global lightbox
window.lightbox = new Lightbox();

// Function to make images clickable in modal
function enableLightboxForModal() {
    const modal = document.getElementById('projectModal');
    if (!modal) return;

    // Add click handler to main modal image
    const mainImage = modal.querySelector('.modal-image');
    if (mainImage) {
        mainImage.style.cursor = 'pointer';
        mainImage.addEventListener('click', function() {
            if (!this.src) return;
            
            // Collect all images from the modal
            const images = collectModalImages(modal);
            window.lightbox.open(images, 0);
        });
    }

    // Add click handlers to gallery images
    const observer = new MutationObserver(() => {
        addGalleryImageHandlers(modal);
    });

    observer.observe(modal, {
        childList: true,
        subtree: true
    });

    addGalleryImageHandlers(modal);
}

function addGalleryImageHandlers(modal) {
    const galleryImages = modal.querySelectorAll('.modal-gallery-image, .media-item img');
    
    galleryImages.forEach((img, index) => {
        img.style.cursor = 'pointer';
        img.removeEventListener('click', img._lightboxHandler); // Remove old handler
        
        img._lightboxHandler = function() {
            const images = collectModalImages(modal);
            // Find this image's index in the collection
            const imageIndex = images.findIndex(item => item.url === this.src);
            window.lightbox.open(images, imageIndex >= 0 ? imageIndex : 0);
        };
        
        img.addEventListener('click', img._lightboxHandler);
    });
}

function collectModalImages(modal) {
    const images = [];
    
    // Main image
    const mainImage = modal.querySelector('.modal-image');
    if (mainImage && mainImage.src && mainImage.style.display !== 'none') {
        images.push({
            url: mainImage.src,
            alt: mainImage.alt,
            caption: modal.querySelector('.modal-title')?.textContent || ''
        });
    }

    // Gallery images
    const galleryImages = modal.querySelectorAll('.modal-gallery-image, .media-item img');
    galleryImages.forEach(img => {
        if (img.src) {
            const caption = img.closest('.media-item')?.querySelector('.media-caption')?.textContent || '';
            images.push({
                url: img.src,
                alt: img.alt,
                caption: caption
            });
        }
    });

    return images;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    enableLightboxForModal();
});

// Export for use in other scripts
window.enableLightboxForModal = enableLightboxForModal;
