class Api::V1::PlansController < ApplicationController
  before_action :authenticate_user!, only: :index_for_current_user

  def index
    plans = Plan.where(active: true)
    plans_with_currency = convert_plans_to_user_currency(plans)
    render json: plans_with_currency
  end

  def index_for_current_user
    if current_user.present? && current_user.free_plan_used?
      plans = Plan.where(active: true, is_one_time_use: false)
    else
      plans = Plan.where(active: true)
    end
    plans_with_currency = convert_plans_to_user_currency(plans)
    render json: plans_with_currency
  end

  def show
    plan = Plan.find(params[:id])
    plan_with_currency = convert_plan_to_user_currency(plan)
    render json: plan_with_currency
  end

  private

  def convert_plans_to_user_currency(plans)
    user_currency = detect_user_currency
    plans.map do |plan|
      convert_plan_to_user_currency(plan, user_currency)
    end
  end

  def convert_plan_to_user_currency(plan, user_currency = nil)
    user_currency ||= detect_user_currency
    plan_data = plan.as_json
    if user_currency != 'INR'
      converted_price = CurrencyConversionService.convert_price(plan.price, user_currency)
      plan_data['converted_price'] = converted_price
      plan_data['converted_currency'] = user_currency
      plan_data['converted_symbol'] = CurrencyConversionService.get_currency_symbol(user_currency)
    end
    plan_data['original_price'] = plan.price
    plan_data['original_currency'] = 'INR'
    plan_data['original_symbol'] = '₹'
    plan_data['user_currency'] = user_currency
    plan_data
  end

  def detect_user_currency
    # Use Redis-cached country if available
    effective_country = get_effective_country
    country_to_currency = {
      'US' => 'USD',
      'CA' => 'CAD',
      'AU' => 'AUD',
      'GB' => 'GBP',
      'IN' => 'INR',
      'JP' => 'JPY'
    }
    if effective_country.present?
      currency = country_to_currency[effective_country.upcase]
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

  def get_client_ip
    # Try different headers to get the real IP address
    # This handles cases where the app is behind a proxy/load balancer
    request.env['HTTP_X_FORWARDED_FOR']&.split(',')&.first ||
    request.env['HTTP_X_REAL_IP'] ||
    request.env['HTTP_X_CLIENT_IP'] ||
    request.remote_ip ||
    '127.0.0.1' # fallback for localhost
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
