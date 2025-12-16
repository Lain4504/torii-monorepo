const nkeys = require('nats').nkeys;

// From .env
const issuerSeed = 'SAAMTMBUANSRW3XDXZBIBF4JYRRUMWGV2GZT5MQ54VNWNRPN2Y4J46NQSA';

// From nats_server.conf line 42
const expectedIssuerPublicKey = 'AD7EHM6WBIVERNVY6K7T3QEL62EB2BNMK4TTHXTUHTYSJGS3SZFZ4HX5';

try {
    const kp = nkeys.fromSeed(Buffer.from(issuerSeed));
    const publicKey = kp.getPublicKey();

    console.log('Issuer Seed from .env:', issuerSeed);
    console.log('Public key:', publicKey);
    console.log('Expected (from nats_server.conf):', expectedIssuerPublicKey);
    console.log('Match:', publicKey === expectedIssuerPublicKey ? '✅ YES' : '❌ NO');

    if (publicKey !== expectedIssuerPublicKey) {
        console.log('\n⚠️  MISMATCH! NATS server will reject all auth responses!');
        console.log('\nFix: Update nats_server.conf line 42:');
        console.log('  issuer:', publicKey);
    }
} catch (e) {
    console.error('Error:', e.message);
}
