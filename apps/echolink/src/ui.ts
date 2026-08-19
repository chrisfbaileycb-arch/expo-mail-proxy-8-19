/**
 * ui.ts — Expo Mail Proxy Local Business Dashboard & Interactive Growth Hub
 *
 * Full-Featured Local Business Platform:
 * - 🌟 Interactive Product Landing Page & Tour
 * - 🎬 Full-Width Short-Form AI Video Studio (16:9 / 9:16 framing, MiniMax/HeyGen connectors)
 * - 🎮 4 Neutral Engagement Games (Scratch & Reveal, Mystery Box, Triple Match Slots, Memory Flip)
 * - 📱 Dynamic In-Store QR Print Studio (Counter Standees, Table Tents, Mirror Clings)
 * - 🤖 AI Marketing Co-Pilot Agent (Gemini & Domain Strategy Engine)
 * - 📬 Outbound Email Dispatch Hub & Deliverability Auditor (Resend, SendGrid, SMTP, Sandbox)
 * - ⚙️ Automated Re-Engagement Workflows (CRM Sync, Gratitude Touchpoint, Slow Drip, VIP Tiering)
 * - 💡 Interactive Onboarding Bubble Tour Pop-up with Enable/Disable preference
 */

import { renderLandingPageHtml } from './landing.js';
import { INDUSTRY_PROFILES, ONBOARDING_STEPS } from './ui-data.js';

export function renderDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Expo Mail Proxy — Local Business Growth & Automated Retention</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <!-- QR Code generation library -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <!-- Canvas Confetti -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            heading: ['"Outfit"', 'sans-serif'],
          },
          colors: {
            brand: {
              amber: '#D97706',
              warm: '#F59E0B',
              clay: '#B45309',
              sand: '#FAF5EF',
              surface: '#FFFFFF',
              card: '#FDFBF7',
              border: '#E8DFD5',
              dark: '#1C1917',
              muted: '#78716C',
            }
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-heading { font-family: 'Outfit', sans-serif; }
    
    /* Scratch Card Canvas */
    .scratch-container {
      position: relative;
      user-select: none;
      -webkit-user-select: none;
    }
    #scratchCanvas {
      position: absolute;
      top: 0;
      left: 0;
      border-radius: 1rem;
      cursor: crosshair;
      touch-action: none;
    }

    /* Slot Machine Reels */
    .slot-reel {
      height: 110px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      transition: transform 0.2s ease-out;
    }
    .slot-spinning {
      animation: slotBlur 0.1s infinite linear;
    }
    @keyframes slotBlur {
      0% { filter: blur(0px); transform: translateY(-6px); }
      50% { filter: blur(3px); transform: translateY(6px); }
      100% { filter: blur(0px); transform: translateY(0px); }
    }

    /* Card Flip */
    .flip-card {
      perspective: 1000px;
    }
    .flip-card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      text-align: center;
      transition: transform 0.5s;
      transform-style: preserve-3d;
    }
    .flip-card.flipped .flip-card-inner {
      transform: rotateY(180deg);
    }
    .flip-card-front, .flip-card-back {
      position: absolute;
      width: 100%;
      height: 100%;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      border-radius: 0.75rem;
    }
    .flip-card-back {
      transform: rotateY(180deg);
    }

    /* Video Player Fluid Aspect Ratios */
    .aspect-video-16-9 {
      aspect-ratio: 16 / 9;
      width: 100%;
      max-height: 520px;
    }
    .aspect-video-9-16 {
      aspect-ratio: 9 / 16;
      width: 100%;
      max-width: 380px;
      max-height: 580px;
      margin: 0 auto;
    }

    /* Pulse bubble animation */
    @keyframes pulseBubble {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.04); }
    }
    .bubble-pulse {
      animation: pulseBubble 2s infinite ease-in-out;
    }
  </style>
