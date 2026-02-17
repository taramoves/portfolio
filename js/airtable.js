const AIRTABLE_CONFIG = {
    ACCESS_TOKEN: 'patuh3Jlg71SRPHIb.679b821c7528d252101cdc7f40cc8ed0e44c7e3d9443c2505213f89501a7ad2c',
    BASE_ID: 'appy5PeLmP9YHhroy',  // Just the base ID part before the slash
    TABLE_NAME: 'Projects',        // Make sure this matches your table name
    VIEW_NAME: 'Grid view'         // Make sure this matches your view name
};

// Helper function for Airtable requests
async function fetchAirtableData({ table, view, filterByFormula = '' }) {
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