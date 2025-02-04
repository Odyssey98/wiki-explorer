interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

export const translations: Translations = {
  zh: {
    appTitle: '探索',
    searchPlaceholder: '搜索感兴趣的内容...',
    noResults: '未找到相关结果',
    topics: {
      onThisDay: '那年今日',
      featured: '热门条目',
      science: '科学技术',
      culture: '文化艺术',
      history: '历史人物',
      geography: '自然地理',
      society: '社会科学',
      sports: '体育运动',
      entertainment: '娱乐休闲',
      architecture: '建筑设计',
    },
  },
  en: {
    appTitle: 'Explorer',
    searchPlaceholder: 'Search for content...',
    noResults: 'No results found',
    topics: {
      onThisDay: 'On This Day',
      featured: 'Featured Articles',
      science: 'Science & Tech',
      culture: 'Arts & Culture',
      history: 'Historical Figures',
      geography: 'Geography',
      society: 'Social Science',
      sports: 'Sports',
      entertainment: 'Entertainment',
      architecture: 'Architecture',
    },
  },
};
