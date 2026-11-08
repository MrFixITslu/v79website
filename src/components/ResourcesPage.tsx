import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, User, Tag, BookOpen, ArrowRight, Download, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { BlogArticle } from "../types";
import { ArticleCardSkeleton } from "./ui/Skeleton";
import { Button } from "./ui/Button";
import { animateScrollTo } from "../utils/scroll";
import { ShareButtons } from "./ShareButtons";

interface ResourcesPageProps {
  onNavigate?: (v: string) => void;
  onSelectArticle?: (slug: string) => void;
}

export default function ResourcesPage({ onNavigate, onSelectArticle }: ResourcesPageProps) {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setArticles(data);
          // If onSelectArticle is NOT passed, handle query param locally
          if (!onSelectArticle) {
            const params = new URLSearchParams(window.location.search);
            const sharedSlug = params.get("article");
            if (sharedSlug) {
              const found = data.find((a: BlogArticle) => a.slug === sharedSlug);
              if (found) openArticle(sharedSlug);
            }
          }
        } else {
          setError("Failed to load articles.");
        }
      })
      .catch(() => setError("Could not connect to the server."))
      .finally(() => setLoading(false));
  }, []);

  const scrollToResources = () => {
    const el = document.getElementById("resources");
    if (el) {
      const targetY = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 80);
      window.scrollTo({ top: targetY, behavior: "instant" });
    }
  };

  const openArticle = async (slug: string) => {
    if (onSelectArticle) {
      onSelectArticle(slug);
      return;
    }
    setLoadingSlug(slug);
    setError(null);
    try {
      const r = await fetch(`/api/articles/${slug}`);
      if (!r.ok) throw new Error("Failed to load article");
      const data = await r.json();
      setSelectedArticle(data);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("article", slug);
        window.history.replaceState({}, "", url.toString());
      }

      setTimeout(() => {
        scrollToResources();
      }, 20);
    } catch {
      setError("Could not load article.");
    } finally {
      setLoadingSlug(null);
    }
  };

  const closeArticle = () => {
    setSelectedArticle(null);

    // Clean up query param on closing article view
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("article");
      window.history.replaceState({}, "", url.toString());
    }

    setTimeout(() => {
      scrollToResources();
    }, 50);
  };

  if (selectedArticle) {
    return (
      <motion.div
        id="article-reader"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pb-16"
      >
        <div className="max-w-3xl mx-auto px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between pt-6">
            <button
              onClick={closeArticle}
              className="flex items-center gap-2 text-sm text-app-text-muted hover:text-indigo-400 transition font-mono cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Resources
            </button>
            <span className="text-[11px] font-mono text-app-text-muted uppercase tracking-wider">
              {selectedArticle.category}
            </span>
          </div>

          {selectedArticle.coverImage && (
            <div className="rounded-2xl overflow-hidden h-56 sm:h-72">
              <img
                src={selectedArticle.coverImage}
                alt={selectedArticle.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-app-text-muted">
              <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{selectedArticle.category}</span>
              {selectedArticle.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{selectedArticle.date}</span>}
              {selectedArticle.author && <span className="flex items-center gap-1"><User className="w-3 h-3" />{selectedArticle.author}</span>}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-app-text dark:text-white leading-tight">
              {selectedArticle.title}
            </h1>

            {/* Quick Share Bar beneath title */}
            <div className="pt-2 pb-1">
              <ShareButtons
                title={selectedArticle.title}
                slug={selectedArticle.slug}
                imageUrl={selectedArticle.coverImage}
                coverImage={selectedArticle.coverImage}
                description={selectedArticle.description}
                category={selectedArticle.category}
                variant="inline"
              />
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-app-text prose-p:text-app-text-sec prose-p:font-light prose-p:leading-relaxed prose-strong:text-app-text prose-li:text-app-text-sec prose-li:font-light prose-a:text-indigo-400 prose-code:text-indigo-400 prose-code:bg-indigo-500/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
            <ReactMarkdown>{selectedArticle.content || ""}</ReactMarkdown>
          </div>

          {/* End-of-article Share Banner */}
          <div className="pt-6 border-t border-app-border">
            <ShareButtons
              title={selectedArticle.title}
              slug={selectedArticle.slug}
              imageUrl={selectedArticle.coverImage}
              coverImage={selectedArticle.coverImage}
              description={selectedArticle.description}
              category={selectedArticle.category}
              variant="block"
            />
          </div>

          <div className="pt-2 space-y-4">
            <div className="glass rounded-2xl p-6 text-center space-y-3 border border-indigo-500/20">
              <p className="text-sm text-app-text-sec font-light">Have questions? Our team is ready to help your business implement these best practices.</p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <Button onClick={closeArticle} variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
                  Back to All Insights
                </Button>
                <Button onClick={() => onNavigate?.("contact")} variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                  Talk to an Expert
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const sorted = [...articles].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const categories = ["All", ...Array.from(new Set(sorted.map((a) => a.category).filter(Boolean)))];
  const query = search.trim().toLowerCase();
  const visible = sorted.filter((article) =>
    (category === "All" || article.category === category) &&
    (!query || [article.title, article.description, article.category, article.author].some((field) => String(field || "").toLowerCase().includes(query)))
  );
  const featured = category === "All" && !query ? sorted[0] : null;
  const articleList = featured ? visible.filter((article) => article.slug !== featured.slug) : visible;

  return (
    <div className="space-y-20 pb-16 sm:space-y-28">
      <section className="relative overflow-hidden px-6 pt-12 sm:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_15%,rgba(14,143,136,.1),transparent_54%)]" />
        <div className="relative mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal">Resources & insights</p>
          <motion.h1 initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="mt-5 max-w-5xl text-4xl font-bold leading-[1.1] tracking-[-.05em] sm:text-6xl">
            Practical knowledge. <span className="text-v79-teal">Better business decisions.</span>
          </motion.h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-app-text-sec">
            Ideas, guidance and insights to help Caribbean businesses work smarter, strengthen operations and make technology work for them.
          </p>
          <p className="mt-4 max-w-3xl leading-7 text-app-text-sec">Learn about digital transformation, practical AI, ICT reliability and the business tools that help teams make progress.</p>
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <a href="/free-ai-prompting-guide" className="group flex flex-col justify-between rounded-[2rem] border border-v79-teal/25 bg-v79-navy p-8 text-white transition hover:border-v79-teal-light sm:p-10">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-v79-teal-light"><Download size={17} aria-hidden="true" /> Newsletter subscriber guides</span>
              <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-4xl">Useful guidance, delivered with purpose.</h2>
              <p className="mt-5 max-w-xl leading-8 text-white/75">Join the V79 Digital newsletter to get the AI Prompting Guide. Future downloadable guides and checklists will also be offered to subscribers as they become available.</p>
            </div>
            <span className="mt-8 inline-flex items-center gap-2 self-start rounded-full bg-v79-teal px-5 py-3 text-sm font-bold text-white group-hover:bg-v79-teal-dark">Subscribe & access the guide <ArrowRight size={16} aria-hidden="true" /></span>
          </a>
          <a href="https://academy.v79sl.com" className="group flex flex-col justify-between rounded-[2rem] border border-app-border bg-app-aside-bg/50 p-8 transition hover:border-v79-teal/40 sm:p-10">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-v79-teal"><BookOpen size={17} aria-hidden="true" /> Learn with V79 Academy</span>
              <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-4xl">Courses and training belong in the Academy.</h2>
              <p className="mt-5 max-w-xl leading-8 text-app-text-sec">Explore practical learning programmes and training resources through our dedicated Academy. Resources here remains focused on business insights and subscriber guides.</p>
            </div>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-v79-teal group-hover:underline">Explore V79 Academy <ArrowRight size={17} aria-hidden="true" /></span>
          </a>
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal">Business insights</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Find what matters to your business.</h2>
            <p className="mt-5 leading-8 text-app-text-sec">Explore published articles on process improvement, AI, ICT, business software and customer experience.</p>
          </div>

          <div className="mb-8 flex flex-col gap-4">
            <label htmlFor="resources-search" className="text-sm font-semibold text-app-text">Search articles</label>
            <input id="resources-search" value={search} onChange={(e) => setSearch(e.target.value)} type="search" placeholder="Search a topic, challenge or article..." className="w-full max-w-2xl rounded-2xl border border-app-input-border bg-app-input px-5 py-4 text-sm text-app-text outline-none focus:border-v79-teal focus:ring-2 focus:ring-v79-teal/20" />
            <div aria-label="Filter articles by category" className="flex flex-wrap gap-2">
              {categories.map((name) => (
                <button key={name} type="button" aria-pressed={category === name} onClick={() => setCategory(name)} className={"rounded-full border px-4 py-2 text-xs font-semibold transition " + (category === name ? "border-v79-teal bg-v79-teal text-white" : "border-app-border text-app-text-sec hover:border-v79-teal hover:text-v79-teal")}>{name}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div aria-live="polite" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((n)=><ArticleCardSkeleton key={n} />)}</div>
          ) : error ? (
            <div className="rounded-2xl border border-app-border p-8 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-v79-teal" aria-hidden="true" />
              <p role="alert" className="mt-3 text-sm text-app-text-sec">{error}</p>
              <p className="mt-2 text-xs text-app-text-muted">Articles are temporarily unavailable. You can still explore Academy and the newsletter guide above.</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="rounded-2xl border border-app-border p-8 text-center text-app-text-sec">New articles are on the way. Check back soon.</div>
          ) : (
            <div className="space-y-10">
              {featured && (
                <motion.button type="button" initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} onClick={() => openArticle(featured.slug)} className="group grid w-full overflow-hidden rounded-[2rem] border border-v79-teal/25 bg-app-aside-bg/30 text-left transition hover:border-v79-teal/60 hover:shadow-xl lg:grid-cols-[.85fr_1.15fr]">
                  <div className="flex min-h-[230px] items-center justify-center overflow-hidden bg-v79-navy">
                    {featured.coverImage ? <img src={featured.coverImage} alt="" loading="lazy" decoding="async" className="h-full max-h-[400px] w-full object-cover" /> : <BookOpen className="h-16 w-16 text-v79-teal-light" aria-hidden="true" />}
                  </div>
                  <div className="flex flex-col justify-center p-7 sm:p-10">
                    <p className="text-xs font-bold uppercase tracking-[.18em] text-v79-teal">Featured insight · {featured.category}</p>
                    <h3 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{featured.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-app-text-sec">{featured.description}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-v79-teal">Read the article <ArrowRight size={17} aria-hidden="true" /></span>
                  </div>
                </motion.button>
              )}
              {articleList.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {articleList.map((article, i) => (
                    <motion.button key={article.slug} type="button" initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:Math.min(i,4)*0.06}} onClick={() => openArticle(article.slug)} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-app-border bg-app-bg text-left transition hover:border-v79-teal/40 hover:shadow-lg">
                      <div className="flex h-44 items-center justify-center overflow-hidden bg-v79-navy/90">
                        {article.coverImage ? <img src={article.coverImage} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <BookOpen className="h-11 w-11 text-v79-teal-light" aria-hidden="true" />}
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <p className="text-xs font-bold uppercase tracking-[.14em] text-v79-teal">{article.category}</p>
                        <h3 className="mt-3 text-lg font-bold">{article.title}</h3>
                        <p className="mt-3 flex-1 text-sm leading-7 text-app-text-sec">{article.description}</p>
                        <div className="mt-6 flex items-center justify-between gap-3 border-t border-app-border pt-4 text-xs text-app-text-muted"><span>{article.date || "Article"}</span><span className="inline-flex items-center gap-1 font-semibold text-v79-teal">Read <ArrowRight size={14} aria-hidden="true" /></span></div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : !featured && (
                <p className="rounded-xl border border-app-border p-6 text-sm text-app-text-sec">No articles match that search. Try another keyword or category.</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[2rem] bg-v79-navy p-9 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-v79-teal-light">From Idea to Advantage</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Have a challenge an article can't solve?</h2><p className="mt-3 max-w-2xl leading-7 text-white/70">Tell us what you're trying to improve. We'll help you identify practical options.</p></div>
          <button onClick={() => onNavigate?.("contact")} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-v79-teal px-7 py-4 text-sm font-bold text-white hover:bg-v79-teal-dark">Book a discovery call <ArrowRight size={17} aria-hidden="true" /></button>
        </div>
      </section>
    </div>
  );
}
