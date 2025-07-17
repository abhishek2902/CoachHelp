# Dynamic Sitemap System

This system generates dynamic sitemaps for your TestPortal application, combining React frontend public pages with database-driven dynamic pages.

## Architecture

- **React Frontend**: Handles public pages (homepage, pricing, about, etc.)
- **Ruby Backend**: Captures dynamic pages from database (DynamicPage, Test, Plan, etc.)

## Features

- ✅ Dynamic sitemap generation from database content
- ✅ React public pages integration
- ✅ Automatic robots.txt updates
- ✅ Sitemap caching and performance optimization
- ✅ Search engine submission support
- ✅ Comprehensive rake tasks
- ✅ Real-time sitemap serving via controller
- ✅ Configurable settings

## Quick Start

### 1. Generate Sitemap

```bash
# Generate complete sitemap (React pages + Database content)
rails sitemap:generate

# Generate only React public pages
rails sitemap:react_pages

# Generate only database dynamic pages
rails sitemap:db_pages

# Generate complete sitemap with cleanup and submission
rails sitemap
```

### 2. View Statistics

```bash
# Show sitemap statistics
rails sitemap:stats
```

### 3. Clean Up

```bash
# Clean up old sitemap files
rails sitemap:cleanup
```

## Available Rake Tasks

| Task | Description |
|------|-------------|
| `sitemap:generate` | Generate complete sitemap with React pages and database content |
| `sitemap:react_pages` | Generate sitemap with only React public pages |
| `sitemap:db_pages` | Generate sitemap with only database dynamic pages |
| `sitemap:generate_index` | Generate sitemap index file |
| `sitemap:cleanup` | Clean up old sitemap files |
| `sitemap:submit` | Submit sitemap to search engines |
| `sitemap:stats` | Show sitemap statistics |
| `sitemap` | Run complete sitemap workflow |

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Frontend application URL
FRONTEND_APP_URL=https://talenttest.io

# Sitemap cache age (in seconds, default: 3600)
SITEMAP_CACHE_AGE=3600

# Search engine API keys (optional)
GOOGLE_SEARCH_CONSOLE_API_KEY=your_google_api_key
BING_WEBMASTER_API_KEY=your_bing_api_key
```

### Customizing React Pages

Edit `config/initializers/sitemap_config.rb` to modify React public pages:

```ruby
SitemapConfig[:react_pages][:high_priority] = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/pricing', priority: '0.9', changefreq: 'weekly' },
  # Add your custom pages here
]
```

### Customizing Database Models

Edit `config/initializers/sitemap_config.rb` to modify database model inclusion:

```ruby
SitemapConfig[:database_models][:your_model] = {
  model: 'YourModel',
  scope: 'active', # optional scope
  url_pattern: '/your-pattern/:slug',
  priority: '0.7',
  changefreq: 'weekly'
}
```

## Database Models Included

The system automatically includes these database models:

1. **DynamicPage** - Active dynamic pages with slugs
2. **Test** - Published tests that are accessible
3. **Plan** - All pricing plans
4. **Faq** - All FAQ entries
5. **Help** - All help articles
6. **Review** - Public reviews (show_in_public: true)
7. **Organization** - All organizations

## React Public Pages Included

The system includes these React frontend pages:

### High Priority (0.9-1.0)
- Homepage (`/`) - Daily updates
- Pricing (`/pricing`) - Weekly updates
- Test Portal Under 2000 INR (`/test-portal-under-2000-inr`) - Weekly updates

### Medium Priority (0.8)
- About (`/about`) - Monthly updates
- Solutions pages (`/solutions/*`) - Monthly updates
- Signup (`/signup`) - Monthly updates

### Lower Priority (0.6-0.7)
- Contact (`/contact`) - Monthly updates
- Help (`/help`) - Monthly updates
- FAQ (`/faq`) - Monthly updates
- Login (`/login`) - Monthly updates

### Legal Pages (0.3-0.5)
- Terms (`/terms`) - Yearly updates
- Privacy (`/privacy`) - Yearly updates
- Cookie Preferences (`/cookie-preferences`) - Yearly updates

## API Endpoints

### Sitemap Access

- **GET** `/sitemap.xml` - Main sitemap
- **GET** `/sitemap_index.xml` - Sitemap index
- **POST** `/sitemap/regenerate` - Force regenerate sitemap (admin only)

### Example Usage

```bash
# Access sitemap
curl https://yourdomain.com/sitemap.xml

# Force regenerate (requires admin authentication)
curl -X POST https://yourdomain.com/sitemap/regenerate \
  -H "Authorization: Bearer your_admin_token"
```

## File Structure

```
TestPortal-Backend/
├── app/
│   ├── controllers/
│   │   └── sitemap_controller.rb          # Sitemap controller
│   └── services/
│       ├── sitemap_service.rb             # Main sitemap service
│       └── react_sitemap_service.rb       # React pages service
├── config/
│   ├── initializers/
│   │   └── sitemap_config.rb              # Configuration
│   └── routes.rb                          # Routes (updated)
├── lib/
│   └── tasks/
│       └── sitemap.rake                   # Rake tasks
├── public/
│   ├── sitemap.xml                        # Generated sitemap
│   ├── sitemap_index.xml                  # Sitemap index
│   └── robots.txt                         # Updated robots.txt
└── SMITEMAP_README.md                     # This file
```

## Performance Considerations

### Large Sites

For sites with many pages (>50,000 URLs):

1. **Use sitemap index**: Automatically generated for large sites
2. **Batch processing**: Configured to process 1000 records at a time
3. **Memory limits**: Set to 512MB by default
4. **Caching**: Sitemaps are cached for 1 hour by default

### Customization

Edit `config/initializers/sitemap_config.rb`:

```ruby
SitemapConfig[:performance][:batch_size] = 500    # Smaller batches
SitemapConfig[:performance][:memory_limit] = 256.megabytes  # Less memory
SitemapConfig[:performance][:timeout] = 600       # Longer timeout
```

## Search Engine Submission

### Google Search Console

1. Get your API key from Google Search Console
2. Add to environment: `GOOGLE_SEARCH_CONSOLE_API_KEY=your_key`
3. Run: `rails sitemap:submit`

### Bing Webmaster Tools

1. Get your API key from Bing Webmaster Tools
2. Add to environment: `BING_WEBMASTER_API_KEY=your_key`
3. Run: `rails sitemap:submit`

## Monitoring

### Check Sitemap Health

```bash
# View statistics
rails sitemap:stats

# Check file size
ls -lh public/sitemap.xml

# Validate XML
xmllint --noout public/sitemap.xml
```

### Logs

Sitemap generation logs are output to console. For production, check your Rails logs:

```bash
tail -f log/production.log | grep sitemap
```

## Troubleshooting

### Common Issues

1. **Permission denied**: Ensure write permissions to `public/` directory
2. **Memory issues**: Reduce batch size in configuration
3. **Timeout**: Increase timeout in configuration
4. **Missing models**: Ensure all referenced models exist

### Debug Mode

```bash
# Run with verbose output
RAILS_ENV=development rails sitemap:generate

# Check specific components
rails sitemap:react_pages
rails sitemap:db_pages
```

## Contributing

To add new models or pages:

1. Update `config/initializers/sitemap_config.rb`
2. Add corresponding methods to `SitemapService`
3. Update this README
4. Test with `rails sitemap:stats`

## License

This sitemap system is part of the TestPortal application. 