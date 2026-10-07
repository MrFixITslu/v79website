import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import {
  Sun, Moon, Menu, X, ChevronDown, Phone, MessageSquare,
  LayoutDashboard, WalletCards, Megaphone, ShoppingCart,
  GraduationCap, ArrowRight, ShieldCheck, CheckCircle2,
} from "lucide-react";
import HomePage from "./components/HomePage";
import AboutPage from "./components/AboutPage";
import ServicesPage from "./components/ServicesPage";
import IndustriesPage from "./components/IndustriesPage";
import ContactPage from "./components/ContactPage";
import { SaaSApp } from "./types";
import { V79OfficialLogo } from "./components/V79OfficialLogo";
import { SectionLoadingFallback } from "./components/ui/Skeleton";
import { CLIENT_STORIES } from "./data/testimonials";
import LegalPage from "./components/LegalPage";

const ResourcesPage = lazy(() => import("./components/ResourcesPage"));
const ArticleDetailPage = lazy(() =>
  import("./components/ArticleDetailPage").then(m => ({ default: m.ArticleDetailPage }))
);

// Lazy-loaded: only needed once a user actually opens a course or tool
// feedback flow, not on initial marketing-site paint. CourseDetailPage
// alone pulls in the 950-line CourseCertification module, so this keeps
// that entirely out of the bundle everyone downloads to see the homepage.
const CourseDetailPage = lazy(() =>
  import("./components/CourseDetailPage").then(m => ({ default: m.CourseDetailPage }))
);
function getCourseIdFromUrl(): number | null {
  const match = window.location.pathname.match(/^\/course\/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

const SECTIONS = [
  { id: "home", label: "Home", subItems: [
    { id: "services-overview", label: "What We Do" },
    { id: "why-v79", label: "Why Choose V79" },
    { id: "cost-of-downtime", label: "Cost of Downtime" },
    ...(CLIENT_STORIES.length > 0 ? [{ id: "testimonials", label: "Client Stories" }] : []),
    { id: "free-assessment", label: "ICT Health Assessment" },
  ]},
  { id: "about", label: "About" },
  { id: "services", label: "Services", subItems: [
    { id: "managed-it", label: "Managed IT Services" },
    { id: "cloud", label: "Cloud Solutions" },
    { id: "software", label: "Custom Software" },
    { id: "ai-automation", label: "AI Automation" },
    { id: "networking", label: "Network & VoIP" },
    { id: "cybersecurity", label: "Cybersecurity" },
    { id: "assessment", label: "ICT Health Assessment" },
  ]},
  { id: "industries", label: "Industries" },
  { id: "solutions", label: "Solutions" },
  { id: "resources", label: "Resources" },
  { id: "contact", label: "Contact" },
];

// The subset of Services sub-items that are actual accordion cards in
// ServicesPage (as opposed to "assessment", which is always-visible
// content with nothing to expand). Clicking one of these in the nav should
// open its card automatically, not just scroll to its still-collapsed header.
const SERVICE_ACCORDION_IDS = ["managed-it", "cloud", "software", "ai-automation", "networking", "cybersecurity"];

const MARKETING_ROUTE_TO_SECTION: Record<string, string> = {
  "/about": "about",
  "/services": "services",
  "/industries": "industries",
  "/solutions": "solutions",
  "/resources": "resources",
  "/contact": "contact",
};

export default function App() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Which top-level nav item's sub-menu is currently open (desktop dropdown
  // or mobile accordion) — null means none open. Only one at a time.
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  // Nav-triggered jumps use a brief fade-to-background / fade-in instead of
  // a visible scroll: the jump itself happens instantly while the overlay
  // is fully opaque, so fast-moving content never flashes past on screen —
  // an eased scroll animation still shows that motion no matter how it's
  // tuned, since it's still a real scroll the eye has to track. This is a
  // clean dissolve from one section straight to the next instead.
  const [navTransitioning, setNavTransitioning] = useState(false);
  // Which service accordion card in ServicesPage is expanded. Lifted up
  // here (rather than local state inside ServicesPage) so clicking a
  // specific service in the Services dropdown — e.g. "Cloud Solutions" —
  // can open that exact card automatically, instead of just scrolling to
  // its (still collapsed) header and making the user click it again.
  const [openServiceId, setOpenServiceId] = useState<string | null>("managed-it");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try { return (localStorage.getItem("vision79-theme") as "light" | "dark") || "dark"; }
    catch { return "dark"; }
  });

  // Legacy course deep-links remain supported, but course discovery now lives in V79 Academy.
  const [apps, setApps] = useState<SaaSApp[]>([]);
  const hadSelectedCourse = useRef(false);
  const [selectedCourse, setSelectedCourse] = useState<SaaSApp | null>(null);

  // Directly selected article for direct link reading (WhatsApp, social, or in-app click)
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      return p.get("article");
    }
    return null;
  });

  useEffect(() => {
    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const article = p.get("article");
      setSelectedArticleSlug(article);
      if (article) return;
      const path = window.location.pathname.replace(/\/+$/, "") || "/";
      const target = path === "/" ? "home" : MARKETING_ROUTE_TO_SECTION[path];
      if (!target) return;
      setActiveSection(target);
      window.setTimeout(() => {
        const el = document.getElementById(target);
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.pageYOffset - 110);
      }, 40);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    try { localStorage.setItem("vision79-theme", theme); } catch {}
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme !== "dark");
  }, [theme]);

  useEffect(() => {
    if (!window.location.pathname.startsWith("/course/")) return;
    const loadCourses = async () => {
      try {
        const res = await fetch("/api/apps");
        if (res.ok) setApps(await res.json());
      } catch {}
    };
    void loadCourses();
  }, []);

  // Direct marketing URLs should land on the matching section instead of
  // always opening at the top of the long-form homepage.
  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    const target = MARKETING_ROUTE_TO_SECTION[path];
    if (!target) return;
    setActiveSection(target);
    const timer = window.setTimeout(() => {
      const el = document.getElementById(target);
      if (el) {
        const topPos = el.getBoundingClientRect().top + window.pageYOffset - 110;
        window.scrollTo(0, topPos);
      }
    }, 80);
    return () => window.clearTimeout(timer);
  }, []);

  // Deep-link support: /course/123 selects the course and scrolls to Solutions
  useEffect(() => {
    if (apps.length === 0) return;
    const courseId = getCourseIdFromUrl();
    if (courseId !== null && !selectedCourse) {
      const match = apps.find(a => a.id === courseId && a.category === "courses");
      if (match) {
        setSelectedCourse(match);
        setActiveSection("solutions");
        requestAnimationFrame(() => scrollTo("solutions"));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps]);

  useEffect(() => {
    if (selectedCourse) {
      hadSelectedCourse.current = true;
      const url = `/course/${selectedCourse.id}`;
      if (window.location.pathname !== url) window.history.pushState({ courseId: selectedCourse.id }, "", url);
    } else if (hadSelectedCourse.current && window.location.pathname.startsWith("/course/")) {
      hadSelectedCourse.current = false;
      window.history.pushState({}, "", "/");
    }
  }, [selectedCourse]);

  useEffect(() => {
    const handlePop = () => {
      const courseId = getCourseIdFromUrl();
      if (courseId !== null) {
        const match = apps.find(a => a.id === courseId && a.category === "courses");
        if (match) { setSelectedCourse(match); return; }
      }
      setSelectedCourse(null);
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [apps]);

  // Keep nav highlight in sync while the user scrolls, not just on click
  useEffect(() => {
    const sectionEls = SECTIONS
      .map(s => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sectionEls.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: [0.1, 0.25, 0.5, 0.75] }
    );
    sectionEls.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Close an open dropdown when clicking outside it, or pressing Escape
  useEffect(() => {
    if (!openDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openDropdown]);

  // parentId: when scrolling to a sub-anchor (e.g. a specific service card),
  // pass its top-level parent's id so the nav highlight stays glued to the
  // right top-level item immediately, rather than briefly going blank until
  // the scroll-spy above catches up once the smooth-scroll settles.
  const NAV_FADE_IN_MS = 200;
  const NAV_FADE_OUT_MS = 260;

  const navTransitionSeq = useRef(0);

  const scrollTo = (id: string, parentId?: string) => {
    if (selectedArticleSlug) {
      setSelectedArticleSlug(null);
      const url = new URL(window.location.href);
      url.searchParams.delete("article");
      window.history.pushState({}, "", url.pathname + (id ? `#${id}` : ""));
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const topPos = el.getBoundingClientRect().top + window.pageYOffset - 120;
          window.scrollTo(0, topPos);
        }
      }, 50);
      return;
    }

    const routeSection = parentId || id;
    setActiveSection(routeSection);
    setMobileNavOpen(false);
    setOpenDropdown(null);
    setMobileExpanded(null);

    // Keep the browser URL aligned with the section the visitor is viewing.
    // This makes copied links, analytics, canonical routes, and back/forward
    // navigation consistent instead of leaving every section at "/".
    if (SECTIONS.some(section => section.id === routeSection)) {
      const basePath = routeSection === "home" ? "/" : `/${routeSection}`;
      const nextUrl = id !== routeSection ? `${basePath}#${id}` : basePath;
      if (window.location.pathname + window.location.hash !== nextUrl) {
        window.history.pushState({}, "", nextUrl);
      }
    }

    // Jumping straight to a specific service (e.g. "Cloud Solutions" from
    // the Services dropdown) should land with that card already open —
    // otherwise the user has to click it again after arriving, which
    // defeats the point of a direct link to it.
    if (SERVICE_ACCORDION_IDS.includes(id)) {
      setOpenServiceId(id);
    }

    // If a nav item is clicked again before a prior transition finished
    // (e.g. clicking two different sections in quick succession), only the
    // LAST click should actually jump/fade-out — otherwise the first
    // click's queued jump can land and flash briefly before the second
    // click's jump overwrites it.
    const requestId = ++navTransitionSeq.current;

    const jump = () => {
      const el = document.getElementById(id);
      if (el) {
        const topPos = el.getBoundingClientRect().top + window.pageYOffset - 120;
        window.scrollTo(0, topPos); // instant — hidden behind the fade overlay
      }
    };

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      jump();
      return;
    }

    setNavTransitioning(true);
    window.setTimeout(() => {
      if (navTransitionSeq.current !== requestId) return; // superseded by a newer click
      jump();
      // Give the browser a frame to actually paint the new scroll position
      // before starting the fade-out, or the reveal can catch the tail end
      // of the jump rather than a clean, already-settled destination.
      requestAnimationFrame(() => {
        if (navTransitionSeq.current === requestId) setNavTransitioning(false);
      });
    }, NAV_FADE_IN_MS);
  };

  const isSectionActive = (sec: typeof SECTIONS[number]) =>
    activeSection === sec.id || (sec.subItems?.some(si => si.id === activeSection) ?? false);

  const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
  if (normalizedPath === "/privacy") return <LegalPage type="privacy" />;
  if (normalizedPath === "/terms") return <LegalPage type="terms" />;
  if (normalizedPath === "/data-deletion") return <LegalPage type="data-deletion" />;

  return (
    <MotionConfig reducedMotion="user">
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden bg-app-bg text-app-text antialiased selection:bg-v79-teal/20 selection:text-v79-teal">
      {/* Skip to Content for Accessibility / Screen Readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2.5 focus:bg-v79-coral focus:text-white focus:rounded-xl focus:font-bold focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Nav transition overlay: fades to the page background, jumps the
          scroll position instantly while fully opaque, then fades back in
          — so a nav click never shows content flying past mid-scroll.
          Starts below the header (top-28 matches the header's h-28) so the
          sticky header itself never gets covered/flickers during a
          transition — it should feel like a fixed anchor, not something
          that disappears every time you click a nav link. */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: navTransitioning ? 1 : 0 }}
        transition={{ duration: (navTransitioning ? NAV_FADE_IN_MS : NAV_FADE_OUT_MS) / 1000, ease: "easeInOut" }}
        className="fixed top-28 inset-x-0 bottom-0 z-[45] bg-app-bg pointer-events-none"
      />
      {/* Apple-inspired Sticky Header */}
      <header className="h-28 flex items-center justify-between px-6 lg:px-12 border-b border-app-border bg-app-header-bg/90 backdrop-blur-xl fixed top-0 inset-x-0 z-50">
        <button
          onClick={() => scrollTo("home")}
          aria-label="Vision79 Digital Home"
          className="flex items-center cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded-xl py-1 px-1 -ml-1 transition-opacity hover:opacity-90"
        >
          <V79OfficialLogo size="md" />
        </button>

        {/* Desktop Nav */}
        <nav ref={navRef} aria-label="Main Navigation" className="hidden lg:flex items-center gap-1.5">
          {SECTIONS.map(sec => {
            const active = isSectionActive(sec);
            const hasSubItems = !!sec.subItems?.length;
            return (
              <div key={sec.id} className="relative">
                <div
                  className={`relative flex items-center rounded-lg cursor-pointer focus-within:ring-2 focus-within:ring-v79-teal/50 ${
                    active ? "text-v79-teal font-bold" : "text-app-text-sec hover:text-app-text"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-v79-teal/10 rounded-lg"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {!active && (
                    <span className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 bg-app-aside-bg transition-opacity" />
                  )}
                  <button
                    onClick={() => scrollTo(sec.id)}
                    className="relative z-10 pl-3.5 pr-1.5 py-1.5 text-xs font-semibold tracking-wide cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded-lg"
                  >
                    {sec.label}
                  </button>
                  {hasSubItems && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(p => (p === sec.id ? null : sec.id));
                      }}
                      aria-label={`${sec.label} sub-sections`}
                      aria-expanded={openDropdown === sec.id}
                      className="relative z-10 pl-0.5 pr-2.5 py-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded-lg"
                    >
                      <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === sec.id ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {hasSubItems && openDropdown === sec.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1.5 min-w-[210px] bg-app-header-bg border border-app-border rounded-xl shadow-2xl p-1.5 z-50"
                    >
                      {sec.subItems!.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => scrollTo(sub.id, sec.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 ${
                            activeSection === sub.id
                              ? "text-v79-teal bg-v79-teal/10"
                              : "text-app-text-sec hover:text-app-text hover:bg-app-aside-bg"
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          <button
            onClick={() => setTheme(p => p === "dark" ? "light" : "dark")}
            className="ml-3 p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-app-border bg-app-btn-sec text-app-text hover:bg-app-btn-sec/80 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-v79-coral-light" /> : <Moon className="w-4 h-4 text-v79-teal" />}
          </button>
        </nav>

        {/* Mobile controls */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setTheme(p => p === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-app-border bg-app-btn-sec cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-v79-coral-light" /> : <Moon className="w-4 h-4 text-v79-teal" />}
          </button>
          <button
            onClick={() => { setMobileNavOpen(p => !p); setMobileExpanded(null); }}
            aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
            className="relative p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-app-border bg-app-btn-sec cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileNavOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="block"
                >
                  <X className="w-4 h-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="block"
                >
                  <Menu className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed top-28 left-0 right-0 z-40 bg-app-header-bg/95 backdrop-blur-2xl border-b border-app-border p-5 flex flex-col gap-2 shadow-2xl max-h-[calc(100vh-7rem)] overflow-y-auto"
          >
            {SECTIONS.map(sec => {
              const active = isSectionActive(sec);
              const hasSubItems = !!sec.subItems?.length;
              const expanded = mobileExpanded === sec.id;
              return (
                <div key={sec.id}>
                  <div
                    className={`relative flex items-center rounded-xl ${
                      active ? "text-v79-teal font-bold" : "text-app-text-sec hover:text-app-text hover:bg-app-aside-bg transition-colors"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-active-pill-mobile"
                        className="absolute inset-0 bg-v79-teal/15 rounded-xl"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <button
                      onClick={() => scrollTo(sec.id)}
                      className="relative z-10 flex-1 px-4 py-3 text-sm font-semibold text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded-xl"
                    >
                      {sec.label}
                    </button>
                    {hasSubItems && (
                      <button
                        onClick={() => setMobileExpanded(p => (p === sec.id ? null : sec.id))}
                        aria-label={`${sec.label} sub-sections`}
                        aria-expanded={expanded}
                        className="relative z-10 px-4 py-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded-xl"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>
                  <AnimatePresence>
                    {hasSubItems && expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pl-3"
                      >
                        {sec.subItems!.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => scrollTo(sub.id, sec.id)}
                            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 ${
                              activeSection === sub.id
                                ? "text-v79-teal font-semibold"
                                : "text-app-text-muted hover:text-app-text hover:bg-app-aside-bg"
                            }`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedArticleSlug ? (
        <main id="main-content" tabIndex={-1} className="flex-1 min-h-[75vh] focus:outline-none">
          <Suspense fallback={<SectionLoadingFallback />}>
            <ArticleDetailPage
              slug={selectedArticleSlug}
              onBack={() => {
                setSelectedArticleSlug(null);
                const url = new URL(window.location.href);
                url.searchParams.delete("article");
                window.history.pushState({}, "", url.pathname + "#resources");
                setTimeout(() => scrollTo("resources"), 50);
              }}
              onNavigate={(sec) => {
                setSelectedArticleSlug(null);
                const url = new URL(window.location.href);
                url.searchParams.delete("article");
                window.history.pushState({}, "", url.pathname + "#" + sec);
                setTimeout(() => scrollTo(sec), 50);
              }}
              onSelectArticle={(slug) => {
                setSelectedArticleSlug(slug);
                const url = new URL(window.location.href);
                url.searchParams.set("article", slug);
                window.history.pushState({}, "", url.toString());
                window.scrollTo(0, 0);
              }}
            />
          </Suspense>
        </main>
      ) : (
        /* Continuous One-Page Apple-Inspired Flow */
        <main id="main-content" tabIndex={-1} className="flex-1 space-y-32 pb-24 pt-28 focus:outline-none">
        <section id="home" className="scroll-mt-32">
          <HomePage onNavigate={(v) => scrollTo(SECTIONS.some(s => s.id === v) ? v : "services")} />
        </section>

        <div className="w-full max-w-7xl mx-auto px-6"><div className="h-px bg-gradient-to-r from-transparent via-app-border to-transparent" /></div>

        <section id="about" className="scroll-mt-32">
          <AboutPage />
        </section>

        <div className="w-full max-w-7xl mx-auto px-6"><div className="h-px bg-gradient-to-r from-transparent via-app-border to-transparent" /></div>

        <section id="services" className="scroll-mt-32">
          <ServicesPage
            onNavigate={(v) => scrollTo(SECTIONS.some(s => s.id === v) ? v : "services")}
            openId={openServiceId}
            setOpenId={setOpenServiceId}
          />
        </section>

        <div className="w-full max-w-7xl mx-auto px-6"><div className="h-px bg-gradient-to-r from-transparent via-app-border to-transparent" /></div>

        <section id="industries" className="scroll-mt-32">
          <IndustriesPage onNavigate={(v) => scrollTo(SECTIONS.some(s => s.id === v) ? v : "industries")} />
        </section>

        <div className="w-full max-w-7xl mx-auto px-6"><div className="h-px bg-gradient-to-r from-transparent via-app-border to-transparent" /></div>

        <section id="solutions" className="scroll-mt-32 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <AnimatePresence mode="wait">
            {selectedCourse ? (
              <motion.div key="course" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }}>
                <Suspense fallback={<SectionLoadingFallback />}>
                  <CourseDetailPage course={selectedCourse} onBack={() => setSelectedCourse(null)} />
                </Suspense>
              </motion.div>
            ) : (
              <motion.div key="hub-ecosystem" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-10 lg:space-y-12">
                <div className="max-w-3xl space-y-4">
                  <span className="text-[10px] font-mono uppercase font-extrabold tracking-[0.25em] text-indigo-400">V79 Business Platform</span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-app-text dark:text-white">Run Your Business from V79 Hub</h2>
                  <p className="text-app-text-sec text-sm sm:text-base font-light leading-relaxed max-w-2xl">
                    One account. One dashboard. The tools your business needs. V79 Hub brings your V79 business applications together so your team can manage finances, customers, marketing, sales and business activity from one secure workspace.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <a href="https://hub.v79sl.com" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 text-sm font-semibold transition no-underline">
                      Explore V79 Hub <ArrowRight className="w-4 h-4" />
                    </a>
                    <button onClick={() => scrollTo("contact")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-app-border bg-app-btn-sec hover:border-indigo-400/40 px-5 py-3 text-sm font-semibold text-app-text transition cursor-pointer">
                      Request Access
                    </button>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.10] via-app-aside-bg/70 to-app-bg p-6 sm:p-8 lg:p-10 shadow-xl">
                  <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                  <div className="relative grid lg:grid-cols-[1.05fr_1fr] gap-8 items-center">
                    <div className="space-y-5">
                      <div className="w-14 h-14 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <LayoutDashboard className="w-7 h-7" />
                      </div>
                      <div className="space-y-2">
                        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-indigo-400 font-bold">The centre of the ecosystem</div>
                        <h3 className="text-2xl sm:text-3xl font-bold font-display text-app-text dark:text-white">V79 Hub</h3>
                        <p className="text-sm text-app-text-sec leading-relaxed max-w-xl">
                          Your business workspace for secure sign-in, access to V79 applications, key information and the services enabled for your organisation.
                        </p>
                      </div>
                      <a href="https://hub.v79sl.com" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 no-underline transition">
                        Open V79 Hub <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        "One business workspace",
                        "Central app access",
                        "Business KPI visibility",
                        "Subscription management",
                      ].map(item => (
                        <div key={item} className="flex items-center gap-3 rounded-xl border border-app-border bg-app-bg/55 px-4 py-3 text-xs text-app-text-sec">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-app-text-muted font-bold">Business modules</div>
                    <h3 className="mt-1 text-xl sm:text-2xl font-bold font-display text-app-text dark:text-white">Add the capabilities your business needs</h3>
                  </div>

                  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="glass rounded-2xl border border-app-border p-5 space-y-4 hover:border-indigo-400/30 transition">
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><WalletCards className="w-5 h-5" /></div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-app-text-muted">Manage Money</div>
                        <h4 className="mt-1 text-base font-bold font-display text-app-text dark:text-white">FFPRO</h4>
                        <p className="mt-2 text-xs leading-relaxed text-app-text-sec">Track finances, budgets, cash flow, goals and business financial performance.</p>
                      </div>
                    </div>

                    <div className="glass rounded-2xl border border-app-border p-5 space-y-4 hover:border-indigo-400/30 transition">
                      <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400"><CheckCircle2 className="w-5 h-5" /></div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-app-text-muted">Manage Customers & Support</div>
                        <h4 className="mt-1 text-base font-bold font-display text-app-text dark:text-white">V79 Tiquet</h4>
                        <p className="mt-2 text-xs leading-relaxed text-app-text-sec">Manage customer requests, service tickets, follow-up and support activity.</p>
                      </div>
                    </div>

                    <div className="glass rounded-2xl border border-app-border p-5 space-y-4 hover:border-indigo-400/30 transition">
                      <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400"><Megaphone className="w-5 h-5" /></div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-app-text-muted">Grow Your Business</div>
                        <h4 className="mt-1 text-base font-bold font-display text-app-text dark:text-white">V79 Marketing</h4>
                        <p className="mt-2 text-xs leading-relaxed text-app-text-sec">Organise leads, campaigns, events and customer engagement from one workflow.</p>
                      </div>
                    </div>

                    <div className="glass rounded-2xl border border-app-border p-5 space-y-4 hover:border-indigo-400/30 transition">
                      <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400"><ShoppingCart className="w-5 h-5" /></div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-app-text-muted">Manage Sales</div>
                        <h4 className="mt-1 text-base font-bold font-display text-app-text dark:text-white">V79 POS</h4>
                        <p className="mt-2 text-xs leading-relaxed text-app-text-sec">Support day-to-day selling, transaction workflows and operational sales visibility.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center gap-6 lg:justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0"><GraduationCap className="w-6 h-6" /></div>
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-violet-400 font-bold">Connected Learning</div>
                      <h3 className="text-xl font-bold font-display text-app-text dark:text-white">V79 Academy</h3>
                      <p className="text-xs sm:text-sm text-app-text-sec leading-relaxed max-w-2xl">Practical technology and business training for individuals and teams. Course discovery and learning now live in the Academy rather than the business-app marketplace.</p>
                    </div>
                  </div>
                  <a href="https://v79academy.v79sl.com/academy" className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 hover:bg-violet-500/15 px-5 py-3 text-sm font-semibold text-violet-400 no-underline transition shrink-0">
                    Explore V79 Academy <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-app-text-muted font-bold">How V79 Hub works</div>
                    <h3 className="mt-1 text-xl sm:text-2xl font-bold font-display text-app-text dark:text-white">A simpler way to build your business toolkit</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      ["01", "Create your business workspace", "Your organisation gets its own secure V79 workspace."],
                      ["02", "Add the tools you need", "Enable the business applications and services that fit how you operate."],
                      ["03", "Run everything from Hub", "Access your applications and key business information from one place."],
                    ].map(([step, title, copy]) => (
                      <div key={step} className="rounded-2xl border border-app-border bg-app-aside-bg/40 p-5">
                        <div className="text-xs font-mono font-bold text-indigo-400">{step}</div>
                        <h4 className="mt-3 text-sm font-bold font-display text-app-text dark:text-white">{title}</h4>
                        <p className="mt-2 text-xs leading-relaxed text-app-text-sec">{copy}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-app-border bg-app-aside-bg/35 p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-app-text dark:text-white">A focused business ecosystem</h3>
                      <p className="mt-1 text-xs text-app-text-sec max-w-2xl">V79 Hub is reserved for customer business tools. Games, community projects and experimental products remain separate from the SMB platform.</p>
                    </div>
                  </div>
                  <button onClick={() => scrollTo("contact")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-app-btn-sec border border-app-border hover:border-indigo-400/40 px-4 py-2.5 text-xs font-semibold text-app-text transition cursor-pointer shrink-0">
                    Talk to V79 Digital <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <div className="w-full max-w-7xl mx-auto px-6"><div className="h-px bg-gradient-to-r from-transparent via-app-border to-transparent" /></div>

        <section id="resources" className="scroll-mt-32">
          <Suspense fallback={<SectionLoadingFallback />}>
            <ResourcesPage
              onNavigate={(v) => scrollTo(SECTIONS.some(s => s.id === v) ? v : "resources")}
              onSelectArticle={(slug) => {
                setSelectedArticleSlug(slug);
                const url = new URL(window.location.href);
                url.searchParams.set("article", slug);
                window.history.pushState({}, "", url.toString());
                window.scrollTo(0, 0);
              }}
            />
          </Suspense>
        </section>

        <div className="w-full max-w-7xl mx-auto px-6"><div className="h-px bg-gradient-to-r from-transparent via-app-border to-transparent" /></div>

        <section id="contact" className="scroll-mt-32">
          <ContactPage />
        </section>
      </main>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-v79-navy-dark pt-12 pb-24 sm:pb-12 px-6 lg:px-12 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-slate-200 dark:border-white/10">
          <div className="space-y-4 col-span-2">
            <div className="flex items-center">
              <V79OfficialLogo size="lg" />
            </div>
            <p className="text-xs text-slate-600 dark:text-white/70 font-light max-w-sm leading-relaxed">
              Managed IT, cybersecurity, cloud infrastructure, and business software support for organisations across Saint Lucia and the Eastern Caribbean.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono text-[11px]">Services</div>
            <ul className="space-y-1.5 text-slate-600 dark:text-white/60 font-light">
              <li><button onClick={() => scrollTo("services")} className="hover:text-v79-teal dark:hover:text-v79-teal-light transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded">Cybersecurity</button></li>
              <li><button onClick={() => scrollTo("services")} className="hover:text-v79-teal dark:hover:text-v79-teal-light transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded">Cloud &amp; Backup</button></li>
              <li><button onClick={() => scrollTo("services")} className="hover:text-v79-teal dark:hover:text-v79-teal-light transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded">Managed IT Support</button></li>
              <li><button onClick={() => scrollTo("services")} className="hover:text-v79-teal dark:hover:text-v79-teal-light transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded">Custom Software</button></li>
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono text-[11px]">Industries</div>
            <ul className="space-y-1.5 text-slate-600 dark:text-white/60 font-light">
              <li><button onClick={() => scrollTo("industries")} className="hover:text-v79-teal dark:hover:text-v79-teal-light transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded">Small Business</button></li>
              <li><button onClick={() => scrollTo("industries")} className="hover:text-v79-teal dark:hover:text-v79-teal-light transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded">Government</button></li>
              <li><button onClick={() => scrollTo("industries")} className="hover:text-v79-teal dark:hover:text-v79-teal-light transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded">Healthcare</button></li>
              <li><button onClick={() => scrollTo("industries")} className="hover:text-v79-teal dark:hover:text-v79-teal-light transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded">Hospitality</button></li>
            </ul>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono text-[11px]">Company</div>
            <ul className="space-y-1.5 text-slate-600 dark:text-white/60 font-light">
              {SECTIONS.filter(s => ["about", "resources", "contact"].includes(s.id)).map(s => (
                <li key={s.id}>
                  <button onClick={() => scrollTo(s.id)} className="hover:text-v79-teal dark:hover:text-v79-teal-light transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded">{s.label}</button>
                </li>
              ))}
              <li>Castries, Saint Lucia</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 pb-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-600 dark:text-white/60 font-light border-b border-slate-200 dark:border-white/10">
          <div>Phone: <a href="tel:+17587260035" className="text-v79-teal dark:text-v79-teal-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded">+1 758 726 0035</a></div>
          <span className="hidden sm:block text-slate-300 dark:text-white/20">|</span>
          <div>Email: <a href="mailto:vision79slu@gmail.com" className="text-v79-teal dark:text-v79-teal-light hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50 rounded">vision79slu@gmail.com</a></div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-white/50 font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-v79-teal-light animate-pulse" />
            <span>Website operational · Service SLAs are defined by client agreement</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end">
            <a href="/privacy" className="hover:text-v79-teal dark:hover:text-v79-teal-light transition">Privacy Policy</a>
            <a href="/terms" className="hover:text-v79-teal dark:hover:text-v79-teal-light transition">Terms of Service</a>
            <a href="/data-deletion" className="hover:text-v79-teal dark:hover:text-v79-teal-light transition">Data Deletion</a>
            <span>© 2026 V79 Digital. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Quick Action Button (Desktop Viewports) */}
      <aside aria-label="Quick contact" className="hidden sm:block fixed bottom-6 right-6 z-50">
        <a
          id="floating-whatsapp-btn"
          href="https://wa.me/17587260035?text=Hello%20V79%20Digital,%20I'd%20like%20to%20inquire%20about%20Vision79%20ICT%20support%20services."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with V79 Digital on WhatsApp"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xl shadow-emerald-900/30 hover:scale-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 group"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full" />
          </div>
          <span className="tracking-tight">Chat on WhatsApp</span>
        </a>
      </aside>

      {/* Sticky Mobile Quick-Action Bar (Mobile Viewports < 768px) */}
      <nav aria-label="Mobile quick contact" className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-app-bg/95 backdrop-blur-md border-t border-app-border px-3 py-2 shadow-2xl flex items-center gap-2">
        <a
          id="mobile-call-btn"
          href="tel:+17587260035"
          aria-label="Call Vision79 Digital at +1 758 726 0035"
          className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-v79-navy dark:bg-v79-navy-light text-white text-xs font-bold shadow transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50"
        >
          <Phone className="w-4 h-4 text-v79-teal-light" />
          <span>Call Office</span>
        </a>
        <a
          id="mobile-whatsapp-btn"
          href="https://wa.me/17587260035?text=Hello%20V79%20Digital,%20I%20need%20urgent%20ICT%20support%20for%20my%20business%20in%20Saint%20Lucia."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with V79 Digital on WhatsApp (opens in new tab)"
          className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <MessageSquare className="w-4 h-4 text-white" />
          <span>WhatsApp</span>
        </a>
      </nav>
    </div>
    </MotionConfig>
  );
}

