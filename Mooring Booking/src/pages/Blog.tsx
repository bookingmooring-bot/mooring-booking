import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const featuredPost = {
  title: "Top 10 Hidden Mooring Gems in Croatia for 2026",
  excerpt: "Discover secret spots that even local sailors don't know about.",
  image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80",
  author: "Captain M. Bosic",
  date: "January 15, 2026",
  category: "Destinations",
  readTime: "8 min read"
};

const posts = [
  { id: 1, title: "Hidden Gems of Croatian Kornati Islands", excerpt: "Navigate through 89 islands and discover moorings and marina berths.", image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80", author: "Ana K.", date: "January 12, 2026", category: "Destinations", readTime: "7 min" },
  { id: 2, title: "Mooring Guide: Santorini, Greece", excerpt: "Complete guide to finding affordable moorings and marina spots around this iconic island.", image: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=800&q=80", author: "Nikos P.", date: "January 10, 2026", category: "Destinations", readTime: "9 min" },
  { id: 3, title: "Best Moorings in Amalfi Coast, Italy", excerpt: "Navigate the stunning Amalfi Coast with our insider guide to moorings and marinas.", image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80", author: "Giuseppe R.", date: "January 8, 2026", category: "Destinations", readTime: "10 min" },
  { id: 4, title: "Discovering Albanian Riviera by Boat", excerpt: "Europe's last undiscovered coastline offers incredible value for moorings.", image: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=800&q=80", author: "Erion M.", date: "January 6, 2026", category: "Destinations", readTime: "6 min" },
  { id: 5, title: "Anchoring in Strong Winds: Expert Tips", excerpt: "When the Bura or Meltemi hits, you need to know these techniques.", image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80", author: "Captain Dimitri", date: "December 20, 2025", category: "Tips & Guides", readTime: "12 min" },
  { id: 6, title: "How Peer-to-Peer Mooring is Changing Sailing", excerpt: "The sharing economy has finally reached the nautical world — moorings and marinas unite.", image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80", author: "M. Bosic", date: "December 12, 2025", category: "Industry", readTime: "8 min" },
  { id: 7, title: "Best Mediterranean Marinas for Winter Storage", excerpt: "Compare prices, services, and locations for overwintering your vessel at top Mediterranean marinas.", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80", author: "D. Lazukic", date: "November 28, 2025", category: "For Providers", readTime: "10 min" },
  { id: 8, title: "How to Choose Between Moorings and Marinas", excerpt: "Pros, cons and cost comparison — which option suits your sailing style?", image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80", author: "Ana K.", date: "November 15, 2025", category: "Tips & Guides", readTime: "7 min" },
  { id: 9, title: "Mooring Booking Launches in Albania and Malta", excerpt: "New countries join the Mediterranean's largest mooring marketplace.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", author: "M. Bosic", date: "November 1, 2025", category: "News", readTime: "5 min" },
];

const BlogPage = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    { label: t('blog.all'), value: "All" },
    { label: t('blog.destinations'), value: "Destinations" },
    { label: t('blog.tipsGuides'), value: "Tips & Guides" },
    { label: t('blog.industry'), value: "Industry" },
    { label: t('blog.forProviders'), value: "For Providers" },
    { label: t('blog.news'), value: "News" },
  ];

  const filteredPosts = activeCategory === "All"
    ? posts
    : posts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-16 bg-gradient-ocean">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">{t('blog.title')}</h1>
              <p className="text-lg text-primary-foreground/80">{t('blog.subtitle')}</p>
            </div>
          </div>
        </section>

        <section className="py-6 bg-card border-b border-border sticky top-16 md:top-20 z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={activeCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  className={activeCategory === cat.value ? "bg-gradient-ocean" : ""}
                  onClick={() => setActiveCategory(cat.value)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {activeCategory === "All" && (
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
              <div className="bg-card rounded-2xl overflow-hidden shadow-hover max-w-5xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="aspect-video lg:aspect-auto"><img src={featuredPost.image} alt={featuredPost.title} className="w-full h-full object-cover" /></div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">{featuredPost.category}</span>
                      <span className="text-muted-foreground text-sm">{featuredPost.readTime}</span>
                    </div>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">{featuredPost.title}</h2>
                    <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><User size={16} />{featuredPost.author}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar size={16} />{featuredPost.date}</div>
                    </div>
                    <Button className="bg-gradient-ocean w-fit">{t('blog.readArticle')}<ArrowRight className="ml-2" size={18} /></Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-8">{t('blog.latestArticles')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <article key={post.id} className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-hover transition-shadow">
                  <div className="aspect-video"><img src={post.image} alt={post.title} className="w-full h-full object-cover" /></div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-xs font-medium">{post.category}</span>
                      <span className="text-muted-foreground text-xs">{post.readTime}</span>
                    </div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground"><span>{post.author}</span><span>{post.date}</span></div>
                  </div>
                </article>
              ))}
            </div>
            {filteredPosts.length === 0 && (
              <p className="text-center text-muted-foreground py-12">{t('explore.noMoorings', 'No articles found in this category.')}</p>
            )}
            <div className="text-center mt-12"><Button variant="outline" size="lg">{t('blog.loadMore')}</Button></div>
          </div>
        </section>

        <section className="py-16 bg-gradient-ocean">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-4">{t('blog.newsletterTitle')}</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">{t('blog.newsletterSubtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input type="email" placeholder={t('blog.enterEmail')} className="flex-1 h-12 px-4 rounded-lg bg-card/90 border-0 text-foreground placeholder:text-muted-foreground" />
              <Button className="bg-gold text-gold-foreground hover:bg-gold/90 h-12 px-6">{t('blog.subscribe')}</Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
