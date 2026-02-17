export default async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        const baseId = process.env.AIRTABLE_BASE_ID;
        const apiToken = process.env.AIRTABLE_API_TOKEN;
        const table = process.env.AIRTABLE_SUBSCRIBERS_TABLE || 'Subscribers';

        if (!baseId || !apiToken) {
            res.status(500).json({ error: 'Missing Airtable environment variables' });
            return;
        }

        const { email } = req.body || {};
        if (!email || typeof email !== 'string') {
            res.status(400).json({ error: 'Email is required' });
            return;
        }
        const emailTrimmed = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailTrimmed)) {
            res.status(400).json({ error: 'Invalid email address' });
            return;
        }

        const url = new URL(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`);
        const payload = {
            records: [
                {
                    fields: {
                        Email: emailTrimmed,
                        Source: 'website',
                        SubscribedAt: new Date().toISOString()
                    }
                }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            res.status(response.status).json({ error: 'Airtable request failed', status: response.status, details: text });
            return;
        }

        res.status(200).json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err?.message || String(err) });
    }
}


