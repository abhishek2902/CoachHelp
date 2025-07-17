class Invoice < ApplicationRecord
  validates :user_name, :user_email, presence: true
  
  belongs_to :subscription, optional: true
  belongs_to :token_transaction, optional: true
  belongs_to :user, optional: true

  delegate :plan, to: :subscription, allow_nil: true
  
  before_create :generate_invoice_number
  
  def plan_name
    if subscription.present?
      subscription.plan.name
    elsif token_transaction.present?
      "Token Purchase #{token_transaction.amount}"
    else
      "N/A"
    end
  end
  
  def plan_price
    if subscription.present?
      subscription.plan.price
    elsif token_transaction.present?
      amount
    else
      0
    end
  end
  
  def discounted_amount
    if discount.to_f > 0
      plan_price.to_f - (plan_price.to_f * discount.to_f / 100)
    else
      plan_price.to_f
    end
  end
  
  # def gst_amount
  #   (discounted_amount * 0.18).round(2)
  # end
  
  def total_with_gst
    if user&.country == "IN"
      (discounted_amount * 1.18).round(2)
    else
      discounted_amount.round(2)
    end
  end

  def display_currency
    currency.presence || 'INR'
  end

  def display_amount
    if currency != 'INR' && converted_total_amount.present?
      converted_total_amount
    else
      total_amount || amount
    end
  end

  def display_currency_symbol
    {
      'USD' => '$',
      'EUR' => '€',
      'GBP' => '£',
      'CAD' => 'C$',
      'AUD' => 'A$',
      'JPY' => '¥',
      'INR' => '₹'
    }[currency] || currency
  end

  def formatted_display_amount
    symbol = display_currency_symbol
    amount = display_amount
    
    case display_currency.upcase
    when 'JPY'
      "#{symbol}#{amount.to_i}"
    else
      "#{symbol}#{amount.to_f.round(2)}"
    end
  end

  def original_formatted_amount
    "₹#{original_amount.to_f.round(2)}"
  end

  def has_currency_conversion?
    currency != 'INR' && (converted_amount.present? || converted_total_amount.present?)
  end

  def exchange_rate_display
    return nil unless exchange_rate.present?
    "1 INR = #{exchange_rate.to_f.round(4)} #{currency}"
  end

  def converted_base_amount
    return base_amount if currency == 'INR' || exchange_rate.blank?
    (base_amount * exchange_rate).round(2)
  end

  def converted_discounted_amount
    return discounted_amount if currency == 'INR' || exchange_rate.blank?
    (discounted_amount * exchange_rate).round(2)
  end

  def converted_gst_amount
    return gst_amount if currency == 'INR' || exchange_rate.blank?
    (gst_amount * exchange_rate).round(2)
  end

  def converted_total_amount
    return total_amount if currency == 'INR' || exchange_rate.blank?
    (total_amount * exchange_rate).round(2)
  end
  
  private
  
  def generate_invoice_number
    timestamp = Time.now.strftime("%Y%m%d%H%M%S")
    random_code = SecureRandom.hex(3).upcase
    self.invoice_number = "INV-#{timestamp}-#{random_code}"
  end
end
