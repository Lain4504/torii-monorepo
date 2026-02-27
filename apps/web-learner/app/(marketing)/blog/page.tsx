import {
  BookOpen,
  Building2,
  GraduationCap,
  Clock,
  Brain,
  Grid3x3,
  List,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Globe
} from 'lucide-react'

// Static blog data
const featuredArticle = {
  id: 1,
  slug: 'exploring-japanese-beauty',
  category: 'Featured Article',
  title: '日本語の美しさを探究する：中級者のためのガイド',
  titleEn: 'Exploring the Beauty of Japanese: A Guide for Intermediate Learners',
  excerpt: '日本語のニュアンスを深く理解し、より自然な表現を身につけましょう。文脈に応じた言葉の使い分けや、文化的な背景が言葉に与える影響について詳しく解説します。',
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2bArztI9K3xRM05b2j3H7x0sCj42h1_mER-dpWCNvpWbEn19UlvVMX6S_oglcQ5-cjqX6QbvNe-EWXQAoVFo2g7CP1xOPQ0rJ4knXFHSbJi0Ztlq6QJbt2KJBYYeRXVChtbbVJnjfSo2jjgy32S0JcbIKY2NnpO2zorvta-klNXQ6_NRobcZxxQtAgZ3rHM1ArhEQmXDlcp3UK2Gtx_3u8GwffwC3gfvv8h9xh2h7ZFPGZZxJp0CPqzbq4VIjODI3_c7cYu8eSgA',
  imageAlt: 'Traditional Japanese temple architecture with autumn leaves',
}

const blogPosts = [
  {
    id: 1,
    slug: 'jlpt-n2-vocabulary-tips',
    category: 'Vocabulary',
    title: 'JLPT N2 Vocabulary Tips: 効率的な覚え方',
    excerpt: 'N2レベルの単語は抽象的になりがちです。例文と一緒に文脈で覚えるコツをご紹介します。',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4sXc97PTAm8F6nCtnXXCEuBrYsPKBvjGDX3lTuCmA_Qq5TPKSKs3dNjUsEdEYo8qJ-9nMoj1XbzTiYq-7DO9pZlvmnGK0T9OQDEg_6eSXS9Di36KesS1s_od_73tQowtXy9-1Y6CEEo7cxRGTYmwA3v4lFhHIwZR6dGPBM1PCqNhzpWGLFtVBUs_fKIkIGhAYq-9VQ8MntaMv8e-ls88FL0bWJlw-cCurCsFE-4Jngu9WK_8IPRB2L6swDDxvdOZs_nhJ9ecXE74',
    imageAlt: 'Close up of Japanese text in a book',
    author: '田中',
    date: '2023-10-24',
  },
  {
    id: 2,
    slug: 'ai-role-in-learning',
    category: 'AI Sensei',
    title: 'The Role of AI: 言語学習におけるAIの役割',
    excerpt: '最新のAIを使って日本語のライティングを劇的に向上させる方法とは？プロンプトの活用法を伝授。',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApoiNCsIDcH-xbIlgFXgBys-h5Fo13RJ0Z_8ErKFEfJ8LkqZFLGrKw864AQK0y8D5igzaGDhwazFkSezSma4BkM-MY9dZuwEt2bROg3weYaIScL_jnqlARXYh3RaDwpcGttRTut1r2uLq2mmbLva6ORdigcGdMiN6qlVCeQMQQ-3h7yDyyn7OYSppa5MJem74mwilyGjOTfpDq4ZHcOPRRQSbUfX8NIqZW8nrkm7hjC1DpIJMn0kcAq6oHB5tR3fddmzbEzecFOa8',
    imageAlt: 'Futuristic AI interface visualization',
    author: '佐藤',
    date: '2023-10-22',
  },
  {
    id: 3,
    slug: 'understanding-keigo',
    category: 'Grammar',
    title: 'Understanding Keigo: 敬語を正しく理解する',
    excerpt: '尊敬語・謙譲語・丁寧語の使い分けを、よくあるビジネスシーンの実例から学びましょう。',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvL79MW48rHdjXol9aMtpVOXwIOIgsTp0ljsRsH-pVW9urORhC0vpyiiwY5QWw8_l-mSZSj7zvAZbNpxUqFRSmdVIXdyKqvx7R16eHZgRcoHIn5XMbQwCnUKr85zQWZcQtV7syUSMIUQRsWCAhp6SnCWDc_zC9DjvWN_7ELuxIfhqZDE115PrPmKZf9unspS5K_l564kyGoyPXg097OtgLQyiNVVc1IfvjRJ-XJSbxtc4qHl8mG6SQzhJevTCzPchfIXDbp6Rv04g',
    imageAlt: 'People bowing in a business setting in Japan',
    author: '鈴木',
    date: '2023-10-20',
  },
  {
    id: 4,
    slug: 'top-10-kanji-apps',
    category: 'Study Methods',
    title: 'Top 10 Kanji Apps: おすすめの漢字アプリ10選',
    excerpt: 'スキマ時間を活用して漢字をマスターするための最強アプリを厳選してご紹介します。',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfphACdiKuTAYAEJqwgCUtRAz-A-SzpYxZVWShNgvabYV998n11ZQQaD4yeItT62i_vaefbjTu7zjARjr0JNq0m-A2u0d8TOIXucUlLMAub9Z9n3kUUUbtcyzMUrgDe8Zmw-WVGUKQKQCkD6oxAK236li4U051J_XZ7ypExHmhTtf5fcP_gdAlH601A--twE_lcJ87pqiVZxSc_50j3mkVONLI7LjdHH7P5Z9M3b7xSTZVXUAAeEWXShk6DDsbsebkBFK5D9HrX6s',
    imageAlt: 'Smart phone showing mobile apps on home screen',
    author: '高橋',
    date: '2023-10-18',
  },
]

