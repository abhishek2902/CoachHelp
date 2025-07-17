class Api::V1::CurrencyController < ApplicationController
  def detect_currency
    ip_address = get_client_ip
    user_currency = detect_user_currency
    
    # Get additional info for debugging
    country = CurrencyConversionService.send(:detect_country_from_ip, ip_address)
    
    render json: {
      currency: user_currency,
      symbol: CurrencyConversionService.get_currency_symbol(user_currency),
      detected_country: country,
      ip_address: ip_address,
      user_logged_in: current_user.present?,
      user_country: get_effective_country,
      accept_language: request.env['HTTP_ACCEPT_LANGUAGE']
    }
  end
  
  def convert_price
    price_in_inr = params[:price].to_f
    target_currency = params[:currency]&.upcase || 'USD'
    
    unless CurrencyConversionService.supported_currency?(target_currency)
      render json: { error: 'Unsupported currency' }, status: :bad_request
      return
    end
    
    converted_price = CurrencyConversionService.convert_price(price_in_inr, target_currency)
    
    render json: {
      original_price: price_in_inr,
      original_currency: 'INR',
      converted_price: converted_price,
      target_currency: target_currency,
      symbol: CurrencyConversionService.get_currency_symbol(target_currency)
    }
  end
  
  def get_exchange_rate
    from_currency = params[:from]&.upcase || 'INR'
    to_currency = params[:to]&.upcase || 'USD'
    
    unless CurrencyConversionService.supported_currency?(from_currency) && 
           CurrencyConversionService.supported_currency?(to_currency)
      render json: { error: 'Unsupported currency' }, status: :bad_request
      return
    end
    
    rate = CurrencyConversionService.get_exchange_rate(from_currency, to_currency)
    
    render json: {
      from_currency: from_currency,
      to_currency: to_currency,
      rate: rate
    }
  end

  private

  def get_client_ip
    # Log all relevant headers for debugging
    Rails.logger.info "IP detection: X-Forwarded-For=#{request.env['HTTP_X_FORWARDED_FOR']}, X-Real-IP=#{request.env['HTTP_X_REAL_IP']}, X-Client-IP=#{request.env['HTTP_X_CLIENT_IP']}, remote_ip=#{request.remote_ip}"
    # Try different headers to get the real IP address
    ip = request.env['HTTP_X_FORWARDED_FOR']&.split(',')&.first&.strip
    ip ||= request.env['HTTP_X_REAL_IP']
    ip ||= request.env['HTTP_X_CLIENT_IP']
    ip ||= request.remote_ip
    ip ||= '127.0.0.1' # fallback for localhost
    Rails.logger.info "Detected client IP: #{ip}"
    ip
  end

  def detect_user_currency
    # Try to get from user's country first (for logged-in users)
    if current_user&.country.present?
      country_to_currency = {
        'US' => 'USD',
        'CA' => 'CAD',
        'AU' => 'AUD',
        'GB' => 'GBP',
        'IN' => 'INR',
        'JP' => 'JPY'
      }
      
      currency = country_to_currency[current_user.country.upcase]
      return currency if currency.present?
    end
    
    # For non-logged-in users, use IP-based detection
    ip_address = get_client_ip
    
    # If it's localhost, try to detect from Accept-Language header
    if is_local_or_private_ip?(ip_address)
      return detect_currency_from_headers
    end
    
    CurrencyConversionService.detect_user_currency(ip_address)
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
    # Check Accept-Language header for better detection
    accept_language = request.env['HTTP_ACCEPT_LANGUAGE']
    
    if accept_language.present?
      # Check for Indian languages
      if accept_language.downcase.include?('hi') || # Hindi
         accept_language.downcase.include?('ta') || # Tamil
         accept_language.downcase.include?('te') || # Telugu
         accept_language.downcase.include?('bn') || # Bengali
         accept_language.downcase.include?('mr') || # Marathi
         accept_language.downcase.include?('gu') || # Gujarati
         accept_language.downcase.include?('kn') || # Kannada
         accept_language.downcase.include?('ml') || # Malayalam
         accept_language.downcase.include?('pa') || # Punjabi
         accept_language.downcase.include?('or') || # Odia
         accept_language.downcase.include?('as') || # Assamese
         accept_language.downcase.include?('en-in') # English (India)
        return 'INR'
      end
    end
    
    # Default to INR for localhost (assuming Indian developers)
    'INR'
  end

  def get_effective_country
    ip_country = CurrencyConversionService.send(:detect_country_from_ip, request.remote_ip)
    return ip_country if ip_country.present?
    current_user.country if current_user.respond_to?(:country)
  end
end 