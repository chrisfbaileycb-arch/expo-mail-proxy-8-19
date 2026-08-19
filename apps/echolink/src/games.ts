/**
 * games.ts — Local Business Gamification Engine (4 Interactive Games)
 *
 * Supported Interactive Games (NO spin-the-wheel):
 * 1. Scratch & Reveal Luxury Card (scratch)
 * 2. Mystery VIP Gift Unboxing (mystery_box)
 * 3. Triple Match Reward Slots (slot_machine)
 * 4. Memory Match & Flip Pairs (match_flip)
 *
 * Business Categories:
 * - retail: Boutique & Retail Shops
 * - cafe: Cafes, Bakeries & Dining
 * - fitness: Fitness Studios & Wellness Centers
 * - services: Professional, Home & Personal Services
 * - general: Universal Local Business Rewards
 */

import { z } from 'zod';
import { createHash } from 'node:crypto';

export type GameType = 'scratch' | 'mystery_box' | 'slot_machine' | 'match_flip';
export type BusinessCategory =
  | 'retail'
  | 'cafe'
  | 'contractors'
  | 'dental_health'
  | 'real_estate'
  | 'tattoo_piercing'
  | 'financial_wealth'
  | 'salon_barber'
  | 'fitness'
  | 'services'
  | 'general';
// Compatibility alias
export type SalonCategory = BusinessCategory | 'hair' | 'barber' | 'nails' | 'spa';

export interface GameReward {
  id: string;
  name: string;
  category: BusinessCategory;
  tier: 'grand' | 'mid' | 'boost' | 'perk';
  value: string;
  code: string;
  description: string;
  instructions: string;
  badgeEmoji: string;
  expiresInDays: number;
}

export interface GameResult {
  gameType: GameType;
  gameTitle: string;
  leadId: string;
  reward: GameReward;
  voucherCode: string;
  expiresAt: string;
  meta: Record<string, any>;
}

export const GamePlaySchema = z.object({
  gameType: z.enum(['scratch', 'mystery_box', 'slot_machine', 'match_flip']),
  leadId: z.string().min(1),
  businessCategory: z.string().optional().default('retail'),
  salonType: z.string().optional(), // backwards-compatible field
  playerAction: z.record(z.any()).optional(),
});

