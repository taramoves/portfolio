function formatDate(dateString) {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

async function fetchJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.json();
}

function getQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
}

async function renderBlogList() {
    const listEl = document.getElementById('blog-list');
    if (!listEl) return;

    try {
        const base = (typeof window !== 'undefined' && window.BLOG_BASE) ? window.BLOG_BASE.replace(/\/$/, '') : '.';
        const posts = await fetchJSON(`${base}/posts.json`);
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (posts.length === 0) {
            listEl.innerHTML = '<p>No posts yet.</p>';
            return;
        }

        const frag = document.createDocumentFragment();
        posts.forEach(post => {
            const item = document.createElement('article');
            item.className = 'blog-list-item';
            item.innerHTML = `
                <h2><a href="post.html?slug=${encodeURIComponent(post.slug)}">${post.title}</a></h2>
                <div class="post-meta">
                    ${post.date ? `<time>${formatDate(post.date)}</time>` : ''}
                    ${post.tags && post.tags.length ? `<span class="tags">${post.tags.map(t => `#${t}`).join(' ')}</span>` : ''}
                </div>
                ${post.excerpt ? `<p class="blog-excerpt">${post.excerpt}</p>` : ''}
            `;
            frag.appendChild(item);
        });
        listEl.innerHTML = '';
        listEl.appendChild(frag);
    } catch (err) {
        listEl.innerHTML = `<p>Failed to load posts.</p>`;
        // eslint-disable-next-line no-console
        console.error(err);
    }
}

async function renderBlogPost() {
    const titleEl = document.getElementById('post-title');
    const dateEl = document.getElementById('post-date');
    const tagsEl = document.getElementById('post-tags');
    const contentEl = document.getElementById('post-content');
    if (!contentEl) return;

    const slug = getQueryParam('slug');
    if (!slug) {
        contentEl.textContent = 'Missing slug parameter.';
        return;
    }

    try {
        const base = (typeof window !== 'undefined' && window.BLOG_BASE) ? window.BLOG_BASE.replace(/\/$/, '') : '.';
        const postsDir = (typeof window !== 'undefined' && window.BLOG_POSTS_DIR)
            ? window.BLOG_POSTS_DIR.replace(/\/$/, '')
            : `${base}/posts`;
        const posts = await fetchJSON(`${base}/posts.json`);
        const meta = posts.find(p => p.slug === slug);
        if (meta) {
            if (titleEl) titleEl.textContent = meta.title || slug;
            if (dateEl) dateEl.textContent = meta.date ? formatDate(meta.date) : '';
            if (tagsEl) tagsEl.innerHTML = meta.tags && meta.tags.length ? meta.tags.map(t => `<span class="tag">${t}</span>`).join('') : '';
        } else if (titleEl) {
            titleEl.textContent = slug;
        }

        const res = await fetch(`${postsDir}/${slug}.md`);
        if (!res.ok) throw new Error('Post not found');
        const md = await res.text();
        const html = window.marked ? window.marked.parse(md) : md;
        contentEl.innerHTML = html;
    } catch (err) {
        contentEl.innerHTML = '<p>Sorry, this post could not be loaded.</p>';
        // eslint-disable-next-line no-console
        console.error(err);
    }
}

window.renderBlogList = renderBlogList;
window.renderBlogPost = renderBlogPost;
