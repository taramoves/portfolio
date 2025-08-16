export default async function handler(req, res) {
    try {
        if (req.method !== 'GET') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        const baseId = process.env.AIRTABLE_BASE_ID;
        const apiToken = process.env.AIRTABLE_API_TOKEN;
        const {
            table = 'Projects',
            view = 'Grid view',
            filterByFormula = ''
        } = req.query;

        if (!baseId || !apiToken) {
            res.status(500).json({ error: 'Missing Airtable environment variables' });
            return;
        }

        const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`);
        if (view) url.searchParams.append('view', view);
        if (filterByFormula) url.searchParams.append('filterByFormula', filterByFormula);

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            res.status(response.status).json({ error: 'Airtable request failed', status: response.status, details: text });
            return;
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err?.message || String(err) });
    }
}


