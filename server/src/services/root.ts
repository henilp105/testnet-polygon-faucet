// If you prefer async/await, use the following
export default async function(fastify, opts) {
  fastify.get('/', async function(request, reply) {
    return { root: true };
  });
  fastify.get('/info', async function(request, reply) {
    const faucetBalance = await fastify.getEthBalance();
    const latest20Transactions = await fastify.mongo.db
      .collection('transactions')
      .find({})
      .sort({
        createdAt: -1,
      })
      .limit(20)
      .toArray();
    
     const ipAddress = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
     const visitors = fastify.mongo.db.collection('visitors');

     const existingVisitor = await visitors.findOne({ ipAddress });
      if (existingVisitor) {
        await visitors.updateOne(
          { ipAddress },
          {
            $set: {
              UA: request.headers['user-agent'],
              language: request.headers['accept-language'],
              platform: request.headers['user-agent'].split('(')[1].split(';')[0],
              createdAt: new Date(),
            }
          }
        );
      } else {
        await visitors.insertOne({
          UA: request.headers['user-agent'],
          language: request.headers['accept-language'],
          platform: request.headers['user-agent'].split('(')[1].split(';')[0],
          ipAddress,
          createdAt: new Date(),
        });
      }


    return {
      faucetBalance: fastify.web3.utils.fromWei(faucetBalance, 'ether'),
      claimTimeout: opts.config.timeouts.claimTimeout,
      latest20Transactions,
    };
  });
}
