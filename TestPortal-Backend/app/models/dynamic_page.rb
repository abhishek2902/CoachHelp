class DynamicPage < ApplicationRecord
  validates :title, presence: true
  validates :slug, presence: true, uniqueness: true
  validates :price, presence: true, if: :requires_price?
  validates :currency, presence: true, if: :requires_price?

  before_validation :generate_slug, on: :create
  before_validation :set_default_meta_fields, on: :create
  before_save :update_meta_fields_if_price_changed

  scope :active, -> { where(active: true) }

  private

  def generate_slug
    return if slug.present?
    
    base_slug = title.parameterize
    counter = 1
    new_slug = base_slug
    
    while DynamicPage.exists?(slug: new_slug)
      new_slug = "#{base_slug}-#{counter}"
      counter += 1
    end
    
    self.slug = new_slug
  end

  def set_default_meta_fields
    self.meta_description ||= generate_meta_description
    self.og_title ||= title
    self.og_description ||= generate_meta_description
    self.canonical_url ||= "https://talenttest.io/#{slug}"
    self.schema_data ||= generate_schema_data
  end

  def update_meta_fields_if_price_changed
    if price_changed? || currency_changed?
      self.meta_description = generate_meta_description
      self.og_description = generate_meta_description
      self.schema_data = generate_schema_data
    end
  end

  def generate_meta_description
    if price.present? && currency.present?
      currency_symbol = get_currency_symbol(currency)
      "Launch your own test portal website for under #{currency_symbol}#{price}. Fast, secure, and feature-rich. Get started with Talenttest.io today!"
    else
      title
    end
  end

  def generate_schema_data
    schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": title,
      "image": og_image.presence || "https://talenttest.io/assets/seo-test-portal.jpg",
      "description": generate_meta_description,
      "brand": {
        "@type": "Brand",
        "name": "Talenttest.io"
      }
    }

    if price.present? && currency.present?
      schema["offers"] = {
        "@type": "Offer",
        "priceCurrency": currency,
        "price": price,
        "availability": "https://schema.org/InStock",
        "url": canonical_url.presence || "https://talenttest.io/#{slug}"
      }
    end

    schema
  end

  def get_currency_symbol(currency_code)
    {
      'INR' => '₹',
      'USD' => '$',
      'EUR' => '€',
      'GBP' => '£'
    }[currency_code] || '₹'
  end

  def requires_price?
    # Add logic here if you want to make price required for certain pages
    true
  end
end 