const { nkeys } = require('nats');

// Test Account Seed
const accountSeed = 'SAAB4IFWUI2KFNAXDT44WX2SSUTGCT46TBBLU2BN2CXKPDXDELRK5DJI74';

try {
    const kp = nkeys.fromSeed(Buffer.from(accountSeed));
    const publicKey = kp.getPublicKey();

    console.log('✅ Account Public Key:', publicKey);
    console.log('');

    // Test JWT signing
    const testPayload = {
        jti: 'test-123',
        iat: Math.floor(Date.now() / 1000),
        iss: publicKey,
        sub: 'TEST',
        aud: 'PNM',
        nats: {
            type: 'user',
            version: 2
        }
    };

    // Method 1: Custom signing (current implementation)
    const header = { typ: 'JWT', alg: 'ed25519-nkey' };
    const headerEnc = base64UrlEncode(JSON.stringify(header));
    const payloadEnc = base64UrlEncode(JSON.stringify(testPayload));
    const input = `${headerEnc}.${payloadEnc}`;
    const sig = kp.sign(Buffer.from(input));
    const sigEnc = base64UrlEncode(sig);
    const customJwt = `${input}.${sigEnc}`;

    console.log('Custom JWT (first 100 chars):');
    console.log(customJwt.substring(0, 100) + '...');
    console.log('');

    // Decode and verify
    const parts = customJwt.split('.');
    console.log('JWT Parts:');
    console.log('  Header:', Buffer.from(parts[0], 'base64').toString());
    console.log('  Payload (first 100 chars):', Buffer.from(base64UrlDecode(parts[0]), 'utf8').toString().substring(0, 100));
    console.log('  Signature length:', parts[2].length);
    console.log('');

    // Verify signature
    const verified = kp.verify(Buffer.from(input), base64UrlDecodeToBuffer(parts[2]));
    console.log('✅ Signature verified:', verified);

} catch (e) {
    console.error('❌ Error:', e.message);
    console.error(e.stack);
}

function base64UrlEncode(input) {
    const buf = Buffer.from(input);
    return buf.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function base64UrlDecode(input) {
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    return base64;
}

function base64UrlDecodeToBuffer(input) {
    return Buffer.from(base64UrlDecode(input), 'base64');
}
