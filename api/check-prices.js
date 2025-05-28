const webPush = require('web-push');
const axios = require('axios');

const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
};

webPush.setVapidDetails(
    'mailto:vasokima@gmail.com', // Replace with your contact email
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// In-memory subscriptions; replace with database in production
const subscriptions = require('../subscriptions');

module.exports = async (req, res) => {
    try {
        const response = await axios.get(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,rejuve-ai,sophiaverse,chia,stellar,kava,decentraland,zksync,starknet,arbitrum,optimism,dforce-token,band-protocol,notcoin,polkadot,solana,singularity-finance,flare-networks,redbelly-network-token,songbird,vestate,coin98,hypercycle,alien-worlds,chainge-finance,befi-labs,hello-labs,masa-finance,cardano,ripple,celo,osmosis,cosmos,berachain-bera,sui,beoble,dia-data,chainlink,agridex-governance-token,kolz,kitten-haimer,troy,iota,worldcoin-wld,mintlayer,ethereum&order=market_cap_desc&per_page=50&page=1&sparkline=false'
        );
        const coins = response.data;

        for (const coin of coins) {
            if (coin.price_change_percentage_24h > 2) {
                const payload = JSON.stringify({
                    title: `ფასის გაფრთხილება: ${coin.name}`,
                    body: `${coin.name}-მა 24 საათში ${coin.price_change_percentage_24h.toFixed(2)}%-ით მოიმატა!`
                });

                for (const subscription of subscriptions) {
                    try {
                        await webPush.sendNotification(subscription, payload);
                    } catch (error) {
                        console.error('Error sending notification:', error);
                        subscriptions.splice(subscriptions.indexOf(subscription), 1);
                    }
                }
            }
        }

        res.status(200).json({ message: 'Price check completed' });
    } catch (error) {
        console.error('Error fetching price data:', error.message);
        res.status(500).json({ error: 'Failed to check prices' });
    }
};
