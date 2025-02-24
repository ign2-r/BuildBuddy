// pages/api/chatgpt.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Your API logic here
        const response = await fetch('https://api.openai.com/v1/engines/chatgpt/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`
            },
            body: JSON.stringify({
                prompt: req.body.prompt,
                max_tokens: 150
            })
        });

        const data = await response.json();
        res.status(200).json({ data });
    } else {
        // Handle any other HTTP method
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
