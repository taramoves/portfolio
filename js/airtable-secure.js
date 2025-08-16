// Secure Airtable configuration using environment variables
// This replaces the hardcoded credentials in airtable.js

let AIRTABLE_CONFIG = null;

// Initialize configuration
async function initAirtableConfig() {
    if (!AIRTABLE_CONFIG) {
        AIRTABLE_CONFIG = await loadAirtableConfig();
        console.log('🔒 Airtable config loaded securely');
    }
    return AIRTABLE_CONFIG;
}

// Helper function for Airtable requests (updated to use secure config)
async function fetchAirtableDataSecure({ table, view, filterByFormula = '' }) {
    // Ensure config is loaded
    await initAirtableConfig();
    
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${table}`);
    if (view) url.searchParams.append('view', view);
    if (filterByFormula) url.searchParams.append('filterByFormula', filterByFormula);

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) throw new Error(`Airtable fetch failed: ${response.status}`);
    return await response.json();
}

// Enhanced fetch functions for new tables
async function fetchProjects(view = null) {
    await initAirtableConfig();
    const viewToUse = view || AIRTABLE_CONFIG.PROJECTS_VIEW;
    console.log('🔍 Fetching from Airtable view:', viewToUse);
    return fetchAirtableDataSecure({
        table: AIRTABLE_CONFIG.PROJECTS_TABLE,
        view: viewToUse
    });
}

async function fetchMediaAssets(projectId = null) {
    await initAirtableConfig();
    const filter = projectId ? `{Linked Project} = "${projectId}"` : '';
    return fetchAirtableDataSecure({
        table: AIRTABLE_CONFIG.MEDIA_TABLE,
        filterByFormula: filter
    });
}

async function fetchExhibitions(projectId = null) {
    await initAirtableConfig();
    const filter = projectId ? `FIND("${projectId}", {Featured Projects})` : '';
    return fetchAirtableDataSecure({
        table: AIRTABLE_CONFIG.EXHIBITIONS_TABLE,
        filterByFormula: filter
    });
}

async function fetchCollaborators(projectId = null) {
    await initAirtableConfig();
    const filter = projectId ? `FIND("${projectId}", {Projects Together})` : '';
    return fetchAirtableDataSecure({
        table: AIRTABLE_CONFIG.COLLABORATORS_TABLE,
        filterByFormula: filter
    });
}

async function fetchWorkshops(projectId = null) {
    await initAirtableConfig();
    const filter = projectId ? `FIND("${projectId}", {Related Projects})` : '';
    return fetchAirtableDataSecure({
        table: AIRTABLE_CONFIG.WORKSHOPS_TABLE,
        filterByFormula: filter
    });
}

// Backward compatibility - keep the old function name
async function fetchAirtableData(options) {
    return fetchAirtableDataSecure(options);
}

// Export functions for global use
window.fetchAirtableDataSecure = fetchAirtableDataSecure;
window.fetchProjects = fetchProjects;
window.fetchMediaAssets = fetchMediaAssets;
window.fetchExhibitions = fetchExhibitions;
window.fetchCollaborators = fetchCollaborators;
window.fetchWorkshops = fetchWorkshops;
window.initAirtableConfig = initAirtableConfig; 