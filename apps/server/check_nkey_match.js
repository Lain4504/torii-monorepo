const nkeys = require('nats/lib/nkeys');

// From .env
const nkeySeed = 'SUAGSRI6D537QEHEK7G5KAN4KINSL77FTRTAJGA2KTFRR7AIOMA43P4PRE';

// From nats_server.conf
const expectedPublicKey = 'UD4JADBMDSQCA5D475KSMFV43TAINASJ3TIEFQ7LP43XENPMQYFTRFKP';

try {
    const kp = nkeys.fromSeed(Buffer.from(nkeySeed));
    const publicKey = kp.getPublicKey();

    console.log('Seed from .env:', nkeySeed);
    console.log('Public key:', publicKey);
    console.log('Expected (from nats_server.conf):', expectedPublicKey);
    console.log('Match:', publicKey === expectedPublicKey ? '✅ YES' : '❌ NO');

    if (publicKey !== expectedPublicKey) {
        console.log('\n⚠️  MISMATCH! Server will reject auth callout from this NKEY.');
        console.log('Solution: Update nats_server.conf auth_users to include:', publicKey);
    }
} catch (e) {
    console.error('Error:', e.message);
}
