class ReactSitemapService
  attr_reader :base_url

  def initialize(base_url = nil)
    @base_url = base_url || ENV['FRONTEND_APP_URL'] || 'https://talenttest.io'
  end

  def get_public_pages
    [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/pricing', priority: '0.9', changefreq: 'weekly' },
      { path: '/contact', priority: '0.7', changefreq: 'monthly' },
      { path: '/help', priority: '0.7', changefreq: 'monthly' },
      { path: '/faq', priority: '0.7', changefreq: 'monthly' },
      { path: '/about', priority: '0.8', changefreq: 'monthly' },
      { path: '/terms', priority: '0.5', changefreq: 'yearly' },
      { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
      { path: '/cookie-preferences', priority: '0.3', changefreq: 'yearly' },
      { path: '/solutions/educators', priority: '0.8', changefreq: 'monthly' },
      { path: '/solutions/recruiters', priority: '0.8', changefreq: 'monthly' },
      { path: '/solutions/online-exams', priority: '0.8', changefreq: 'monthly' },
      { path: '/solutions/proctoring', priority: '0.8', changefreq: 'monthly' },
      { path: '/test-portal-under-2000-inr', priority: '0.9', changefreq: 'weekly' },
      { path: '/signup', priority: '0.8', changefreq: 'monthly' },
      { path: '/login', priority: '0.6', changefreq: 'monthly' }
    ]
  end

  def generate_sitemap_entries
    entries = []
    get_public_pages.each do |page|
      entries << {
        url: base_url + page[:path],
        priority: page[:priority],
        changefreq: page[:changefreq],
        lastmod: Time.current.iso8601
      }
    end
    entries
  end
end 