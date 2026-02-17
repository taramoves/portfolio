# Markdown Blog Guide

Add posts under `blog/posts/` as Markdown files and register them in `blog/posts.json`.

1. Create a new file: `blog/posts/my-new-post.md`
2. Add front metadata in `blog/posts.json`:
   ```json
   {
     "slug": "my-new-post",
     "title": "My New Post",
     "date": "2025-02-10",
     "excerpt": "Short summary...",
     "tags": ["note"]
   }
   ```
3. Visit `/blog/` to see it listed, and `/blog/post.html?slug=my-new-post` for the full post.

Notes:
- Images: place URLs directly in Markdown or store images in `/assets/` and refer with relative paths like `../assets/...`.
- Posts are static; deploy to Vercel to publish updates.
