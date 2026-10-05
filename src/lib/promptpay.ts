/**
 * PromptPay EMVCo QR Code Payload Generator
 * Conforms to Bank of Thailand & EMVCo Standard Specifications
 */

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function fTag(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export function formatPromptPayTarget(target: string): { type: 'phone' | 'id' | 'wallet'; formatted: string } {
  const cleaned = target.replace(/[^0-9]/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // Mobile Phone: 0812345678 -> 0066812345678
    return {
      type: 'phone',
      formatted: `0066${cleaned.substring(1)}`,
    };
  } else if (cleaned.length === 13) {
    // National ID or Tax ID
    return {
      type: 'id',
      formatted: cleaned,
    };
  } else if (cleaned.length === 15) {
    // E-Wallet ID
    return {
      type: 'wallet',
      formatted: cleaned,
    };
  }
  // Default to phone fallback
  return {
    type: 'phone',
    formatted: `0066${cleaned.padStart(9, '0')}`,
  };
}

export function generatePromptPayPayload(target: string, amount?: number): string {
  const { type, formatted } = formatPromptPayTarget(target);

  // Sub-tags for Merchant Account Information (Tag 29)
  const aid = fTag('00', 'A000000677010111');
  const targetTag = type === 'phone' ? fTag('01', formatted) : type === 'id' ? fTag('02', formatted) : fTag('03', formatted);
  const tag29 = fTag('29', `${aid}${targetTag}`);

  // Base EMVCo Tags
  let payload = '';
  payload += fTag('00', '01'); // Payload Format Indicator
  payload += fTag('01', amount ? '12' : '11'); // 12 = Dynamic (with amount), 11 = Static
  payload += tag29;
  payload += fTag('53', '764'); // Currency: 764 = THB

  if (amount !== undefined && amount > 0) {
    const formattedAmount = amount.toFixed(2);
    payload += fTag('54', formattedAmount);
  }

  payload += fTag('58', 'TH'); // Country Code

  // Checksum Tag 63 with length 04
  const payloadToCrc = `${payload}6304`;
  const checksum = crc16(payloadToCrc);

  return `${payloadToCrc}${checksum}`;
}

/**
 * Returns QR Code Image URL (using reliable SVG / CDN data)
 */
export function getPromptPayQRUrl(target: string, amount: number): string {
  const payload = generatePromptPayPayload(target, amount);
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=${encodeURIComponent(payload)}`;
}