// Local Business Neutral Rewards Catalog
export const BUSINESS_REWARDS: Record<BusinessCategory, GameReward[]> = {
  dental_health: [
    {
      id: 'dental_grand_whitening',
      name: '$75 Off Professional In-Office Teeth Whitening',
      category: 'dental_health',
      tier: 'grand',
      value: '$75 OFF',
      code: 'DENTAL75',
      description: 'Brighten your smile with advanced laser whitening applied by certified dental hygienists.',
      instructions: 'Mention voucher code when scheduling your cleaning or whitening appointment.',
      badgeEmoji: '🦷',
      expiresInDays: 30,
    },
    {
      id: 'dental_sonic_kit',
      name: 'Free Deluxe Sonic Electric Toothbrush VIP Kit',
      category: 'dental_health',
      tier: 'mid',
      value: '$65 Value',
      code: 'SONICKIT',
      description: 'Includes rechargeable sonic toothbrush with 3 extra sensitive replacement brush heads.',
      instructions: 'Claim at reception following your scheduled hygiene appointment.',
      badgeEmoji: '✨',
      expiresInDays: 30,
    },
    {
      id: 'dental_preventive_credit',
      name: '$40 Credit Toward Preventive Hygiene & Exam',
      category: 'dental_health',
      tier: 'boost',
      value: '$40 CREDIT',
      code: 'CLEAN40',
      description: 'Applied directly to co-pay or out-of-pocket balance on comprehensive dental examinations.',
      instructions: 'Show voucher confirmation upon check-in.',
      badgeEmoji: '🩺',
      expiresInDays: 45,
    },
    {
      id: 'dental_fluoride_perk',
      name: 'Free Enamel Strengthening Fluoride Treatment',
      category: 'dental_health',
      tier: 'perk',
      value: '$35 Value',
      code: 'ENAMELCARE',
      description: 'Protective medical-grade fluoride varnish applied during routine cleaning.',
      instructions: 'Automatically added to your next checkup visit.',
      badgeEmoji: '💎',
      expiresInDays: 30,
    },
  ],
  real_estate: [
    {
      id: 're_grand_closing',
      name: '$500 Credit Toward Closing Costs or Home Warranty',
      category: 'real_estate',
      tier: 'grand',
      value: '$500 CREDIT',
      code: 'HOMECREDIT',
      description: 'Applied to closing escrow fees or a 1-year comprehensive buyer/seller home warranty.',
      instructions: 'Present during representation agreement or contract consultation.',
      badgeEmoji: '🏡',
      expiresInDays: 90,
    },
    {
      id: 're_drone_valuation',
      name: 'Free 4K Drone Video & Certified Home Valuation',
      category: 'real_estate',
      tier: 'mid',
      value: '$350 Value',
      code: 'DRONEVAL',
      description: 'Comprehensive comparative market analysis with aerial drone footage for sellers.',
      instructions: 'Book your complimentary property walkthrough online.',
      badgeEmoji: '🚁',
      expiresInDays: 60,
    },
    {
      id: 're_staging_consult',
      name: 'Complimentary Professional Staging Consultation',
      category: 'real_estate',
      tier: 'boost',
      value: '$250 Value',
      code: 'STAGEPRO',
      description: 'Interior staging roadmap and high-impact curb appeal enhancement guide.',
      instructions: 'Redeem prior to listing your home on MLS.',
      badgeEmoji: '🛋️',
      expiresInDays: 60,
    },
    {
      id: 're_inspection_guide',
      name: 'Free VIP Home Buyer Inspection Checklist & Guide',
      category: 'real_estate',
      tier: 'perk',
      value: '$75 Value',
      code: 'BUYERGUIDE',
      description: 'Proprietary inspection checklist, negotiation playbook, and local market trends brief.',
      instructions: 'Instant download delivered via client portal.',
      badgeEmoji: '📋',
      expiresInDays: 30,
    },
  ],
  contractors: [
    {
      id: 'contract_grand_250',
      name: '$250 Off Any Home Renovation Project of $1,000+',
      category: 'contractors',
      tier: 'grand',
      value: '$250 OFF',
      code: 'REMODEL250',
      description: 'Direct discount on kitchen, bath, flooring, roofing, or outdoor living projects.',
      instructions: 'Mention code during in-home estimate and project scoping.',
      badgeEmoji: '🔨',
      expiresInDays: 60,
    },
    {
      id: 'contract_3d_design',
      name: 'Free 3D Architectural Render & Material Planning',
      category: 'contractors',
      tier: 'mid',
      value: '$300 Value',
      code: 'RENDER3D',
      description: 'Full virtual walkthrough and blueprint rendering of your proposed renovation space.',
      instructions: 'Claim with our design team at your first consultation.',
      badgeEmoji: '📐',
      expiresInDays: 45,
    },
    {
      id: 'contract_inspection_free',
      name: 'Complimentary 25-Point Roof & Gutter Inspection',
      category: 'contractors',
      tier: 'boost',
      value: '$150 Value',
      code: 'ROOFCHECK',
      description: 'Thorough drone and physical inspection report detailing condition and weather-proofing.',
      instructions: 'Schedule inspection online with your preferred date.',
      badgeEmoji: '🏠',
      expiresInDays: 30,
    },
    {
      id: 'contract_perk_50',
      name: '$50 Credit Toward Seasonal Home Maintenance',
      category: 'contractors',
      tier: 'perk',
      value: '$50 CREDIT',
      code: 'MAINTAIN50',
      description: 'Valid for HVAC tune-up, power washing, gutter cleaning, or minor drywall repairs.',
      instructions: 'Redeem on service invoice.',
      badgeEmoji: '🧰',
      expiresInDays: 45,
    },
  ],
  tattoo_piercing: [
    {
      id: 'tat_grand_50',
      name: '$50 Off Custom Flash or Full-Day Tattoo Session',
      category: 'tattoo_piercing',
      tier: 'grand',
      value: '$50 OFF',
      code: 'INK50',
      description: 'Valid on custom artwork, full-sleeve sessions, or flash day projects.',
      instructions: 'Show voucher when placing deposit or during booking consultation.',
      badgeEmoji: '🖋️',
      expiresInDays: 45,
    },
    {
      id: 'tat_aftercare_kit',
      name: 'Free Deluxe Botanical Aftercare Kit & Healing Balm',
      category: 'tattoo_piercing',
      tier: 'mid',
      value: '$25 Value',
      code: 'AFTERCARE',
      description: 'All-natural vegan tattoo butter, antimicrobial wash, and sterile barrier film.',
      instructions: 'Given directly by your artist following your session.',
      badgeEmoji: '🌿',
      expiresInDays: 30,
    },
    {
      id: 'tat_jewelry_upgrade',
      name: 'Free Titanium / Gold Fine Piercing Jewelry Upgrade',
      category: 'tattoo_piercing',
      tier: 'boost',
      value: '$30 Value',
      code: 'JEWEL30',
      description: 'Upgrade your piercing to implant-grade titanium or solid 14k gold ends.',
      instructions: 'Select upgraded jewelry at the studio counter.',
      badgeEmoji: '💎',
      expiresInDays: 30,
    },
    {
      id: 'tat_return_credit',
      name: '$20 Loyalty Credit on Next Tattoo or Piercing',
      category: 'tattoo_piercing',
      tier: 'perk',
      value: '$20 CREDIT',
      code: 'INKLOYAL20',
      description: 'Savings voucher on touch-ups, additional piercings, or subsequent tattoos.',
      instructions: 'Valid on appointments within 60 days.',
      badgeEmoji: '⭐',
      expiresInDays: 60,
    },
  ],
  financial_wealth: [
    {
      id: 'fin_grand_roadmap',
      name: 'Free Comprehensive Retirement & Tax Blueprint',
      category: 'financial_wealth',
      tier: 'grand',
      value: '$450 Value',
      code: 'WEALTHPLAN',
      description: 'Tailored stress-test analysis, Social Security optimization, and tax-efficient wealth distribution model.',
      instructions: 'Claim during your dedicated strategy consultation.',
      badgeEmoji: '📈',
      expiresInDays: 60,
    },
    {
      id: 'fin_fee_rebate',
      name: '$150 Portfolio Advisory Fee Credit / Rebate',
      category: 'financial_wealth',
      tier: 'mid',
      value: '$150 CREDIT',
      code: 'REBATE150',
      description: 'Applied directly to initial advisory or management fees on actively managed portfolios.',
      instructions: 'Credited on your onboarding client agreement.',
      badgeEmoji: '💼',
      expiresInDays: 45,
    },
    {
      id: 'fin_estate_review',
      name: 'Complimentary Estate & Beneficiary Audit Review',
      category: 'financial_wealth',
      tier: 'boost',
      value: '$250 Value',
      code: 'ESTATEPRO',
      description: 'Audit wills, trusts, and beneficiary designations to safeguard family assets.',
      instructions: 'Schedule with a wealth advisor.',
      badgeEmoji: '🛡️',
      expiresInDays: 45,
    },
    {
      id: 'fin_market_perk',
      name: 'VIP Quarterly Market Intelligence & Economic Brief',
      category: 'financial_wealth',
      tier: 'perk',
      value: '$50 Value',
      code: 'MARKETINSIGHT',
      description: 'Institutional-grade market commentary, interest rate projections, and sector analysis.',
      instructions: 'Instant digital access sent to your email.',
      badgeEmoji: '📊',
      expiresInDays: 30,
    },
  ],
  salon_barber: [
    {
      id: 'salon_grand_25',
      name: '$25 Off Precision Cut, Color, or Balayage Session',
      category: 'salon_barber',
      tier: 'grand',
      value: '$25 OFF',
      code: 'GLAM25',
      description: 'Valid for women and men styling, master barber fades, color glaze, or luxury balayage.',
      instructions: 'Mention code at checkout or when booking online.',
      badgeEmoji: '✂️',
      expiresInDays: 21,
    },
    {
      id: 'salon_scalp_massage',
      name: 'Free Deep Conditioning Scalp Treatment & Steam',
      category: 'salon_barber',
      tier: 'mid',
      value: '$30 Value',
      code: 'SCALPWELL',
      description: 'Rejuvenating botanical scalp exfoliation, hot towel wrap, and steam infusion.',
      instructions: 'Claim with any haircut or styling service.',
      badgeEmoji: '💆',
      expiresInDays: 30,
    },
    {
      id: 'salon_beard_upgrade',
      name: 'Free Hot-Towel Beard Sculpting or Gloss Treatment',
      category: 'salon_barber',
      tier: 'boost',
      value: '$20 Value',
      code: 'SCULPTPRO',
      description: 'Razor sharp line-up, organic conditioning oil, and eucalyptus hot towel press.',
      instructions: 'Included with your master haircut appointment.',
      badgeEmoji: '💈',
      expiresInDays: 21,
    },
    {
      id: 'salon_perk_15',
      name: '$15 Rebooking Credit on Your Next 4-Week Visit',
      category: 'salon_barber',
      tier: 'perk',
      value: '$15 OFF',
      code: 'REBOOK15',
      description: 'Keep your style pristine with automatic savings on scheduled 4-week appointments.',
      instructions: 'Automatically credited when setting your return date.',
      badgeEmoji: '✨',
      expiresInDays: 28,
    },
  ],
  retail: [
    {
      id: 'retail_grand_25',
      name: '$25 Off Any In-Store Purchase of $75+',
      category: 'retail',
      tier: 'grand',
      value: '$25 OFF',
      code: 'RETAIL25',
      description: 'Exclusive instant savings voucher applied at checkout on any new arrivals or merchandise.',
      instructions: 'Present barcode/code at cash register upon purchase.',
      badgeEmoji: '🛍️',
      expiresInDays: 14,
    },
    {
      id: 'retail_gift_purchase',
      name: 'Complimentary VIP Gift with Any Purchase',
      category: 'retail',
      tier: 'mid',
      value: '$18 Value',
      code: 'VIPGIFT',
      description: 'Curated premium accessory or signature gift item packed with your shopping bag.',
      instructions: 'Claim with staff when completing any transaction.',
      badgeEmoji: '🎁',
      expiresInDays: 21,
    },
    {
      id: 'retail_tier_boost',
      name: 'Double VIP Loyalty Points on Today’s Visit',
      category: 'retail',
      tier: 'boost',
      value: '2X POINTS',
      code: 'POINTS2X',
      description: 'Accelerate your customer rewards balance with 2x points applied instantly.',
      instructions: 'Automatically credited to your linked mobile number.',
      badgeEmoji: '⭐',
      expiresInDays: 30,
    },
    {
      id: 'retail_perk_10',
      name: '$10 Off Next Seasonal Collection Visit',
      category: 'retail',
      tier: 'perk',
      value: '$10 OFF',
      code: 'SEASON10',
      description: 'Bonus store credit toward your next shopping visit.',
      instructions: 'Valid in-store or on customer online portal.',
      badgeEmoji: '🏷️',
      expiresInDays: 28,
    },
  ],
  cafe: [
    {
      id: 'cafe_grand_10',
      name: '$10 Off Fresh Pastry Box & Coffee Order of $25+',
      category: 'cafe',
      tier: 'grand',
      value: '$10 OFF',
      code: 'BAKERY10',
      description: 'Enjoy delicious handcrafted artisan pastries, morning croissants, and specialty coffee.',
      instructions: 'Show at register counter upon ordering.',
      badgeEmoji: '🥐',
      expiresInDays: 14,
    },
    {
      id: 'cafe_free_beverage',
      name: 'Complimentary Artisan Beverage or Specialty Latte',
      category: 'cafe',
      tier: 'mid',
      value: '$7.50 Value',
      code: 'SIPFREE',
      description: 'Your choice of single-origin pour over, handcrafted matcha latte, or organic cold brew.',
      instructions: 'Redeem at counter on your next visit.',
      badgeEmoji: '☕',
      expiresInDays: 21,
    },
    {
      id: 'cafe_coffee_beans',
      name: 'Free 4oz Sample Bag of Single-Origin Roasted Beans',
      category: 'cafe',
      tier: 'boost',
      value: '$8.00 Value',
      code: 'ROASTBAG',
      description: 'Freshly roasted whole-bean coffee packaged in our eco-friendly degassing valve pouch.',
      instructions: 'Claim with any beverage or pastry purchase.',
      badgeEmoji: '🫘',
      expiresInDays: 21,
    },
    {
      id: 'cafe_perk_cookie',
      name: 'Free Handcrafted Gourmet Cookie or Scone Perk',
      category: 'cafe',
      tier: 'perk',
      value: '$5.50 Value',
      code: 'SWEETBITE',
      description: 'Warm sea-salt chocolate chip cookie or seasonal berry crumb scone baked fresh daily.',
      instructions: 'Valid with any coffee or tea order.',
      badgeEmoji: '🍪',
      expiresInDays: 14,
    },
  ],
  fitness: [
    {
      id: 'fit_grand_session',
      name: 'Complimentary 1-on-1 Training & Assessment Session',
      category: 'fitness',
      tier: 'grand',
      value: '$85 Value',
      code: 'FITPRO85',
      description: 'Comprehensive mobility screening, body composition scan, and personalized coaching session.',
      instructions: 'Book online or schedule at studio front desk.',
      badgeEmoji: '💪',
      expiresInDays: 14,
    },
    {
      id: 'fit_class_discount',
      name: '$25 Off Any Class Pack or Monthly Pass',
      category: 'fitness',
      tier: 'mid',
      value: '$25 OFF',
      code: 'STUDIO25',
      description: 'Valid for Pilates, yoga, HIIT, spin, or strength group training packages.',
      instructions: 'Apply code at checkout on the studio website.',
      badgeEmoji: '🧘',
      expiresInDays: 21,
    },
    {
      id: 'fit_recovery_pass',
      name: 'Free Recovery Lounge & Sauna Access Pass',
      category: 'fitness',
      tier: 'boost',
      value: '$30 Value',
      code: 'RECOVERWELL',
      description: '30-minute compression therapy, infrared sauna, and hydration lounge access.',
      instructions: 'Reserve your recovery slot at studio desk.',
      badgeEmoji: '🧊',
      expiresInDays: 30,
    },
    {
      id: 'fit_perk_shake',
      name: 'Free Post-Workout Organic Protein Smoothie',
      category: 'fitness',
      tier: 'perk',
      value: '$9.50 Value',
      code: 'SMOOTHIEBOOST',
      description: 'Cold-pressed recovery blend crafted at the studio juice bar.',
      instructions: 'Claim immediately after your workout.',
      badgeEmoji: '🥤',
      expiresInDays: 14,
    },
  ],
  services: [
    {
      id: 'service_grand_consult',
      name: '$35 Credit Toward Any Service Appointment',
      category: 'services',
      tier: 'grand',
      value: '$35 CREDIT',
      code: 'CREDIT35',
      description: 'Generous credit valid across all premier consultation, maintenance, or booking services.',
      instructions: 'Applied directly to your invoice or online appointment.',
      badgeEmoji: '💼',
      expiresInDays: 21,
    },
    {
      id: 'service_mid_upgrade',
      name: 'Complimentary Premium Package Upgrade',
      category: 'services',
      tier: 'mid',
      value: '$25 Value',
      code: 'UPGRADEPRO',
      description: 'Complimentary priority scheduling, extended duration, or enhanced service tier.',
      instructions: 'Mention voucher code when scheduling.',
      badgeEmoji: '⚡',
      expiresInDays: 30,
    },
    {
      id: 'service_boost_perk',
      name: 'Free Consultation & Assessment Report',
      category: 'services',
      tier: 'boost',
      value: '$40 Value',
      code: 'ASSESSFREE',
      description: 'In-depth diagnostic overview and tailored recommendations roadmap.',
      instructions: 'Redeem during initial intake session.',
      badgeEmoji: '📋',
      expiresInDays: 30,
    },
    {
      id: 'service_perk_voucher',
      name: '$15 Loyalty Bonus on Next Scheduled Visit',
      category: 'services',
      tier: 'perk',
      value: '$15 OFF',
      code: 'LOYAL15',
      description: 'Direct savings on your return service booking.',
      instructions: 'Valid on appointments booked within 30 days.',
      badgeEmoji: '🤝',
      expiresInDays: 30,
    },
  ],
  general: [
    {
      id: 'gen_grand_20',
      name: '$20 Off Your Total Bill of $50+',
      category: 'general',
      tier: 'grand',
      value: '$20 OFF',
      code: 'SAVE20',
      description: 'Direct in-store or online savings voucher for valued local guests.',
      instructions: 'Show voucher code during checkout.',
      badgeEmoji: '🎉',
      expiresInDays: 14,
    },
    {
      id: 'gen_mid_gift',
      name: 'Complimentary Welcome Gift & VIP Pass',
      category: 'general',
      tier: 'mid',
      value: '$15 Value',
      code: 'WELCOMEGIFT',
      description: 'Curated welcome gift and enrollment in our priority customer circle.',
      instructions: 'Claim with staff on your visit.',
      badgeEmoji: '🎁',
      expiresInDays: 21,
    },
    {
      id: 'gen_boost_upgrade',
      name: 'Free Service or Product Upgrade',
      category: 'general',
      tier: 'boost',
      value: '$12 Value',
      code: 'UPGRADE12',
      description: 'Complimentary addition to your order or appointment package.',
      instructions: 'Present at counter or point of sale.',
      badgeEmoji: '⭐',
      expiresInDays: 30,
    },
    {
      id: 'gen_perk_bounce',
      name: '$10 Off Your Next Return Visit',
      category: 'general',
      tier: 'perk',
      value: '$10 OFF',
      code: 'BOUNCE10',
      description: 'Exclusive return customer voucher to keep the rewards flowing.',
      instructions: 'Valid on your subsequent visit.',
      badgeEmoji: '🏷️',
      expiresInDays: 30,
    },
  ],
};

