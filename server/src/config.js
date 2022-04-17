module.exports = {
  mongo: {
    url: process.env.MONGO_URL,
  },
  timeouts: {
    claimTimeout: 43200000,
  },
  hCaptchaSecret: process.env.HCAPTCHA_SECRET,
  network: {
    rpc: process.env.RPC, // switched to Alchemy for better Performance
    explorer: 'https://mumbai.polygonscan.com',
    privateKey: process.env.PRIVATE_KEY,
    gasLimit: '21150',
    tokens: {
      matic: {
        amount: 0.2,
        maxbalance: 50000000000000000000,
      },
    },
  },
};
