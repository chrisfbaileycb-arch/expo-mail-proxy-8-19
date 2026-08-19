/**
 * copilot.ts — Expo Mail Proxy AI Local Business Co-Pilot Engine
 *
 * Implements server-side Gemini AI integration using the official @google/genai SDK
 * (with gemini-3.7-flash and User-Agent telemetry). Provides full contextual
 * fallback if GEMINI_API_KEY is not configured, ensuring zero-config reliability.
 */

import { GoogleGenAI } from '@google/genai';
import { recommendVideoForContent, type BusinessVideo } from './video-service.js';

export interface CopilotRequest {
  prompt: string;
  businessCategory?:
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
  salonType?: string; // backwards compatibility
  currentWorkflow?: string;
  campaignTopic?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface CopilotResponse {
  reply: string;
  actionSuggestions: string[];
  suggestedVideo?: BusinessVideo;
  suggestedWorkflow?: {
    name: string;
    description: string;
    stepToRun: string;
  };
  generatedCampaignSnippet?: {
    subject: string;
    smsBody: string;
    emailBody: string;
    targetSegment: string;
  };
}

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (geminiClient) return geminiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  geminiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return geminiClient;
}

const BUSINESS_SYSTEM_INSTRUCTION = `
You are the Expo Mail Proxy Co-Pilot — an elite AI growth marketing consultant and automation copilot specialized for local businesses (retail shops, cafes & dining, boutique fitness studios, wellness centers, and professional service providers).
Your goals:
1. Guide business owners through creating high-converting weekly email campaigns and automated re-engagement workflows.
2. Automate post-visit customer care, gratitude touchpoints (+2 hrs), and rebooking/repurchase cadences (+3 to +10 weeks).
3. Draft compelling, spam-safe, high-converting email and SMS copy with embedded short-form AI video clips.
4. Recommend matching short-form promotional and educational videos for every campaign.
5. Guide owners through the 4 core automations: CRM Lead Sync, Gratitude Touchpoint, Slow-Trickle Drip (pacing 15-20 messages/hour), and VIP Weekly Loyalty Tiering.
Format output cleanly in Markdown with bold action items. Keep tone lively, encouraging, and sophisticated.
`.trim();

/**
 * Generates an AI response from Gemini or returns intelligent contextual business heuristics.
 */
