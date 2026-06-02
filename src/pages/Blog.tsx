import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { featuredPost, listPosts } from "@/data/blogPosts";

const PAGE_SIZE = 6;

const BlogPage = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const categories = [
    { label: t('blog.all'), value: "All" },
    { label: t('blog.destinations'), value: "Destinations" },
    { label: t('blog.tipsGuides'), value: "Tips & Guides" },
    { label: t('blog.industry'), value: "Industry" },
    { label: t('blog.forProviders'), value: "For Providers" },
    { label: t('blog.news'), value: "News" },
  ];

  const filteredPosts = activeCategory === "All"
    ? listPosts
    : listPosts.filter(p => p.category === activeCategory);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const selectCategory = (value: string) => {
    setActiveCategory(value);
    setVisibleCount(PAGE_SIZE);
  };

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
                  onClick={() => selectCategory(cat.value)}
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
                    <Button asChild className="bg-gradient-ocean w-fit">
                      <Link to={`/blog/${featuredPost.slug}`}>{t('blog.readArticle')}<ArrowRight className="ml-2" size={18} /></Link>
                    </Button>
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
              {visiblePosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-hover transition-shadow group block">
                  <div className="aspect-video overflow-hidden"><img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-xs font-medium">{post.category}</span>
                      <span className="text-muted-foreground text-xs">{post.readTime}</span>
                    </div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground"><span>{post.author}</span><span>{post.date}</span></div>
                  </div>
                </Link>
              ))}
            </div>
            {filteredPosts.length === 0 && (
              <p className="text-center text-muted-foreground py-12">{t('explore.noMoorings', 'No articles found in this category.')}</p>
            )}
            {hasMore && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                  {t('blog.loadMore')}
                </Button>
              </div>
            )}
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
