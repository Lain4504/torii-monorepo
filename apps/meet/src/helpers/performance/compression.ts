/**
 * Message Compression Utility
 * 
 * Provides compression/decompression for whiteboard messages
 * to reduce bandwidth usage in large rooms
 */

/**
 * Compress a string using the Compression Streams API
 * This is natively supported in modern browsers
 */
export async function compressMessage(message: string): Promise<Uint8Array> {
  try {
    // Convert string to Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    // Check if CompressionStream is available
    if (typeof CompressionStream === 'undefined') {
      // Fallback: return uncompressed if not available
      return data;
    }
    
    // Create compression stream
    const stream = new Blob([data]).stream();
    const compressedStream = stream.pipeThrough(
      new CompressionStream('gzip')
    );
    
    // Convert stream to Uint8Array
    const compressedBlob = await new Response(compressedStream).blob();
    const buffer = await compressedBlob.arrayBuffer();
    
    return new Uint8Array(buffer);
  } catch (error) {
    console.error('Compression failed:', error);
    // Return original data on error
    const encoder = new TextEncoder();
    return encoder.encode(message);
  }
}

/**
 * Decompress a Uint8Array back to string
 */
export async function decompressMessage(data: Uint8Array): Promise<string> {
  try {
    // Check if DecompressionStream is available
    if (typeof DecompressionStream === 'undefined') {
      // Fallback: treat as uncompressed
      const decoder = new TextDecoder();
      return decoder.decode(data);
    }
    
    // Create decompression stream
    const stream = new Blob([data]).stream();
    const decompressedStream = stream.pipeThrough(
      new DecompressionStream('gzip')
    );
    
    // Convert stream to string
    const decompressedBlob = await new Response(decompressedStream).blob();
    const text = await decompressedBlob.text();
    
    return text;
  } catch (error) {
    console.error('Decompression failed:', error);
    // Try to decode as uncompressed on error
    const decoder = new TextDecoder();
    return decoder.decode(data);
  }
}

/**
 * Check if compression would be beneficial
 * @param message The message to check
 * @param threshold Size threshold in bytes
 */
export function shouldCompress(message: string, threshold: number): boolean {
  const encoder = new TextEncoder();
  const size = encoder.encode(message).length;
  return size > threshold;
}

/**
 * Get message size in bytes
 */
export function getMessageSize(message: string): number {
  const encoder = new TextEncoder();
  return encoder.encode(message).length;
}

/**
 * Check if compression is supported by the browser
 */
export function isCompressionSupported(): boolean {
  return typeof CompressionStream !== 'undefined' && 
         typeof DecompressionStream !== 'undefined';
}