function normalizeCategory(cat?: string): BusinessCategory {
  if (!cat) return 'retail';
  const c = cat.toLowerCase();
  if (['dental', 'dental_health', 'dentist', 'health', 'clinic', 'medical'].some(k => c.includes(k))) return 'dental_health';
  if (['real_estate', 'realtor', 'broker', 'property', 'homes'].some(k => c.includes(k))) return 'real_estate';
  if (['contractor', 'contractors', 'remodel', 'roofing', 'hvac', 'plumbing', 'construction'].some(k => c.includes(k))) return 'contractors';
  if (['tattoo', 'tattoo_piercing', 'piercing', 'ink', 'parlor'].some(k => c.includes(k))) return 'tattoo_piercing';
  if (['financial', 'financial_wealth', 'wealth', 'advisor', 'finance', 'invest'].some(k => c.includes(k))) return 'financial_wealth';
  if (['barber', 'salon', 'salon_barber', 'hair', 'spa', 'massage', 'nails'].some(k => c.includes(k))) return 'salon_barber';
  if (['cafe', 'bakery', 'coffee', 'espresso', 'pastry'].some(k => c.includes(k))) return 'cafe';
  if (['retail', 'shop', 'boutique', 'store'].some(k => c.includes(k))) return 'retail';
  if (['fitness', 'gym', 'yoga', 'pilates', 'studio'].some(k => c.includes(k))) return 'fitness';
  if (['services', 'service', 'consulting'].some(k => c.includes(k))) return 'services';
  return 'general';
}

