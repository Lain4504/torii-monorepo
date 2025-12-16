const { nkeys } = require('nats');

// From your .env file
const accountSeed = process.env.NATS_ACCOUNT_SEED || 'SAxxxx...';

// From nats_server.conf line 74
const expectedPublicKey = 'ADQJVKRRWCB32QRIR6OL6WDSTOK6VLZCLI7Z3WGZWJCP2UFH4EXLHHJ6';

try {
    const kp = nkeys.fromSeed(Buffer.from(accountSeed));
    const actualPublicKey = kp.getPublicKey();

    console.log('='.repeat(60));
    console.log('🔑 NATS Account Key Verification');
    console.log('='.repeat(60));
    console.log('');
    console.log('Account Seed (from .env):');
    console.log('  ', accountSeed);
    console.log('');
    console.log('Expected Public Key (from nats_server.conf):');
    console.log('  ', expectedPublicKey);
    console.log('');
    console.log('Actual Public Key (derived from seed):');
    console.log('  ', actualPublicKey);
    console.log('');
    console.log('Match:', actualPublicKey === expectedPublicKey ? '✅ YES' : '❌ NO');
    console.log('');

    if (actualPublicKey !== expectedPublicKey) {
        console.log('⚠️  MISMATCH! NATS server will reject all auth responses!');
        console.log('');
        console.log('Fix options:');
        console.log('1. Update nats_server.conf line 74:');
        console.log('     issuer:', actualPublicKey);
        console.log('');
        console.log('2. OR generate new Account Seed that matches the expected public key');
        console.log('   (You cannot reverse-engineer a seed from a public key)');
    } else {
        console.log('✅ Configuration is correct!');
    }
    console.log('');
    console.log('='.repeat(60));
} catch (e) {
    console.error('❌ Error:', e.message);
    console.log('');
    console.log('Make sure NATS_ACCOUNT_SEED is set in your .env file');
    console.log('It should start with "SA" (Account Seed)');
}
