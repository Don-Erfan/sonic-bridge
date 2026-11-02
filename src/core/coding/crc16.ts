const TABLE: Uint16Array = (() => {
  const table = new Uint16Array(256);
  for (let i = 0; i < 256; i++) {
    let crc = i << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
    table[i] = crc;
  }
  return table;
})();

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF). Accepts several chunks to avoid copies. */
export function crc16(...chunks: readonly Uint8Array[]): number {
  let crc = 0xffff;
  for (const chunk of chunks) {
    for (const byte of chunk) {
      crc = ((crc << 8) & 0xffff) ^ TABLE[((crc >> 8) ^ byte) & 0xff]!;
    }
  }
  return crc;
}
