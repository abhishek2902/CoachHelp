class SitemapController < ApplicationController
  # Skip authentication for sitemap access
  
  # Serve sitemap.xml
  def index
    # Check if we should serve cached version or generate fresh
    if should_serve_cached?
      serve_cached_sitemap
    else
      generate_fresh_sitemap
    end
  end
  
  # Serve sitemap index
  def index_xml
    base_url = ENV['FRONTEND_APP_URL'] || 'https://talenttest.io'
    
    sitemap_index = '<?xml version="1.0" encoding="UTF-8"?>'
    sitemap_index += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    sitemap_index += "<sitemap><loc>#{base_url}/sitemap.xml</loc><lastmod>#{Time.current.iso8601}</lastmod></sitemap>"
    sitemap_index += '</sitemapindex>'
    
    render xml: sitemap_index, content_type: 'application/xml'
  end
  
  # Force regenerate sitemap
  def regenerate
    # Only allow in development or with proper authentication
    unless Rails.env.development? || current_admin_user
      render json: { error: 'Unauthorized' }, status: :unauthorized
      return
    end
    
    service = SitemapService.new
    service.generate_and_save
    
    render json: { 
      message: 'Sitemap regenerated successfully',
      url_count: service.url_count,
      generated_at: Time.current.iso8601
    }
  end
  
  private
  
  def should_serve_cached?
    # Serve cached version if:
    # 1. File exists
    # 2. File is less than 1 hour old (or configured time)
    # 3. Not in development mode
    
    sitemap_path = Rails.root.join('public', 'sitemap.xml')
    return false unless File.exist?(sitemap_path)
    
    # In development, always generate fresh
    return false if Rails.env.development?
    
    # Check if file is recent enough
    max_age = ENV['SITEMAP_CACHE_AGE']&.to_i || 3600 # 1 hour default
    file_age = Time.current - File.mtime(sitemap_path)
    
    file_age < max_age
  end
  
  def serve_cached_sitemap
    sitemap_path = Rails.root.join('public', 'sitemap.xml')
    
    if File.exist?(sitemap_path)
      send_file sitemap_path, 
                type: 'application/xml', 
                disposition: 'inline',
                last_modified: File.mtime(sitemap_path)
    else
      generate_fresh_sitemap
    end
  end
  
  def generate_fresh_sitemap
    service = SitemapService.new
    sitemap_xml = service.generate
    
    render xml: sitemap_xml, content_type: 'application/xml'
  end
end 