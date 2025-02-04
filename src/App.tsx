import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { translations } from './i18n';

interface WikiResult {
  pageid: number;
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
  };
}

const DEFAULT_TOPICS = [
  '那年今日',
  '热门条目',
  '科学技术',
  '文化艺术',
  '历史人物',
  '自然地理',
  '社会科学',
  '体育运动',
  '娱乐休闲',
  '建筑设计',
];

function App() {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<WikiResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeCategory, setActiveCategory] = useState(DEFAULT_TOPICS[0]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const observer = useRef<IntersectionObserver>();
  const [lang, setLang] = useState('zh');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const lastArticleRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchArticles(query || activeCategory, true);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, query, activeCategory]
  );

  const t = (key: string) => {
    const keys = key.split('.');
    let value = translations[lang];
    for (const k of keys) {
      value = value[k];
    }
    return value;
  };

  const TOPICS = [
    { key: 'onThisDay', value: t('topics.onThisDay') },
    { key: 'featured', value: t('topics.featured') },
    { key: 'science', value: t('topics.science') },
    { key: 'culture', value: t('topics.culture') },
    { key: 'history', value: t('topics.history') },
    { key: 'geography', value: t('topics.geography') },
    { key: 'society', value: t('topics.society') },
    { key: 'sports', value: t('topics.sports') },
    { key: 'entertainment', value: t('topics.entertainment') },
    { key: 'architecture', value: t('topics.architecture') },
  ];

  const fetchSpecialContent = async (category: string) => {
    if (category === '热门条目') {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?` +
          `action=query&format=json&origin=*&` +
          `prop=extracts|pageimages&generator=mostviewed&` +
          `gpvimlimit=10&exintro=1&explaintext=1&` +
          `piprop=thumbnail&pithumbsize=400`
      );
      const data = await response.json();
      return data;
    } else if (category === '那年今日') {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?` +
          `action=query&format=json&origin=*&` +
          `prop=extracts|pageimages&generator=search&` +
          `gsrlimit=10&gsrsearch=On_${month}_${day}&` +
          `exintro=1&explaintext=1&piprop=thumbnail&pithumbsize=400`
      );
      const data = await response.json();
      return data;
    }
    return null;
  };

  const fetchArticles = async (searchQuery: string, append = false) => {
    if (!searchQuery) return;
    setIsLoading(true);
    try {
      let data;
      const apiLang = lang === 'zh' ? 'zh' : 'en';

      if (['热门条目', 'Featured Articles'].includes(searchQuery) && !append) {
        data = await fetchSpecialContent(searchQuery);
      } else {
        const response = await fetch(
          `https://${apiLang}.wikipedia.org/w/api.php?` +
            `action=query&format=json&origin=*&` +
            `prop=extracts|pageimages&` +
            `generator=search&gsrlimit=10&` +
            `gsroffset=${append ? offset : 0}&` +
            `gsrsearch=${encodeURIComponent(
              searchQuery === '热门条目'
                ? 'featured article'
                : searchQuery === '那年今日'
                ? 'historical events'
                : searchQuery
            )}&` +
            `exintro=1&explaintext=1&piprop=thumbnail&pithumbsize=400`
        );
        data = await response.json();
      }

      const pages = data.query?.pages || {};
      const results = Object.values(pages) as WikiResult[];

      setArticles((prev) => (append ? [...prev, ...results] : results));
      setOffset((prev) => (append ? prev + 10 : 10));
      setHasMore(results.length === 10);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (articles.length === 0) {
      fetchArticles(activeCategory);
    }
  }, [activeCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        fetchArticles(query);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleArticleClick = (title: string) => {
    const url = `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(
      title
    )}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div
          className={`mx-auto px-4 py-3 flex items-center justify-between ${
            isMobile ? '' : 'max-w-6xl'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="text-red-500" size={isMobile ? 20 : 24} />
            <span
              className={`${
                isMobile ? 'text-lg' : 'text-xl'
              } font-bold text-red-500`}
            >
              {t('appTitle')}
            </span>
          </div>
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className={`w-full px-4 ${
                  isMobile ? 'py-2 text-sm' : 'py-2.5'
                } pl-10 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50`}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={isMobile ? 16 : 18}
              />
            </div>
          </div>
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-red-500"
          >
            {lang === 'zh' ? 'EN' : '中'}
          </button>
        </div>

        {/* 分类导航 */}
        <div
          className={`border-b border-gray-100 bg-white ${
            isMobile ? 'px-2' : 'px-4'
          }`}
        >
          <div className={`mx-auto ${isMobile ? '' : 'max-w-6xl'}`}>
            <div className="flex gap-6 overflow-x-auto py-3 scrollbar-hide">
              {TOPICS.map((topic) => (
                <button
                  key={topic.key}
                  onClick={() => {
                    setActiveCategory(topic.value);
                    setArticles([]);
                    setOffset(0);
                    setHasMore(true);
                  }}
                  className={`whitespace-nowrap text-sm font-medium transition-colors ${
                    activeCategory === topic.value
                      ? 'text-red-500'
                      : 'text-gray-600 hover:text-red-500'
                  }`}
                >
                  {topic.value}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className={`mx-auto px-4 py-6 ${isMobile ? '' : 'max-w-6xl'}`}>
        <div
          className={`grid ${
            isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-4'
          }`}
        >
          {articles.map((article, index) => (
            <div
              key={article.pageid}
              ref={index === articles.length - 1 ? lastArticleRef : null}
              onClick={() => handleArticleClick(article.title)}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              {article.thumbnail && (
                <div className="relative aspect-[4/3] overflow-hidden group">
                  <img
                    src={article.thumbnail.source}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className={`p-3 ${isMobile ? 'space-y-1.5' : 'space-y-2'}`}>
                <h2
                  className={`${
                    isMobile ? 'text-sm' : 'text-base'
                  } font-medium line-clamp-2 text-gray-900`}
                >
                  {article.title}
                </h2>
                <p
                  className={`${
                    isMobile ? 'text-xs' : 'text-sm'
                  } text-gray-500 line-clamp-2`}
                >
                  {article.extract}
                </p>
              </div>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center p-6">
            <Loader2
              className="animate-spin text-red-500"
              size={isMobile ? 24 : 28}
            />
          </div>
        )}

        {!isLoading && articles.length === 0 && query && (
          <div className="text-center text-gray-500 py-12">
            {t('noResults')}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
