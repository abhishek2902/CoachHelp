# app/services/razorpay_service.rb
class RazorpayService
  def initialize(user, params)
    @user = user
    @params = params
  end

  def token_rate
    ENV.fetch('TOKEN_RATE', '1').to_f
  end

  def get_effective_country
    # Try Redis-cached country from IP first
    ip_country = CurrencyConversionService.send(:detect_country_from_ip, @params[:ip_address]) if @params[:ip_address].present?
    return ip_country if ip_country.present?
    # Fallback to user country
    @user.country if @user.respond_to?(:country)
  end

  def create_order
    plan_id = @params[:plan_id]
    tokens = @params[:tokens].to_i

    effective_country = get_effective_country
    Rails.logger.info "RazorpayService: effective_country=#{effective_country} for IP=#{@params[:ip_address]}"

    user_currency = detect_user_currency
    Rails.logger.info "RazorpayService: user_currency=#{user_currency} for IP=#{@params[:ip_address]}"

    is_indian = effective_country.present? && effective_country.to_s.upcase == 'IN'
    gst_rate = is_indian ? 0.18 : 0.0

    if plan_id.present?
      plan = Plan.find(plan_id)
      base_amount = plan.price.to_f
      
      # Apply promo code discount for plan purchases
      if @params[:promo_code_id].present?
        promo_code = PromoCode.find_by(id: @params[:promo_code_id])
        if promo_code&.usable? && !promo_code.expired?
          base_amount = base_amount - (base_amount * promo_code.discount.to_f / 100)
        end
      end
      
      amount_with_gst = (base_amount * (1 + gst_rate)).round(2)
    else
      base_amount = tokens * token_rate
      
      # Apply promo code discount for token purchases
      if @params[:promo_code_id].present?
        promo_code = PromoCode.find_by(id: @params[:promo_code_id])
        if promo_code&.usable? && !promo_code.expired?
          base_amount = base_amount - (base_amount * promo_code.discount.to_f / 100)
        end
      end
      
      amount_with_gst = (base_amount * (1 + gst_rate)).round(2)
    end

    supported_currencies = %w[INR USD EUR GBP CAD AUD JPY]
    order_currency = is_indian ? 'INR' : (supported_currencies.include?(user_currency) ? user_currency : 'USD')

    # Conversion
    display_amount = amount_with_gst
    exchange_rate = nil
    converted_base_amount = base_amount
    converted_gst = (base_amount * gst_rate).round(2)
    converted_discount = 0
    converted_subtotal = base_amount

    if order_currency != 'INR'
      display_amount = CurrencyConversionService.convert_price(amount_with_gst, order_currency)
      exchange_rate = CurrencyConversionService.get_exchange_rate('INR', order_currency)
      converted_base_amount = CurrencyConversionService.convert_price(base_amount, order_currency)
      converted_gst = 0 # No GST for non-INR
      converted_discount = CurrencyConversionService.convert_price(0, order_currency)
      converted_subtotal = converted_base_amount - converted_discount
    end

    amount_in_smallest_unit = (display_amount * 100).to_i

    razorpay_order = Razorpay::Order.create(
      amount: amount_in_smallest_unit,
      currency: order_currency,
      receipt: SecureRandom.hex(10),
      notes: {
        plan_id: plan_id,
        user_id: @user.id,
        promo_code_id: @params[:promo_code_id],
        tokens: tokens,
        user_currency: order_currency,
        display_currency: user_currency,
        converted_amount: display_amount,
        exchange_rate: exchange_rate
      }
    )

    {
      order_id: razorpay_order.id,
      amount: amount_in_smallest_unit,
      base_amount: base_amount,
      converted_base_amount: converted_base_amount,
      discount: 0, # or actual discount if applied
      converted_discount: converted_discount,
      subtotal: base_amount,
      converted_subtotal: converted_subtotal,
      gst: is_indian ? (base_amount * gst_rate).round(2) : 0,
      converted_gst: converted_gst,
      total: amount_with_gst,
      converted_amount: display_amount,
      exchange_rate: exchange_rate,
      user_currency: order_currency,
      currency_symbol: CurrencyConversionService.get_currency_symbol(order_currency),
      payment_currency: order_currency
    }
  rescue => e
    { error: e.message }
  end

  def verify_payment
    order_id = @params[:order_id] || @params[:razorpay_order_id]
    payment_id = @params[:payment_id] || @params[:razorpay_payment_id]
    signature = @params[:signature] || @params[:razorpay_signature]
    plan_id = @params[:plan_id]
    promo_code_id = @params[:promo_code_id]
    tokens = @params[:tokens].to_i

    unless valid_signature?(order_id, payment_id, signature)
      return { success: false, errors: "Payment Verification Failed" }
    end

    # Fetch the Razorpay order to get the actual currency used
    razorpay_order = Razorpay::Order.fetch(order_id)
    order_currency = razorpay_order.currency

    if tokens > 0
      handle_token_purchase(tokens, payment_id, order_id, order_currency)
      return { success: true, message: "Tokens purchased successfully!" }
    end

    if plan_id.present?
      user_referral = @user.referral
      if user_referral&.referred_by_code.present? && !user_referral.referral_rewarded
        referrer_referral = User.find_by(referral_code: user_referral.referred_by_code)
        if referrer_referral
          if Plan.find(plan_id).price >= ENV['MINIMUM_PLAN_PRICE'].to_i
                user_referral.update!(
                  referral_rewarded: true,
                  subscription_status: "rewarded",
                  cash_benefit: 20
                )
                UserMailer.referral_bonus_email(referrer_referral, 20).deliver_later
            else
              user_referral.update!(subscription_status: "no_reward")
          end
            user_referral.update!(referral_rewarded: true, subscription_status: "rewarded")
          end
        end
      handle_plan_purchase(plan_id, payment_id, order_id, promo_code_id, order_currency)
      return { success: true, message: "Payment Verified and Subscription Created!" }
    end

    { success: false, errors: "Invalid payment type" }
  end

  def process_webhook(payload, received_signature)
    secret = ENV['RAZORPAY_WEBHOOK_SECRET']
    calculated_signature = OpenSSL::HMAC.hexdigest('SHA256', secret, payload)
    return { status: :unauthorized } unless calculated_signature == received_signature

    event = JSON.parse(payload)
    if event["event"] == "payment.captured"
      payment_data = event["payload"]["payment"]["entity"]
      order_id = payment_data["order_id"]
      payment_id = payment_data["id"]
      notes = payment_data["notes"] || {}
      plan_id = notes["plan_id"]
      user_id = notes["user_id"]
      return { status: :bad_request } unless plan_id.present? && user_id.present?

      user = User.find_by(id: user_id)
      plan = Plan.find_by(id: plan_id)
      return { status: :not_found } unless user && plan

      subscription = Subscription.find_or_initialize_by(user: user)
      subscription.assign_attributes(
        plan: plan,
        status: 'active',
        start_date: Time.current,
        end_date: Time.current + plan.interval.to_i.days,
        payment_method: 'razorpay',
        external_payment_id: payment_id,
        order_id: order_id,
        cancel_at_period_end: false,
        tests_remaining: plan.tests_allowed
      )
      subscription.save!

      Notification.create!(
        user: user,
        message: "Your payment was successfully captured and your subscription is now active.",
        notifiable: subscription
      )

      admin_user = User.find_by(admin: true)
      if admin_user
        Notification.create!(
          user: admin_user,
          message: "#{user.first_name} has successfully subscribed to the #{subscription.plan.name} plan.",
          notifiable: subscription
        )
      end

      # Get currency info from notes
      user_currency = notes["user_currency"] || 'INR'
      converted_amount = notes["converted_amount"]
      exchange_rate = notes["exchange_rate"]
      gst_amount = user_currency == 'INR' ? (plan.price * 0.18).round(2) : 0
      total_amount = user_currency == 'INR' ? (plan.price + gst_amount).round(2) : plan.price

      # Calculate discount if promo code is present
      discount_percent = 0
      if notes["promo_code_id"].present?
        promo_code = PromoCode.find_by(id: notes["promo_code_id"])
        if promo_code&.usable? && !promo_code.expired?
          discount_percent = promo_code.discount.to_f
        end
      end
      discounted_amount = plan.price - (plan.price * discount_percent / 100)
      gst_amount = user_currency == 'INR' ? (discounted_amount * 0.18).round(2) : 0
      total_amount = user_currency == 'INR' ? (discounted_amount + gst_amount).round(2) : discounted_amount.round(2)

      Invoice.create!(
        subscription: subscription,
        amount: plan.price,
        payment_id: payment_id,
        status: 'paid',
        issued_at: Time.current,
        user_name: user.first_name,
        user_email: user.email,
        user_phone: user.mobile_number,
        currency: user_currency,
        converted_amount: converted_amount,
        exchange_rate: exchange_rate,
        original_currency: 'INR',
        original_amount: plan.price,
        discount: discount_percent,
        base_amount: plan.price,
        discounted_amount: discounted_amount,
        gst_amount: gst_amount,
        total_amount: total_amount
      )

      { status: :ok, success: true, message: "Payment Verified and Subscription Created!" }
    else
      { status: :unprocessable_entity, success: false, errors: "Payment Verification Failed" }
    end
  end

  private

  def valid_signature?(order_id, payment_id, signature)
    generated_signature = OpenSSL::HMAC.hexdigest(
      "SHA256",
      ENV['RAZORPAY_KEY_SECRET'],
      "#{order_id}|#{payment_id}"
    )
    generated_signature == signature
  end

  def detect_user_currency
    # Try Redis-cached country from IP first
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
    # Fallback to USD for international users
    'USD'
  end

  def handle_token_purchase(tokens, payment_id, order_id, order_currency = 'INR')
    wallet = UserWallet.find_or_create_by(user: @user)
    wallet.token_balance ||= 0
    wallet.token_balance += tokens
    wallet.save!

    tx = TokenTransaction.create!(
      user: @user,
      amount: tokens,
      source: 'purchase',
      meta: { payment_id: payment_id }
    )

    # Calculate all amounts
    base_amount = tokens * token_rate
    discount_percent = 0
    if @params[:promo_code_id].present?
      promo_code = PromoCode.find_by(id: @params[:promo_code_id])
      if promo_code&.usable? && !promo_code.expired?
        discount_percent = promo_code.discount.to_f
      end
    end
    discounted_amount = base_amount - (base_amount * discount_percent / 100)
    gst_amount = order_currency == 'INR' ? (discounted_amount * 0.18).round(2) : 0
    total_amount = order_currency == 'INR' ? (discounted_amount + gst_amount).round(2) : discounted_amount.round(2)

    # Get currency info
    user_currency = detect_user_currency
    converted_amount = nil
    exchange_rate = nil
    if order_currency != 'INR'
      converted_amount = CurrencyConversionService.convert_price(total_amount, order_currency)
      exchange_rate = CurrencyConversionService.get_exchange_rate('INR', order_currency)
    end

    invoice = Invoice.create!(
      token_transaction: tx,
      amount: base_amount,
      payment_id: payment_id,
      status: 'paid',
      issued_at: Time.current,
      user_name: @user.first_name,
      user_email: @user.email,
      user_phone: @user.mobile_number,
      user_id: @user.id,
      discount: discount_percent,
      base_amount: base_amount,
      discounted_amount: discounted_amount,
      gst_amount: gst_amount,
      total_amount: total_amount,
      currency: order_currency,
      converted_amount: converted_amount,
      exchange_rate: exchange_rate,
      original_currency: 'INR',
      original_amount: base_amount
    )

    UserMailer.purchase_success_email(@user, tokens, invoice).deliver_now
    UserMailer.notify_admin_of_purchase(@user, tokens, invoice).deliver_now
  end

  def handle_plan_purchase(plan_id, payment_id, order_id, promo_code_id = nil, order_currency = 'INR')
    plan = Plan.find(plan_id)
    promo_code = PromoCode.find_by(id: promo_code_id) if promo_code_id.present?
    base_amount = plan.price.to_f
    discount_percent = promo_code&.discount.to_f || 0
    discounted_amount = base_amount - (base_amount * discount_percent / 100)
    gst_amount = order_currency == 'INR' ? (discounted_amount * 0.18).round(2) : 0
    total_amount = order_currency == 'INR' ? (discounted_amount + gst_amount).round(2) : discounted_amount.round(2)

    subscription = Subscription.create!(
      user: @user,
      plan: plan,
      status: 'active',
      start_date: Time.current,
      end_date: Time.current + plan.interval.to_i.days,
      payment_method: 'razorpay',
      external_payment_id: payment_id,
      order_id: order_id,
      cancel_at_period_end: false,
      tests_remaining: plan.tests_allowed
    )

    # Get currency info
    user_currency = detect_user_currency
    converted_amount = nil
    exchange_rate = nil
    if order_currency != 'INR'
      converted_amount = CurrencyConversionService.convert_price(total_amount, order_currency)
      exchange_rate = CurrencyConversionService.get_exchange_rate('INR', order_currency)
    end

    invoice = Invoice.create!(
      subscription: subscription,
      amount: base_amount,
      discount: discount_percent,
      payment_id: payment_id,
      status: 'paid',
      issued_at: Time.current,
      user_name: @user.first_name,
      user_email: @user.email,
      user_phone: @user.mobile_number,
      base_amount: base_amount,
      discounted_amount: discounted_amount,
      gst_amount: gst_amount,
      total_amount: total_amount,
      currency: order_currency,
      converted_amount: converted_amount,
      exchange_rate: exchange_rate,
      original_currency: 'INR',
      original_amount: base_amount
    )

    Notification.create!(
      user: @user,
      message: "Your payment was successfully verified and your subscription to the #{plan.name} plan is now active.",
      notifiable: subscription
    )

    admin_user = User.find_by(admin: true)
    if admin_user
      Notification.create!(
        user: admin_user,
        message: "#{@user.first_name} has subscribed to the #{plan.name} plan via Razorpay.",
        notifiable: subscription
        )
    end

    @user.update(free_plan_used: true) if plan.is_one_time_use && !@user.free_plan_used
    SubscriptionMailerJob.perform_later("subscription_success", @user.id, plan.id, invoice.id)
    SubscriptionMailerJob.perform_later("notify_admin", @user.id, plan.id, invoice.id)
  end
end
