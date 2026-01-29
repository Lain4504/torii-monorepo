/**
 * Message Compression Utility
 * 
 * Provides compression/decompression for whiteboard messages
 * to reduce bandwidth usage in large rooms.
 * 
 * Messages are prefixed with a compression marker byte:
 * - 0x00: Uncompressed data
 * - 0x01: Compressed data (gzip)
 */

const COMPRESSION_MARKER_UNCOMPRESSED = 0x00;
const COMPRESSION_MARKER_COMPRESSED = 0x01;

/**
 * Compress a string using the Compression Streams API
 * Returns data with compression marker prefix
 */
export async function compressMessage(message: string): Promise<Uint8Array> {
  try {
    // Convert string to Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    // Check if CompressionStream is available
    if (typeof CompressionStream === 'undefined') {
      // Fallback: return uncompressed with marker
      const result = new Uint8Array(data.length + 1);
      result[0] = COMPRESSION_MARKER_UNCOMPRESSED;
      result.set(data, 1);
      return result;
    }
    
    // Create compression stream
    const stream = new Blob([data]).stream();
    const compressedStream = stream.pipeThrough(
      new CompressionStream('gzip')
    );
    
    // Convert stream to Uint8Array
    const compressedBlob = await new Response(compressedStream).blob();
    const buffer = await compressedBlob.arrayBuffer();
    const compressed = new Uint8Array(buffer);
    
    // Add compression marker
    const result = new Uint8Array(compressed.length + 1);
    result[0] = COMPRESSION_MARKER_COMPRESSED;
    result.set(compressed, 1);
    
    return result;
  } catch (error) {
    console.error('Compression failed:', error);
    // Return uncompressed with marker on error
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const result = new Uint8Array(data.length + 1);
    result[0] = COMPRESSION_MARKER_UNCOMPRESSED;
    result.set(data, 1);
    return result;
  }
}

/**
 * Decompress a Uint8Array back to string
 * Automatically detects compression based on marker byte
 */
export async function decompressMessage(data: Uint8Array): Promise<string> {
  try {
    // Check for compression marker
    if (data.length === 0) {
      return '';
    }
    
    const marker = data[0];
    const payload = data.slice(1);
    
    // Handle uncompressed data
    if (marker === COMPRESSION_MARKER_UNCOMPRESSED) {
      const decoder = new TextDecoder();
      return decoder.decode(payload);
    }
    
    // Handle compressed data
    if (marker === COMPRESSION_MARKER_COMPRESSED) {
      // Check if DecompressionStream is available
      if (typeof DecompressionStream === 'undefined') {
        throw new Error('DecompressionStream not available but data is marked as compressed');
      }
      
      // Create decompression stream
      const stream = new Blob([payload]).stream();
      const decompressedStream = stream.pipeThrough(
        new DecompressionStream('gzip')
      );
      
      // Convert stream to string
      const decompressedBlob = await new Response(decompressedStream).blob();
      const text = await decompressedBlob.text();
      
      return text;
    }
    
    // Unknown marker - try to decode as uncompressed
    console.warn(`Unknown compression marker: ${marker}, treating as uncompressed`);
    const decoder = new TextDecoder();
    return decoder.decode(payload);
  } catch (error) {
    console.error('Decompression failed:', error);
    // Last resort: try to decode entire buffer as uncompressed
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