const categories = [
  { icon: BookOpen, name: 'Grammar / 文法', href: '#', active: true },
  { icon: Globe, name: 'Vocabulary / 単語', href: '#', active: false },
  { icon: Building2, name: 'Culture / 文化', href: '#', active: false },
  { icon: GraduationCap, name: 'JLPT / 試験対策', href: '#', active: false },
  { icon: Clock, name: 'Study Methods / 学習法', href: '#', active: false },
  { icon: Brain, name: 'AI Sensei / AI先生', href: '#', active: false },
]

const popularTags = ['#Kanji', '#Keigo', '#N2', '#Listening', '#Anime']

export default function BlogListingPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10 space-y-12">
          {/* Hero Featured Article */}
          <section className="relative overflow-hidden rounded-3xl bg-slate-900 aspect-[21/9] flex items-end">
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: `url('${featuredArticle.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            <div className="relative p-8 md:p-12 max-w-3xl space-y-4">
              <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">
                {featuredArticle.category}
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                {featuredArticle.title}
                <span className="block text-xl md:text-2xl font-medium text-slate-300 mt-2">
                  {featuredArticle.titleEn}
                </span>
              </h2>
              <p className="text-slate-300 text-sm md:text-base line-clamp-2">
                {featuredArticle.excerpt}
              </p>
              <button className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all group">
                <span>続きを読む</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 space-y-8 order-2 lg:order-1">
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  カテゴリー
                </h3>
                <div className="flex flex-col gap-1">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <a
                        key={category.name}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          category.active
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        href={category.href}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{category.name}</span>
                      </a>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  人気のタグ
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-medium rounded-full cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </aside>

            {/* Article Listing */}
            <div className="flex-1 space-y-8 order-1 lg:order-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-2xl font-bold">
                  最新の記事 <span className="text-slate-400 font-normal">/ Latest Posts</span>
                </h2>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors">
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        alt={post.imageAlt}
                        src={post.image}
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur text-slate-900 text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-sm">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-primary text-xs font-bold">{post.author}</span>
                          </div>
                          <span className="text-xs text-slate-400">{post.date}</span>
                        </div>
                        <button className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                          記事を読む <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              <nav className="flex items-center justify-center gap-2 pt-8">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white font-bold">
                  1
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                  2
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                  3
                </button>
                <span className="px-2">...</span>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                  12
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
            </div>
          </div>
    </div>
  )
}
