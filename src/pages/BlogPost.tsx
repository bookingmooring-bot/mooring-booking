import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, User, ArrowLeft, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { getBlogPost, listPosts, type BlogBlock } from "@/data/blogPosts";

const renderBlock = (block: BlogBlock, i: number) => {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={i} className="font-heading text-2xl font-bold text-foreground mt-10 mb-4">
          {block.text}
        </h2>
      );
    case "ul":
      return (
        <ul key={i} className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    case "p":
    default:
      return (
        <p key={i} className="text-muted-foreground leading-relaxed mb-5">
          {block.text}
        </p>
      );
  }
};

const BlogPostPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (post) {
      const prev = document.title;
      document.title = `${post.title} — Mooring Booking`;
      return () => { document.title = prev; };
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20">
          <section className="py-24 bg-background">
            <div className="container mx-auto px-4 text-center">
              <h1 className="font-heading text-3xl font-bold text-foreground mb-4">
                {t("blog.notFoundTitle", "Article not found")}
              </h1>
              <p className="text-muted-foreground mb-8">
                {t("blog.notFoundBody", "This article may have been moved or removed.")}
              </p>
              <Button asChild className="bg-gradient-ocean">
                <Link to="/blog">
                  <ArrowLeft className="mr-2" size={18} />
                  {t("blog.backToBlog", "Back to blog")}
                </Link>
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const related = listPosts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="relative h-[42vh] min-h-[280px] w-full overflow-hidden">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="container mx-auto px-4 pb-8">
              <div className="max-w-3xl">
                <span className="inline-block bg-secondary/90 text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium mb-4">
                  {post.category}
                </span>
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/85">
                  <span className="flex items-center gap-2"><User size={16} />{post.author}</span>
                  <span className="flex items-center gap-2"><Calendar size={16} />{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <article className="max-w-3xl mx-auto">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <ArrowLeft size={16} />
                {t("blog.backToBlog", "Back to blog")}
              </Link>

              <p className="text-lg text-foreground/90 leading-relaxed mb-8 font-medium">
                {post.excerpt}
              </p>

              {post.body.map(renderBlock)}
            </article>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="py-12 bg-muted">
            <div className="container mx-auto px-4">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-8 max-w-3xl mx-auto">
                {t("blog.relatedArticles", "Related articles")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {related.map((rp) => (
                  <Link
                    key={rp.id}
                    to={`/blog/${rp.slug}`}
                    className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-hover transition-shadow group"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={rp.image}
                        alt={rp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-heading font-semibold text-base text-foreground mb-2 line-clamp-2">
                        {rp.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-sm text-secondary font-medium">
                        {t("blog.readArticle", "Read article")}
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogPostPage;
