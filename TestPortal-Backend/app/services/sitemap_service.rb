class SitemapService
  attr_reader :base_url, :sitemap_xml

  def initialize(base_url = nil)
    @base_url = base_url || ENV['FRONTEND_APP_URL'] || 'https://talenttest.io'
    @sitemap_xml = ''
  end

  def generate
    initialize_sitemap
    add_react_public_pages
    add_dynamic_pages
    add_published_tests
    add_plans
    add_faqs
    add_help_articles
    add_reviews
    add_organizations
    finalize_sitemap
    @sitemap_xml
  end

  def generate_and_save(file_path = nil)
    generate
    file_path ||= Rails.root.join('public', 'sitemap.xml')
    File.write(file_path, @sitemap_xml)
    update_robots_txt
    @sitemap_xml
  end

  def url_count
    @sitemap_xml.scan(/<url>/).count
  end

  private

  def initialize_sitemap
    @sitemap_xml = '<?xml version="1.0" encoding="UTF-8"?>'
    @sitemap_xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  end

  def add_react_public_pages
    puts "Adding React frontend public pages..."
    react_service = ReactSitemapService.new(base_url)
    react_service.generate_sitemap_entries.each do |entry|
      add_url_entry(entry[:url], entry[:priority], entry[:changefreq], entry[:lastmod])
    end
  end

  def add_dynamic_pages
    puts "Adding dynamic pages from database..."
    DynamicPage.active.find_each do |page|
      add_url_entry(
        base_url + "/#{page.slug}",
        '0.8',
        'weekly',
        page.updated_at
      )
    end
  end

  def add_published_tests
    puts "Adding published tests from database..."
    Test.where(status: 'published').find_each do |test|
      # Only add tests that are accessible and not expired
      if test.accessible_now? && (test.link_expires_date.nil? || test.link_expires_date > Date.current)
        add_url_entry(
          base_url + "/test/#{test.slug}",
          '0.6',
          'weekly',
          test.updated_at
        )
      end
    end
  end

  def add_plans
    puts "Adding plans from database..."
    Plan.find_each do |plan|
      add_url_entry(
        base_url + "/pricing",
        '0.7',
        'monthly',
        plan.updated_at
      )
    end
  end

  def add_faqs
    puts "Adding FAQ entries from database..."
    Faq.find_each do |faq|
      add_url_entry(
        base_url + "/faq",
        '0.6',
        'monthly',
        faq.updated_at
      )
    end
  end

  def add_help_articles
    puts "Adding help articles from database..."
    Help.find_each do |help|
      add_url_entry(
        base_url + "/help",
        '0.6',
        'monthly',
        help.updated_at
      )
    end
  end

  def add_reviews
    puts "Adding public reviews from database..."
    Review.where(show_in_public: true).find_each do |review|
      add_url_entry(
        base_url + "/reviews",
        '0.5',
        'monthly',
        review.updated_at
      )
    end
  end

  def add_organizations
    puts "Adding organizations from database..."
    Organization.find_each do |org|
      add_url_entry(
        base_url + "/organizations",
        '0.5',
        'monthly',
        org.updated_at
      )
    end
  end

  def finalize_sitemap
    @sitemap_xml += '</urlset>'
  end

  def add_url_entry(url, priority, changefreq, lastmod = nil)
    entry = "<url>"
    entry += "<loc>#{url}</loc>"
    
    # Handle lastmod - if it's already a string, use it; if it's a time object, format it
    lastmod_str = if lastmod.is_a?(String)
      lastmod
    elsif lastmod.respond_to?(:iso8601)
      lastmod.iso8601
    else
      Time.current.iso8601
    end
    
    entry += "<lastmod>#{lastmod_str}</lastmod>"
    entry += "<changefreq>#{changefreq}</changefreq>"
    entry += "<priority>#{priority}</priority>"
    entry += "</url>"
    @sitemap_xml += entry
  end

  def update_robots_txt
    robots_path = Rails.root.join('public', 'robots.txt')
    
    # Read existing robots.txt or create new one
    robots_content = if File.exist?(robots_path)
      File.read(robots_path)
    else
      "# See https://www.robotstxt.org/robotstxt.html for documentation on how to use the robots.txt file\n\n"
    end
    
    # Add sitemap directive if not already present
    unless robots_content.include?('Sitemap:')
      robots_content += "\nSitemap: #{base_url}/sitemap.xml\n"
      File.write(robots_path, robots_content)
    end
  end
end 