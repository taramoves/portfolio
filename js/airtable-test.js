console.log('Airtable test script loaded');

async function testAirtableConnection() {
    console.log('Testing Airtable connection...');
    try {
        const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${AIRTABLE_CONFIG.TABLE_NAME}`);
        url.searchParams.append('view', AIRTABLE_CONFIG.VIEW_NAME);
        url.searchParams.append('maxRecords', '1'); // Just get one record to test
        
        console.log('Fetching from URL:', url.toString());
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_CONFIG.ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Airtable fetch failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data received:', data);
        
        if (data.records && data.records.length > 0) {
            console.log('Connection successful! Sample record:', data.records[0].id);
        } else {
            console.log('Connection seems to work but no records found');
        }
    } catch (error) {
        console.error('Airtable connection test failed:', error);
    }
}

// Run the test when the page loads
document.addEventListener('DOMContentLoaded', testAirtableConnection); 