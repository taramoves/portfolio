async function postJSON(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const contentType = res.headers.get('content-type') || '';
    const isJSON = contentType.includes('application/json');
    const payload = isJSON ? await res.json() : await res.text();
    if (!res.ok) {
        const message = (payload && payload.error) ? payload.error : 'Request failed';
        throw new Error(message);
    }
    return payload;
}

(function attachSubscribeHandler() {
    const form = document.getElementById('subscribe-form');
    if (!form) return;
    const input = document.getElementById('subscribe-email');
    const message = document.getElementById('subscribe-message');

    function setMessage(text, type) {
        if (!message) return;
        message.textContent = text;
        message.className = `subscribe-message ${type || ''}`;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (input?.value || '').trim();
        if (!email) {
            setMessage('Please enter your email.', 'error');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage('Please enter a valid email.', 'error');
            return;
        }
        form.querySelector('button[type="submit"]').disabled = true;
        setMessage('Subscribing…');
        try {
            const base = (typeof window !== 'undefined') ? window.location.origin : '';
            await postJSON(`${base}/api/subscribe`, { email });
            setMessage('Thanks! Please check your inbox.', 'success');
            form.reset();
        } catch (err) {
            setMessage(err?.message || 'Sorry, something went wrong.', 'error');
        } finally {
            form.querySelector('button[type="submit"]').disabled = false;
        }
    });
})();