export async function generateCopilotAdvice(req: CopilotRequest): Promise<CopilotResponse> {
  const category = req.businessCategory || 'retail';
  const prompt = req.prompt.trim();
  const lowerPrompt = prompt.toLowerCase();

  // Try live Gemini API if key is present
  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Business Category: ${category.toUpperCase()}\nUser Request: ${prompt}\nContext: ${JSON.stringify(req)}`,
              },
            ],
          },
        ],
        config: {
          systemInstruction: BUSINESS_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const replyText = response.text || 'Co-pilot response generated.';
      const videoRec = recommendVideoForContent(prompt, category, category);

      return {
        reply: replyText,
        actionSuggestions: [
          `Execute ${category} weekly email broadcast`,
          'Send 30-day inactive customer win-back campaign',
          'Generate printable in-store counter QR code',
          'Inspect VIP customer retention audit',
        ],
        suggestedVideo: videoRec.matchedVideo,
        suggestedWorkflow: {
          name: 'gratitude-loop',
          description: 'Automated 2-hour post-purchase/service follow-up & video preview',
          stepToRun: 'Execute Gratitude Trigger',
        },
      };
    } catch (err: any) {
      console.warn('[Copilot] Live Gemini call encountered error, falling back to local engine:', err?.message);
    }
  }

  // ── High-Fidelity Domain Heuristic Fallback ────────────────────────────────
  const videoRec = recommendVideoForContent(prompt, category, category);

  if (lowerPrompt.includes('flash') || lowerPrompt.includes('weekend') || lowerPrompt.includes('sale') || lowerPrompt.includes('promo')) {
    return {
      reply: `### 🎯 3-Day Weekend Flash Promotion Playbook (${category.toUpperCase()})

Here is the exact step-by-step strategy to drive an immediate surge of in-store traffic and online orders this weekend:

1. **Target Segment:** Focus on **Recent & Engaged Customers** (visited within last 60 days) + in-store QR code leads.
2. **Email Campaign Blueprint:**
   - **Subject Line:** ✨ VIP Weekend Pass: 20% Off + Surprise In-Store Perk
   - **Preheader:** Valid Friday through Sunday only — show on your mobile device!
   - **Video Inclusion:** Embedded 8-second promotional clip (*"${videoRec.matchedVideo.title}"*) showcasing featured highlights.
3. **Automated Follow-Up Workflow:**
   - Connect to the **Slow-Trickle Drip** pipeline to pace delivery across Friday morning (15–20 emails/hour) so customer support remains seamless.

💡 **Business Growth Tip:** ${videoRec.matchedVideo.businessProTip}`,
      actionSuggestions: [
        'Launch Weekend Flash Email Campaign',
        'Generate 8-Second AI Promo Video with MiniMax',
        'Print QR Table Tents for In-Store Counter',
      ],
      suggestedVideo: videoRec.matchedVideo,
      suggestedWorkflow: {
        name: 'slow-trickle-drip',
        description: 'Paces outgoing re-engagement emails to maintain steady foot traffic and prevent front-counter bottlenecks.',
        stepToRun: 'Dispatch 15 Leads/Hour',
      },
      generatedCampaignSnippet: {
        subject: '✨ VIP Weekend Pass: 20% Off + Surprise In-Store Perk',
        smsBody: `Hey {{firstName}}! 🌟 Enjoy 20% off your visit this weekend with code WEEKEND20: {{claimLink}}`,
        emailBody: `Hi {{firstName}},\n\nWe appreciate you being part of our local community! This weekend only, enjoy 20% off your purchase plus a surprise gift at checkout.\n\nWatch our quick 8-second preview below!`,
        targetSegment: 'Active Customers & In-Store Leads (Last 60 Days)',
      },
    };
  }

  if (lowerPrompt.includes('win back') || lowerPrompt.includes('inactive') || lowerPrompt.includes('lapse') || lowerPrompt.includes('re-engagement') || lowerPrompt.includes('lost')) {
    return {
      reply: `### 💌 30-to-60 Day Inactive Customer Win-Back Campaign

Re-engaging past customers is 5x more cost-effective than cold customer acquisition:

- **Timing & Cadence:** Triggered automatically **Day 35–45** post-visit via the \`slow-trickle-drip\` cadence.
- **Incentive:** Offer a meaningful gesture of appreciation (e.g., "$15 Credit on Any Purchase of $40+" or "Complimentary Welcome Back Perk").
- **Email Subject:** *"We miss you, {{firstName}}! Here is $15 toward your next visit 🎁"*
- **Embedded Short Video:** Includes our 8-second customer appreciation clip (*"${videoRec.matchedVideo.title}"*) highlighting new offerings.`,
      actionSuggestions: [
        'Deploy Win-Back Re-Engagement Sequence',
        'Embed Video Clip into Email Dispatch Hub',
        'Preview Inactive Customer Email Template',
      ],
      suggestedVideo: videoRec.matchedVideo,
      suggestedWorkflow: {
        name: 'slow-trickle-drip',
        description: 'Automated 30-to-60 day re-engagement sequence with tracked voucher redemption.',
        stepToRun: 'Activate 45-Day Win-Back Trigger',
      },
      generatedCampaignSnippet: {
        subject: '🎁 We miss you, {{firstName}}! Here is a $15 gift for your next visit',
        smsBody: `Hi {{firstName}}! We'd love to welcome you back. Enjoy $15 off your next visit with code WELCOME15: {{claimLink}}`,
        emailBody: `Dear {{firstName}},\n\nIt has been a little while since your last visit, and we have introduced exciting new updates!\n\nAs a thank you, please enjoy a $15 credit on us on your next visit.\n\nSee you soon!`,
        targetSegment: 'Lapsed Customers (30–60 Days Inactive)',
      },
    };
  }

  if (lowerPrompt.includes('vip') || lowerPrompt.includes('loyalty') || lowerPrompt.includes('top client') || lowerPrompt.includes('reward')) {
    return {
      reply: `### 👑 VIP Loyalty Tiering & Top 20% Customer Appreciation

For your highest-spending, most loyal customer advocates:

1. **Surprise & Delight Strategy:** Avoid race-to-the-bottom discounts. Instead, reward top patrons with exclusive perks (e.g., **Priority Booking Pass**, **Exclusive Tasting Access**, or a **Curated Gift with Purchase**).
2. **The VIP Appreciation Message:**
   > *"Dear {{firstName}}, you are in our top tier of local patrons! ✨ To celebrate your loyalty, we've loaded a **VIP Complimentary Upgrade Pass** to your profile. Show your code on your next visit: {{claimLink}}"*
3. **Automation Pipeline:** The \`vip-weekly\` workflow recalculates customer spend and visit frequency every Sunday, auto-tagging new VIP tier entrants.`,
      actionSuggestions: [
        'Run VIP Weekly Loyalty Audit',
        'Generate VIP In-Store Counter QR Code',
        'Export Top 20% Customer Segment',
      ],
      suggestedVideo: videoRec.matchedVideo,
      suggestedWorkflow: {
        name: 'vip-weekly',
        description: 'Calculates top spending clients and auto-enrolls them in priority reward queues.',
        stepToRun: 'Run VIP Sunday Reconciliation Batch',
      },
      generatedCampaignSnippet: {
        subject: '👑 Exclusive VIP Status: A Special Gift Just For You',
        smsBody: `Hi {{firstName}}! As one of our top VIP guests, we've added an exclusive perk to your account: {{claimLink}}`,
        emailBody: `Dear {{firstName}},\n\nThank you for being such an extraordinary part of our story! We have loaded a special VIP Loyalty Pass to your account.\n\nWe look forward to seeing you soon!`,
        targetSegment: 'Top 20% High-LTV Customers',
      },
    };
  }

  if (lowerPrompt.includes('workflow') || lowerPrompt.includes('automation') || lowerPrompt.includes('n8n') || lowerPrompt.includes('dispatch')) {
    return {
      reply: `### ⚙️ 4 Automated Growth Workflows for Local Businesses

Expo Mail Proxy manages 4 automated lifecycle pipelines:

1. **CRM Lead & Order Sync:**
   - Ingests customer touchpoints, in-store QR scans, and transaction CSV records.
   - Automatically computes Recency, Frequency, and Monetary scores.
2. **2-Hour Gratitude Loop:**
   - Sends an automated thank-you email/SMS within 2 hours of purchase or visit with a review link and short video.
3. **Slow-Trickle Re-Engagement Drip:**
   - Delivers smart reminders in measured batches (15–20/hour) to keep bookings and foot-traffic steady.
4. **VIP Weekly Loyalty Engine:**
   - Continuously audits top 15% customers and triggers bespoke rewards and early access announcements.`,
      actionSuggestions: [
        'Step Through Welcome & Gratitude Workflow',
        'Audit Outbound Email Dispatch Pipeline',
        'Simulate Slow-Trickle Drip Delivery',
      ],
      suggestedVideo: videoRec.matchedVideo,
      suggestedWorkflow: {
        name: 'gratitude-loop',
        description: 'Sends automated 2-hour thank you note + review link + video guide.',
        stepToRun: 'Execute Step 1: Trigger Gratitude Batch',
      },
    };
  }

  // Default response
  return {
    reply: `### 🌟 Local Business Growth Blueprint (${category.toUpperCase()})

Here are the highest-impact actions you can take today:

- **Customer Re-Engagement:** Activate the **Automated Gratitude Loop** to deliver post-visit video care clips within 2 hours.
- **In-Store Lead Capture:** Deploy the **4 Neutral Engagement Games** (Scratch & Reveal, Mystery VIP Unboxing, Triple Match Slots, Memory Flip Pairs) via counter QR signs.
- **AI Short-Form Video:** Generate a fresh 7–10 second promotional clip using MiniMax or HeyGen to boost email click-through rates by up to 300%.
- **Dispatch Audit:** Test your email deliverability score in the Outbound Dispatch Hub.

How would you like to proceed?`,
    actionSuggestions: [
      `Generate ${category} In-Store QR Table Tents`,
      'Draft Weekly Customer Newsletter',
      'Launch 7-10s AI Promo Video Generator',
      'Step Through Re-engagement Workflow',
    ],
    suggestedVideo: videoRec.matchedVideo,
    suggestedWorkflow: {
      name: 'gratitude-loop',
      description: 'Sends automated 2-hour post-purchase thank you and review link.',
      stepToRun: 'Execute Gratitude Trigger',
    },
  };
}
