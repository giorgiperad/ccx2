const subscriptions = []; // Use a database in production

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const subscription = req.body;
    subscriptions.push(subscription);

    res.status(201).json({ message: 'Subscription received' });
};