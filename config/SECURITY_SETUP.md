# 🔒 Security Setup Instructions

## 🚨 **Why This Matters**

Your API credentials were exposed in client-side code, which means anyone visiting your website could see and potentially abuse your Airtable API key. This setup fixes that security vulnerability.

## 📁 **Files Created**

### **Configuration Files:**
- `config/env.example` - Template showing what values you need
- `config/env.local` - **Your actual credentials** (already filled in)
- `js/config.js` - Configuration loader
- `js/airtable-secure.js` - Secure API functions

### **Security Files:**
- `.gitignore` - Prevents credential files from being committed to Git

## 🛠️ **How to Use**

### **Option 1: Use Local Config (Current Setup)**

1. **Your credentials are already in `config/env.local`**
2. **Update your HTML to use secure files:**

```html
<!-- Replace these lines in index.html: -->
<script src="js/airtable.js"></script>

<!-- With these: -->
<script src="js/config.js"></script>
<script src="js/airtable-secure.js"></script>
```

3. **Update your grid.js file** to use the new secure functions:

```javascript
// Replace this line:
const data = await fetchAirtableData({
    table: AIRTABLE_CONFIG.TABLE_NAME,
    view: AIRTABLE_CONFIG.VIEW_NAME
});

// With this:
const data = await fetchProjects();
```

### **Option 2: Use Environment Variables (Production)**

For production deployment (Netlify, Vercel, etc.):

1. **Set environment variables in your hosting platform:**
   - `AIRTABLE_BASE_ID=appy5PeLmP9YHhroy`
   - `AIRTABLE_API_TOKEN=patuh3Jlg71SRPHIb...`

2. **The system will automatically use environment variables** when available

## 🚀 **Enhanced Features**

The new secure system also includes functions for your enhanced database:

```javascript
// Fetch all projects
const projects = await fetchProjects();

// Fetch media for a specific project
const media = await fetchMediaAssets('project-id');

// Fetch exhibitions featuring a project
const exhibitions = await fetchExhibitions('project-id');

// Fetch collaborators on a project
const collaborators = await fetchCollaborators('project-id');

// Fetch workshops related to a project
const workshops = await fetchWorkshops('project-id');
```

## ⚠️ **Security Best Practices**

### **DO:**
✅ Keep `config/env.local` secret (already in .gitignore)  
✅ Use environment variables in production  
✅ Regenerate API tokens if they've been exposed  
✅ Use different tokens for different environments  

### **DON'T:**
❌ Commit credential files to Git  
❌ Share config files publicly  
❌ Use production credentials in development  
❌ Keep old exposed tokens active  

## 🔄 **Migration Steps**

1. **Update HTML** to use new secure scripts
2. **Test with current setup** to ensure it works
3. **Remove old insecure files** once confirmed working
4. **Import new Airtable structure** when ready
5. **Update API calls** to use enhanced functions

## 🆘 **Troubleshooting**

### **If you see "Using fallback configuration":**
- Check that `config/env.local` exists and has your credentials
- Verify the file is accessible by your web server
- Make sure the file format matches the example

### **If API calls fail:**
- Verify your credentials are correct
- Check that your Base ID and API token are valid
- Ensure your local server can access the config folder

## 🎯 **Next Steps**

1. **Test the secure setup** with your current database
2. **Import your enhanced Airtable structure** 
3. **Update your website code** to use the new enhanced functions
4. **Deploy securely** using environment variables

Your API credentials are now properly secured! 🔐 