/**
 * landing.ts — High-Converting Public Marketing & Landing Page Component
 *
 * Full-width marketing presentation featuring:
 * 1. Hero with headline, subhead, CTAs, trust badges, and interactive dashboard preview card.
 * 2. 6 Distinct Feature Showcases (Gamification, Dynamic QR, 7-10s AI Video, Automated Rebooking, AI Co-Pilot, Single-Use Verification).
 * 3. Industry Presets Showcase (Dentists, Realtors, Contractors, Tattoo Artists, Cafes, Spas, Wealth, Retail, Fitness).
 * 4. Transparent Pricing Teaser & Tiers (Starter, Growth Pro, Enterprise).
 * 5. Full Company Branding Footer.
 */

export function renderLandingPageHtml(): string {
  return `
    <div class="space-y-16 lg:space-y-24">
      
      <!-- ========================================================================= -->
      <!-- 1. HERO SECTION -->
      <!-- ========================================================================= -->
      <section class="relative overflow-hidden bg-gradient-to-b from-brand-sand via-white to-brand-sand pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-brand-border rounded-3xl">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="text-center max-w-4xl mx-auto space-y-6">
            
            <!-- Category Eyebrow Pill -->
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-brand-clay text-xs font-bold uppercase tracking-wider shadow-xs">
              <span class="w-2 h-2 rounded-full bg-brand-amber animate-ping"></span>
              <span>The In-Store Lead Capture & Rebooking Engine</span>
            </div>

            <!-- Main Headline -->
            <h1 class="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-dark tracking-tight leading-[1.12]">
              Turn In-Store Foot Traffic Into <br class="hidden sm:inline" />
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-amber via-brand-warm to-amber-700">High-Retention Repeat Clients</span>
            </h1>

            <!-- Subhead (Exact prompt specification) -->
            <p class="text-lg sm:text-xl text-brand-muted leading-relaxed font-medium max-w-3xl mx-auto">
              Gamified Lead Capture & Video-Enhanced Email Outreach for Local Pros.
            </p>

            <p class="text-sm sm:text-base text-brand-muted/90 max-w-2xl mx-auto">
              Built specifically for dental practices, real estate brokers, general contractors, barbershops, tattoo studios, cafes, and local service professionals to monetize dwell time and automate repeat bookings.
            </p>

            <!-- Prominent Action CTAs -->
            <div class="pt-4 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
              <button onclick="switchViewMode('app'); restartOnboardingTour()" class="px-8 py-3.5 rounded-xl bg-brand-amber hover:bg-brand-clay text-white font-bold text-sm sm:text-base shadow-xl shadow-brand-amber/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                <span>🚀 Get Started Free</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
              
              <button onclick="switchViewMode('app'); openTab('video')" class="px-7 py-3.5 rounded-xl bg-white hover:bg-brand-sand border border-brand-border text-brand-dark font-bold text-sm sm:text-base shadow-xs transition-all flex items-center gap-2">
                <span>⚡ Open Live Hub</span>
              </button>

              <button onclick="switchViewMode('app'); openTab('games')" class="px-6 py-3.5 rounded-xl bg-brand-sand hover:bg-brand-border/60 border border-brand-border text-brand-clay font-bold text-sm sm:text-base transition-all flex items-center gap-2">
                <span>🎮 Try 4 Lead Funnels</span>
              </button>
            </div>

            <!-- Key Metric Counters -->
            <div class="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 border-t border-brand-border/60 max-w-4xl mx-auto">
              <div class="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-brand-border text-center shadow-xs">
                <div class="font-heading text-2xl sm:text-3xl font-extrabold text-brand-amber">4.2x</div>
                <div class="text-[11px] sm:text-xs text-brand-muted font-semibold mt-0.5">Higher Lead Capture vs Static Forms</div>
              </div>
              <div class="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-brand-border text-center shadow-xs">
                <div class="font-heading text-2xl sm:text-3xl font-extrabold text-emerald-600">7–10s</div>
                <div class="text-[11px] sm:text-xs text-brand-muted font-semibold mt-0.5">Email-Optimized Micro-Videos</div>
              </div>
              <div class="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-brand-border text-center shadow-xs">
                <div class="font-heading text-2xl sm:text-3xl font-extrabold text-brand-dark">100%</div>
                <div class="text-[11px] sm:text-xs text-brand-muted font-semibold mt-0.5">Single-Use Anti-Fraud Tokens</div>
              </div>
              <div class="p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-brand-border text-center shadow-xs">
                <div class="font-heading text-2xl sm:text-3xl font-extrabold text-indigo-600">+2hr</div>
                <div class="text-[11px] sm:text-xs text-brand-muted font-semibold mt-0.5">Automated Gratitude Loop</div>
              </div>
            </div>

            <!-- Live Interactive App Hub Preview Card Mockup -->
            <div class="pt-10 max-w-5xl mx-auto">
              <div class="bg-white rounded-3xl border-2 border-brand-border shadow-2xl p-4 sm:p-6 lg:p-8 space-y-6 text-left relative overflow-hidden">
                <div class="flex items-center justify-between border-b border-brand-border pb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-rose-400"></div>
                    <div class="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div class="w-3 h-3 rounded-full bg-emerald-400"></div>
                    <span class="text-xs font-mono font-bold text-brand-muted pl-2">Expo Mail Proxy — Live Operating Hub</span>
                  </div>
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    SPF/DKIM Proxy Active
                  </span>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <!-- Video & Standee Mockup Left -->
                  <div class="lg:col-span-7 space-y-4">
                    <div class="p-4 bg-neutral-900 rounded-2xl text-white space-y-3 shadow-lg">
                      <div class="flex items-center justify-between text-xs text-neutral-400">
                        <span class="flex items-center gap-1.5 font-bold text-white">🎬 Active 8s AI Video Preview</span>
                        <span class="bg-brand-amber/20 text-brand-warm px-2 py-0.5 rounded font-mono text-[10px]">16:9 Widescreen</span>
                      </div>
                      <div class="aspect-video relative rounded-xl overflow-hidden bg-neutral-800 flex items-center justify-center group cursor-pointer" onclick="switchViewMode('app'); openTab('video')">
                        <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80" alt="Video Preview" class="w-full h-full object-cover opacity-80" />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 justify-between">
                          <div>
                            <div class="font-bold text-sm text-white">In-Office Cosmetic Laser Whitening Preview</div>
                            <div class="text-xs text-neutral-300">0:08 HD • MiniMax Video-01 HD Model</div>
                          </div>
                          <div class="w-10 h-10 rounded-full bg-brand-amber text-white flex items-center justify-center font-bold text-lg shadow-lg">▶</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Gamified Win Card Mockup Right -->
                  <div class="lg:col-span-5 space-y-3">
                    <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5">
                      <div class="flex items-center justify-between text-xs font-bold text-brand-clay uppercase tracking-wider">
                        <span>✨ Live Game Voucher</span>
                        <span class="text-emerald-700">Verified</span>
                      </div>
                      <div class="font-heading text-lg font-bold text-brand-dark">🎉 You Won: $75 Whitening Voucher!</div>
                      <p class="text-xs text-brand-muted">Single-use anti-fraud token tied directly to verified guest email address.</p>
                      <div class="p-2.5 bg-white rounded-xl border border-amber-200 flex items-center justify-between font-mono text-xs font-bold text-brand-dark">
                        <span>CODE: DENTAL75-9X2B</span>
                        <span class="text-emerald-600">● Valid 14 Days</span>
                      </div>
                    </div>

                    <div class="p-3 bg-brand-sand rounded-xl border border-brand-border flex items-center justify-between text-xs text-brand-dark">
                      <span class="text-brand-muted">Automated Follow-up:</span>
                      <strong class="text-emerald-700 font-bold">+2hr Care Gratitude Loop</strong>
                    </div>

                    <button onclick="switchViewMode('app')" class="w-full py-2.5 rounded-xl bg-brand-dark hover:bg-neutral-800 text-white font-bold text-xs transition-all text-center shadow-xs">
                      ⚡ Enter Full Workspace Dashboard →
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- 2. THE 6 FEATURE SHOWCASE SECTIONS -->
      <!-- ========================================================================= -->
      
      <!-- FEATURE 1: INTERACTIVE GAMIFICATION SUITE -->
      <section class="py-6 bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-xs">
        <div class="max-w-7xl mx-auto space-y-10">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-border/60 pb-6">
            <div class="max-w-3xl space-y-2">
              <span class="text-xs font-bold uppercase tracking-wider text-brand-clay bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">Feature 1 of 6</span>
              <h2 class="font-heading text-3xl sm:text-4xl font-bold text-brand-dark">
                🎮 Interactive Gamification Suite: 4 High-Conversion Lead Funnels
              </h2>
              <p class="text-brand-muted text-sm sm:text-base leading-relaxed">
                Replace awkward clipboards and generic lead forms with high-retention 5-second engagement games that guests love playing on their smartphones.
              </p>
            </div>
            <button onclick="switchViewMode('app'); openTab('games')" class="px-5 py-2.5 rounded-xl bg-brand-amber hover:bg-brand-clay text-white font-bold text-xs shadow-sm transition-all shrink-0">
              Test All 4 Games in App →
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Game 1: Scratch Card -->
            <div class="p-6 rounded-2xl bg-brand-sand border border-brand-border hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div class="space-y-3">
                <div class="w-12 h-12 rounded-xl bg-amber-100 text-2xl flex items-center justify-center shadow-inner">✨</div>
                <div>
                  <h3 class="font-heading text-lg font-bold text-brand-dark">Digital Scratch & Reveal</h3>
                  <span class="text-[11px] font-bold text-brand-clay uppercase tracking-wider">Canvas Foil Rubbing</span>
                </div>
                <p class="text-xs text-brand-muted leading-relaxed">
                  Guests use their fingertip or mouse to scratch off an opaque silver canvas layer, unveiling instant service savings with haptic confetti.
                </p>
                <div class="p-2.5 bg-white rounded-xl border border-brand-border text-[11px] text-brand-dark space-y-1">
                  <div class="flex justify-between font-semibold"><span>Conversion Rate:</span> <span class="text-emerald-700 font-bold">68.4%</span></div>
                  <div class="flex justify-between font-semibold"><span>Reward Type:</span> <span class="text-brand-clay font-bold">Dynamic Win-Odds</span></div>
                </div>
              </div>
              <button onclick="switchViewMode('app'); openTab('games'); setGameType('scratch')" class="w-full py-2.5 rounded-xl bg-white border border-brand-border hover:bg-brand-amber hover:text-white font-semibold text-xs text-brand-dark transition-all shadow-xs">
                Play Scratch Demo →
              </button>
            </div>

            <!-- Game 2: Mystery Box -->
            <div class="p-6 rounded-2xl bg-brand-sand border border-brand-border hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div class="space-y-3">
                <div class="w-12 h-12 rounded-xl bg-indigo-100 text-2xl flex items-center justify-center shadow-inner">🎁</div>
                <div>
                  <h3 class="font-heading text-lg font-bold text-brand-dark">VIP Mystery Gift Box</h3>
                  <span class="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">3D Box Selection</span>
                </div>
                <p class="text-xs text-brand-muted leading-relaxed">
                  Guests select 1 of 3 golden surprise packages to unlock tiered perks, sample products, or complimentary treatment upgrades.
                </p>
                <div class="p-2.5 bg-white rounded-xl border border-brand-border text-[11px] text-brand-dark space-y-1">
                  <div class="flex justify-between font-semibold"><span>Conversion Rate:</span> <span class="text-emerald-700 font-bold">64.2%</span></div>
                  <div class="flex justify-between font-semibold"><span>Reward Type:</span> <span class="text-indigo-700 font-bold">Tiered Surprises</span></div>
                </div>
              </div>
              <button onclick="switchViewMode('app'); openTab('games'); setGameType('mystery_box')" class="w-full py-2.5 rounded-xl bg-white border border-brand-border hover:bg-indigo-600 hover:text-white font-semibold text-xs text-brand-dark transition-all shadow-xs">
                Try Mystery Box →
              </button>
            </div>

            <!-- Game 3: Slot Reels -->
            <div class="p-6 rounded-2xl bg-brand-sand border border-brand-border hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div class="space-y-3">
                <div class="w-12 h-12 rounded-xl bg-rose-100 text-2xl flex items-center justify-center shadow-inner">🎰</div>
                <div>
                  <h3 class="font-heading text-lg font-bold text-brand-dark">Triple Match Slot Reels</h3>
                  <span class="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Animated Reel Blur</span>
                </div>
                <p class="text-xs text-brand-muted leading-relaxed">
                  Spin 3 animated digital reward reels. Every spin is mathematically weighted to dispense high-value customer incentives.
                </p>
                <div class="p-2.5 bg-white rounded-xl border border-brand-border text-[11px] text-brand-dark space-y-1">
                  <div class="flex justify-between font-semibold"><span>Conversion Rate:</span> <span class="text-emerald-700 font-bold">71.8%</span></div>
                  <div class="flex justify-between font-semibold"><span>Reward Type:</span> <span class="text-rose-700 font-bold">Guaranteed Win</span></div>
                </div>
              </div>
              <button onclick="switchViewMode('app'); openTab('games'); setGameType('slot_machine')" class="w-full py-2.5 rounded-xl bg-white border border-brand-border hover:bg-rose-600 hover:text-white font-semibold text-xs text-brand-dark transition-all shadow-xs">
                Spin Slot Reels →
              </button>
            </div>

            <!-- Game 4: Memory Match -->
            <div class="p-6 rounded-2xl bg-brand-sand border border-brand-border hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div class="space-y-3">
                <div class="w-12 h-12 rounded-xl bg-teal-100 text-2xl flex items-center justify-center shadow-inner">🃏</div>
                <div>
                  <h3 class="font-heading text-lg font-bold text-brand-dark">Memory Pair Match Flip</h3>
                  <span class="text-[11px] font-bold text-teal-700 uppercase tracking-wider">3D Tile Flip Engine</span>
                </div>
                <p class="text-xs text-brand-muted leading-relaxed">
                  Interactive 6-card tile memory puzzle where guests match brand icons to unlock secret VIP vouchers and retail credits.
                </p>
                <div class="p-2.5 bg-white rounded-xl border border-brand-border text-[11px] text-brand-dark space-y-1">
                  <div class="flex justify-between font-semibold"><span>Conversion Rate:</span> <span class="text-emerald-700 font-bold">66.1%</span></div>
                  <div class="flex justify-between font-semibold"><span>Reward Type:</span> <span class="text-teal-700 font-bold">Interactive Puzzle</span></div>
                </div>
              </div>
              <button onclick="switchViewMode('app'); openTab('games'); setGameType('match_flip')" class="w-full py-2.5 rounded-xl bg-white border border-brand-border hover:border-teal-600 hover:text-white font-semibold text-xs text-brand-dark transition-all shadow-xs">
                Play Memory Flip →
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURE 2: IN-STORE DYNAMIC QR FUNNELS -->
      <section class="py-6 bg-brand-sand/60 rounded-3xl p-6 sm:p-10 border border-brand-border">
        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div class="lg:col-span-6 space-y-5">
            <span class="text-xs font-bold uppercase tracking-wider text-brand-clay bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">Feature 2 of 6</span>
            <h2 class="font-heading text-3xl sm:text-4xl font-bold text-brand-dark leading-tight">
              📱 In-Store Dynamic QR Funnels: Print-to-Digital Point of Presence
            </h2>
            <p class="text-brand-muted text-sm sm:text-base leading-relaxed">
              Monetize natural customer dwell time at reception desks, waiting areas, styling mirrors, and checkout terminals. Generate print-ready 300 DPI vector QR standees in standard acrylic frame dimensions.
            </p>

            <div class="space-y-3 text-xs sm:text-sm">
              <div class="p-3.5 bg-white rounded-2xl border border-brand-border flex items-start gap-3 shadow-xs">
                <span class="text-xl">🪧</span>
                <div>
                  <strong class="text-brand-dark block">Countertop Acrylic Standees (4"x6" & 5"x7")</strong>
                  <span class="text-brand-muted text-xs">Captures clients waiting 30–90 seconds at reception check-in or cashier counters.</span>
                </div>
              </div>

              <div class="p-3.5 bg-white rounded-2xl border border-brand-border flex items-start gap-3 shadow-xs">
                <span class="text-xl">🪞</span>
                <div>
                  <strong class="text-brand-dark block">Styling Mirror & Window Clings</strong>
                  <span class="text-brand-muted text-xs">Placed directly at eye level during 20–45 minute chair services in salons and barbershops.</span>
                </div>
              </div>

              <div class="p-3.5 bg-white rounded-2xl border border-brand-border flex items-start gap-3 shadow-xs">
                <span class="text-xl">🧾</span>
                <div>
                  <strong class="text-brand-dark block">POS & Printed Receipt Footers</strong>
                  <span class="text-brand-muted text-xs">Automatically formats dynamic QR codes for post-visit rebooking and review rewards.</span>
                </div>
              </div>
            </div>

            <div class="pt-2">
              <button onclick="switchViewMode('app'); openTab('qr')" class="px-6 py-3 rounded-xl bg-brand-dark hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm">
                <span>📱 Generate In-Store Standee in App</span> →
              </button>
            </div>
          </div>

          <!-- Standee Preview Right -->
          <div class="lg:col-span-6 flex justify-center">
            <div class="bg-white p-8 rounded-3xl border-2 border-brand-amber shadow-xl text-center max-w-sm w-full space-y-4 relative">
              <div class="inline-block bg-brand-amber text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Print-Ready 300 DPI Standee
              </div>
              <div class="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl mx-auto flex items-center justify-center text-2xl">
                🦷
              </div>
              <h3 class="font-heading text-lg font-bold text-brand-dark">
                Scan & Unlock Your $75 Smile Care Perk
              </h3>
              <p class="text-xs text-brand-muted">
                Play our 5-second wellness game at reception for instant dental treatment savings.
              </p>
              <div class="p-3 bg-brand-sand rounded-2xl border border-brand-border inline-block shadow-inner">
                <div id="landingDemoQr" class="w-36 h-36 flex items-center justify-center mx-auto"></div>
              </div>
              <div class="text-[11px] font-bold text-brand-clay uppercase tracking-wider bg-amber-50 p-2 rounded-xl border border-amber-200">
                ⚡ Works With Any Smartphone Camera • Zero App Download
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURE 3: 7-10s EMBEDDED AI VIDEO GENERATOR -->
      <section class="py-6 bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-xs">
        <div class="max-w-7xl mx-auto space-y-10">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-border/60 pb-6">
            <div class="max-w-3xl space-y-2">
              <span class="text-xs font-bold uppercase tracking-wider text-brand-clay bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">Feature 3 of 6</span>
              <h2 class="font-heading text-3xl sm:text-4xl font-bold text-brand-dark">
                🎬 7–10s Embedded AI Video Generator (MiniMax & HeyGen Engine)
              </h2>
              <p class="text-brand-muted text-sm sm:text-base leading-relaxed">
                Short-form video in outbound email increases click-through rates by up to 280%. Generate micro-videos with dual 16:9 and 9:16 aspect framing and 1-click universal HTML email tables.
              </p>
            </div>
            <button onclick="switchViewMode('app'); openTab('video')" class="px-5 py-2.5 rounded-xl bg-brand-amber hover:bg-brand-clay text-white font-bold text-xs shadow-sm transition-all shrink-0">
              Open AI Video Studio →
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 rounded-2xl bg-brand-sand border border-brand-border space-y-3 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-xl bg-amber-100 text-brand-clay flex items-center justify-center font-bold text-base">1</div>
                <h3 class="font-heading text-lg font-bold text-brand-dark">Dual Aspect Ratio Engine</h3>
                <p class="text-xs text-brand-muted leading-relaxed">
                  Generate in <strong>16:9 Widescreen</strong> for desktop email newsletters, client portals, and CRM embeds, or toggle to <strong>9:16 Vertical</strong> for mobile email clients and Instagram/TikTok reels.
                </p>
              </div>
              <div class="p-3 bg-white rounded-xl border border-brand-border text-xs text-brand-dark space-y-1">
                <div class="flex justify-between font-semibold"><span>16:9 Widescreen:</span> <span class="text-brand-amber font-bold">Desktop Newsletters</span></div>
                <div class="flex justify-between font-semibold"><span>9:16 Vertical:</span> <span class="text-indigo-600 font-bold">Mobile Stories & Reels</span></div>
              </div>
            </div>

            <div class="p-6 rounded-2xl bg-brand-sand border border-brand-border space-y-3 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">2</div>
                <h3 class="font-heading text-lg font-bold text-brand-dark">MiniMax & HeyGen Connectors</h3>
                <p class="text-xs text-brand-muted leading-relaxed">
                  Connect generative AI endpoints via REST/Bearer headers or deploy from our curated library of pre-rendered, professional 4K local business templates across 10 industry niches.
                </p>
              </div>
              <div class="p-3 bg-white rounded-xl border border-brand-border text-xs text-brand-dark space-y-1">
                <div class="flex justify-between font-semibold"><span>MiniMax Engine:</span> <span class="text-emerald-700 font-bold">Video-01 HD Model</span></div>
                <div class="flex justify-between font-semibold"><span>HeyGen Studio:</span> <span class="text-purple-700 font-bold">Avatar & Voice API</span></div>
              </div>
            </div>

            <div class="p-6 rounded-2xl bg-brand-sand border border-brand-border space-y-3 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">3</div>
                <h3 class="font-heading text-lg font-bold text-brand-dark">Universal 1-Click HTML Embed</h3>
                <p class="text-xs text-brand-muted leading-relaxed">
                  Copies clean HTML email tables with animated poster fallbacks, play button overlays, and click-to-watch telemetry compatible across Gmail, Apple Mail, Outlook, and mobile apps.
                </p>
              </div>
              <div class="p-3 bg-white rounded-xl border border-brand-border text-xs text-brand-dark space-y-1">
                <div class="flex justify-between font-semibold"><span>Email Compatibility:</span> <span class="text-emerald-700 font-bold">100% Client Support</span></div>
                <div class="flex justify-between font-semibold"><span>Load Speed:</span> <span class="text-brand-clay font-bold">&lt; 350ms Instant</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURE 4: AUTOMATED REBOOKING CADENCES -->
      <section class="py-6 bg-brand-sand/60 rounded-3xl p-6 sm:p-10 border border-brand-border">
        <div class="max-w-7xl mx-auto space-y-10">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-border/60 pb-6">
            <div class="max-w-3xl space-y-2">
              <span class="text-xs font-bold uppercase tracking-wider text-brand-clay bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">Feature 4 of 6</span>
              <h2 class="font-heading text-3xl sm:text-4xl font-bold text-brand-dark">
                ⚙️ Automated Rebooking Cadences (2, 4, 6-Week Retention Cycles)
              </h2>
              <p class="text-brand-muted text-sm sm:text-base leading-relaxed">
                Never lose a past client to churn. The system automatically monitors scan timestamps, store transactions, and calendar intervals to trigger automated rebooking cadences.
              </p>
            </div>
            <button onclick="switchViewMode('app'); openTab('workflows')" class="px-5 py-2.5 rounded-xl bg-brand-amber hover:bg-brand-clay text-white font-bold text-xs shadow-sm transition-all shrink-0">
              Test Rebooking Engine →
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Stage 1 -->
            <div class="p-6 bg-white rounded-2xl border border-brand-border flex flex-col justify-between space-y-4 shadow-xs">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">+2 Hours Post-Visit</span>
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <h4 class="font-heading text-base font-bold text-brand-dark">Gratitude Loop & Review Prompt</h4>
                <p class="text-xs text-brand-muted leading-relaxed">
                  Sends an immediate thank-you note with an embedded 8-second video, aftercare instructions, and a 1-click Google Review link.
                </p>
                <div class="text-[11px] font-semibold text-emerald-700 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                  ⭐ 5-Star Review Prompt
                </div>
              </div>
              <button onclick="switchViewMode('app'); openTab('workflows')" class="w-full py-2 rounded-xl bg-brand-sand border border-brand-border hover:bg-brand-amber hover:text-white font-bold text-xs transition-all">
                Test Gratitude Loop
              </button>
            </div>

            <!-- Stage 2 -->
            <div class="p-6 bg-white rounded-2xl border border-brand-border flex flex-col justify-between space-y-4 shadow-xs">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">+2 to +4 Weeks</span>
                  <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                </div>
                <h4 class="font-heading text-base font-bold text-brand-dark">Precision Rebooking Sequence</h4>
                <p class="text-xs text-brand-muted leading-relaxed">
                  Automatically invites past guests to reserve upcoming haircuts, dental checkups, or home maintenance with exclusive rebooking vouchers.
                </p>
                <div class="text-[11px] font-semibold text-blue-700 bg-blue-50/70 p-2 rounded-lg border border-blue-100">
                  📅 Niche Appointment Recall
                </div>
              </div>
              <button onclick="switchViewMode('app'); openTab('workflows')" class="w-full py-2 rounded-xl bg-brand-sand border border-brand-border hover:bg-brand-amber hover:text-white font-bold text-xs transition-all">
                Test Rebooking Trigger
              </button>
            </div>

            <!-- Stage 3 -->
            <div class="p-6 bg-white rounded-2xl border border-brand-border flex flex-col justify-between space-y-4 shadow-xs">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">+60 Days Inactive</span>
                  <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                </div>
                <h4 class="font-heading text-base font-bold text-brand-dark">Slow-Trickle Win-Back Drip</h4>
                <p class="text-xs text-brand-muted leading-relaxed">
                  Paces win-back invitations at 15–20 emails per hour with compelling return vouchers to re-engage lapsed clients without domain penalty.
                </p>
                <div class="text-[11px] font-semibold text-amber-700 bg-amber-50/70 p-2 rounded-lg border border-amber-100">
                  🛡️ 15-20 msg/hr Pacing
                </div>
              </div>
              <button onclick="switchViewMode('app'); openTab('workflows')" class="w-full py-2 rounded-xl bg-brand-sand border border-brand-border hover:bg-brand-amber hover:text-white font-bold text-xs transition-all">
                Test Slow Drip
              </button>
            </div>

            <!-- Stage 4 -->
            <div class="p-6 bg-white rounded-2xl border border-brand-border flex flex-col justify-between space-y-4 shadow-xs">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">Weekly Audit</span>
                  <span class="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                </div>
                <h4 class="font-heading text-base font-bold text-brand-dark">VIP Loyalty Tier Progression</h4>
                <p class="text-xs text-brand-muted leading-relaxed">
                  Evaluates repeat customer transaction frequency, upgrades qualifying guests to Gold/Platinum tiers, and unlocks quarterly bonus perks.
                </p>
                <div class="text-[11px] font-semibold text-purple-700 bg-purple-50/70 p-2 rounded-lg border border-purple-100">
                  💎 Gold & Platinum Unlocks
                </div>
              </div>
              <button onclick="switchViewMode('app'); openTab('workflows')" class="w-full py-2 rounded-xl bg-brand-sand border border-brand-border hover:bg-brand-amber hover:text-white font-bold text-xs transition-all">
                Test VIP Audit
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURE 5: WEEKLY CO-PILOT CAMPAIGN ASSISTANT -->
      <section class="py-6 bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-xs">
        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div class="lg:col-span-6 space-y-5">
            <span class="text-xs font-bold uppercase tracking-wider text-brand-clay bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">Feature 5 of 6</span>
            <h2 class="font-heading text-3xl sm:text-4xl font-bold text-brand-dark leading-tight">
              🤖 Weekly Co-Pilot Campaign Assistant: Step-by-Step AI Drafting
            </h2>
            <p class="text-brand-muted text-sm sm:text-base leading-relaxed">
              Powered by Gemini, your marketing co-pilot drafts complete industry-tailored weekly email broadcasts, generates 7–10s video prompts, and plans seasonal holiday promos in seconds.
            </p>

            <div class="space-y-3 text-xs sm:text-sm text-brand-dark">
              <div class="flex items-start gap-3 p-3 bg-brand-sand rounded-xl border border-brand-border">
                <span class="text-lg">🎯</span>
                <div>
                  <strong>Bespoke Weekly Themes:</strong> Generates hyper-relevant promotions (e.g. Back-to-School dental exams, Spring remodeling specials, Summer blonde balayage promos).
                </div>
              </div>
              <div class="flex items-start gap-3 p-3 bg-brand-sand rounded-xl border border-brand-border">
                <span class="text-lg">🎬</span>
                <div>
                  <strong>AI Video Prompt Synthesis:</strong> Instantly turns campaign objectives into exact 8-second video scene prompts ready for MiniMax or HeyGen rendering.
                </div>
              </div>
              <div class="flex items-start gap-3 p-3 bg-brand-sand rounded-xl border border-brand-border">
                <span class="text-lg">⚡</span>
                <div>
                  <strong>1-Click Workspace Sync:</strong> Injects drafted subject lines and copy directly into the Outbound Dispatch and Deliverability Auditor.
                </div>
              </div>
            </div>

            <div class="pt-2">
              <button onclick="switchViewMode('app'); openTab('copilot')" class="px-6 py-3 rounded-xl bg-brand-amber hover:bg-brand-clay text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-amber/20 transition-all flex items-center gap-2">
                <span>🤖 Open Marketing Co-Pilot in App</span> →
              </button>
            </div>
          </div>

          <!-- Co-Pilot Chat Mockup Right -->
          <div class="lg:col-span-6">
            <div class="bg-brand-sand p-6 rounded-3xl border border-brand-border shadow-xl space-y-4 max-w-lg mx-auto">
              <div class="flex items-center justify-between border-b border-brand-border pb-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-amber-100 text-brand-clay flex items-center justify-center font-bold text-base">🤖</div>
                  <div>
                    <h4 class="font-heading text-sm font-bold text-brand-dark">Expo Growth Co-Pilot</h4>
                    <span class="text-[10px] text-emerald-700 font-semibold">● Domain Strategy Active</span>
                  </div>
                </div>
                <span class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white border border-brand-border text-brand-muted">Gemini 2.5 Flash</span>
              </div>

              <div class="space-y-3 text-xs">
                <div class="bg-white p-3.5 rounded-2xl border border-brand-border shadow-xs">
                  <span class="font-bold text-brand-clay block mb-1">🤖 Co-Pilot Recommendation:</span>
                  <p class="text-brand-dark leading-relaxed">
                    "For <strong>Dental Practices</strong> this week, let's deploy an 8-second laser whitening video email offering a <strong>$75 hygiene credit</strong>. Pacing it at 18 emails/hour will fill next Tuesday's open hygiene slots."
                  </p>
                </div>

                <div class="bg-amber-100/60 p-3 rounded-2xl border border-amber-200 text-brand-dark ml-4">
                  <span class="font-bold block mb-0.5 text-brand-clay">💡 Ready Strategy Pack:</span>
                  <div>• Subject: ✨ Prioritize Your Smile: $75 Whitening Voucher</div>
                  <div>• Video: 8s In-Office Laser Whitening Care Preview</div>
                  <div>• Cadence: +2hr Post-Visit Gratitude Loop</div>
                </div>
              </div>

              <button onclick="switchViewMode('app'); openTab('copilot')" class="w-full py-2.5 rounded-xl bg-white border border-brand-border hover:border-brand-amber font-bold text-xs text-brand-dark hover:text-brand-clay transition-all shadow-xs text-center block">
                ⚡ Try Co-Pilot Interactive Chat
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURE 6: SINGLE-USE PROXY REWARD VERIFICATION -->
      <section class="py-6 bg-brand-sand/60 rounded-3xl p-6 sm:p-10 border border-brand-border">
        <div class="max-w-7xl mx-auto space-y-10">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-border/60 pb-6">
            <div class="max-w-3xl space-y-2">
              <span class="text-xs font-bold uppercase tracking-wider text-brand-clay bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">Feature 6 of 6</span>
              <h2 class="font-heading text-3xl sm:text-4xl font-bold text-brand-dark">
                🛡️ Single-Use Proxy Reward Verification: In-Store Anti-Abuse Protection
              </h2>
              <p class="text-brand-muted text-sm sm:text-base leading-relaxed">
                Eliminate promotional coupon fraud, screenshot sharing, and duplicate counter claims. Every reward voucher is cryptographically signed, rate-limited, and instantly redeemable via cashier verification.
              </p>
            </div>
            <button onclick="switchViewMode('app'); openTab('games')" class="px-5 py-2.5 rounded-xl bg-brand-amber hover:bg-brand-clay text-white font-bold text-xs shadow-sm transition-all shrink-0">
              Test Voucher Engine →
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 bg-white rounded-2xl border border-brand-border space-y-3 shadow-xs">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">🔒</div>
              <h3 class="font-heading text-lg font-bold text-brand-dark">Cryptographic Single-Use Tokens</h3>
              <p class="text-xs text-brand-muted leading-relaxed">
                Every game win generates a unique alphanumeric token (e.g. <code class="bg-brand-sand px-1.5 py-0.5 rounded text-brand-dark font-mono font-bold">DENTAL75-9X2B</code>) tied strictly to the verified guest email.
              </p>
            </div>

            <div class="p-6 bg-white rounded-2xl border border-brand-border space-y-3 shadow-xs">
              <div class="w-10 h-10 rounded-xl bg-amber-100 text-brand-clay flex items-center justify-center font-bold text-lg">🛡️</div>
              <h3 class="font-heading text-lg font-bold text-brand-dark">Anti-Replay Redemption Lock</h3>
              <p class="text-xs text-brand-muted leading-relaxed">
                Once marked redeemed at the register, tokens immediately invalidate across all devices. Screenshots and forwarded codes are rejected automatically.
              </p>
            </div>

            <div class="p-6 bg-white rounded-2xl border border-brand-border space-y-3 shadow-xs">
              <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">⚡</div>
              <h3 class="font-heading text-lg font-bold text-brand-dark">Cashier 1-Tap Verification</h3>
              <p class="text-xs text-brand-muted leading-relaxed">
                Staff scan the guest's mobile voucher barcode or enter the 8-character code into the POS proxy check to confirm validity in under 1 second.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- 3. INDUSTRY PRESETS SHOWCASE & INTERACTIVE SELECTOR -->
      <!-- ========================================================================= -->
      <section class="py-6 bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-xs space-y-10">
        <div class="text-center max-w-3xl mx-auto space-y-3">
          <span class="text-xs font-bold uppercase tracking-wider text-brand-clay bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">Tailored For Your Sector</span>
          <h2 class="font-heading text-3xl sm:text-4xl font-bold text-brand-dark">
            Industry Presets: Custom Workflows for Local Pros
          </h2>
          <p class="text-brand-muted text-sm sm:text-base leading-relaxed">
            Click any industry below to adapt the entire workspace with specialized video presets, QR standee copy, gamified vouchers, and automated lifecycle cadences:
          </p>
        </div>

        <!-- Quick Filter Pill Bar -->
        <div class="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          <button onclick="switchViewMode('app'); onCategoryChange('dental_health')" class="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs">
            🦷 Dental & Healthcare
          </button>
          <button onclick="switchViewMode('app'); onCategoryChange('real_estate')" class="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs">
            🏡 Real Estate & Brokers
          </button>
          <button onclick="switchViewMode('app'); onCategoryChange('contractors')" class="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs">
            🔨 General Contractors
          </button>
          <button onclick="switchViewMode('app'); onCategoryChange('tattoo_piercing')" class="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs">
            🖋️ Tattoo & Piercing
          </button>
          <button onclick="switchViewMode('app'); onCategoryChange('financial_wealth')" class="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs">
            📈 Financial & Wealth
          </button>
          <button onclick="switchViewMode('app'); onCategoryChange('salon_barber')" class="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs">
            ✂️ Barbershop, Salon & Spa
          </button>
          <button onclick="switchViewMode('app'); onCategoryChange('cafe')" class="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs">
            ☕ Cafes & Bakeries
          </button>
          <button onclick="switchViewMode('app'); onCategoryChange('retail')" class="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs">
            🛍️ Retail Boutiques
          </button>
          <button onclick="switchViewMode('app'); onCategoryChange('fitness')" class="px-3.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs">
            💪 Fitness & Wellness
          </button>
        </div>

        <!-- 6 Main Sector Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <!-- 1. Dentists -->
          <div class="p-6 rounded-2xl bg-brand-sand border border-brand-border hover:border-teal-400 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between">
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">🦷</span>
                <div>
                  <h4 class="font-heading text-base font-bold text-brand-dark">Dental Practices</h4>
                  <span class="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">6-Month Recall • Laser Whitening</span>
                </div>
              </div>
              <p class="text-xs text-brand-muted leading-relaxed">
                Automates preventive checkup reminders, sonic toothbrush loyalty gifts, and in-office cosmetic whitening promotions with 8-second care video embeds.
              </p>
              <div class="p-2.5 bg-white rounded-xl border border-brand-border text-[11px] text-brand-dark">
                <strong>Sample Reward:</strong> $75 Off Laser Whitening or Sonic Brush Kit
              </div>
            </div>
            <button onclick="switchViewMode('app'); onCategoryChange('dental_health'); openTab('video')" class="w-full py-2 rounded-xl bg-white border border-brand-border hover:border-teal-600 font-bold text-xs text-teal-800 transition-all text-center">
              Load Dental Workflow →
            </button>
          </div>

          <!-- 2. Realtors -->
          <div class="p-6 rounded-2xl bg-brand-sand border border-brand-border hover:border-emerald-400 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between">
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">🏡</span>
                <div>
                  <h4 class="font-heading text-base font-bold text-brand-dark">Real Estate Agents & Brokers</h4>
                  <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Drone Tours • $500 Closing Credit</span>
                </div>
              </div>
              <p class="text-xs text-brand-muted leading-relaxed">
                Captures high-intent buyer and seller leads at open houses with comparative property valuation perks and 4K aerial drone showcase reels.
              </p>
              <div class="p-2.5 bg-white rounded-xl border border-brand-border text-[11px] text-brand-dark">
                <strong>Sample Reward:</strong> $500 Closing Credit & Free Drone Valuation
              </div>
            </div>
            <button onclick="switchViewMode('app'); onCategoryChange('real_estate'); openTab('video')" class="w-full py-2 rounded-xl bg-white border border-brand-border hover:border-emerald-600 font-bold text-xs text-emerald-800 transition-all text-center">
              Load Real Estate Workflow →
            </button>
          </div>

          <!-- 3. Contractors -->
          <div class="p-6 rounded-2xl bg-brand-sand border border-brand-border hover:border-amber-400 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between">
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">🔨</span>
                <div>
                  <h4 class="font-heading text-base font-bold text-brand-dark">General Contractors</h4>
                  <span class="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">3D Design Renders • Remodel Perks</span>
                </div>
              </div>
              <p class="text-xs text-brand-muted leading-relaxed">
                Follows up on pending estimate proposals with 3D architectural renders, seasonal kitchen/bath discounts, and automated warranty check-ins.
              </p>
              <div class="p-2.5 bg-white rounded-xl border border-brand-border text-[11px] text-brand-dark">
                <strong>Sample Reward:</strong> $250 Off Remodel & Free 3D Architectural Render
              </div>
            </div>
            <button onclick="switchViewMode('app'); onCategoryChange('contractors'); openTab('video')" class="w-full py-2 rounded-xl bg-white border border-brand-border hover:border-amber-600 font-bold text-xs text-amber-800 transition-all text-center">
              Load Contractor Workflow →
            </button>
          </div>

          <!-- 4. Tattoo Artists -->
          <div class="p-6 rounded-2xl bg-brand-sand border border-brand-border hover:border-slate-500 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between">
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">🖋️</span>
                <div>
                  <h4 class="font-heading text-base font-bold text-brand-dark">Tattoo & Piercing Studios</h4>
                  <span class="text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">Flash Drops • Botanical Aftercare</span>
                </div>
              </div>
              <p class="text-xs text-brand-muted leading-relaxed">
                Drives repeat bookings for custom sleeve work, artist flash drops, titanium jewelry upgrades, and 72-hour sterile aftercare routines.
              </p>
              <div class="p-2.5 bg-white rounded-xl border border-brand-border text-[11px] text-brand-dark">
                <strong>Sample Reward:</strong> $50 Off Custom Session & Free Aftercare Kit
              </div>
            </div>
            <button onclick="switchViewMode('app'); onCategoryChange('tattoo_piercing'); openTab('video')" class="w-full py-2 rounded-xl bg-white border border-brand-border hover:border-slate-800 font-bold text-xs text-slate-900 transition-all text-center">
              Load Tattoo Workflow →
            </button>
          </div>

          <!-- 5. Barbershops & Spas -->
          <div class="p-6 rounded-2xl bg-brand-sand border border-brand-border hover:border-rose-400 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between">
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">✂️</span>
                <div>
                  <h4 class="font-heading text-base font-bold text-brand-dark">Barbershops, Salons & Spas</h4>
                  <span class="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">4-Week Rebooking • Scalp Steam</span>
                </div>
              </div>
              <p class="text-xs text-brand-muted leading-relaxed">
                Keeps chairs full with automated 4-week fade cadences, balayage glaze recall alerts, and luxury scalp spa steam vouchers.
              </p>
              <div class="p-2.5 bg-white rounded-xl border border-brand-border text-[11px] text-brand-dark">
                <strong>Sample Reward:</strong> $25 Off Precision Cut/Color & Free Scalp Spa
              </div>
            </div>
            <button onclick="switchViewMode('app'); onCategoryChange('salon_barber'); openTab('video')" class="w-full py-2 rounded-xl bg-white border border-brand-border hover:border-rose-600 font-bold text-xs text-rose-800 transition-all text-center">
              Load Salon & Spa Workflow →
            </button>
          </div>

          <!-- 6. Cafes & Bakeries -->
          <div class="p-6 rounded-2xl bg-brand-sand border border-brand-border hover:border-amber-500 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between">
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl">☕</span>
                <div>
                  <h4 class="font-heading text-base font-bold text-brand-dark">Cafes & Bakeries</h4>
                  <span class="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">Morning Rush Loyalty • Pastry Box</span>
                </div>
              </div>
              <p class="text-xs text-brand-muted leading-relaxed">
                Captures daily commuter traffic at the espresso counter with scratch rewards for complimentary specialty lattes and fresh sourdough bakery boxes.
              </p>
              <div class="p-2.5 bg-white rounded-xl border border-brand-border text-[11px] text-brand-dark">
                <strong>Sample Reward:</strong> Free Handcrafted Latte or 4oz Roasted Bean Bag
              </div>
            </div>
            <button onclick="switchViewMode('app'); onCategoryChange('cafe'); openTab('video')" class="w-full py-2 rounded-xl bg-white border border-brand-border hover:border-amber-700 font-bold text-xs text-amber-900 transition-all text-center">
              Load Cafe Workflow →
            </button>
          </div>

        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- 4. PRICING TIERS & SIDE-BY-SIDE VALUE COMPARISON -->
      <!-- ========================================================================= -->
      <section class="py-6 bg-brand-sand/60 rounded-3xl p-6 sm:p-10 border border-brand-border space-y-12">
        
        <!-- Header -->
        <div class="text-center max-w-3xl mx-auto space-y-3">
          <span class="text-xs font-bold uppercase tracking-wider text-brand-clay bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200">Simple, Transparent Pricing</span>
          <h2 class="font-heading text-3xl sm:text-4xl font-bold text-brand-dark">
            Predictable Plans for Growing Local Businesses
          </h2>
          <p class="text-brand-muted text-sm sm:text-base leading-relaxed">
            Every plan includes our 100% single-use anti-fraud protection, print-ready dynamic QR generator, and SPF/DKIM proxy deliverability signing.
          </p>
        </div>

        <!-- 2 Core Pricing Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          <!-- TIER 1: FOUNDING MEMBER PASS (FEATURED / HIGHLIGHTED) -->
          <div class="p-8 sm:p-10 bg-white rounded-3xl border-2 border-brand-amber flex flex-col justify-between space-y-6 shadow-2xl relative">
            <div class="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-brand-amber via-amber-600 to-brand-clay text-white text-[11px] font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <span>🔥 Limited Founding Rate</span>
            </div>

            <div class="space-y-5">
              <div>
                <div class="flex items-center justify-between">
                  <h3 class="font-heading text-2xl font-bold text-brand-dark">Founding Member Pass</h3>
                  <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">Lifetime Rate Lock</span>
                </div>
                <p class="text-xs sm:text-sm text-brand-muted mt-2">
                  Solo service operators & local businesses (Barbers, Salons, Bakeries, Solo Contractors).
                </p>
              </div>

              <div class="space-y-1 bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80">
                <div class="flex items-baseline gap-2">
                  <span class="text-5xl font-extrabold text-brand-amber font-heading">$99</span>
                  <span class="text-sm text-brand-muted font-bold">/ month</span>
                </div>
                <div class="text-xs font-semibold text-brand-clay flex items-center gap-1.5 pt-1">
                  <span class="line-through text-neutral-400">Regularly $150/mo</span>
                  <span>— Lock in your rate for life</span>
                </div>
              </div>

              <ul class="space-y-3 text-xs sm:text-sm text-brand-dark pt-2 border-t border-brand-border">
                <li class="flex items-start gap-2.5">
                  <span class="text-brand-amber font-bold text-base leading-none">✓</span>
                  <span><strong>1 Physical Location</strong> / Counter Standee</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-brand-amber font-bold text-base leading-none">✓</span>
                  <span><strong>1,000 Active Contacts</strong> & Verified Guests</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-brand-amber font-bold text-base leading-none">✓</span>
                  <span><strong>4 Interactive Engagement Games</strong> (Scratch, Box, Reels, Flip)</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-brand-amber font-bold text-base leading-none">✓</span>
                  <span><strong>Dynamic Counter QR Standee Generator</strong> (4"x6" & 5"x7")</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-brand-amber font-bold text-base leading-none">✓</span>
                  <span><strong>20 AI Short-Form Video Clips / mo</strong> (MiniMax/HeyGen)</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-brand-amber font-bold text-base leading-none">✓</span>
                  <span><strong>Automated 2/4/6-Week Re-Booking Triggers</strong> & Gratitude Loop</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-brand-amber font-bold text-base leading-none">✓</span>
                  <span><strong>Guided Marketing Co-Pilot Assistant</strong> (Gemini AI Drafting)</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-brand-amber font-bold text-base leading-none">✓</span>
                  <span><strong>Single-Use Fraud-Proof QR Redemption</strong> & Cashier Lock</span>
                </li>
              </ul>
            </div>

            <button onclick="switchViewMode('app'); restartOnboardingTour()" class="w-full py-3.5 rounded-xl bg-brand-amber hover:bg-brand-clay text-white font-bold text-sm shadow-xl shadow-brand-amber/25 transition-all transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-2">
              <span>🚀 Claim Founding Member Pass ($99/mo)</span>
            </button>
          </div>

          <!-- TIER 2: PRO PRACTICE / GROWTH TIER -->
          <div class="p-8 sm:p-10 bg-white rounded-3xl border border-brand-border flex flex-col justify-between space-y-6 shadow-md hover:shadow-xl transition-all">
            <div class="space-y-5">
              <div>
                <div class="flex items-center justify-between">
                  <h3 class="font-heading text-2xl font-bold text-brand-dark">Pro Practice / Growth</h3>
                  <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">High Volume</span>
                </div>
                <p class="text-xs sm:text-sm text-brand-muted mt-2">
                  Multi-chair studios, Dental practices, Real estate teams, Multi-crew contractors.
                </p>
              </div>

              <div class="space-y-1 bg-brand-sand p-4 rounded-2xl border border-brand-border">
                <div class="flex items-baseline gap-2">
                  <span class="text-5xl font-extrabold text-brand-dark font-heading">$199</span>
                  <span class="text-sm text-brand-muted font-bold">/ month</span>
                </div>
                <div class="text-xs font-semibold text-brand-muted pt-1">
                  Predictable flat billing — Cancel anytime
                </div>
              </div>

              <ul class="space-y-3 text-xs sm:text-sm text-brand-dark pt-2 border-t border-brand-border">
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold text-base leading-none">✓</span>
                  <span><strong>Up to 3 Locations</strong> / Sub-accounts & Chairs</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold text-base leading-none">✓</span>
                  <span><strong>5,000 Active Contacts</strong> with Smart Segmentation</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold text-base leading-none">✓</span>
                  <span><strong>60 AI Short-Form Video Clips / mo</strong> (Dual 16:9 & 9:16)</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold text-base leading-none">✓</span>
                  <span><strong>Full Sector Adaptation Themes</strong> (All 9 industry profiles)</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold text-base leading-none">✓</span>
                  <span><strong>Priority Proxy Verification</strong> & SPF/DKIM Dedicated Tunnel</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold text-base leading-none">✓</span>
                  <span><strong>Advanced Custom Automations</strong> & Webhook Integration</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="text-indigo-600 font-bold text-base leading-none">✓</span>
                  <span><strong>Priority 4K Rendering Queue</strong> & Dedicated Account Concierge</span>
                </li>
              </ul>
            </div>

            <button onclick="switchViewMode('app'); restartOnboardingTour()" class="w-full py-3.5 rounded-xl bg-brand-dark hover:bg-neutral-800 text-white font-bold text-sm shadow-md transition-all text-center flex items-center justify-center gap-2">
              <span>⚡ Start Pro Practice Trial</span>
            </button>
          </div>

        </div>

        <!-- SIDE-BY-SIDE TECH STACK VALUE COMPARISON TABLE -->
        <div class="max-w-5xl mx-auto space-y-6 pt-4">
          <div class="text-center space-y-2">
            <h3 class="font-heading text-2xl sm:text-3xl font-bold text-brand-dark">
              Why Pay For 4 Disconnected Tools When You Need 1 Unified Engine?
            </h3>
            <p class="text-xs sm:text-sm text-brand-muted max-w-2xl mx-auto">
              Compare the cost and complexity of cobbling together traditional single-purpose apps versus our all-in-one local growth platform.
            </p>
          </div>

          <div class="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-lg">
            <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-brand-border">
              
              <!-- Column 1: Traditional Tech Stack -->
              <div class="p-6 sm:p-8 space-y-5 bg-neutral-50/50">
                <div class="flex items-center justify-between border-b border-brand-border pb-4">
                  <div>
                    <span class="text-xs font-bold uppercase tracking-wider text-neutral-500">The Fragmented Approach</span>
                    <h4 class="font-heading text-lg font-bold text-neutral-800">Traditional Tech Stack</h4>
                  </div>
                  <span class="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">4 Logins Required</span>
                </div>

                <div class="space-y-3 text-xs sm:text-sm text-neutral-700">
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200">
                    <span class="flex items-center gap-2">📧 Email Newsletter Tool (Mailchimp/Klaviyo)</span>
                    <strong class="font-mono text-neutral-900">$45 – $75/mo</strong>
                  </div>
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200">
                    <span class="flex items-center gap-2">🎬 Standalone AI Video Studio (Synthesia/HeyGen)</span>
                    <strong class="font-mono text-neutral-900">$49 – $89/mo</strong>
                  </div>
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200">
                    <span class="flex items-center gap-2">🎮 Gamified Lead Gen App (Gleam/Outgrow)</span>
                    <strong class="font-mono text-neutral-900">$45 – $79/mo</strong>
                  </div>
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200">
                    <span class="flex items-center gap-2">⚙️ Automation & Webhook Connector (Zapier)</span>
                    <strong class="font-mono text-neutral-900">$20 – $49/mo</strong>
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1 text-center">
                  <div class="text-xs font-bold text-rose-800 uppercase tracking-wider">Total Monthly Software Expense:</div>
                  <div class="font-heading text-2xl font-extrabold text-rose-700">$175 – $280+ / month</div>
                  <div class="text-[11px] text-rose-600 font-medium">Plus hours spent wiring APIs, broken webhooks, and manual data exports.</div>
                </div>
              </div>

              <!-- Column 2: Expo Mail Proxy (Unified) -->
              <div class="p-6 sm:p-8 space-y-5 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20">
                <div class="flex items-center justify-between border-b border-amber-200 pb-4">
                  <div>
                    <span class="text-xs font-bold uppercase tracking-wider text-brand-clay">Unified 3-in-1 Engine</span>
                    <h4 class="font-heading text-lg font-bold text-brand-dark">Expo Mail Proxy</h4>
                  </div>
                  <span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">1 Unified Platform</span>
                </div>

                <div class="space-y-3 text-xs sm:text-sm text-brand-dark">
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200 shadow-xs">
                    <span class="flex items-center gap-2 font-medium">📱 In-Store QR Standees + 4 Gamified Lead Games</span>
                    <span class="text-emerald-700 font-bold">✓ Included</span>
                  </div>
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200 shadow-xs">
                    <span class="flex items-center gap-2 font-medium">🎬 Embedded 7–10s AI Video Generator (MiniMax/HeyGen)</span>
                    <span class="text-emerald-700 font-bold">✓ Included</span>
                  </div>
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200 shadow-xs">
                    <span class="flex items-center gap-2 font-medium">⚙️ Automated 2/4/6-Week Rebooking & Gratitude Loops</span>
                    <span class="text-emerald-700 font-bold">✓ Included</span>
                  </div>
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200 shadow-xs">
                    <span class="flex items-center gap-2 font-medium">🛡️ Gemini Marketing Co-Pilot + Fraud-Proof Cashier Lock</span>
                    <span class="text-emerald-700 font-bold">✓ Included</span>
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-amber-100/70 border border-amber-300 space-y-1 text-center shadow-xs">
                  <div class="text-xs font-bold text-brand-clay uppercase tracking-wider">All-In-One Unified Cost:</div>
                  <div class="font-heading text-2xl font-extrabold text-brand-amber">
                    $99 <span class="text-sm font-semibold text-brand-muted font-sans">founding</span> <span class="text-xs text-neutral-400 font-normal">/ $150 standard</span>
                  </div>
                  <div class="text-[11px] text-brand-clay font-bold">Save over $150+/month while eliminating tool fragmentation!</div>
                </div>
              </div>

            </div>

            <!-- ROI Callout Banner Across Bottom -->
            <div class="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-700 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left px-6">
              <div class="flex items-center gap-3">
                <span class="text-2xl sm:text-3xl">💡</span>
                <div>
                  <div class="font-heading font-extrabold text-sm sm:text-base">The Simple Local Business ROI Equation</div>
                  <div class="text-xs text-emerald-100 font-medium">
                    One single retained client or rebooked appointment per month completely pays for the entire platform.
                  </div>
                </div>
              </div>
              <button onclick="switchViewMode('app'); restartOnboardingTour()" class="px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-extrabold text-xs shadow-md hover:bg-emerald-50 transition-all shrink-0">
                Claim Founding Rate ($99/mo) →
              </button>
            </div>
          </div>
        </div>

      </section>

      <!-- ========================================================================= -->
      <!-- 5. CALL TO ACTION FOOTER BANNER -->
      <!-- ========================================================================= -->
      <section class="py-14 bg-gradient-to-r from-brand-dark via-neutral-900 to-brand-dark text-white rounded-3xl text-center p-8 sm:p-12 shadow-2xl">
        <div class="max-w-3xl mx-auto space-y-6">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <span>⚡ Ready to Deploy</span>
          </div>
          <h2 class="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            Transform In-Store Walk-Ins Into Loyal Repeat Customers
          </h2>
          <p class="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto leading-relaxed">
            Launch your live workspace to generate promotional AI videos, print in-store QR standees, test gamified lead funnels, and dispatch deliverability-audited email campaigns.
          </p>
          <div class="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button onclick="switchViewMode('app'); restartOnboardingTour()" class="px-8 py-3.5 rounded-xl bg-brand-amber hover:bg-brand-warm text-white font-bold text-sm shadow-xl shadow-brand-amber/30 transition-all transform hover:-translate-y-0.5">
              🚀 Launch Workspace Tour
            </button>
            <button onclick="switchViewMode('app')" class="px-7 py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm border border-neutral-700 transition-all">
              ⚡ Open Live Dashboard Hub
            </button>
          </div>
        </div>
      </section>

    </div>
  `;
}
