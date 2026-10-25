/**
 * Currency formatter for West African CFA franc (FCFA / XOF)
 */
export function formatFCFA(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

/**
 * Detect carrier for Côte d'Ivoire phone numbers
 * 07 prefix = Orange CI
 * 05 prefix = MTN CI
 * 01 prefix = Moov Africa CI
 */
export function detectCarrier(phone: string): 'ORANGE_CI' | 'MTN_CI' | 'MOOV_CI' | 'AUTRE' {
  const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
  
  // Format with +225 or direct
  let localPart = cleanPhone;
  if (cleanPhone.startsWith('225')) {
    localPart = cleanPhone.substring(3);
  } else if (cleanPhone.startsWith('00225')) {
    localPart = cleanPhone.substring(5);
  }

  if (localPart.startsWith('07') || localPart.startsWith('7')) return 'ORANGE_CI';
  if (localPart.startsWith('05') || localPart.startsWith('5')) return 'MTN_CI';
  if (localPart.startsWith('01') || localPart.startsWith('1')) return 'MOOV_CI';
  return 'AUTRE';
}

/**
 * Format CI Phone number to standard +225 0X XX XX XX XX
 */
export function formatPhoneCI(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  let local = digits;
  if (digits.startsWith('225') && digits.length >= 12) {
    local = digits.substring(3);
  }
  if (local.length === 10) {
    return `+225 ${local.substring(0, 2)} ${local.substring(2, 4)} ${local.substring(4, 6)} ${local.substring(6, 8)} ${local.substring(8, 10)}`;
  }
  return phone;
}

/**
 * Calculate SMS segments based on length
 */
export function calculateSmsSegments(text: string): { chars: number; segments: number; remainingInSegment: number } {
  const chars = text.length;
  if (chars === 0) return { chars: 0, segments: 0, remainingInSegment: 160 };
  if (chars <= 160) {
    return { chars, segments: 1, remainingInSegment: 160 - chars };
  }
  const segments = Math.ceil(chars / 153);
  const remainingInSegment = (segments * 153) - chars;
  return { chars, segments, remainingInSegment };
}

/**
 * Replace dynamic template tags
 */
export function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    const regex = new RegExp(`\\[${key}\\]`, 'g');
    result = result.replace(regex, val || '');
  }
  return result;
}