</head>
<body class="bg-brand-sand text-brand-dark min-h-screen antialiased flex flex-col selection:bg-brand-warm selection:text-white">

  <!-- TOP HEADER / BRANDING BAR -->
  <header class="bg-white/95 backdrop-blur-md border-b border-brand-border sticky top-0 z-40 px-4 lg:px-8 py-3.5 shadow-sm">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-amber to-brand-warm flex items-center justify-center text-white text-xl font-bold shadow-md shadow-brand-amber/20 cursor-pointer" onclick="switchViewMode('landing')">
          ⚡
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-heading text-xl font-bold text-brand-dark tracking-tight cursor-pointer" onclick="switchViewMode('landing')">Expo Mail Proxy</h1>
            <span id="headerSectorBadge" class="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-brand-clay border border-amber-200">Local Business Hub</span>
          </div>
          <p id="headerTagline" class="text-xs text-brand-muted hidden sm:block">Automated Guest Engagement, AI Video Generation & Rebooking Pipelines</p>
        </div>
      </div>

      <!-- Right Controls: Sector Switcher & Route Switcher -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Prominent View Mode Switcher -->
        <div class="flex items-center bg-brand-sand p-1 rounded-xl border border-brand-border shadow-xs">
          <button id="viewBtn-landing" onclick="switchViewMode('landing')" class="px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg bg-white text-brand-dark shadow-sm border border-brand-border transition-all flex items-center gap-1.5">
            <span>🏠 Public Landing Page</span>
          </button>
          <button id="viewBtn-app" onclick="switchViewMode('app')" class="px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg text-brand-muted hover:text-brand-dark transition-all flex items-center gap-1.5">
            <span>⚡ Live Hub / App</span>
          </button>
        </div>

        <!-- Business Category Quick Switcher -->
        <div class="hidden md:flex items-center gap-1.5">
          <select id="globalBizCategory" onchange="onCategoryChange(this.value)" class="px-3 py-1.5 rounded-xl bg-brand-sand border border-brand-border text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-amber/30">
            <option value="dental_health">🦷 Dental & Healthcare</option>
            <option value="real_estate">🏡 Real Estate & Brokers</option>
            <option value="contractors">🔨 General Contractors</option>
            <option value="tattoo_piercing">🖋️ Tattoo & Piercing</option>
            <option value="financial_wealth">📈 Financial & Wealth</option>
            <option value="salon_barber">✂️ Barbershop & Salon</option>
            <option value="cafe">☕ Cafes & Bakeries</option>
            <option value="retail">🛍️ Retail & Boutiques</option>
            <option value="fitness">💪 Fitness & Wellness</option>
            <option value="services">💼 Professional Services</option>
            <option value="general">🌟 General Local Business</option>
          </select>
        </div>

        <!-- Onboarding Tour Launcher Button -->
        <button id="btnOnboardingToggle" onclick="toggleOnboardingModal()" class="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-brand-clay border border-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
          <span>💡 Directions</span>
        </button>
      </div>
    </div>
  </header>

  <!-- NAVIGATION TABS FOR APP VIEW (HIDDEN ON LANDING PAGE) -->
  <nav id="appNavTabs" class="hidden bg-white border-b border-brand-border px-4 lg:px-8 py-2 sticky top-[61px] z-30 shadow-xs">
    <div class="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
      <div class="flex items-center gap-1.5">
        <button onclick="openTab('video')" id="tabBtn-video" class="tab-btn active px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all bg-brand-amber text-white shadow-sm">
          🎬 AI Video Studio
        </button>
        <button onclick="openTab('games')" id="tabBtn-games" class="tab-btn px-3.5 py-1.5 text-xs font-bold rounded-xl text-brand-muted hover:text-brand-dark hover:bg-brand-sand transition-all">
          🎮 4 Engagement Games
        </button>
        <button onclick="openTab('qr')" id="tabBtn-qr" class="tab-btn px-3.5 py-1.5 text-xs font-bold rounded-xl text-brand-muted hover:text-brand-dark hover:bg-brand-sand transition-all">
          📱 In-Store QR Standee
        </button>
        <button onclick="openTab('dispatch')" id="tabBtn-dispatch" class="tab-btn px-3.5 py-1.5 text-xs font-bold rounded-xl text-brand-muted hover:text-brand-dark hover:bg-brand-sand transition-all">
          📬 Outbound Dispatch
        </button>
        <button onclick="openTab('workflows')" id="tabBtn-workflows" class="tab-btn px-3.5 py-1.5 text-xs font-bold rounded-xl text-brand-muted hover:text-brand-dark hover:bg-brand-sand transition-all">
          ⚙️ Rebooking Automations
        </button>
        <button onclick="openTab('copilot')" id="tabBtn-copilot" class="tab-btn px-3.5 py-1.5 text-xs font-bold rounded-xl text-brand-muted hover:text-brand-dark hover:bg-brand-sand transition-all">
          🤖 AI Co-Pilot
        </button>
      </div>

      <div class="hidden md:flex items-center gap-2">
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Proxy Verified
        </span>
      </div>
    </div>
  </nav>

  <!-- MAIN VIEWPORT CONTAINER -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

    <!-- VIEW 1: INTERACTIVE LANDING PAGE (DEFAULT ON INITIAL LOAD) -->
    <div id="landingView" class="space-y-6">
      ${renderLandingPageHtml()}
    </div>

    <!-- VIEW 2: LIVE APP DASHBOARD TABS -->
    <div id="appView" class="hidden space-y-6">

      <!-- ========================================================================= -->
      <!-- TAB 1: 7-10s SHORT-FORM AI VIDEO GENERATION STUDIO -->
      <!-- ========================================================================= -->
      <section id="tab-video" class="tab-content space-y-6">
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm space-y-6">
          
          <!-- Header and Framing Toggle -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border/60 pb-5">
            <div>
              <div class="flex items-center gap-2.5">
                <span class="w-9 h-9 rounded-xl bg-amber-100 text-brand-clay flex items-center justify-center text-lg font-bold">🎬</span>
                <div>
                  <h2 class="font-heading text-xl sm:text-2xl font-bold text-brand-dark">Embedded Short-Form AI Video Generator</h2>
                  <p class="text-xs text-brand-muted mt-0.5">Generate 7–10 second email-ready promotional video clips designed to boost click-through rates by up to 280%.</p>
                </div>
              </div>
            </div>

            <!-- Aspect Ratio Switcher -->
            <div class="flex items-center bg-brand-sand p-1 rounded-2xl border border-brand-border self-start md:self-auto">
              <button id="aspectBtn-16-9" onclick="setVideoAspect('16-9')" class="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white text-brand-dark shadow-xs transition-all flex items-center gap-1.5">
                <span>🖥️ 16:9 Widescreen</span>
              </button>
              <button id="aspectBtn-9-16" onclick="setVideoAspect('9-16')" class="px-3.5 py-1.5 text-xs font-bold rounded-xl text-brand-muted hover:text-brand-dark transition-all flex items-center gap-1.5">
                <span>📱 9:16 Vertical</span>
              </button>
            </div>
          </div>

          <!-- Video Generation Controls -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <!-- Left Config Form -->
            <div class="lg:col-span-5 space-y-4 bg-brand-sand/60 p-5 rounded-2xl border border-brand-border">
              <div>
                <label class="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">Video Prompt & Visual Focus</label>
                <textarea id="videoPromptInput" rows="3" class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-brand-border text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-amber/30 resize-none" placeholder="Describe the scene (e.g. In-office laser teeth whitening demonstration with radiant smile result)..."></textarea>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-brand-dark uppercase tracking-wider mb-1">Target Duration</label>
                  <select id="videoDurationInput" class="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-amber/30">
                    <option value="8s">⚡ 8 Seconds (Email-Optimized)</option>
                    <option value="7s">7 Seconds (Ultra Micro)</option>
                    <option value="9s">9 Seconds (Featured Reel)</option>
                    <option value="10s">10 Seconds (Full Showcase)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-brand-dark uppercase tracking-wider mb-1">AI Video Engine</label>
                  <select id="videoEngineInput" class="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-amber/30">
                    <option value="minimax">MiniMax (Video-01)</option>
                    <option value="heygen">HeyGen Studio API</option>
                    <option value="template">Pre-Rendered 4K Template</option>
                  </select>
                </div>
              </div>

              <!-- Quick Sector Prompts -->
              <div>
                <span class="block text-[11px] font-bold text-brand-muted uppercase tracking-wider mb-1.5">Quick Sector Presets:</span>
                <div id="quickPromptChips" class="flex flex-wrap gap-1.5">
                  <!-- Injected via JS -->
                </div>
              </div>

              <button id="btnGenerateVideo" onclick="generateAiVideo()" class="w-full py-3 rounded-xl bg-brand-amber hover:bg-brand-clay text-white font-bold text-xs shadow-md shadow-brand-amber/20 transition-all flex items-center justify-center gap-2">
                <span>✨ Generate 7–10s Promotional Clip</span>
              </button>

              <div id="videoGenStatus" class="hidden p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-brand-clay">
                <div class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4 text-brand-amber" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                  <span>Synthesizing micro-video with MiniMax / 4K Engine...</span>
                </div>
              </div>
            </div>

            <!-- Right Full-Width Video Player Area -->
            <div class="lg:col-span-7 space-y-4">
              <div class="bg-brand-dark rounded-2xl p-3 sm:p-4 border border-neutral-800 shadow-xl flex flex-col items-center justify-center">
                <div id="videoPlayerWrapper" class="w-full flex items-center justify-center">
                  <!-- Video Frame Element with Responsive Aspect Ratio -->
                  <div id="videoFrameContainer" class="aspect-video-16-9 relative bg-neutral-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                    <video id="activeVideoElement" controls playsinline class="w-full h-full object-cover rounded-xl" poster="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1200&auto=format&fit=crop&q=80">
                      <source id="videoSourceElement" src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
                      Your browser does not support HTML5 video.
                    </video>
                  </div>
                </div>

                <!-- Video Metadata Info Bar -->
                <div class="w-full mt-3 pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-300">
                  <div class="flex items-center gap-2">
                    <span id="videoTitleBadge" class="font-bold text-white">Smile Radiance: In-Office Laser Whitening & Hygiene Care</span>
                    <span id="videoDurationBadge" class="px-2 py-0.5 rounded-full bg-neutral-800 text-amber-400 text-[10px] font-bold">0:08</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button onclick="copyHtmlEmailEmbed()" class="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-all flex items-center gap-1.5">
                      <span>📋 Copy HTML Email Embed</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Pro Growth Tip Box -->
              <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                <span class="text-xl">💡</span>
                <div>
                  <h4 class="text-xs font-bold text-brand-dark">Growth Pro-Tip:</h4>
                  <p id="videoProTipText" class="text-xs text-brand-muted mt-0.5 leading-relaxed">
                    Remind patients to avoid staining beverages for 48 hours after whitening to lock in radiant enamel brightness.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- TAB 2: 4 ENGAGEMENT GAMES -->
      <!-- ========================================================================= -->
      <section id="tab-games" class="tab-content hidden space-y-6">
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm space-y-6">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-5">
            <div>
              <div class="flex items-center gap-2.5">
                <span class="w-9 h-9 rounded-xl bg-amber-100 text-brand-clay flex items-center justify-center text-lg font-bold">🎮</span>
                <div>
                  <h2 class="font-heading text-xl sm:text-2xl font-bold text-brand-dark">4 Interactive Engagement Games</h2>
                  <p class="text-xs text-brand-muted mt-0.5">Captures customer emails at reception or via QR code with instant single-use reward vouchers.</p>
                </div>
              </div>
            </div>

            <!-- Game Sub-Selector -->
            <div class="flex items-center bg-brand-sand p-1 rounded-2xl border border-brand-border overflow-x-auto no-scrollbar">
              <button id="gameSubBtn-scratch" onclick="setGameType('scratch')" class="px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-brand-dark shadow-xs transition-all">
                ✨ Scratch Card
              </button>
              <button id="gameSubBtn-mystery_box" onclick="setGameType('mystery_box')" class="px-3 py-1.5 text-xs font-bold rounded-xl text-brand-muted hover:text-brand-dark transition-all">
                🎁 Mystery Box
              </button>
              <button id="gameSubBtn-slot_machine" onclick="setGameType('slot_machine')" class="px-3 py-1.5 text-xs font-bold rounded-xl text-brand-muted hover:text-brand-dark transition-all">
                🎰 Slot Reels
              </button>
              <button id="gameSubBtn-match_flip" onclick="setGameType('match_flip')" class="px-3 py-1.5 text-xs font-bold rounded-xl text-brand-muted hover:text-brand-dark transition-all">
                🃏 Memory Flip
              </button>
            </div>
          </div>

          <!-- Active Game Container -->
          <div class="max-w-2xl mx-auto bg-brand-sand/70 p-6 sm:p-8 rounded-3xl border border-brand-border text-center space-y-6">
            
            <div id="gameHeaderInfo" class="space-y-1.5">
              <h3 id="gameActiveTitle" class="font-heading text-2xl font-extrabold text-brand-dark">✨ Digital Scratch & Reveal Card</h3>
              <p id="gameActiveSubtitle" class="text-xs text-brand-muted max-w-md mx-auto">Use your finger or mouse to scratch off the protective foil and unveil your exclusive voucher reward!</p>
            </div>

            <!-- GAME 1: SCRATCH CARD CANVAS -->
            <div id="gameWrapper-scratch" class="game-wrapper flex flex-col items-center justify-center">
              <div class="scratch-container w-[340px] sm:w-[380px] h-[190px] rounded-2xl shadow-lg border border-brand-border bg-gradient-to-br from-amber-500 via-amber-600 to-brand-clay relative overflow-hidden flex flex-col items-center justify-center p-4 text-white">
                <div class="text-4xl mb-1" id="scratchRewardEmoji">🦷</div>
                <div class="font-heading text-lg font-bold tracking-tight text-white" id="scratchRewardName">$75 Off Professional In-Office Whitening</div>
                <div class="text-xs text-amber-100 font-semibold mt-1">Single-Use Code: <span class="bg-black/30 px-2 py-0.5 rounded font-mono" id="scratchRewardCode">DENTAL75</span></div>
                
                <canvas id="scratchCanvas" width="380" height="190"></canvas>
              </div>
              <div class="mt-3 text-[11px] font-semibold text-brand-muted">
                Scratch > 40% of the surface to claim voucher
              </div>
            </div>

            <!-- GAME 2: MYSTERY BOX -->
            <div id="gameWrapper-mystery_box" class="game-wrapper hidden">
              <div class="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <button onclick="pickMysteryBox(1)" class="p-5 rounded-2xl bg-white border border-brand-border hover:border-brand-amber hover:shadow-md transition-all group flex flex-col items-center gap-2">
                  <span class="text-4xl group-hover:scale-110 transition-transform">🎁</span>
                  <span class="text-xs font-bold text-brand-dark">Box #1</span>
                </button>
                <button onclick="pickMysteryBox(2)" class="p-5 rounded-2xl bg-white border border-brand-border hover:border-brand-amber hover:shadow-md transition-all group flex flex-col items-center gap-2">
                  <span class="text-4xl group-hover:scale-110 transition-transform">🎁</span>
                  <span class="text-xs font-bold text-brand-dark">Box #2</span>
                </button>
                <button onclick="pickMysteryBox(3)" class="p-5 rounded-2xl bg-white border border-brand-border hover:border-brand-amber hover:shadow-md transition-all group flex flex-col items-center gap-2">
                  <span class="text-4xl group-hover:scale-110 transition-transform">🎁</span>
                  <span class="text-xs font-bold text-brand-dark">Box #3</span>
                </button>
              </div>
            </div>

            <!-- GAME 3: SLOT REELS -->
            <div id="gameWrapper-slot_machine" class="game-wrapper hidden">
              <div class="max-w-md mx-auto bg-brand-dark p-6 rounded-3xl border border-neutral-800 shadow-xl space-y-4">
                <div class="grid grid-cols-3 gap-3 bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                  <div class="slot-reel bg-neutral-800 rounded-xl text-4xl" id="reel-1">✨</div>
                  <div class="slot-reel bg-neutral-800 rounded-xl text-4xl" id="reel-2">✨</div>
                  <div class="slot-reel bg-neutral-800 rounded-xl text-4xl" id="reel-3">✨</div>
                </div>
                <button id="btnSpinSlot" onclick="spinSlots()" class="w-full py-3 rounded-xl bg-gradient-to-r from-brand-amber to-brand-warm text-white font-bold text-sm shadow-md transition-all">
                  🎰 Pull Lever & Spin Reels
                </button>
              </div>
            </div>

            <!-- GAME 4: MEMORY MATCH FLIP -->
            <div id="gameWrapper-match_flip" class="game-wrapper hidden">
              <div class="grid grid-cols-3 gap-3 max-w-sm mx-auto" id="memoryCardsGrid">
                <!-- Injected via JS -->
              </div>
            </div>

            <!-- REWARD VOUCHER RESULT CARD -->
            <div id="gameRewardResultCard" class="hidden p-6 bg-white rounded-2xl border-2 border-brand-amber shadow-lg space-y-3 max-w-md mx-auto animate-fade-in">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <span>🎉 Voucher Unlocked!</span>
              </div>
              <h4 id="resultRewardName" class="font-heading text-lg font-bold text-brand-dark">$75 Off Professional In-Office Whitening</h4>
              <p id="resultRewardDesc" class="text-xs text-brand-muted">Brighten your smile with advanced laser whitening applied by certified dental hygienists.</p>
              
              <div class="p-3 bg-brand-sand rounded-xl border border-brand-border flex items-center justify-between">
                <div>
                  <span class="text-[10px] uppercase font-bold text-brand-muted">Single-Use Code</span>
                  <div id="resultVoucherCode" class="font-mono text-sm font-extrabold text-brand-dark">DENTAL75</div>
                </div>
                <button onclick="copyVoucherCode()" class="px-3 py-1.5 rounded-lg bg-brand-amber text-white text-xs font-bold hover:bg-brand-clay transition-all">
                  Copy Code
                </button>
              </div>

              <div class="text-[11px] text-brand-muted" id="resultRewardInstructions">
                Mention code when booking online or present voucher at front desk.
              </div>

              <button onclick="resetActiveGame()" class="text-xs font-bold text-brand-clay hover:underline pt-2">
                ↺ Play Again / Reset Game
              </button>
            </div>

          </div>
        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- TAB 3: IN-STORE DYNAMIC QR PRINT STANDEE STUDIO -->
      <!-- ========================================================================= -->
      <section id="tab-qr" class="tab-content hidden space-y-6">
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm space-y-6">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-5">
            <div>
              <div class="flex items-center gap-2.5">
                <span class="w-9 h-9 rounded-xl bg-amber-100 text-brand-clay flex items-center justify-center text-lg font-bold">📱</span>
                <div>
                  <h2 class="font-heading text-xl sm:text-2xl font-bold text-brand-dark">Dynamic In-Store QR Standee Studio</h2>
                  <p class="text-xs text-brand-muted mt-0.5">Generate high-converting, print-ready countertop table tents, window clings, and mirror cards.</p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button onclick="window.print()" class="px-4 py-2 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-sm">
                <span>🖨️ Print Standee PDF</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <!-- Left Controls -->
            <div class="lg:col-span-5 space-y-4 bg-brand-sand/60 p-5 rounded-2xl border border-brand-border">
              <div>
                <label class="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">Standee Headline</label>
                <input id="qrHeadlineInput" type="text" oninput="updateQrStandeePreview()" class="w-full px-3.5 py-2 rounded-xl bg-white border border-brand-border text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-amber/30" value="Scan & Unlock Your $75 Smile Care Perk" />
              </div>

              <div>
                <label class="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">Supporting Subtext</label>
                <input id="qrSubtextInput" type="text" oninput="updateQrStandeePreview()" class="w-full px-3.5 py-2 rounded-xl bg-white border border-brand-border text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-amber/30" value="Play our 10-second wellness game at reception for instant savings." />
              </div>

              <div>
                <label class="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1.5">Target Destination Link</label>
                <input id="qrUrlInput" type="text" oninput="generateQrCode()" class="w-full px-3.5 py-2 rounded-xl bg-white border border-brand-border text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-amber/30" value="https://expo-mail-proxy.local/game?ref=counter_standee" />
              </div>

              <div class="p-3 bg-white rounded-xl border border-brand-border text-xs text-brand-muted space-y-1">
                <span class="font-bold text-brand-dark block">📌 Recommended Acrylic Sizes:</span>
                <div>• 4" x 6" Standard Vertical Acrylic Counter Stand</div>
                <div>• 5" x 7" Waiting Room Table Tent</div>
              </div>
            </div>

            <!-- Right Print Preview Card -->
            <div class="lg:col-span-7 flex justify-center">
              <div id="printableStandeeCard" class="bg-white p-8 rounded-3xl border-2 border-brand-amber shadow-2xl text-center max-w-sm w-full space-y-4">
                <div class="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl mx-auto flex items-center justify-center text-2xl" id="standeeEmoji">
                  🦷
                </div>
                <h3 id="standeePreviewHeadline" class="font-heading text-xl font-extrabold text-brand-dark leading-snug">Scan & Unlock Your $75 Smile Care Perk</h3>
                <p id="standeePreviewSubtext" class="text-xs text-brand-muted">Play our 10-second wellness game at reception for instant dental treatment savings.</p>
                
                <div class="p-4 bg-brand-sand rounded-2xl border border-brand-border inline-block shadow-inner">
                  <div id="standeeQrContainer" class="w-44 h-44 flex items-center justify-center mx-auto"></div>
                </div>

                <div class="text-[11px] font-bold text-brand-clay uppercase tracking-wider">
                  ⚡ Works with any smartphone camera • No app needed
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- TAB 4: OUTBOUND DISPATCH & DELIVERABILITY AUDITOR -->
      <!-- ========================================================================= -->
      <section id="tab-dispatch" class="tab-content hidden space-y-6">
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm space-y-6">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-5">
            <div>
              <div class="flex items-center gap-2.5">
                <span class="w-9 h-9 rounded-xl bg-amber-100 text-brand-clay flex items-center justify-center text-lg font-bold">📬</span>
                <div>
                  <h2 class="font-heading text-xl sm:text-2xl font-bold text-brand-dark">Outbound Email Dispatch & Anti-Spam Auditor</h2>
                  <p class="text-xs text-brand-muted mt-0.5">Send high-converting email broadcasts with video embeds, SPF/DKIM verification, and spam audits.</p>
                </div>
              </div>
            </div>

            <!-- Provider Selector -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-brand-muted">Provider:</span>
              <select id="dispatchProvider" class="px-3 py-1.5 rounded-xl bg-brand-sand border border-brand-border text-xs font-semibold text-brand-dark">
                <option value="sandbox">🛡️ Safe Sandbox Mode</option>
                <option value="resend">Resend API</option>
                <option value="sendgrid">SendGrid</option>
                <option value="smtp">Custom SMTP Server</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <!-- Left Form -->
            <div class="lg:col-span-7 space-y-4">
              <div>
                <label class="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">Subject Line</label>
                <input id="emailSubjectInput" type="text" oninput="auditSpamScore()" class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-brand-border text-xs font-semibold text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-amber/30" value="✨ Prioritize Your Smile: $75 Whitening Voucher & Sonic Brush Perk" />
              </div>

              <div>
                <label class="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">Email Body Copy</label>
                <textarea id="emailBodyInput" rows="7" oninput="auditSpamScore()" class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-brand-border text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-amber/30 resize-none font-mono"></textarea>
              </div>

              <div class="flex items-center justify-between pt-2">
                <button onclick="dispatchOutboundEmail()" class="px-6 py-3 rounded-xl bg-brand-amber hover:bg-brand-clay text-white font-bold text-xs shadow-md shadow-brand-amber/20 transition-all flex items-center gap-2">
                  <span>🚀 Dispatch Email Campaign</span>
                </button>
                <button onclick="resetSampleEmailContent()" class="text-xs font-bold text-brand-clay hover:underline">
                  ↺ Load Industry Template
                </button>
              </div>

              <div id="dispatchFeedback" class="hidden p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                ✓ Campaign queued and dispatched successfully in sandbox mode!
              </div>
            </div>

            <!-- Right Deliverability Auditor -->
            <div class="lg:col-span-5 space-y-4 bg-brand-sand/60 p-5 rounded-2xl border border-brand-border">
              <h4 class="font-heading text-sm font-bold text-brand-dark flex items-center justify-between">
                <span>🛡️ Deliverability & Spam Audit</span>
                <span id="spamScoreBadge" class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">98 / 100 Safe</span>
              </h4>

              <div class="space-y-2.5 text-xs">
                <div class="p-2.5 bg-white rounded-xl border border-brand-border flex items-center justify-between">
                  <span class="text-brand-muted">SPF & DKIM Proxy Signing</span>
                  <span class="font-bold text-emerald-600">✓ Authenticated</span>
                </div>
                <div class="p-2.5 bg-white rounded-xl border border-brand-border flex items-center justify-between">
                  <span class="text-brand-muted">Spam Trigger Keywords</span>
                  <span id="spamKeywordStatus" class="font-bold text-emerald-600">✓ Clean (0 triggers)</span>
                </div>
                <div class="p-2.5 bg-white rounded-xl border border-brand-border flex items-center justify-between">
                  <span class="text-brand-muted">Video Embed Compatibility</span>
                  <span class="font-bold text-emerald-600">✓ Universal HTML5</span>
                </div>
                <div class="p-2.5 bg-white rounded-xl border border-brand-border flex items-center justify-between">
                  <span class="text-brand-muted">Anti-Abuse Voucher Validation</span>
                  <span class="font-bold text-emerald-600">✓ Single-Use Signed</span>
                </div>
              </div>

              <div class="p-3 bg-white rounded-xl border border-brand-border text-[11px] text-brand-muted leading-relaxed">
                💡 <strong>Slow-Trickle Pacing:</strong> Messages will be dispatched in compliant 15–20 message/hour windows to maintain high domain reputation.
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- TAB 5: AUTOMATED RETENTION & REBOOKING PIPELINES -->
      <!-- ========================================================================= -->
      <section id="tab-workflows" class="tab-content hidden space-y-6">
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm space-y-6">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-5">
            <div>
              <div class="flex items-center gap-2.5">
                <span class="w-9 h-9 rounded-xl bg-amber-100 text-brand-clay flex items-center justify-center text-lg font-bold">⚙️</span>
                <div>
                  <h2 class="font-heading text-xl sm:text-2xl font-bold text-brand-dark">Automated Rebooking & Retention Cadences</h2>
                  <p class="text-xs text-brand-muted mt-0.5">Hands-free customer lifecycle automations triggered by store visits, QR scans, and calendar intervals.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Workflow 1 -->
            <div class="p-6 bg-brand-sand/60 rounded-2xl border border-brand-border flex flex-col justify-between space-y-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">+2 Hours Post-Visit</span>
                  <span class="text-[11px] font-bold text-emerald-600 flex items-center gap-1">● Active</span>
                </div>
                <h4 class="font-heading text-base font-bold text-brand-dark">Gratitude Loop & 8s Care Video</h4>
                <p class="text-xs text-brand-muted leading-relaxed">
                  Sends an immediate thank-you note with an embedded 8-second video, aftercare instructions, and an invitation to leave a Google Review.
                </p>
              </div>
              <button onclick="triggerWorkflow('gratitude_loop')" class="w-full py-2.5 rounded-xl bg-white border border-brand-border hover:bg-brand-amber hover:text-white font-bold text-xs transition-all">
                ⚡ Test Run Gratitude Loop
              </button>
            </div>

            <!-- Workflow 2 -->
            <div class="p-6 bg-brand-sand/60 rounded-2xl border border-brand-border flex flex-col justify-between space-y-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">+4 Weeks Cadence</span>
                  <span class="text-[11px] font-bold text-emerald-600 flex items-center gap-1">● Active</span>
                </div>
                <h4 class="font-heading text-base font-bold text-brand-dark">Precision Rebooking Sequence</h4>
                <p class="text-xs text-brand-muted leading-relaxed">
                  Automatically invites past guests to reserve their upcoming haircut, dental checkup, or home maintenance with exclusive rebooking vouchers.
                </p>
              </div>
              <button onclick="triggerWorkflow('rebooking_cadence')" class="w-full py-2.5 rounded-xl bg-white border border-brand-border hover:bg-brand-amber hover:text-white font-bold text-xs transition-all">
                ⚡ Test Run Rebooking Trigger
              </button>
            </div>

            <!-- Workflow 3 -->
            <div class="p-6 bg-brand-sand/60 rounded-2xl border border-brand-border flex flex-col justify-between space-y-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">+60 Days Inactive</span>
                  <span class="text-[11px] font-bold text-emerald-600 flex items-center gap-1">● Active</span>
                </div>
                <h4 class="font-heading text-base font-bold text-brand-dark">Slow-Trickle Win-Back Drip</h4>
                <p class="text-xs text-brand-muted leading-relaxed">
                  Paces win-back invitations at 15–20 emails per hour with compelling return vouchers to re-engage lapsed clients safely.
                </p>
              </div>
              <button onclick="triggerWorkflow('slow_trickle_winback')" class="w-full py-2.5 rounded-xl bg-white border border-brand-border hover:bg-brand-amber hover:text-white font-bold text-xs transition-all">
                ⚡ Test Run Slow-Trickle Drip
              </button>
            </div>

            <!-- Workflow 4 -->
            <div class="p-6 bg-brand-sand/60 rounded-2xl border border-brand-border flex flex-col justify-between space-y-4">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">Weekly Audit</span>
                  <span class="text-[11px] font-bold text-emerald-600 flex items-center gap-1">● Active</span>
                </div>
                <h4 class="font-heading text-base font-bold text-brand-dark">VIP Loyalty Tier Progression</h4>
                <p class="text-xs text-brand-muted leading-relaxed">
                  Evaluates repeat customer transaction frequency, upgrades qualifying guests to Gold/Platinum tiers, and unlocks quarterly bonus perks.
                </p>
              </div>
              <button onclick="triggerWorkflow('vip_tier_calc')" class="w-full py-2.5 rounded-xl bg-white border border-brand-border hover:bg-brand-amber hover:text-white font-bold text-xs transition-all">
                ⚡ Test Run VIP Tier Audit
              </button>
            </div>

          </div>

          <div id="workflowFeedback" class="hidden p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            ✓ Workflow simulation completed! Dispatched 1 sample proxy transaction.
          </div>
        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- TAB 6: AI MARKETING CO-PILOT -->
      <!-- ========================================================================= -->
      <section id="tab-copilot" class="tab-content hidden space-y-6">
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-sm space-y-6">
          
          <div class="flex items-center gap-2.5 border-b border-brand-border/60 pb-5">
            <span class="w-9 h-9 rounded-xl bg-amber-100 text-brand-clay flex items-center justify-center text-lg font-bold">🤖</span>
            <div>
              <h2 class="font-heading text-xl sm:text-2xl font-bold text-brand-dark">AI Marketing Co-Pilot Assistant</h2>
              <p class="text-xs text-brand-muted mt-0.5">Strategize, draft industry weekly campaigns, and calculate customer retention optimizations.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Chat Feed -->
            <div class="lg:col-span-8 space-y-4">
              <div id="copilotChatFeed" class="h-80 overflow-y-auto p-4 bg-brand-sand/50 rounded-2xl border border-brand-border space-y-3 text-xs">
                <div class="bg-white p-3.5 rounded-2xl border border-brand-border shadow-xs max-w-lg">
                  <span class="font-bold text-brand-clay block mb-1">🤖 Expo Co-Pilot:</span>
                  <p class="text-brand-dark leading-relaxed">
                    Hello! I'm your growth marketing co-pilot. I can draft high-converting weekly emails, generate promotional video ideas, or plan re-engagement cadences for your business. What would you like to build today?
                  </p>
                </div>
              </div>

              <!-- Chat Input -->
              <div class="flex items-center gap-2">
                <input id="copilotInput" type="text" onkeydown="if(event.key==='Enter') sendCopilotMsg()" class="flex-1 px-4 py-2.5 rounded-xl bg-white border border-brand-border text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-amber/30" placeholder="Ask Co-Pilot for a campaign strategy or promotional idea..." />
                <button onclick="sendCopilotMsg()" class="px-5 py-2.5 rounded-xl bg-brand-amber hover:bg-brand-clay text-white font-bold text-xs transition-all shadow-sm">
                  Send
                </button>
              </div>
            </div>

            <!-- Quick Strategy Prompts -->
            <div class="lg:col-span-4 space-y-3 bg-brand-sand/60 p-4 rounded-2xl border border-brand-border">
              <span class="text-xs font-bold uppercase tracking-wider text-brand-dark block">⚡ Fast Strategy Prompts</span>
              <div class="space-y-2">
                <button onclick="runQuickPrompt('Draft a 3-day weekend flash campaign with video perks')" class="w-full text-left p-2.5 bg-white rounded-xl border border-brand-border hover:border-brand-amber text-xs font-medium text-brand-dark transition-all">
                  🎯 Weekend Flash Promotion
                </button>
                <button onclick="runQuickPrompt('Plan a 30-day inactive customer win-back campaign')" class="w-full text-left p-2.5 bg-white rounded-xl border border-brand-border hover:border-brand-amber text-xs font-medium text-brand-dark transition-all">
                  💌 Inactive Customer Win-Back
                </button>
                <button onclick="runQuickPrompt('Draft a VIP customer gratitude email with a $25 reward voucher')" class="w-full text-left p-2.5 bg-white rounded-xl border border-brand-border hover:border-brand-amber text-xs font-medium text-brand-dark transition-all">
                  🌟 VIP Gratitude Campaign
                </button>
                <button onclick="runQuickPrompt('Generate 4 promotional video concepts for email embeds')" class="w-full text-left p-2.5 bg-white rounded-xl border border-brand-border hover:border-brand-amber text-xs font-medium text-brand-dark transition-all">
                  🎬 4 Micro-Video Ideas
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  </main>

  <!-- ========================================================================= -->
  <!-- INTERACTIVE ONBOARDING POP-UP BUBBLE MODAL -->
  <!-- ========================================================================= -->
  <div id="onboardingModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-all duration-300 hidden">
    <div class="bg-white rounded-3xl border-2 border-brand-amber p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative animate-fade-in">
      
      <!-- Top Bubble Progress Bar -->
      <div class="flex items-center justify-between border-b border-brand-border/60 pb-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-amber-100 text-brand-clay flex items-center justify-center text-sm font-extrabold bubble-pulse">
            💡
          </div>
          <div>
            <span class="text-[11px] font-bold uppercase tracking-wider text-brand-clay" id="onboardingStepBadge">Step 1 of 5</span>
            <h3 class="font-heading text-lg font-bold text-brand-dark" id="onboardingTitle">Select Your Business Niche</h3>
          </div>
        </div>

        <button onclick="closeOnboardingModal(false)" class="text-brand-muted hover:text-brand-dark text-xl font-bold p-1">
          ✕
        </button>
      </div>

      <!-- Bubble Step Content -->
      <div class="space-y-4">
        <p class="text-xs sm:text-sm text-brand-muted leading-relaxed" id="onboardingDesc">
          Switch between Dental, Real Estate, General Contractors, Tattoo & Piercing, Financial Wealth, Barbershops & Salons, Cafes & Bakeries, or Retail. The entire platform dynamically adapts its video presets, gamified rewards, and email copy!
        </p>

        <!-- Progress Indicator Dots -->
        <div class="flex items-center justify-center gap-2 py-2" id="onboardingDots">
          <span class="w-2.5 h-2.5 rounded-full bg-brand-amber"></span>
          <span class="w-2 h-2 rounded-full bg-brand-border"></span>
          <span class="w-2 h-2 rounded-full bg-brand-border"></span>
          <span class="w-2 h-2 rounded-full bg-brand-border"></span>
          <span class="w-2 h-2 rounded-full bg-brand-border"></span>
        </div>
      </div>

      <!-- Action Navigation Row -->
      <div class="flex items-center justify-between pt-2 border-t border-brand-border/60">
        <button id="btnOnboardingPrev" onclick="prevOnboardingStep()" class="px-4 py-2 rounded-xl bg-brand-sand border border-brand-border text-xs font-bold text-brand-dark hover:bg-neutral-200 transition-all opacity-50 cursor-not-allowed" disabled>
          ← Back
        </button>

        <div class="flex items-center gap-2">
          <button onclick="closeOnboardingModal(true)" class="text-xs font-semibold text-brand-muted hover:text-brand-dark px-2">
            Don't show again
          </button>
          <button id="btnOnboardingNext" onclick="nextOnboardingStep()" class="px-5 py-2.5 rounded-xl bg-brand-amber hover:bg-brand-clay text-white text-xs font-bold shadow-md shadow-brand-amber/20 transition-all">
            Next: Explore Video Studio →
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- FOOTER -->
  <footer class="bg-white border-t border-brand-border py-4 px-4 sm:px-8 text-center text-xs text-brand-muted mt-auto">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
      <div>Expo Mail Proxy • Local Business Outreach, AI Video Engine & Automated Retention</div>
      <div class="flex items-center gap-3">
        <button onclick="switchViewMode('landing')" class="hover:text-brand-dark">Product Tour</button>
        <span>•</span>
        <button onclick="restartOnboardingTour()" class="hover:text-brand-dark">💡 Directions Guide</button>
      </div>
    </div>
  </footer>

  <!-- CLIENT-SIDE DATA & SCRIPT ENGINE -->
  <script>
    // Industry Profiles injected from server
    const INDUSTRY_PROFILES = ${JSON.stringify(INDUSTRY_PROFILES)};
    const ONBOARDING_STEPS = ${JSON.stringify(ONBOARDING_STEPS)};

    let currentCategory = 'dental_health';
    let currentTab = 'video';
    let currentViewMode = 'landing';
    let currentVideoAspect = '16-9';
    let currentGameType = 'scratch';
    let currentOnboardingStep = 0;
    let qrGeneratorInstance = null;

    // Initialize application state
    window.addEventListener('DOMContentLoaded', () => {
      onCategoryChange('dental_health');
      initScratchCanvas();
      generateQrCode();
      generateLandingQrCode();
    });

    function switchViewMode(mode) {
      currentViewMode = mode;
      const landingView = document.getElementById('landingView');
      const appView = document.getElementById('appView');
      const appNavTabs = document.getElementById('appNavTabs');
      const btnLanding = document.getElementById('viewBtn-landing');
      const btnApp = document.getElementById('viewBtn-app');

      if (mode === 'landing') {
        landingView?.classList.remove('hidden');
        appView?.classList.add('hidden');
        appNavTabs?.classList.add('hidden');

        btnLanding?.classList.add('bg-white', 'text-brand-dark', 'shadow-sm', 'border', 'border-brand-border');
        btnLanding?.classList.remove('text-brand-muted');
        btnApp?.classList.remove('bg-white', 'text-brand-dark', 'shadow-sm', 'border', 'border-brand-border');
        btnApp?.classList.add('text-brand-muted');

        generateLandingQrCode();
      } else {
        landingView?.classList.add('hidden');
        appView?.classList.remove('hidden');
        appNavTabs?.classList.remove('hidden');

        btnApp?.classList.add('bg-white', 'text-brand-dark', 'shadow-sm', 'border', 'border-brand-border');
        btnApp?.classList.remove('text-brand-muted');
        btnLanding?.classList.remove('bg-white', 'text-brand-dark', 'shadow-sm', 'border', 'border-brand-border');
        btnLanding?.classList.add('text-brand-muted');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openTab(tabId) {
      if (currentViewMode === 'landing') {
        switchViewMode('app');
      }
      currentTab = tabId;
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      const activeEl = document.getElementById('tab-' + tabId);
      if (activeEl) activeEl.classList.remove('hidden');

      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-brand-amber', 'text-white', 'shadow-sm');
        btn.classList.add('text-brand-muted');
      });
      const activeBtn = document.getElementById('tabBtn-' + tabId);
      if (activeBtn) {
        activeBtn.classList.add('bg-brand-amber', 'text-white', 'shadow-sm');
        activeBtn.classList.remove('text-brand-muted');
      }
    }

    function onCategoryChange(catId) {
      currentCategory = catId;
      const profile = INDUSTRY_PROFILES[catId] || INDUSTRY_PROFILES['general'];
      
      // Update dropdown selection if needed
      const select = document.getElementById('globalBizCategory');
      if (select && select.value !== catId) select.value = catId;

      // Update header details
      document.getElementById('headerSectorBadge').textContent = profile.name;
      document.getElementById('headerTagline').textContent = profile.tagline;

      // Update Video Studio
      document.getElementById('videoTitleBadge').textContent = profile.sampleVideoTitle;
      document.getElementById('videoDurationBadge').textContent = profile.sampleVideoDuration;
      document.getElementById('videoProTipText').textContent = profile.sampleProTip;
      const activeVideo = document.getElementById('activeVideoElement');
      if (activeVideo) {
        activeVideo.poster = profile.sampleVideoPoster;
      }

      // Update Quick Chips in Video Studio
      const chipsContainer = document.getElementById('quickPromptChips');
      chipsContainer.innerHTML = \`
        <button onclick="setPrompt('\${profile.copilotPreset}')" class="px-2.5 py-1 rounded-lg bg-white border border-brand-border text-[11px] font-medium text-brand-dark hover:border-brand-amber">\${profile.emoji} \${profile.copilotPreset}</button>
        <button onclick="setPrompt('Generate an 8-second customer appreciation promo')" class="px-2.5 py-1 rounded-lg bg-white border border-brand-border text-[11px] font-medium text-brand-dark hover:border-brand-amber">⚡ 8s Appreciation Promo</button>
      \`;

      // Update QR standee
      document.getElementById('qrHeadlineInput').value = profile.sampleQrHeadline;
      document.getElementById('qrSubtextInput').value = profile.sampleQrSubtext;
      updateQrStandeePreview();

      // Update Email Dispatch defaults
      document.getElementById('emailSubjectInput').value = profile.sampleSubject;
      document.getElementById('emailBodyInput').value = profile.sampleEmailBody;
      auditSpamScore();

      // Update Scratch reward preview
      document.getElementById('scratchRewardEmoji').textContent = profile.emoji;
      document.getElementById('scratchRewardName').textContent = profile.sampleRewardHighlight;
    }

    function setPrompt(text) {
      document.getElementById('videoPromptInput').value = text;
    }

    function setVideoAspect(aspect) {
      currentVideoAspect = aspect;
      const btn16_9 = document.getElementById('aspectBtn-16-9');
      const btn9_16 = document.getElementById('aspectBtn-9-16');
      const container = document.getElementById('videoFrameContainer');

      if (aspect === '16-9') {
        container.className = 'aspect-video-16-9 relative bg-neutral-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center';
        btn16_9.className = 'px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white text-brand-dark shadow-xs transition-all flex items-center gap-1.5';
        btn9_16.className = 'px-3.5 py-1.5 text-xs font-bold rounded-xl text-brand-muted hover:text-brand-dark transition-all flex items-center gap-1.5';
      } else {
        container.className = 'aspect-video-9-16 relative bg-neutral-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center';
        btn9_16.className = 'px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white text-brand-dark shadow-xs transition-all flex items-center gap-1.5';
        btn16_9.className = 'px-3.5 py-1.5 text-xs font-bold rounded-xl text-brand-muted hover:text-brand-dark transition-all flex items-center gap-1.5';
      }
    }

    function generateAiVideo() {
      const status = document.getElementById('videoGenStatus');
      const btn = document.getElementById('btnGenerateVideo');
      status.classList.remove('hidden');
      btn.disabled = true;

      setTimeout(() => {
        status.classList.add('hidden');
        btn.disabled = false;
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      }, 1500);
    }

    function copyHtmlEmailEmbed() {
      const profile = INDUSTRY_PROFILES[currentCategory] || INDUSTRY_PROFILES['general'];
      const html = \`<table cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;margin:0 auto;background-color:#ffffff;border-radius:12px;border:1px solid #e8dfd5;overflow:hidden;">
  <tr>
    <td align="center" style="position:relative;background-color:#1c1917;">
      <a href="https://expo-mail-proxy.local/watch" target="_blank" style="text-decoration:none;display:block;">
        <img src="\${profile.sampleVideoPoster}" alt="\${profile.sampleVideoTitle}" style="width:100%;height:auto;display:block;max-height:340px;object-fit:cover;" />
        <div style="padding:12px;background-color:#1c1917;color:#ffffff;font-family:sans-serif;font-size:13px;font-weight:bold;">
          ▶ Watch \${profile.sampleVideoTitle} (\${profile.sampleVideoDuration})
        </div>
      </a>
    </td>
  </tr>
</table>\`;
      navigator.clipboard.writeText(html).then(() => {
        alert('HTML Email Embed code copied to clipboard!');
      });
    }

    // ==========================================
    // GAMES LOGIC
    // ==========================================
    function setGameType(type) {
      currentGameType = type;
      document.querySelectorAll('.game-wrapper').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('[id^="gameSubBtn-"]').forEach(btn => {
        btn.classList.remove('bg-white', 'text-brand-dark', 'shadow-xs');
        btn.classList.add('text-brand-muted');
      });

      const activeBtn = document.getElementById('gameSubBtn-' + type);
      if (activeBtn) {
        activeBtn.classList.add('bg-white', 'text-brand-dark', 'shadow-xs');
        activeBtn.classList.remove('text-brand-muted');
      }

      const activeWrapper = document.getElementById('gameWrapper-' + type);
      if (activeWrapper) activeWrapper.classList.remove('hidden');

      if (type === 'scratch') {
        document.getElementById('gameActiveTitle').textContent = '✨ Digital Scratch & Reveal Card';
        document.getElementById('gameActiveSubtitle').textContent = 'Use your finger or mouse to scratch off the protective foil and unveil your exclusive voucher reward!';
        initScratchCanvas();
      } else if (type === 'mystery_box') {
        document.getElementById('gameActiveTitle').textContent = '🎁 VIP Mystery Gift Unboxing';
        document.getElementById('gameActiveSubtitle').textContent = 'Select 1 of 3 locked golden mystery boxes to unlock your surprise service perk!';
      } else if (type === 'slot_machine') {
        document.getElementById('gameActiveTitle').textContent = '🎰 Triple Match Reward Reels';
        document.getElementById('gameActiveSubtitle').textContent = 'Pull the lever and spin 3 reels to hit the grand customer rewards jackpot!';
      } else if (type === 'match_flip') {
        document.getElementById('gameActiveTitle').textContent = '🃏 Memory Pair Match Challenge';
        document.getElementById('gameActiveSubtitle').textContent = 'Flip and match the matching brand symbols to unlock VIP loyalty vouchers!';
        initMemoryGame();
      }

      document.getElementById('gameRewardResultCard').classList.add('hidden');
    }

    function initScratchCanvas() {
      const canvas = document.getElementById('scratchCanvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 16px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ SCRATCH WITH FINGER / MOUSE TO REVEAL ✨', canvas.width / 2, canvas.height / 2 + 6);

      let isDrawing = false;
      let scratchedPixels = 0;

      function scratch(e) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = (clientX - rect.left) * (canvas.width / rect.width);
        const y = (clientY - rect.top) * (canvas.height / rect.height);

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 24, 0, Math.PI * 2);
        ctx.fill();

        scratchedPixels++;
        if (scratchedPixels > 35) {
          revealReward();
        }
      }

      canvas.onmousedown = () => { isDrawing = true; };
      canvas.onmouseup = () => { isDrawing = false; };
      canvas.onmousemove = scratch;
      canvas.ontouchstart = () => { isDrawing = true; };
      canvas.ontouchend = () => { isDrawing = false; };
      canvas.ontouchmove = scratch;
    }

    function pickMysteryBox(boxNum) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      revealReward();
    }

    function spinSlots() {
      const r1 = document.getElementById('reel-1');
      const r2 = document.getElementById('reel-2');
      const r3 = document.getElementById('reel-3');
      const btn = document.getElementById('btnSpinSlot');
      btn.disabled = true;

      r1.classList.add('slot-spinning');
      r2.classList.add('slot-spinning');
      r3.classList.add('slot-spinning');

      const symbols = ['💎', '✨', '🎁', '⭐', '🎉'];
      const profile = INDUSTRY_PROFILES[currentCategory] || INDUSTRY_PROFILES['general'];

      setTimeout(() => {
        r1.classList.remove('slot-spinning');
        r1.textContent = profile.emoji;
      }, 600);

      setTimeout(() => {
        r2.classList.remove('slot-spinning');
        r2.textContent = profile.emoji;
      }, 1000);

      setTimeout(() => {
        r3.classList.remove('slot-spinning');
        r3.textContent = profile.emoji;
        btn.disabled = false;
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        revealReward();
      }, 1400);
    }

    function initMemoryGame() {
      const grid = document.getElementById('memoryCardsGrid');
      if (!grid) return;
      const profile = INDUSTRY_PROFILES[currentCategory] || INDUSTRY_PROFILES['general'];
      const icons = [profile.emoji, profile.emoji, '⭐', '⭐', '🎁', '🎁'];
      grid.innerHTML = icons.map((icon, i) => \`
        <button onclick="flipMemoryCard(this, '\${icon}')" class="h-20 bg-white rounded-xl border border-brand-border flex items-center justify-center text-2xl font-bold shadow-xs hover:border-brand-amber transition-all">
          ❓
        </button>
      \`).join('');
    }

    let flippedCount = 0;
    function flipMemoryCard(btn, icon) {
      btn.textContent = icon;
      btn.classList.add('bg-amber-50', 'border-brand-amber');
      flippedCount++;
      if (flippedCount >= 4) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        revealReward();
      }
    }

    function revealReward() {
      const profile = INDUSTRY_PROFILES[currentCategory] || INDUSTRY_PROFILES['general'];
      document.getElementById('resultRewardName').textContent = profile.sampleRewardHighlight;
      document.getElementById('resultRewardDesc').textContent = profile.tagline;
      document.getElementById('gameRewardResultCard').classList.remove('hidden');
    }

    function copyVoucherCode() {
      const code = document.getElementById('resultVoucherCode').textContent;
      navigator.clipboard.writeText(code).then(() => {
        alert('Voucher code copied: ' + code);
      });
    }

    function resetActiveGame() {
      document.getElementById('gameRewardResultCard').classList.add('hidden');
      if (currentGameType === 'scratch') initScratchCanvas();
      if (currentGameType === 'match_flip') {
        flippedCount = 0;
        initMemoryGame();
      }
    }

    // ==========================================
    // QR CODE STANDEE STUDIO
    // ==========================================
    function updateQrStandeePreview() {
      const headline = document.getElementById('qrHeadlineInput').value;
      const subtext = document.getElementById('qrSubtextInput').value;
      const profile = INDUSTRY_PROFILES[currentCategory] || INDUSTRY_PROFILES['general'];

      document.getElementById('standeePreviewHeadline').textContent = headline;
      document.getElementById('standeePreviewSubtext').textContent = subtext;
      document.getElementById('standeeEmoji').textContent = profile.emoji;
    }

    function generateQrCode() {
      const url = document.getElementById('qrUrlInput').value || 'https://expo-mail-proxy.local';
      const container = document.getElementById('standeeQrContainer');
      if (!container) return;
      container.innerHTML = '';
      new QRCode(container, {
        text: url,
        width: 176,
        height: 176,
        colorDark: '#1C1917',
        colorLight: '#FAF5EF',
        correctLevel: QRCode.CorrectLevel.H
      });
    }

    function generateLandingQrCode() {
      const container = document.getElementById('landingDemoQr');
      if (!container) return;
      container.innerHTML = '';
      new QRCode(container, {
        text: 'https://expo-mail-proxy.local/demo',
        width: 160,
        height: 160,
        colorDark: '#1C1917',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.H
      });
    }

    // ==========================================
    // DISPATCH & AUDITOR LOGIC
    // ==========================================
    function auditSpamScore() {
      const subject = document.getElementById('emailSubjectInput').value.toLowerCase();
      const body = document.getElementById('emailBodyInput').value.toLowerCase();
      const spamWords = ['free money', 'act now!!!', 'viagra', '100% free $$$', 'risk free guaranteed'];

      let triggers = 0;
      spamWords.forEach(w => {
        if (subject.includes(w) || body.includes(w)) triggers++;
      });

      const badge = document.getElementById('spamScoreBadge');
      const status = document.getElementById('spamKeywordStatus');
      if (triggers === 0) {
        badge.textContent = '99 / 100 Safe';
        badge.className = 'px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold';
        status.textContent = '✓ Clean (0 triggers)';
        status.className = 'font-bold text-emerald-600';
      } else {
        badge.textContent = '74 / 100 Warning';
        badge.className = 'px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold';
        status.textContent = '⚠️ ' + triggers + ' keyword trigger(s)';
        status.className = 'font-bold text-amber-600';
      }
    }

    function dispatchOutboundEmail() {
      const feedback = document.getElementById('dispatchFeedback');
      feedback.classList.remove('hidden');
      setTimeout(() => {
        feedback.classList.add('hidden');
      }, 3500);
    }

    function resetSampleEmailContent() {
      const profile = INDUSTRY_PROFILES[currentCategory] || INDUSTRY_PROFILES['general'];
      document.getElementById('emailSubjectInput').value = profile.sampleSubject;
      document.getElementById('emailBodyInput').value = profile.sampleEmailBody;
      auditSpamScore();
    }

    // ==========================================
    // WORKFLOW SIMULATION
    // ==========================================
    function triggerWorkflow(name) {
      const feedback = document.getElementById('workflowFeedback');
      feedback.textContent = '✓ Workflow [' + name + '] triggered! Dispatched proxy notification & logged transaction.';
      feedback.classList.remove('hidden');
      setTimeout(() => {
        feedback.classList.add('hidden');
      }, 3500);
    }

    // ==========================================
    // AI CO-PILOT ASSISTANT
    // ==========================================
    function sendCopilotMsg() {
      const input = document.getElementById('copilotInput');
      const query = input.value.trim();
      if (!query) return;

      const feed = document.getElementById('copilotChatFeed');
      feed.innerHTML += \`
        <div class="bg-brand-amber/10 p-3.5 rounded-2xl border border-brand-amber/20 max-w-lg ml-auto text-right">
          <span class="font-bold text-brand-clay block mb-1">You:</span>
          <p class="text-brand-dark">\${query}</p>
        </div>
      \`;
      input.value = '';

      fetch('/api/copilot/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, businessCategory: currentCategory })
      })
      .then(res => res.json())
      .then(data => {
        feed.innerHTML += \`
          <div class="bg-white p-3.5 rounded-2xl border border-brand-border shadow-xs max-w-lg">
            <span class="font-bold text-brand-clay block mb-1">🤖 Expo Co-Pilot:</span>
            <div class="text-brand-dark leading-relaxed whitespace-pre-wrap">\${data.reply || 'Strategy drafted.'}</div>
          </div>
        \`;
        feed.scrollTop = feed.scrollHeight;
      })
      .catch(() => {
        const profile = INDUSTRY_PROFILES[currentCategory] || INDUSTRY_PROFILES['general'];
        feed.innerHTML += \`
          <div class="bg-white p-3.5 rounded-2xl border border-brand-border shadow-xs max-w-lg">
            <span class="font-bold text-brand-clay block mb-1">🤖 Expo Co-Pilot:</span>
            <p class="text-brand-dark leading-relaxed">
              Here is your strategic recommendation for <strong>\${profile.name}</strong>:
              <br/>• Launch a 4-week automated cadence offering: <em>\${profile.sampleRewardHighlight}</em>.
              <br/>• Attach our 8-second video clip: <em>"\${profile.sampleVideoTitle}"</em> to boost engagement.
            </p>
          </div>
        \`;
        feed.scrollTop = feed.scrollHeight;
      });
    }

    function runQuickPrompt(text) {
      document.getElementById('copilotInput').value = text;
      sendCopilotMsg();
    }

    // ==========================================
    // INTERACTIVE ONBOARDING POP-UP BUBBLES
    // ==========================================
    function toggleOnboardingModal() {
      const modal = document.getElementById('onboardingModal');
      if (modal.classList.contains('hidden')) {
        openOnboardingModal();
      } else {
        closeOnboardingModal(false);
      }
    }

    function openOnboardingModal() {
      currentOnboardingStep = 0;
      renderOnboardingStep();
      document.getElementById('onboardingModal').classList.remove('hidden');
    }

    function closeOnboardingModal(disablePermanently) {
      document.getElementById('onboardingModal').classList.add('hidden');
      if (disablePermanently) {
        localStorage.setItem('expo_onboarding_disabled', 'true');
      }
    }

    function restartOnboardingTour() {
      localStorage.removeItem('expo_onboarding_disabled');
      switchViewMode('app');
      openOnboardingModal();
    }

    function renderOnboardingStep() {
      const step = ONBOARDING_STEPS[currentOnboardingStep];
      if (!step) return;

      document.getElementById('onboardingStepBadge').textContent = step.badge;
      document.getElementById('onboardingTitle').textContent = step.title;
      document.getElementById('onboardingDesc').textContent = step.description;
      document.getElementById('btnOnboardingNext').textContent = step.actionText;

      // Update Back Button state
      const prevBtn = document.getElementById('btnOnboardingPrev');
      if (currentOnboardingStep === 0) {
        prevBtn.disabled = true;
        prevBtn.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        prevBtn.disabled = false;
        prevBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }

      // Update dots
      const dotsContainer = document.getElementById('onboardingDots');
      dotsContainer.innerHTML = ONBOARDING_STEPS.map((s, idx) => {
        if (idx === currentOnboardingStep) {
          return '<span class="w-3 h-3 rounded-full bg-brand-amber shadow-sm"></span>';
        }
        return '<span class="w-2 h-2 rounded-full bg-brand-border"></span>';
      }).join('');

      // Switch to relevant app tab
      if (step.targetTab) {
        openTab(step.targetTab);
      }
    }

    function nextOnboardingStep() {
      if (currentOnboardingStep < ONBOARDING_STEPS.length - 1) {
        currentOnboardingStep++;
        renderOnboardingStep();
      } else {
        closeOnboardingModal(true);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
    }

    function prevOnboardingStep() {
      if (currentOnboardingStep > 0) {
        currentOnboardingStep--;
        renderOnboardingStep();
      }
    }
  </script>
</body>
</html>`;
}
