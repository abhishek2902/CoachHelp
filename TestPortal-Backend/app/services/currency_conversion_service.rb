class CurrencyConversionService
  include HTTParty
  
  # Base currency is INR
  BASE_CURRENCY = 'INR'
  
  # Cache duration in seconds (24 hours)
  CACHE_DURATION = 24.hours
  
  # Supported currencies
  SUPPORTED_CURRENCIES = %w[USD EUR GBP CAD AUD JPY INR]
  
  # Currency symbols
  CURRENCY_SYMBOLS = {
    'INR' => '₹',
    'USD' => '$',
    'EUR' => '€',
    'GBP' => '£',
    'CAD' => 'C$',
    'AUD' => 'A$',
    'JPY' => '¥'
  }
  
  class << self
    def get_exchange_rate(from_currency, to_currency)
      return 1.0 if from_currency == to_currency
      
      cache_key = "exchange_rate:#{from_currency}:#{to_currency}:#{Date.current.to_s}"
      
      # Try to get from cache first
      cached_rate = Rails.cache.read(cache_key)
      return cached_rate if cached_rate.present?
      
      # Fetch from API
      rate = fetch_exchange_rate(from_currency, to_currency)
      
      # Cache the result
      Rails.cache.write(cache_key, rate, expires_in: CACHE_DURATION) if rate.present?
      
      rate
    end
    
    def convert_price(price_in_inr, target_currency)
      return price_in_inr if target_currency == BASE_CURRENCY
      
      rate = get_exchange_rate(BASE_CURRENCY, target_currency)
      return price_in_inr unless rate.present?
      
      (price_in_inr * rate).round(2)
    end
    
    def get_currency_symbol(currency_code)
      CURRENCY_SYMBOLS[currency_code.upcase] || currency_code
    end
    
    def detect_user_currency(ip_address)
      # Try to get country from IP
      country = detect_country_from_ip(ip_address)
      
      # Map country to currency
      country_to_currency = {
        'US' => 'USD',
        'CA' => 'CAD',
        'AU' => 'AUD',
        'GB' => 'GBP',
        'IN' => 'INR',
        'JP' => 'JPY',
        'DE' => 'EUR',
        'FR' => 'EUR',
        'IT' => 'EUR',
        'ES' => 'EUR',
        'NL' => 'EUR',
        'BE' => 'EUR',
        'AT' => 'EUR',
        'IE' => 'EUR',
        'FI' => 'EUR',
        'PT' => 'EUR',
        'GR' => 'EUR',
        'LU' => 'EUR',
        'MT' => 'EUR',
        'CY' => 'EUR',
        'EE' => 'EUR',
        'LV' => 'EUR',
        'LT' => 'EUR',
        'SI' => 'EUR',
        'SK' => 'EUR'
      }
      
      # If we detected a country, use its currency
      if country && country_to_currency[country].present?
        return country_to_currency[country]
      end
      
      # For localhost/private IPs, try to detect from request headers
      if is_local_or_private_ip?(ip_address)
        return detect_currency_from_headers
      end
      
      # Default to USD for unknown countries
      'USD'
    end
    
    def supported_currency?(currency_code)
      SUPPORTED_CURRENCIES.include?(currency_code.upcase)
    end
    
    private
    
    def fetch_exchange_rate(from_currency, to_currency)
     
      begin
        # Using exchangerate-api.com (free tier)
        url = "https://api.exchangerate-api.com/v4/latest/#{from_currency}"
        response = HTTParty.get(url, timeout: 10)
        
        if response.success?
          data = JSON.parse(response.body)
          rates = data['rates']
          return rates[to_currency] if rates && rates[to_currency]
        end
        
        # Fallback to a simple conversion (you should replace this with a real API)
        fallback_rates = {
          'USD' => 0.012,  # 1 INR = 0.012 USD (approximately 83 INR = 1 USD)
          'EUR' => 0.011,  # 1 INR = 0.011 EUR (approximate)
          'GBP' => 0.0095, # 1 INR = 0.0095 GBP (approximate)
          'CAD' => 0.016,  # 1 INR = 0.016 CAD (approximate)
          'AUD' => 0.018,  # 1 INR = 0.018 AUD (approximate)
          'JPY' => 1.8     # 1 INR = 1.8 JPY (approximate)
        }
        
        fallback_rates[to_currency]
      rescue => e
        Rails.logger.error "Currency conversion error: #{e.message}"
        nil
      end
    end
    
    def detect_country_from_ip(ip_address)
      Rails.logger.info "detect+++IP #{ip_address}"

      return nil if ip_address.blank?
      
      # Skip localhost and private IP ranges
      return nil if ip_address == '127.0.0.1' || 
                   ip_address == 'localhost' ||
                   ip_address.start_with?('192.168.') ||
                   ip_address.start_with?('10.') ||
                   ip_address.start_with?('172.')
      
      begin
        redis_key = "user_country:ip:#{ip_address}"
        country = nil
        Sidekiq.redis { |conn| country = conn.get(redis_key) }
        if country.present?
          Rails.logger.info "Country for IP #{ip_address} found in Redis: #{country}"
          return country
        end
        # Use Geocoder to get country from IP
        result = Geocoder.search(ip_address).first
        if result&.country_code.present?
          Rails.logger.info "IP #{ip_address} detected as country: #{result.country_code} (caching in Redis)"
          Sidekiq.redis { |conn| conn.set(redis_key, result.country_code, ex: 24*60*60) }
          return result.country_code
        else
          Rails.logger.warn "Could not detect country for IP: #{ip_address}"
          return nil
        end
      rescue => e
        Rails.logger.error "IP geolocation error for #{ip_address}: #{e.message}"
        nil
      end
    end

    def is_local_or_private_ip?(ip_address)
      return true if ip_address.blank?
      
      ip_address == '127.0.0.1' || 
      ip_address == 'localhost' ||
      ip_address.start_with?('192.168.') ||
      ip_address.start_with?('10.') ||
      ip_address.start_with?('172.')
    end

    def detect_currency_from_headers
      'INR'
    end
  end
end 