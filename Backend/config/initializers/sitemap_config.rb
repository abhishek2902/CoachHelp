# Sitemap Configuration
# This file contains configuration settings for the sitemap generation

SitemapConfig = {
  # Base URL for the frontend application
  base_url: ENV['FRONTEND_APP_URL'] || 'https://talenttest.io',
  
  # Cache settings
  cache_age: ENV['SITEMAP_CACHE_AGE']&.to_i || 3600, # 1 hour in seconds
  
  # File paths
  sitemap_path: Rails.root.join('public', 'sitemap.xml'),
  sitemap_index_path: Rails.root.join('public', 'sitemap_index.xml'),
  robots_path: Rails.root.join('public', 'robots.txt'),
  
  # React public pages configuration
  react_pages: {
    # High priority pages (homepage, pricing, etc.)
    high_priority: [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/pricing', priority: '0.9', changefreq: 'weekly' },
      { path: '/test-portal-under-2000-inr', priority: '0.9', changefreq: 'weekly' }
    ],
    
    # Medium priority pages (solutions, about, etc.)
    medium_priority: [
      { path: '/about', priority: '0.8', changefreq: 'monthly' },
      { path: '/solutions/educators', priority: '0.8', changefreq: 'monthly' },
      { path: '/solutions/recruiters', priority: '0.8', changefreq: 'monthly' },
      { path: '/solutions/online-exams', priority: '0.8', changefreq: 'monthly' },
      { path: '/solutions/proctoring', priority: '0.8', changefreq: 'monthly' },
      { path: '/signup', priority: '0.8', changefreq: 'monthly' }
    ],
    
    # Lower priority pages (contact, help, etc.)
    low_priority: [
      { path: '/contact', priority: '0.7', changefreq: 'monthly' },
      { path: '/help', priority: '0.7', changefreq: 'monthly' },
      { path: '/faq', priority: '0.7', changefreq: 'monthly' },
      { path: '/login', priority: '0.6', changefreq: 'monthly' }
    ],
    
    # Legal pages (rarely change)
    legal_pages: [
      { path: '/terms', priority: '0.5', changefreq: 'yearly' },
      { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
      { path: '/cookie-preferences', priority: '0.3', changefreq: 'yearly' }
    ]
  },
  
  # Database models configuration
  database_models: {
    # Models to include in sitemap with their URL patterns and settings
    dynamic_pages: {
      model: 'DynamicPage',
      scope: 'active',
      url_pattern: '/:slug',
      priority: '0.8',
      changefreq: 'weekly'
    },
    
    published_tests: {
      model: 'Test',
      scope: 'published',
      url_pattern: '/test/:slug',
      priority: '0.6',
      changefreq: 'weekly',
      conditions: ['accessible_now?', 'link_expires_date.nil? || link_expires_date > Date.current']
    },
    
    plans: {
      model: 'Plan',
      url_pattern: '/pricing',
      priority: '0.7',
      changefreq: 'monthly'
    },
    
    faqs: {
      model: 'Faq',
      url_pattern: '/faq',
      priority: '0.6',
      changefreq: 'monthly'
    },
    
    help_articles: {
      model: 'Help',
      url_pattern: '/help',
      priority: '0.6',
      changefreq: 'monthly'
    },
    
    public_reviews: {
      model: 'Review',
      scope: 'show_in_public',
      url_pattern: '/reviews',
      priority: '0.5',
      changefreq: 'monthly'
    },
    
    organizations: {
      model: 'Organization',
      url_pattern: '/organizations',
      priority: '0.5',
      changefreq: 'monthly'
    }
  },
  
  # Search engine submission settings
  search_engines: {
    google_search_console: {
      enabled: ENV['GOOGLE_SEARCH_CONSOLE_API_KEY'].present?,
      api_key: ENV['GOOGLE_SEARCH_CONSOLE_API_KEY'],
      endpoint: 'https://searchconsole.googleapis.com/v1/sites/{siteUrl}/sitemaps'
    },
    
    bing_webmaster: {
      enabled: ENV['BING_WEBMASTER_API_KEY'].present?,
      api_key: ENV['BING_WEBMASTER_API_KEY'],
      endpoint: 'https://ssl.bing.com/webmaster/api.svc/json/SubmitSitemap'
    }
  },
  
  # Performance settings
  performance: {
    batch_size: 1000, # Number of records to process in batches
    memory_limit: 512.megabytes, # Memory limit for large sitemaps
    timeout: 300 # Timeout in seconds for sitemap generation
  }
}.freeze 