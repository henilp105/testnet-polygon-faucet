https://rpc-mumbai.maticvigil.com/v1/258e1081aff2cd17260b42157a356464f1bcd20d
module.exports = {
  mongo: {
    url: process.env.MONGO_URL,
  },
  timeouts: {
    claimTimeout: 43200000,
  },
  hCaptchaSecret: process.env.HCAPTCHA_SECRET,
  network: {
    rpc: 'https://rpc-mumbai.maticvigil.com/v1/258e1081aff2cd17260b42157a356464f1bcd20d',
    explorer: 'https://mumbai.polygonscan.com',
    privateKey: process.env.PRIVATE_KEY,
    gasLimit: '21150',
    tokens: {
      matic: {
        amount: 0.4,
        maxbalance: 50000000000000000000,
      },
    },
  },
};
