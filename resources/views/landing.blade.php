<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
    <title>Cosco UNS Madiun - Super App Cost Control & Tata Kelola Anggaran</title>
    <meta name="description" content="Portal Resmi Cost Control (Cosco) Universitas Sebelas Maret (UNS) Kampus Madiun. Perencanaan TOR & RAB, monitoring dan review anggaran, ajuan memo cair, serta pelaporan SPJ & LPJ penuh amanah dan integritas.">

    <link rel="icon" href="/images/cosco/favicon_cosco.png?v=hd2026" type="image/png">
    <link rel="shortcut icon" href="/images/cosco/favicon_cosco.png?v=hd2026" type="image/png">
    <link rel="apple-touch-icon" href="/images/cosco/favicon_cosco.png?v=hd2026">

    <!-- Google Fonts: Montserrat, Plus Jakarta Sans & Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">

    <!-- TAILWIND CSS RUNTIME ENGINE -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        uns: {
                            midnight: '#020617',
                            navy: '#0F172A',
                            deep: '#172554',
                            blue: '#1E3A8A',
                            royal: '#1E40AF',
                            bright: '#2563EB',
                            gold: '#F59E0B',
                            amber: '#D97706',
                            emerald: '#059669',
                        }
                    },
                    fontFamily: {
                        sans: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
                        heading: ['"Montserrat"', 'sans-serif'],
                    }
                }
            }
        }
    </script>

    <style>
        body {
            font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
            background-color: #F8FAFC;
            color: #0F172A;
            overflow-x: hidden;
        }
        h1, h2, h3, h4, h5, h6, .font-heading {
            font-family: 'Montserrat', sans-serif;
            letter-spacing: -0.015em;
        }

        /* HERO DOT MATRIX PATTERN */
        .hero-dot-grid {
            background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1.5px, transparent 1.5px);
            background-size: 20px 20px;
        }

        /* SCROLL REVEAL ANIMATIONS (SAFE & SMOOTH) */
        .reveal-on-scroll {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            will-change: opacity, transform;
        }
        .reveal-on-scroll.is-revealed {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        .reveal-delay-100 { transition-delay: 0.08s; }
        .reveal-delay-200 { transition-delay: 0.16s; }
        .reveal-delay-300 { transition-delay: 0.24s; }
        .reveal-delay-400 { transition-delay: 0.32s; }

        /* CROSSFADE SLIDER */
        .hero-slide {
            position: absolute;
            inset: 0;
            opacity: 0;
            transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
            background-size: cover;
            background-position: center;
        }
        .hero-slide.active {
            opacity: 1;
            z-index: 1;
        }
    </style>
</head>
<body class="antialiased selection:bg-amber-400 selection:text-blue-950 flex flex-col min-h-screen">

    <!-- ==========================================
         TOP ANNOUNCEMENT & LIVE CLOCK BAR
         ========================================== -->
    <div class="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-1.5 sm:gap-2">
            <div class="flex items-center gap-2 text-center md:text-left">
                <span class="flex h-2 w-2 relative shrink-0">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span class="text-[10.5px] sm:text-xs font-medium text-slate-300">
                    Portal Resmi Cost Control - Universitas Sebelas Maret (UNS) Kampus Madiun
                </span>
            </div>
            <div class="flex items-center gap-2.5 text-slate-400 text-[10.5px] sm:text-[11px] flex-wrap justify-center">
                <span class="flex items-center gap-1">
                    <svg class="w-3 h-3 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Caruban, Madiun
                </span>
                <span class="text-slate-700 hidden sm:inline">-</span>
                <span class="flex items-center gap-1">
                    <svg class="w-3 h-3 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    07.30 - 16.30 WIB
                </span>
                <span class="text-slate-700 hidden sm:inline">-</span>
                <span class="flex items-center gap-1 font-medium text-slate-200">
                    <svg class="w-3 h-3 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span id="liveDateClockTopBar">Sabtu, 22 Agustus 2026 - 19:10 WIB</span>
                </span>
            </div>
        </div>
    </div>

    <!-- ==========================================
         NAVBAR (CLEAN, 100% UN-CRAMPED ON MOBILE)
         ========================================== -->
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16 sm:h-20">
                
                <!-- BRANDING & LOGO -->
                <a href="/" class="flex items-center gap-2.5 sm:gap-3.5 group shrink-0">
                    <img src="/images/logo_uns.png?v=uns2026" alt="Logo Resmi UNS" class="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105 shrink-0">
                    <div class="h-7 sm:h-8 w-px bg-slate-200 shrink-0"></div>
                    <div class="flex flex-col justify-center">
                        <div class="flex items-center gap-1.5 sm:gap-2">
                            <span class="text-lg sm:text-2xl font-black font-heading tracking-tight text-blue-900 leading-none">
                                COSCO
                            </span>
                            <span class="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-300 whitespace-nowrap">
                                Cost Control
                            </span>
                        </div>
                        <span class="text-[10px] sm:text-[11px] font-semibold text-slate-500 tracking-tight leading-none mt-1">
                            UNS Kampus Madiun
                        </span>
                    </div>
                </a>

                <!-- DESKTOP NAV LINKS -->
                <nav class="hidden lg:flex items-center gap-7">
                    <a href="#fitur-utama" class="text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-blue-900 transition-colors">
                        4 Pilar Fitur
                    </a>
                    <a href="#alur-sistem" class="text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-blue-900 transition-colors">
                        Alur Pengajuan
                    </a>
                    <a href="#komitmen-amanah" class="text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-blue-900 transition-colors">
                        Komitmen Integritas
                    </a>
                </nav>

                <!-- RIGHT ACTION: DESKTOP LOGIN / MOBILE HAMBURGER -->
                <div class="flex items-center gap-2.5">
                    <!-- Desktop / Tablet Login Button -->
                    <a href="/login" class="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-heading font-bold shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer">
                        <span>Masuk Dashboard</span>
                        <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                    </a>

                    <!-- Mobile Hamburger Button Only -->
                    <button id="mobileMenuBtn" type="button" class="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-900" aria-label="Buka Menu">
                        <svg id="hamburgerIcon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                        <svg id="closeIcon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

            </div>
        </div>

                <!-- MOBILE MENU DRAWER (CUSTOM SVG ICONS ONLY - ZERO EMOJI) -->
        <div id="mobileMenu" class="hidden lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-xl">
            <a href="#fitur-utama" class="mobile-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-900 transition-colors">
                <div class="size-7 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-100">
                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <span>4 Pilar Fitur Tata Kelola</span>
            </a>
            <a href="#alur-sistem" class="mobile-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 transition-colors">
                <div class="size-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                </div>
                <span>Alur Pengajuan & Pencairan Dana</span>
            </a>
            <a href="#komitmen-amanah" class="mobile-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-amber-50 hover:text-amber-900 transition-colors">
                <div class="size-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-100">
                    <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <span>Komitmen Integritas & Amanah</span>
            </a>
            <div class="pt-2 border-t border-slate-100">
                <a href="/login" class="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-heading font-bold text-xs shadow-md transition-colors">
                    <span>Masuk ke Dashboard Cosco</span>
                    <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                </a>
            </div>
        </div>
    </header>

    <!-- ==========================================
         HERO SECTION (SPACIOUS, NO OVERLAPPING)
         ========================================== -->
    <section class="relative bg-slate-950 text-white overflow-hidden">
        
        <!-- BACKGROUND CROSSFADE SLIDER -->
        <div class="absolute inset-0 z-0 overflow-hidden">
            <div class="hero-slide active" style="background-image: url('/images/cosco/cosco_slide1.jpg');"></div>
            <div class="hero-slide" style="background-image: url('/images/cosco/cosco_slide2.jpg');"></div>
            <div class="hero-slide" style="background-image: url('/images/cosco/cosco_slide3.jpg');"></div>
            
            <!-- OVERLAYS -->
            <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-blue-950/70 z-10"></div>
            <div class="absolute inset-0 hero-dot-grid opacity-25 z-10 pointer-events-none"></div>
        </div>

        <!-- HERO CONTENT -->
        <div class="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 lg:py-24">
            <div class="max-w-3xl space-y-4 sm:space-y-6">
                
                <!-- TOP BADGE -->
                <div class="flex items-center gap-2 text-amber-400 text-xs sm:text-sm font-bold uppercase tracking-widest font-heading">
                    <span class="size-2 rounded-full bg-amber-400 shrink-0"></span>
                    <span>SUPER APP COST CONTROL - UNS MADIUN</span>
                </div>

                <!-- MAIN HEADINGS -->
                <div class="space-y-2.5 sm:space-y-3">
                    <h1 class="text-2xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-white leading-tight">
                        Cosco - <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200">Cost Control</span> UNS Madiun
                    </h1>

                    <!-- OFFICIAL TAGLINE -->
                    <div class="p-3 sm:p-4 rounded-xl bg-blue-950/80 border-l-4 border-amber-400 shadow-xl backdrop-blur-md">
                        <p class="text-xs sm:text-base lg:text-lg font-bold text-amber-300 italic font-heading leading-snug">
                            &ldquo;Mari menjaga dan menggunakan dana penuh amanah dan integritas&rdquo;
                        </p>
                    </div>
                </div>

                <!-- DESCRIPTION -->
                <p class="text-xs sm:text-sm lg:text-base text-slate-200 leading-relaxed">
                    Sistem informasi terintegrasi untuk <strong class="text-white">Perencanaan TOR & RAB</strong>, monitoring dan review anggaran, <strong class="text-white">Ajuan dan Monitoring Memo Cair</strong>, serta <strong class="text-white">Pelaporan SPJ & LPJ</strong> yang transparan dan akuntabel.
                </p>

                <!-- ACTION BUTTONS -->
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                    <a href="/login" class="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-heading font-black text-xs sm:text-sm tracking-wide shadow-xl transition-all hover:scale-[1.02] cursor-pointer">
                        <span>MASUK DASHBOARD SSO</span>
                        <svg class="w-4 h-4 text-slate-950 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                    </a>
                    <a href="#fitur-utama" class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all">
                        <span>PELAJARI 4 PILAR FITUR</span>
                    </a>
                </div>

                <!-- MINI HIGHLIGHTS (RESPONSIVE 2-COLS) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-slate-300">
                    <div class="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                        <div class="p-1 rounded-md bg-blue-600/30 text-blue-300 shrink-0">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <div>
                            <span class="font-bold text-white block text-[11px] sm:text-xs">1. Perencanaan & Review TOR RAB</span>
                            <span class="text-[9.5px] sm:text-[10px] text-slate-400">Monitoring Anggaran & Akun MAK IKU</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                        <div class="p-1 rounded-md bg-amber-500/30 text-amber-300 shrink-0">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <div>
                            <span class="font-bold text-white block text-[11px] sm:text-xs">2. Ajuan Memo Cair & SPJ LPJ</span>
                            <span class="text-[9.5px] sm:text-[10px] text-slate-400">Penuh Amanah & Integritas Tinggi</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>

                <!-- SLIDER CONTROLLER & SCROLL INDICATOR BAR (BOTTOM) -->
        <div class="relative z-20 bg-slate-950/80 border-t border-slate-800/90 py-3.5 px-4">
            <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                
                <!-- LEFT: GESER KE BAWAH SCROLL INDICATOR -->
                <a href="#fitur-utama" class="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors group cursor-pointer">
                    <div class="size-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all shadow-xs">
                        <svg class="w-3.5 h-3.5 animate-bounce text-amber-400 group-hover:text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                    </div>
                    <span class="font-heading font-bold uppercase tracking-wider text-[11px] sm:text-xs text-slate-200 group-hover:text-amber-400">Geser ke Bawah</span>
                </a>

                <!-- RIGHT: SLIDER CONTROLLER + GAMBAR HANYA PEMANIS DISCLAIMER -->
                <div class="flex flex-col items-center sm:items-end gap-1.5">
                    <div class="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/20 shadow-xl">
                        <button type="button" onclick="heroPrevSlide()" class="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer" aria-label="Slide Sebelumnya">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        
                        <div class="flex items-center gap-1.5 px-2" id="heroDotsContainer">
                            <button onclick="setHeroSlide(0)" class="hero-dot h-1.5 w-6 rounded-full bg-amber-400 transition-all"></button>
                            <button onclick="setHeroSlide(1)" class="hero-dot h-1.5 w-2 rounded-full bg-white/30 transition-all"></button>
                            <button onclick="setHeroSlide(2)" class="hero-dot h-1.5 w-2 rounded-full bg-white/30 transition-all"></button>
                        </div>

                        <span id="heroSlideCounter" class="font-mono font-bold text-amber-400 text-xs">01 / 03</span>

                        <button type="button" onclick="heroNextSlide()" class="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer" aria-label="Slide Berikutnya">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
                        </button>
                    </div>

                    <!-- TULISAN GAMBAR HANYA PEMANIS -->
                    <div class="text-[10.5px] text-slate-300/80 font-medium tracking-wide flex items-center gap-1.5 pr-1">
                        <svg class="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span>* Gambar hanya pemanis</span>
                    </div>
                </div>

            </div>
        </div>

    </section>

    <!-- ==========================================
         SECTION 1: 4 PILAR FITUR UTAMA COSCO
         ========================================== -->
    <section id="fitur-utama" class="py-14 sm:py-20 bg-slate-50 border-b border-slate-200/80">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <!-- SECTION HEADER -->
            <div class="text-center max-w-3xl mx-auto mb-10 sm:mb-14 reveal-on-scroll">
                <div class="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-widest text-blue-900 mb-2 font-heading">
                    <span class="size-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    <span>4 PILAR UTAMA TATA KELOLA KEUANGAN</span>
                    <span class="size-1.5 rounded-full bg-amber-500 shrink-0"></span>
                </div>
                <h2 class="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
                    Fitur Eksekutif Cosco UNS Madiun
                </h2>
                <p class="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
                    Mengakomodasi seluruh siklus anggaran universitas dari perencanaan awal hingga pertanggungjawaban akhir dengan prinsip akuntabilitas mutlak.
                </p>
                <div class="w-12 sm:w-16 h-1 bg-amber-400 mx-auto mt-3.5 rounded-full"></div>
            </div>

            <!-- 4 FEATURE CARDS GRID -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                <!-- PILAR 1 -->
                <div class="reveal-on-scroll reveal-delay-100 group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-3.5">
                            <span class="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-blue-900 font-extrabold tracking-widest">
                                Pilar 01
                            </span>
                            <div class="size-9 sm:size-10 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center shadow-xs">
                                <svg class="size-4 sm:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            </div>
                        </div>
                        <h3 class="text-base sm:text-lg font-bold font-heading text-slate-900 group-hover:text-blue-900 transition-colors">
                            1. Perencanaan TOR & RAB
                        </h3>
                        <p class="text-xs font-semibold text-amber-600 mt-1">
                            Monitoring & Review TOR RAB
                        </p>
                        <p class="text-xs text-slate-600 mt-2.5 leading-relaxed">
                            Penyusunan Term of Reference (TOR), Rincian Anggaran Biaya (RAB), monitoring status pengajuan kegiatan, dan review kelayakan akun MAK/IKU oleh tim verifikator.
                        </p>
                    </div>
                    <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-900">
                        <span>Monitoring & Review</span>
                        <div class="size-7 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center group-hover:bg-blue-900 group-hover:text-amber-400 transition-all duration-300 shadow-2xs">
                            <svg class="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                        </div>
                    </div>
                </div>

                <!-- PILAR 2 -->
                <div class="reveal-on-scroll reveal-delay-200 group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-3.5">
                            <span class="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800 font-extrabold tracking-widest">
                                Pilar 02
                            </span>
                            <div class="size-9 sm:size-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
                                <svg class="size-4 sm:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                            </div>
                        </div>
                        <h3 class="text-base sm:text-lg font-bold font-heading text-slate-900 group-hover:text-emerald-900 transition-colors">
                            2. Ajuan & Monitoring Memo Cair
                        </h3>
                        <p class="text-xs font-semibold text-emerald-700 mt-1">
                            Pencairan Dana Terpantau
                        </p>
                        <p class="text-xs text-slate-600 mt-2.5 leading-relaxed">
                            Pengajuan surat rekomendasi pencairan dana secara digital, pelacakan histori nominal pencairan, serta monitoring tahapan persetujuan pimpinan secara cepat.
                        </p>
                    </div>
                    <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-900">
                        <span>Pencairan Dana</span>
                        <div class="size-7 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition-all duration-300 shadow-2xs">
                            <svg class="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                        </div>
                    </div>
                </div>

                <!-- PILAR 3 -->
                <div class="reveal-on-scroll reveal-delay-300 group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-3.5">
                            <span class="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-blue-900 font-extrabold tracking-widest">
                                Pilar 03
                            </span>
                            <div class="size-9 sm:size-10 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center shadow-xs">
                                <svg class="size-4 sm:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
                            </div>
                        </div>
                        <h3 class="text-base sm:text-lg font-bold font-heading text-slate-900 group-hover:text-blue-900 transition-colors">
                            3. Pelaporan SPJ dan LPJ
                        </h3>
                        <p class="text-xs font-semibold text-amber-600 mt-1">
                            Tertib Administrasi Keuangan
                        </p>
                        <p class="text-xs text-slate-600 mt-2.5 leading-relaxed">
                            Unggah bukti sah kwitansi belanja, nota, bukti transfer, dan berkas Surat Pertanggungjawaban (SPJ) serta Laporan Pertanggungjawaban (LPJ) kegiatan secara terstruktur.
                        </p>
                    </div>
                    <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-900">
                        <span>Pertanggungjawaban</span>
                        <div class="size-7 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center group-hover:bg-blue-900 group-hover:text-amber-400 transition-all duration-300 shadow-2xs">
                            <svg class="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                        </div>
                    </div>
                </div>

                <!-- PILAR 4 -->
                <div class="reveal-on-scroll reveal-delay-400 group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-3.5">
                            <span class="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-700 font-extrabold tracking-widest">
                                Pilar 04
                            </span>
                            <div class="size-9 sm:size-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs">
                                <svg class="size-4 sm:size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                            </div>
                        </div>
                        <h3 class="text-base sm:text-lg font-bold font-heading text-slate-900 group-hover:text-amber-700 transition-colors">
                            4. Cosco = Cost Control
                        </h3>
                        <p class="text-xs font-semibold text-amber-700 mt-1">
                            Amanah & Berintegritas
                        </p>
                        <p class="text-xs text-slate-600 mt-2.5 leading-relaxed">
                            Sistem pengendalian biaya terpadu dengan memegang teguh komitmen: <em class="font-semibold text-slate-800">&ldquo;Mari menjaga dan menggunakan dana penuh amanah dan integritas&rdquo;</em>.
                        </p>
                    </div>
                    <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>Amanah & Integritas</span>
                        <div class="size-7 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-amber-400 transition-all duration-300 shadow-2xs">
                            <svg class="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </section>

    <!-- ==========================================
         SECTION 2: ALUR PENGELOLAAN DANA 4 TAHAP
         ========================================== -->
    <section id="alur-sistem" class="py-14 sm:py-20 bg-white border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div class="text-center max-w-3xl mx-auto mb-10 sm:mb-14 reveal-on-scroll">
                <div class="flex items-center justify-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-widest text-emerald-800 mb-2 font-heading">
                    <span class="size-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span>TRANSPARAN, AKUNTABEL & TERSTRUKTUR</span>
                    <span class="size-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                </div>
                <h2 class="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
                    Alur 4 Tahap Pengelolaan Dana Cosco
                </h2>
                <p class="mt-2.5 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
                    Proses terstandarisasi untuk memastikan setiap pengajuan kegiatan tervalidasi secara berjenjang.
                </p>
                <div class="w-12 sm:w-16 h-1 bg-emerald-500 mx-auto mt-3.5 rounded-full"></div>
            </div>

            <!-- 4 STEPS GRID -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                <!-- STEP 1 -->
                <div class="reveal-on-scroll reveal-delay-100 p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
                    <div class="size-9 sm:size-10 rounded-xl bg-blue-900 text-amber-400 font-heading font-black text-xs sm:text-sm flex items-center justify-center mb-3.5 shadow-xs">
                        1
                    </div>
                    <h3 class="text-sm sm:text-base font-bold font-heading text-slate-900 mb-1">
                        1. Pengusulan TOR & RAB
                    </h3>
                    <p class="text-xs text-slate-600 leading-relaxed">
                        Pengusul menginput rincian kegiatan dan kebutuhan anggaran berdasarkan akun MAK dan sasaran IKU.
                    </p>
                </div>

                <!-- STEP 2 -->
                <div class="reveal-on-scroll reveal-delay-200 p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
                    <div class="size-9 sm:size-10 rounded-xl bg-blue-900 text-amber-400 font-heading font-black text-xs sm:text-sm flex items-center justify-center mb-3.5 shadow-xs">
                        2
                    </div>
                    <h3 class="text-sm sm:text-base font-bold font-heading text-slate-900 mb-1">
                        2. Review & Verifikasi
                    </h3>
                    <p class="text-xs text-slate-600 leading-relaxed">
                        Tim verifikator dan pimpinan memvalidasi kesesuaian anggaran serta kelayakan dokumen TOR.
                    </p>
                </div>

                <!-- STEP 3 -->
                <div class="reveal-on-scroll reveal-delay-300 p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
                    <div class="size-9 sm:size-10 rounded-xl bg-emerald-800 text-white font-heading font-black text-xs sm:text-sm flex items-center justify-center mb-3.5 shadow-xs">
                        3
                    </div>
                    <h3 class="text-sm sm:text-base font-bold font-heading text-slate-900 mb-1">
                        3. Penerbitan Memo Cair
                    </h3>
                    <p class="text-xs text-slate-600 leading-relaxed">
                        Surat Memo Cair resmi diterbitkan untuk proses realisasi pencairan dana ke pihak pengusul.
                    </p>
                </div>

                <!-- STEP 4 -->
                <div class="reveal-on-scroll reveal-delay-400 p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
                    <div class="size-9 sm:size-10 rounded-xl bg-slate-900 text-amber-400 font-heading font-black text-xs sm:text-sm flex items-center justify-center mb-3.5 shadow-xs">
                        4
                    </div>
                    <h3 class="text-sm sm:text-base font-bold font-heading text-slate-900 mb-1">
                        4. Pelaporan SPJ & LPJ
                    </h3>
                    <p class="text-xs text-slate-600 leading-relaxed">
                        Pengusul mengunggah bukti kwitansi sah dan laporan pertanggungjawaban kegiatan hingga tervalidasi.
                    </p>
                </div>

            </div>

        </div>
    </section>

    <!-- ==========================================
         SECTION 3: CALL TO ACTION KOMITMEN AMANAH
         ========================================== -->
    <section id="komitmen-amanah" class="py-14 sm:py-20 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white relative overflow-hidden">
        <div class="absolute inset-0 hero-dot-grid opacity-20 pointer-events-none"></div>

        <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-6 reveal-on-scroll">
            <div class="flex items-center justify-center gap-2 text-amber-400 text-[11px] sm:text-xs font-black uppercase tracking-widest font-heading">
                <span class="size-2 rounded-full bg-amber-400 shrink-0"></span>
                <span>KOMITMEN INTEGRITAS KEUANGAN</span>
                <span class="size-2 rounded-full bg-amber-400 shrink-0"></span>
            </div>

            <h2 class="text-xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight leading-tight">
                &ldquo;Mari menjaga dan menggunakan dana penuh amanah dan integritas&rdquo;
            </h2>

            <p class="text-xs sm:text-sm lg:text-base text-blue-100/90 max-w-2xl mx-auto leading-relaxed">
                Cosco (Cost Control) menjadi pilar utama tertib administrasi keuangan, mengawal setiap rupiah anggaran kegiatan akademik dan operasional di UNS Kampus Madiun.
            </p>

            <div class="pt-2">
                <a href="/login" class="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-heading font-black text-xs sm:text-sm tracking-wide shadow-2xl transition-all hover:scale-105">
                    <span>Masuk Dashboard Cosco</span>
                    <svg class="w-4 h-4 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                </a>
            </div>
        </div>
    </section>

    <!-- ==========================================
         FOOTER EKSEKUTIF
         ========================================== -->
    <footer class="bg-slate-950 text-slate-400 text-xs border-t border-slate-800/90 pt-10 pb-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-800">
                
                <!-- BRAND INFO -->
                <div class="md:col-span-6 space-y-3">
                    <div class="flex items-center gap-2.5">
                        <img src="/images/logo_uns.png?v=uns2026" alt="Logo Resmi UNS" class="h-9 sm:h-10 w-auto object-contain shrink-0">
                        <div>
                            <span class="text-base sm:text-lg font-black font-heading text-white tracking-tight block">
                                COSCO (COST CONTROL)
                            </span>
                            <span class="text-[10px] sm:text-[11px] text-slate-400 font-semibold">
                                Universitas Sebelas Maret - Kampus Madiun
                            </span>
                        </div>
                    </div>
                    <p class="text-xs text-slate-400 leading-relaxed max-w-md">
                        Sistem informasi tata kelola perencanaan TOR/RAB, monitoring & review, memo cair, serta pelaporan SPJ/LPJ berbasis integritas di lingkungan UNS Kampus Caruban - Madiun.
                    </p>
                    <p class="text-xs font-bold text-amber-400 italic">
                        &ldquo;Mari menjaga dan menggunakan dana penuh amanah dan integritas&rdquo;
                    </p>
                </div>

                <!-- LINKS -->
                <div class="md:col-span-3 space-y-2.5">
                    <span class="font-bold text-white uppercase tracking-wider text-xs font-heading block">
                        Modul Anggaran
                    </span>
                    <ul class="space-y-1.5 text-xs">
                        <li><a href="/login" class="hover:text-amber-400 transition-colors">1. Perencanaan & Review TOR RAB</a></li>
                        <li><a href="/login" class="hover:text-amber-400 transition-colors">2. Ajuan & Monitoring Memo Cair</a></li>
                        <li><a href="/login" class="hover:text-amber-400 transition-colors">3. Pelaporan SPJ dan LPJ</a></li>
                        <li><a href="/login" class="hover:text-amber-400 transition-colors">4. Cosco (Cost Control)</a></li>
                    </ul>
                </div>

                <!-- CAMPUS LOCATION -->
                <div class="md:col-span-3 space-y-2.5">
                    <span class="font-bold text-white uppercase tracking-wider text-xs font-heading block">
                        Lokasi Kampus
                    </span>
                    <p class="text-xs text-slate-400 leading-relaxed">
                        <strong class="text-white">Kampus Caruban UNS</strong><br>
                        Jl. Imam Bonjol No. 1, Caruban, Kab. Madiun, Jawa Timur<br>
                        Portal: <a href="https://unsmadiun.id" target="_blank" class="text-amber-400 hover:underline">unsmadiun.id</a>
                    </p>
                </div>

            </div>

            <!-- BOTTOM COPYRIGHT -->
            <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10.5px] sm:text-[11px] text-slate-500">
                <p>&copy; 2026 Universitas Sebelas Maret (UNS) Kampus Madiun. All rights reserved.</p>
                <p class="font-semibold text-slate-400">Super App Cost Control (Cosco) - v2.0 Executive Edition</p>
            </div>
        </div>
    </footer>

    <!-- ==========================================
         JAVASCRIPT ENGINES (RESPONSIVE, CLOCK, SLIDER, SCROLL REVEAL)
         ========================================== -->
    <script>
        // 1. MOBILE MENU TOGGLE
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        const hamburgerIcon = document.getElementById('hamburgerIcon');
        const closeIcon = document.getElementById('closeIcon');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', function() {
                const isHidden = mobileMenu.classList.toggle('hidden');
                if (hamburgerIcon && closeIcon) {
                    hamburgerIcon.classList.toggle('hidden', !isHidden);
                    closeIcon.classList.toggle('hidden', isHidden);
                }
            });

            document.querySelectorAll('.mobile-nav-link').forEach(function(link) {
                link.addEventListener('click', function() {
                    mobileMenu.classList.add('hidden');
                    if (hamburgerIcon && closeIcon) {
                        hamburgerIcon.classList.remove('hidden');
                        closeIcon.classList.add('hidden');
                    }
                });
            });
        }

        // 2. LIVE INDONESIAN DATE & CLOCK
        function updateLiveClock() {
            const el = document.getElementById('liveDateClockTopBar');
            if (!el) return;

            const now = new Date();
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const months = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];

            const dayName = days[now.getDay()];
            const dayNum = now.getDate();
            const monthName = months[now.getMonth()];
            const year = now.getFullYear();

            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');

            el.innerHTML = dayName + ', ' + dayNum + ' ' + monthName + ' ' + year + ' - ' + hours + '.' + minutes + '.' + seconds + ' WIB';
        }

        // 3. CROSSFADE HERO SLIDER (6.5 SECONDS)
        let currentSlide = 0;
        const heroSlides = document.querySelectorAll('.hero-slide');
        const heroDots = document.querySelectorAll('.hero-dot');
        const heroCounter = document.getElementById('heroSlideCounter');
        let heroInterval = null;

        function setHeroSlide(idx) {
            if (!heroSlides || !heroSlides.length) return;
            currentSlide = (idx + heroSlides.length) % heroSlides.length;

            heroSlides.forEach(function(s, i) {
                s.classList.toggle('active', i === currentSlide);
            });

            heroDots.forEach(function(d, i) {
                if (i === currentSlide) {
                    d.className = 'hero-dot h-1.5 w-6 rounded-full bg-amber-400 transition-all';
                } else {
                    d.className = 'hero-dot h-1.5 w-2 rounded-full bg-white/30 transition-all';
                }
            });

            if (heroCounter) {
                heroCounter.textContent = '0' + (currentSlide + 1) + ' / 0' + heroSlides.length;
            }
        }

        function heroPrevSlide() {
            setHeroSlide(currentSlide - 1);
            startHeroAutoplay();
        }

        function heroNextSlide() {
            setHeroSlide(currentSlide + 1);
            startHeroAutoplay();
        }

        function startHeroAutoplay() {
            if (heroInterval) clearInterval(heroInterval);
            heroInterval = setInterval(function() {
                setHeroSlide(currentSlide + 1);
            }, 6500);
        }

        // 4. SCROLL REVEAL (INSTANT & BULLETPROOF OBSERVER)
        function initScrollReveal() {
            const revealElements = document.querySelectorAll('.reveal-on-scroll');
            if (!revealElements || !revealElements.length) return;

            function revealElement(el) {
                el.classList.add('is-revealed');
            }

            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            revealElement(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: 0.01,
                    rootMargin: '100px 0px 100px 0px'
                });

                revealElements.forEach(function(el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= (window.innerHeight || document.documentElement.clientHeight) + 150) {
                        revealElement(el);
                    } else {
                        observer.observe(el);
                    }
                });
            } else {
                revealElements.forEach(revealElement);
            }

            window.addEventListener('scroll', function() {
                revealElements.forEach(function(el) {
                    if (!el.classList.contains('is-revealed')) {
                        const rect = el.getBoundingClientRect();
                        if (rect.top <= window.innerHeight + 50) {
                            revealElement(el);
                        }
                    }
                });
            }, { passive: true });
        }

        document.addEventListener('DOMContentLoaded', function() {
            updateLiveClock();
            setInterval(updateLiveClock, 1000);
            setHeroSlide(0);
            startHeroAutoplay();
            initScrollReveal();
        });
    </script>
</body>
</html>