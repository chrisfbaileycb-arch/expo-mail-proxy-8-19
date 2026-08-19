/**
 * portal.ts — Customer Destination & Voucher Redirection Portal
 *
 * Builds a channel-specific destination URL with the promo code auto-applied.
 * Supports Online Store/Website, Booking & Scheduling, and VIP Rewards Portal.
 */

export type OrderingPlatform = 'store' | 'booking' | 'promotions' | 'heartland' | 'toast' | 'doordash';

export interface RedirectResult {
  url: string;
  isMobileDeepLink: boolean;
  platform: OrderingPlatform;
}

/** Detect mobile user agents (iOS and Android). */
function isMobileUserAgent(userAgent: string): boolean {
  return /\b(iPhone|iPad|iPod|Android)\b/i.test(userAgent);
}

/** Read platform destination URL from env at call time (not module load time). */
function getPlatformUrl(platform: OrderingPlatform): string {
  switch (platform) {
    case 'store':
      return process.env.ORDERING_URL_STORE || 'https://shop.localbiz.com/store';
    case 'booking':
      return process.env.ORDERING_URL_BOOKING || 'https://booking.localbiz.com/schedule';
    case 'promotions':
      return process.env.ORDERING_URL_PROMO || 'https://rewards.localbiz.com/vip';
    case 'heartland':
      return process.env.ORDERING_URL_HEARTLAND || 'https://booking.localbiz.com/heartland';
    case 'toast':
      return process.env.ORDERING_URL_TOAST || 'https://shop.localbiz.com/toast';
    case 'doordash':
      return process.env.ORDERING_URL_DOORDASH || 'https://rewards.localbiz.com/doordash';
    default:
      return 'https://shop.localbiz.com/store';
  }
}

/**
 * Build the customer redirect URL for a given coupon code and platform.
 *
 * @param couponCode  The promo/coupon code to auto-apply.
 * @param platform    Target customer platform.
 * @param userAgent   Client User-Agent string.
 */
export function buildRedirect(
  couponCode: string,
  platform: OrderingPlatform,
  userAgent: string,
): RedirectResult {
  const isMobile = isMobileUserAgent(userAgent);
  const baseUrl = getPlatformUrl(platform);

  if (!baseUrl) {
    throw new Error(`Destination URL not configured for platform: ${platform}`);
  }

  // Append promo code as query param
  const separator = baseUrl.includes('?') ? '&' : '?';
  const url = `${baseUrl}${separator}promo=${encodeURIComponent(couponCode)}`;

  return {
    url,
    isMobileDeepLink: false,
    platform,
  };
}