/**
 * Executes a game roll with fair weighted distribution.
 */
export function playSalonGame(
  gameType: GameType,
  leadId: string,
  categoryInput: string = 'retail',
  rng: () => number = Math.random
): GameResult {
  const cat = normalizeCategory(categoryInput);
  const rewards = BUSINESS_REWARDS[cat] || BUSINESS_REWARDS.retail;

  // Weighted odds: Grand (15%), Mid (30%), Boost (30%), Perk (25%)
  const roll = rng();
  let selectedReward: GameReward;
  if (roll < 0.15) {
    selectedReward = rewards.find((r) => r.tier === 'grand') || rewards[0];
  } else if (roll < 0.45) {
    selectedReward = rewards.find((r) => r.tier === 'mid') || rewards[1];
  } else if (roll < 0.75) {
    selectedReward = rewards.find((r) => r.tier === 'boost') || rewards[2];
  } else {
    selectedReward = rewards.find((r) => r.tier === 'perk') || rewards[3];
  }

  // Generate unique redemption voucher code
  const hashSuffix = createHash('sha256')
    .update(`${leadId}-${selectedReward.id}-${Date.now()}`)
    .digest('hex')
    .slice(0, 6)
    .toUpperCase();
  const voucherCode = `${selectedReward.code}-${hashSuffix}`;

  const expiresDate = new Date();
  expiresDate.setDate(expiresDate.getDate() + selectedReward.expiresInDays);

  const gameTitles: Record<GameType, string> = {
    scratch: '✨ Scratch & Reveal Luxury Reward',
    mystery_box: '🎁 Mystery VIP Gift Unboxing',
    slot_machine: '🎰 Triple Match Reward Slots',
    match_flip: '🃏 Memory Match & Flip Pairs',
  };

  // Game specific metadata
  let meta: Record<string, any> = {};
  if (gameType === 'slot_machine') {
    const matchedIcon = selectedReward.badgeEmoji || '⭐';
    meta = {
      reels: [matchedIcon, matchedIcon, matchedIcon],
      isJackpot: selectedReward.tier === 'grand',
      payline: 'Triple Match',
    };
  } else if (gameType === 'mystery_box') {
    meta = {
      selectedBoxIndex: Math.floor(rng() * 3),
      boxColor: ['Rose Gold Luxury Box', 'Champagne Silk Box', 'Emerald Velvet Box'][Math.floor(rng() * 3)],
    };
  } else if (gameType === 'scratch') {
    meta = {
      scratchCoverageRequired: '70%',
      foilColor: '#D4A373',
    };
  } else if (gameType === 'match_flip') {
    meta = {
      matchedPairsCount: 3,
      timeElapsedSeconds: 12,
    };
  }

  return {
    gameType,
    gameTitle: gameTitles[gameType],
    leadId,
    reward: selectedReward,
    voucherCode,
    expiresAt: expiresDate.toISOString(),
    meta,
  };
}

export function getAllSalonRewards(): Record<BusinessCategory, GameReward[]> {
  return BUSINESS_REWARDS;
}
