/**
 * video-service.ts — Local Business Video Library & AI End-Video Recommender
 *
 * Provides curated promotional, educational, and onboarding video templates
 * for local businesses (Retail, Cafes/Dining, Fitness/Studios, Services).
 *
 * Features an intelligent recommendation engine that suggests the ideal
 * end-video embed based on outbound email/SMS promotional content.
 */

export interface BusinessVideo {
  id: string;
  title: string;
  category:
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
  duration: string;
  instructor: string;
  tags: string[];
  thumbnailUrl: string;
  videoUrl: string;
  summary: string;
  businessProTip: string;
  recommendedEmailHeading: string;
  ctaText: string;
}

export const BUSINESS_VIDEOS: BusinessVideo[] = [
  {
    id: 'vid_dental_whitening',
    title: 'Smile Radiance: In-Office Laser Whitening & Preventive Care Guide',
    category: 'dental_health',
    duration: '0:08',
    instructor: 'Lead Dental Hygienist',
    tags: ['dental', 'teeth', 'whitening', 'cleaning', 'hygiene', 'health', 'smile', 'checkup', 'preventive'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1200&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    summary: 'A quick 8-second visual guide on how modern in-office laser whitening and preventive hygiene appointments keep your smile radiant and protected.',
    businessProTip: 'Remind patients to avoid coffee or dark beverages for 48 hours after whitening treatments to lock in enamel brightness.',
    recommendedEmailHeading: '🦷 8-Second Smile Care & Laser Whitening Walkthrough',
    ctaText: 'Watch Smile Care Clip (8s)',
  },
  {
    id: 'vid_re_tour',
    title: 'Exclusive Property Walkthrough: Drone Tour & Staging Roadmap',
    category: 'real_estate',
    duration: '0:09',
    instructor: 'Principal Broker & Listing Team',
    tags: ['real estate', 'realtor', 'property', 'homes', 'listing', 'drone', 'staging', 'buyer', 'seller', 'valuation'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    summary: 'Cinematic drone fly-through showcasing neighborhood amenities, high-impact staging highlights, and buyer presentation tips.',
    businessProTip: 'Proper staging and drone aerials reduce market time by up to 45% and attract premium qualified offers.',
    recommendedEmailHeading: '🏡 Take a 9-Second Drone Tour & Market Valuation Brief',
    ctaText: 'Watch Virtual Home Tour (9s)',
  },
  {
    id: 'vid_contract_renovation',
    title: 'Master Craftsmanship: 3D Renovation Design & Quality Build',
    category: 'contractors',
    duration: '0:08',
    instructor: 'Master Builder & Project Lead',
    tags: ['contractor', 'renovation', 'remodel', 'kitchen', 'bath', 'construction', 'roofing', '3d design', 'craftsmanship'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    summary: 'Step behind the scenes of a custom remodel, from 3D architectural rendering to structural precision and finished luxury touches.',
    businessProTip: 'Share 3D design renders with clients early in the estimation phase to align expectations and accelerate permit approvals.',
    recommendedEmailHeading: '🔨 8-Second Remodel Blueprint & Craftsmanship Tour',
    ctaText: 'Watch 3D Design Preview (8s)',
  },
  {
    id: 'vid_tat_studio',
    title: 'Sterile Artistry: Custom Tattoo Session & Flash Gallery Preview',
    category: 'tattoo_piercing',
    duration: '0:09',
    instructor: 'Resident Tattoo Artist',
    tags: ['tattoo', 'piercing', 'ink', 'art', 'flash', 'aftercare', 'fine jewelry', 'studio', 'custom design'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=1200&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    summary: 'Explore custom ink design drafting, sterile needle setup, and premium titanium piercing jewelry placements.',
    businessProTip: 'Proper botanical aftercare applied in the first 72 hours maintains vibrant color saturation and crisp line work.',
    recommendedEmailHeading: '🖋️ 9-Second Studio Tour & Custom Flash Gallery Preview',
    ctaText: 'Watch Studio Artistry Clip (9s)',
  },
  {
    id: 'vid_fin_wealth',
    title: 'Strategic Wealth: 3 Pillars of Tax-Efficient Retirement Planning',
    category: 'financial_wealth',
    duration: '0:08',
    instructor: 'Certified Financial Planner',
    tags: ['financial', 'wealth', 'advisor', 'retirement', 'tax', 'invest', 'estate', 'portfolio', 'planning'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    summary: 'Essential 8-second briefing on tax diversification, risk-adjusted portfolio growth, and legacy estate safeguarding.',
    businessProTip: 'Conduct annual beneficiary reviews to prevent costly probate delays and preserve tax-sheltered advantages.',
    recommendedEmailHeading: '📈 8-Second Wealth & Tax-Efficient Planning Overview',
    ctaText: 'Watch Retirement Brief (8s)',
  },
  {
    id: 'vid_salon_styling',
    title: 'Master Styling & Cut: Precision Fades, Balayage & Scalp Wellness',
    category: 'salon_barber',
    duration: '0:09',
    instructor: 'Master Stylist & Barber',
    tags: ['barber', 'salon', 'hair', 'fade', 'balayage', 'styling', 'scalp', 'spa', 'massage', 'cut'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    summary: 'Watch razor-sharp line ups, luxury hair coloring techniques, and botanical scalp steam treatments in action.',
    businessProTip: 'Booking regular 4-week haircut cadences maintains edge geometry and scalp health.',
    recommendedEmailHeading: '✂️ 9-Second Precision Cut & Style Preview',
    ctaText: 'Watch Styling Session (9s)',
  },
  {
    id: 'vid_vip_welcome',
    title: 'Welcome to the VIP Club: Unlocking Exclusive Rewards & Perks',
    category: 'general',
    duration: '0:08',
    instructor: 'Community Experience Team',
    tags: ['welcome', 'vip', 'points', 'onboarding', 'rewards', 'loyalty', 'first visit'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=1200&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    summary: 'A warm introduction to our local community circle, detailing how every in-store or online visit accumulates trackable reward vouchers.',
    businessProTip: 'Show your welcome barcode on your mobile device at checkout to receive your complimentary gift.',
    recommendedEmailHeading: '🎬 Watch Your 8-Second VIP Welcome & Reward Guide',
    ctaText: 'View Welcome Video (8s)',
  },
  {
    id: 'vid_retail_arrivals',
    title: 'New Season Arrivals & Exclusive In-Store Styling Guide',
    category: 'retail',
    duration: '0:09',
    instructor: 'Store Curator',
    tags: ['retail', 'arrivals', 'boutique', 'fashion', 'collection', 'shopping', 'sale', 'flash promo'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    summary: 'Discover curated seasonal favorites, handcrafted artisan goods, and limited-batch releases in our latest collection drop.',
    businessProTip: 'New arrivals are limited in quantity — reserve your favorite pieces online or visit our boutique this weekend.',
    recommendedEmailHeading: '✨ Behind the Drop: Watch the New Collection Preview',
    ctaText: 'Watch Collection Reel (9s)',
  },
  {
    id: 'vid_cafe_craft',
    title: 'The Art of the Roast: Handcrafted Specialty Blends & Pastry Pairings',
    category: 'cafe',
    duration: '0:08',
    instructor: 'Master Roaster & Pastry Chef',
    tags: ['cafe', 'coffee', 'bakery', 'roast', 'latte', 'pastry', 'espresso', 'croissant', 'scone'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    summary: 'Experience single-origin bean selections, slow-fermented organic bakery treats, and secret seasonal flavor pairings.',
    businessProTip: 'Pair our single-origin pour-over with fresh morning croissants baked daily at 6:30 AM.',
    recommendedEmailHeading: '☕ Craft & Savor: Meet Your Barista’s Top Pick',
    ctaText: 'Watch Savor Clip (8s)',
  },
  {
    id: 'vid_fitness_kickstart',
    title: 'Studio Quick Start: Form Tips, Recovery Secrets & Fast Results',
    category: 'fitness',
    duration: '0:10',
    instructor: 'Lead Movement Coach',
    tags: ['fitness', 'workout', 'wellness', 'yoga', 'recovery', 'strength', 'training', 'classes'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    summary: 'Essential dynamic warmups, breath cadence techniques, and recovery lounge amenities to maximize your fitness progress.',
    businessProTip: 'Hydrate 30 minutes before class and schedule your post-workout recovery session early.',
    recommendedEmailHeading: '💪 Coach’s 10-Second Movement & Recovery Brief',
    ctaText: 'Watch Studio Quick Start (10s)',
  },
  {
    id: 'vid_service_consult',
    title: 'Service Excellence: What to Expect & How to Maximize Your Session',
    category: 'services',
    duration: '0:08',
    instructor: 'Client Relations Director',
    tags: ['service', 'consultation', 'appointment', 'maintenance', 'care', 'upgrade', 'support'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&auto=format&fit=crop&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    summary: 'A step-by-step preview of your scheduled consultation, intake roadmap, and post-session deliverables.',
    businessProTip: 'Have your project goals or preferences ready in advance to streamline your dedicated session.',
    recommendedEmailHeading: '📋 Quick Consultation Preview & Preparation Tips',
    ctaText: 'Watch Preparation Guide (8s)',
  },
];

// Alias for backwards compatibility
export const SALON_VIDEOS = BUSINESS_VIDEOS;
export type SalonVideo = BusinessVideo;

export interface VideoRecommendationResult {
  matchedVideo: BusinessVideo;
  relevanceScore: number;
  reason: string;
  recommendedEmailEmbed: {
    heading: string;
    videoDuration: string;
    stylistProTip: string; // compatibility key
    businessProTip: string;
    ctaUrl: string;
    ctaLabel: string;
  };
}

/**
 * Intelligent recommendation algorithm:
 * Analyzes campaign copy, subject line, or promo focus to match the most relevant video.
 */
export function recommendVideoForContent(
  topicOrCopy: string,
  audienceHint: string = 'general',
  categoryInput: string = 'general',
): VideoRecommendationResult {
  const query = `${topicOrCopy} ${audienceHint} ${categoryInput}`.toLowerCase();

  let bestMatch = BUSINESS_VIDEOS[0];
  let highestScore = 0;

  for (const video of BUSINESS_VIDEOS) {
    let score = 0;
    // Category match
    if (categoryInput.toLowerCase().includes(video.category)) {
      score += 15;
    }
    // Tag match
    for (const tag of video.tags) {
      if (query.includes(tag.toLowerCase())) {
        score += 8;
      }
    }
    // Title match
    const titleWords = video.title.toLowerCase().split(/\s+/);
    for (const word of titleWords) {
      if (word.length > 3 && query.includes(word)) {
        score += 5;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = video;
    }
  }

  // Fallback defaults
  if (highestScore === 0) {
    bestMatch = BUSINESS_VIDEOS.find((v) => v.category === 'general') || BUSINESS_VIDEOS[0];
    highestScore = 12;
  }

  return {
    matchedVideo: bestMatch,
    relevanceScore: Math.min(100, Math.round((highestScore / 40) * 100)),
    reason: `Matched "${bestMatch.title}" based on keywords matching ${bestMatch.tags.slice(0, 3).join(', ')}.`,
    recommendedEmailEmbed: {
      heading: bestMatch.recommendedEmailHeading,
      videoDuration: bestMatch.duration,
      stylistProTip: bestMatch.businessProTip,
      businessProTip: bestMatch.businessProTip,
      ctaUrl: bestMatch.videoUrl,
      ctaLabel: bestMatch.ctaText,
    },
  };
}
