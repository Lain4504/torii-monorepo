/**
 * Generate HMAC SHA-256 signature for plugNmeet API authentication
 * Copied from plugNmeet-client implementation
 * @param secretKey - API secret key
 * @param message - Message to sign (JSON stringified request body)
 * @param algorithm - Hash algorithm (default: SHA-256)
 * @returns Hex string signature
 */
export async function getHashSignature(
    secretKey: string,
    message: string,
    algorithm: string = 'SHA-256'
): Promise<string> {
    // Convert the message and secretKey to Uint8Array
    const encoder = new TextEncoder();
    const messageUint8Array = encoder.encode(message);
    const keyUint8Array = encoder.encode(secretKey);

    // Import the secretKey as a CryptoKey
    const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyUint8Array,
        { name: 'HMAC', hash: algorithm },
        false,
        ['sign']
    );

    // Sign the message with HMAC and the CryptoKey
    const signature = await window.crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        messageUint8Array
    );

    // Convert the signature ArrayBuffer to a hex string
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
