namespace :sitemap do
  desc "Generate dynamic sitemap with React public pages and database content"
  task generate: :environment do
    puts "Generating sitemap..."
    puts "This will include:"
    puts "- React frontend public pages"
    puts "- Dynamic pages from database"
    puts "- Published tests from database"
    puts "- Plans, FAQs, Help articles from database"
    puts "- Public reviews and organizations from database"
    puts ""
    
    service = SitemapService.new
    service.generate_and_save
    
    puts "Sitemap generated successfully!"
    puts "Total URLs in sitemap: #{service.url_count}"
  end
  
  desc "Generate sitemap index for large sites (if you have multiple sitemaps)"
  task generate_index: :environment do
    puts "Generating sitemap index..."
    
    base_url = ENV['FRONTEND_APP_URL'] || 'https://talenttest.io'
    
    sitemap_index = '<?xml version="1.0" encoding="UTF-8"?>'
    sitemap_index += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    sitemap_index += "<sitemap><loc>#{base_url}/sitemap.xml</loc><lastmod>#{Time.current.iso8601}</lastmod></sitemap>"
    sitemap_index += '</sitemapindex>'
    
    sitemap_index_path = Rails.root.join('public', 'sitemap_index.xml')
    File.write(sitemap_index_path, sitemap_index)
    
    puts "Sitemap index generated successfully at: #{sitemap_index_path}"
  end
  
  desc "Clean up old sitemap files"
  task cleanup: :environment do
    puts "Cleaning up old sitemap files..."
    
    sitemap_files = [
      Rails.root.join('public', 'sitemap.xml'),
      Rails.root.join('public', 'sitemap_index.xml')
    ]
    
    sitemap_files.each do |file|
      if File.exist?(file)
        File.delete(file)
        puts "Deleted: #{file}"
      end
    end
    
    puts "Cleanup completed"
  end
  
  desc "Generate and submit sitemap to search engines (requires API keys)"
  task submit: :environment do
    puts "Submitting sitemap to search engines..."
    
    base_url = ENV['FRONTEND_APP_URL'] || 'https://talenttest.io'
    sitemap_url = "#{base_url}/sitemap.xml"
    
    # Submit to Google Search Console (if configured)
    if ENV['GOOGLE_SEARCH_CONSOLE_API_KEY']
      puts "Submitting to Google Search Console..."
      # Add Google Search Console submission logic here
      # You'll need to implement the actual API call
    end
    
    # Submit to Bing Webmaster Tools (if configured)
    if ENV['BING_WEBMASTER_API_KEY']
      puts "Submitting to Bing Webmaster Tools..."
      # Add Bing Webmaster Tools submission logic here
      # You'll need to implement the actual API call
    end
    
    puts "Sitemap submission completed"
  end
  
  desc "Show sitemap statistics"
  task stats: :environment do
    puts "Sitemap Statistics:"
    puts "==================="
    
    # Count React public pages
    react_service = ReactSitemapService.new
    react_pages_count = react_service.get_public_pages.count
    puts "React Public Pages: #{react_pages_count}"
    
    # Count dynamic pages
    dynamic_pages_count = DynamicPage.active.count
    puts "Dynamic Pages (DB): #{dynamic_pages_count}"
    
    # Count published tests
    published_tests_count = Test.where(status: 'published').count
    puts "Published Tests (DB): #{published_tests_count}"
    
    # Count plans
    plans_count = Plan.count
    puts "Plans (DB): #{plans_count}"
    
    # Count FAQs
    faqs_count = Faq.count
    puts "FAQs (DB): #{faqs_count}"
    
    # Count help articles
    help_count = Help.count
    puts "Help Articles (DB): #{help_count}"
    
    # Count public reviews
    reviews_count = Review.where(show_in_public: true).count
    puts "Public Reviews (DB): #{reviews_count}"
    
    # Count organizations
    orgs_count = Organization.count
    puts "Organizations (DB): #{orgs_count}"
    
    total_estimated = react_pages_count + dynamic_pages_count + published_tests_count + 
                     plans_count + faqs_count + help_count + reviews_count + orgs_count
    puts "Total Estimated URLs: #{total_estimated}"
    
    # Check if sitemap exists and show its stats
    sitemap_path = Rails.root.join('public', 'sitemap.xml')
    if File.exist?(sitemap_path)
      content = File.read(sitemap_path)
      actual_count = content.scan(/<url>/).count
      puts "Actual URLs in sitemap: #{actual_count}"
      puts "Sitemap file size: #{File.size(sitemap_path)} bytes"
    else
      puts "Sitemap file not found"
    end
  end
  
  desc "Generate only React public pages sitemap"
  task react_pages: :environment do
    puts "Generating sitemap with only React public pages..."
    
    base_url = ENV['FRONTEND_APP_URL'] || 'https://talenttest.io'
    sitemap_xml = '<?xml version="1.0" encoding="UTF-8"?>'
    sitemap_xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    
    react_service = ReactSitemapService.new(base_url)
    react_service.generate_sitemap_entries.each do |entry|
      sitemap_xml += "<url>"
      sitemap_xml += "<loc>#{entry[:url]}</loc>"
      sitemap_xml += "<lastmod>#{entry[:lastmod]}</lastmod>"
      sitemap_xml += "<changefreq>#{entry[:changefreq]}</changefreq>"
      sitemap_xml += "<priority>#{entry[:priority]}</priority>"
      sitemap_xml += "</url>"
    end
    
    sitemap_xml += '</urlset>'
    
    sitemap_path = Rails.root.join('public', 'react_sitemap.xml')
    File.write(sitemap_path, sitemap_xml)
    
    puts "React sitemap generated successfully at: #{sitemap_path}"
    puts "Total React URLs: #{react_service.get_public_pages.count}"
  end
  
  desc "Generate only database dynamic pages sitemap"
  task db_pages: :environment do
    puts "Generating sitemap with only database dynamic pages..."
    
    service = SitemapService.new
    service.generate # Don't save to default location
    
    sitemap_path = Rails.root.join('public', 'db_sitemap.xml')
    File.write(sitemap_path, service.sitemap_xml)
    
    puts "Database sitemap generated successfully at: #{sitemap_path}"
    puts "Total DB URLs: #{service.url_count}"
  end
end

# Convenience task to run all sitemap operations
desc "Generate complete sitemap with cleanup and submission"
task sitemap: ['sitemap:cleanup', 'sitemap:generate', 'sitemap:generate_index', 'sitemap:submit'] 