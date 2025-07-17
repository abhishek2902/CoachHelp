# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end


# AdminUser.destroy_all
# AdminUser.create!(
#   email: "admin1@testportal.com",
#   password: "123456"
# )
# puts "✅ AdminUser seeded successfully!"
# # User.create!(
# #   email: "admin2@testportal.com",
# #   password: "123456",
# #   admin: "true"
# # )
Category.destroy_all
  require_relative './categories_seeds'
# # Create new plans
# Plan.create!([
#   {
#     name: "Standard Plan",
#     price: 199.00,
#     interval: "yearly",
#     description: "Perfect for individuals or small groups starting out. This plan allows up to 50 students to attempt tests.",
#     features: "- Access for up to 50 students\n- Basic support\n- Limited reports\n- Valid for 1 year",
#     tests_allowed: 50,
#     currency: "INR",
#     active: true
#   },
#   {
#     name: "Pro Plan",
#     price: 499.00,
#     interval: "yearly",
#     description: "Ideal for active users and teams. This plan supports up to 200 students attempting tests, with priority support.",
#     features: "- Access for up to 200 students\n- Priority support\n- Detailed analytics\n- Valid for 1 year",
#     tests_allowed: 200,
#     currency: "INR",
#     active: true
#   },
#   {
#     name: "Enterprise Plan",
#     price: 999.00,
#     interval: "yearly",
#     description: "Designed for large institutions or heavy users, with full access.This plan supports up to 1000 students attempting tests, with priority support.",
#     features: "- Access for up to 1000 students\n- Dedicated support\n- Custom reporting\n- Valid for 1 year",
#     tests_allowed: 1000,
#     currency: "INR",
#     active: true
#   }
# ])

# puts "✅ Plans seeded successfully!"

# # db/seeds.rb

# require 'activerecord-import'  # ensure the gem is loaded

# # Currencies with approximate rates
# currencies = [
#   { "name": "India", "currency": "INR", "symbol": "₹", "rate": 1 },
#   { "name": "United States", "currency": "USD", "symbol": "$", "rate": 0.0120 },
#   { "name": "United Kingdom", "currency": "GBP", "symbol": "£", "rate": 0.0094 },
#   { "name": "Eurozone", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Japan", "currency": "JPY", "symbol": "¥", "rate": 1.91 },
#   { "name": "Canada", "currency": "CAD", "symbol": "$", "rate": 0.0164 },
#   { "name": "Australia", "currency": "AUD", "symbol": "A$", "rate": 0.0180 },
#   { "name": "United Arab Emirates", "currency": "AED", "symbol": "د.إ", "rate": 0.0441 },
#   { "name": "Singapore", "currency": "SGD", "symbol": "S$", "rate": 0.0162 },
#   { "name": "Switzerland", "currency": "CHF", "symbol": "CHF", "rate": 0.0107 },
#   { "name": "South Korea", "currency": "KRW", "symbol": "₩", "rate": 16.65 },
#   { "name": "Brazil", "currency": "BRL", "symbol": "R$", "rate": 0.0652 },
#   { "name": "South Africa", "currency": "ZAR", "symbol": "R", "rate": 0.216 },
#   { "name": "Afghanistan", "currency": "AFN", "symbol": "؋", "rate": 0.84 },
#   { "name": "Albania", "currency": "ALL", "symbol": "L", "rate": 1.12 },
#   { "name": "Algeria", "currency": "DZD", "symbol": "د.ج", "rate": 1.61 },
#   { "name": "Angola", "currency": "AOA", "symbol": "Kz", "rate": 10.15 },
#   { "name": "Argentina", "currency": "ARS", "symbol": "$", "rate": 10.90 },
#   { "name": "Armenia", "currency": "AMD", "symbol": "֏", "rate": 4.65 },
#   { "name": "Aruba", "currency": "AWG", "symbol": "ƒ", "rate": 0.0216 },
#   { "name": "Austria", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Azerbaijan", "currency": "AZN", "symbol": "₼", "rate": 0.0204 },
#   { "name": "Bahamas", "currency": "BSD", "symbol": "$", "rate": 0.0120 },
#   { "name": "Bahrain", "currency": "BHD", "symbol": ".د.ب", "rate": 0.0045 },
#   { "name": "Bangladesh", "currency": "BDT", "symbol": "৳", "rate": 1.41 },
#   { "name": "Barbados", "currency": "BBD", "symbol": "$", "rate": 0.024 },
#   { "name": "Belarus", "currency": "BYN", "symbol": "Br", "rate": 0.039 },
#   { "name": "Belgium", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Belize", "currency": "BZD", "symbol": "BZ$", "rate": 0.024 },
#   { "name": "Benin", "currency": "XOF", "symbol": "CFA", "rate": 7.34 },
#   { "name": "Bermuda", "currency": "BMD", "symbol": "$", "rate": 0.0120 },
#   { "name": "Bhutan", "currency": "BTN", "symbol": "Nu.", "rate": 1.00 },
#   { "name": "Bolivia", "currency": "BOB", "symbol": "Bs.", "rate": 0.083 },
#   { "name": "Bosnia and Herzegovina", "currency": "BAM", "symbol": "KM", "rate": 0.0219 },
#   { "name": "Botswana", "currency": "BWP", "symbol": "P", "rate": 0.168 },
#   { "name": "Brunei", "currency": "BND", "symbol": "$", "rate": 0.0162 },
#   { "name": "Bulgaria", "currency": "BGN", "symbol": "лв", "rate": 0.0219 },
#   { "name": "Burkina Faso", "currency": "XOF", "symbol": "CFA", "rate": 7.34 },
#   { "name": "Burundi", "currency": "BIF", "symbol": "FBu", "rate": 34.43 },
#   { "name": "Cabo Verde", "currency": "CVE", "symbol": "$", "rate": 1.24 },
#   { "name": "Cambodia", "currency": "KHR", "symbol": "៛", "rate": 49.11 },
#   { "name": "Cameroon", "currency": "XAF", "symbol": "FCFA", "rate": 7.34 },
#   { "name": "Cayman Islands", "currency": "KYD", "symbol": "$", "rate": 0.0100 },
#   { "name": "Central African Republic", "currency": "XAF", "symbol": "FCFA", "rate": 7.34 },
#   { "name": "Chad", "currency": "XAF", "symbol": "FCFA", "rate": 7.34 },
#   { "name": "Chile", "currency": "CLP", "symbol": "$", "rate": 11.23 },
#   { "name": "China", "currency": "CNY", "symbol": "¥", "rate": 0.087 },
#   { "name": "Colombia", "currency": "COP", "symbol": "$", "rate": 49.37 },
#   { "name": "Comoros", "currency": "KMF", "symbol": "CF", "rate": 5.51 },
#   { "name": "Congo, Democratic Republic of the", "currency": "CDF", "symbol": "FC", "rate": 33.48 },
#   { "name": "Congo, Republic of the", "currency": "XAF", "symbol": "FCFA", "rate": 7.34 },
#   { "name": "Costa Rica", "currency": "CRC", "symbol": "₡", "rate": 6.26 },
#   { "name": "Côte d'Ivoire", "currency": "XOF", "symbol": "CFA", "rate": 7.34 },
#   { "name": "Croatia", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Cuba", "currency": "CUP", "symbol": "₱", "rate": 0.31 },
#   { "name": "Cyprus", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Czechia", "currency": "CZK", "symbol": "Kč", "rate": 0.279 },
#   { "name": "Denmark", "currency": "DKK", "symbol": "kr", "rate": 0.0835 },
#   { "name": "Djibouti", "currency": "DJF", "symbol": "Fdj", "rate": 2.13 },
#   { "name": "Dominican Republic", "currency": "DOP", "symbol": "RD$", "rate": 0.70 },
#   { "name": "Egypt", "currency": "EGP", "symbol": "£", "rate": 0.57 },
#   { "name": "El Salvador", "currency": "USD", "symbol": "$", "rate": 0.0120 },
#   { "name": "Equatorial Guinea", "currency": "XAF", "symbol": "FCFA", "rate": 7.34 },
#   { "name": "Eritrea", "currency": "ERN", "symbol": "Nfk", "rate": 0.18 },
#   { "name": "Estonia", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Eswatini", "currency": "SZL", "symbol": "L", "rate": 0.224 },
#   { "name": "Ethiopia", "currency": "ETB", "symbol": "Br", "rate": 0.69 },
#   { "name": "Fiji", "currency": "FJD", "symbol": "$", "rate": 0.0268 },
#   { "name": "Finland", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "France", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Gabon", "currency": "XAF", "symbol": "FCFA", "rate": 7.34 },
#   { "name": "Gambia", "currency": "GMD", "symbol": "D", "rate": 0.81 },
#   { "name": "Georgia", "currency": "GEL", "symbol": "₾", "rate": 0.0337 },
#   { "name": "Germany", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Ghana", "currency": "GHS", "symbol": "₵", "rate": 0.18 },
#   { "name": "Greece", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Guatemala", "currency": "GTQ", "symbol": "Q", "rate": 0.093 },
#   { "name": "Guinea", "currency": "GNF", "symbol": "FG", "rate": 103.06 },
#   { "name": "Guyana", "currency": "GYD", "symbol": "$", "rate": 2.51 },
#   { "name": "Haiti", "currency": "HTG", "symbol": "G", "rate": 1.59 },
#   { "name": "Honduras", "currency": "HNL", "symbol": "L", "rate": 0.296 },
#   { "name": "Hong Kong", "currency": "HKD", "symbol": "$", "rate": 0.0937 },
#   { "name": "Hungary", "currency": "HUF", "symbol": "Ft", "rate": 4.41 },
#   { "name": "Iceland", "currency": "ISK", "symbol": "kr", "rate": 1.67 },
#   { "name": "Indonesia", "currency": "IDR", "symbol": "Rp", "rate": 196.85 },
#   { "name": "Iran", "currency": "IRR", "symbol": "﷼", "rate": 504.00 },
#   { "name": "Iraq", "currency": "IQD", "symbol": "ع.د", "rate": 15.72 },
#   { "name": "Ireland", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Israel", "currency": "ILS", "symbol": "₪", "rate": 0.0445 },
#   { "name": "Italy", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Jamaica", "currency": "JMD", "symbol": "J$", "rate": 1.86 },
#   { "name": "Jordan", "currency": "JOD", "symbol": "JD", "rate": 0.0085 },
#   { "name": "Kazakhstan", "currency": "KZT", "symbol": "₸", "rate": 5.55 },
#   { "name": "Kenya", "currency": "KES", "symbol": "KSh", "rate": 1.55 },
#   { "name": "Kuwait", "currency": "KWD", "symbol": "د.ك", "rate": 0.0037 },
#   { "name": "Kyrgyzstan", "currency": "KGS", "symbol": "с", "rate": 1.04 },
#   { "name": "Laos", "currency": "LAK", "symbol": "₭", "rate": 261.26 },
#   { "name": "Latvia", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Lebanon", "currency": "LBP", "symbol": "£", "rate": 1079.55 },
#   { "name": "Lesotho", "currency": "LSL", "symbol": "L", "rate": 0.224 },
#   { "name": "Liberia", "currency": "LRD", "symbol": "$", "rate": 2.32 },
#   { "name": "Libya", "currency": "LYD", "symbol": "ل.د", "rate": 0.058 },
#   { "name": "Liechtenstein", "currency": "CHF", "symbol": "CHF", "rate": 0.0107 },
#   { "name": "Lithuania", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Luxembourg", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Macao", "currency": "MOP", "symbol": "P", "rate": 0.0968 },
#   { "name": "Madagascar", "currency": "MGA", "symbol": "Ar", "rate": 54.10 },
#   { "name": "Malawi", "currency": "MWK", "symbol": "MK", "rate": 20.84 },
#   { "name": "Malaysia", "currency": "MYR", "symbol": "RM", "rate": 0.0565 },
#   { "name": "Maldives", "currency": "MVR", "symbol": "Rf", "rate": 0.185 },
#   { "name": "Mali", "currency": "XOF", "symbol": "CFA", "rate": 7.34 },
#   { "name": "Malta", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Mauritania", "currency": "MRU", "symbol": "UM", "rate": 0.47 },
#   { "name": "Mauritius", "currency": "MUR", "symbol": "₨", "rate": 0.559 },
#   { "name": "Mexico", "currency": "MXN", "symbol": "$", "rate": 0.218 },
#   { "name": "Moldova", "currency": "MDL", "symbol": "L", "rate": 0.213 },
#   { "name": "Monaco", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Mongolia", "currency": "MNT", "symbol": "₮", "rate": 40.80 },
#   { "name": "Montenegro", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Morocco", "currency": "MAD", "symbol": "د.م.", "rate": 0.120 },
#   { "name": "Mozambique", "currency": "MZN", "symbol": "MT", "rate": 0.77 },
#   { "name": "Myanmar", "currency": "MMK", "symbol": "K", "rate": 25.19 },
#   { "name": "Namibia", "currency": "NAD", "symbol": "$", "rate": 0.224 },
#   { "name": "Nepal", "currency": "NPR", "symbol": "₨", "rate": 1.60 },
#   { "name": "Netherlands", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "New Zealand", "currency": "NZD", "symbol": "$", "rate": 0.0196 },
#   { "name": "Nicaragua", "currency": "NIO", "symbol": "C$", "rate": 0.44 },
#   { "name": "Niger", "currency": "XOF", "symbol": "CFA", "rate": 7.34 },
#   { "name": "Nigeria", "currency": "NGN", "symbol": "₦", "rate": 17.80 },
#   { "name": "North Macedonia", "currency": "MKD", "symbol": "ден", "rate": 0.68 },
#   { "name": "Norway", "currency": "NOK", "symbol": "kr", "rate": 0.127 },
#   { "name": "Oman", "currency": "OMR", "symbol": "﷼", "rate": 0.0046 },
#   { "name": "Pakistan", "currency": "PKR", "symbol": "₨", "rate": 3.34 },
#   { "name": "Panama", "currency": "PAB", "symbol": "B/.", "rate": 0.0120 },
#   { "name": "Papua New Guinea", "currency": "PGK", "symbol": "K", "rate": 0.046 },
#   { "name": "Paraguay", "currency": "PYG", "symbol": "₲", "rate": 90.18 },
#   { "name": "Peru", "currency": "PEN", "symbol": "S/.", "rate": 0.045 },
#   { "name": "Philippines", "currency": "PHP", "symbol": "₱", "rate": 0.705 },
#   { "name": "Poland", "currency": "PLN", "symbol": "zł", "rate": 0.0483 },
#   { "name": "Portugal", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Qatar", "currency": "QAR", "symbol": "﷼", "rate": 0.0437 },
#   { "name": "Romania", "currency": "RON", "symbol": "lei", "rate": 0.0556 },
#   { "name": "Russia", "currency": "RUB", "symbol": "₽", "rate": 1.05 },
#   { "name": "Rwanda", "currency": "RWF", "symbol": "FRw", "rate": 15.69 },
#   { "name": "Samoa", "currency": "WST", "symbol": "T", "rate": 0.032 },
#   { "name": "San Marino", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Sao Tome and Principe", "currency": "STN", "symbol": "Db", "rate": 0.27 },
#   { "name": "Saudi Arabia", "currency": "SAR", "symbol": "﷼", "rate": 0.0450 },
#   { "name": "Senegal", "currency": "XOF", "symbol": "CFA", "rate": 7.34 },
#   { "name": "Serbia", "currency": "RSD", "symbol": "дин.", "rate": 1.31 },
#   { "name": "Seychelles", "currency": "SCR", "symbol": "₨", "rate": 0.16 },
#   { "name": "Sierra Leone", "currency": "SLL", "symbol": "Le", "rate": 263.16 },
#   { "name": "Slovakia", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Slovenia", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Solomon Islands", "currency": "SBD", "symbol": "$", "rate": 0.10 },
#   { "name": "Somalia", "currency": "SOS", "symbol": "S", "rate": 6.84 },
#   { "name": "South Sudan", "currency": "SSP", "symbol": "£", "rate": 18.06 },
#   { "name": "Spain", "currency": "EUR", "symbol": "€", "rate": 0.0112 },
#   { "name": "Sri Lanka", "currency": "LKR", "symbol": "Rs", "rate": 3.66 },
#   { "name": "Sudan", "currency": "SDG", "symbol": "ج.س.", "rate": 7.20 },
#   { "name": "Suriname", "currency": "SRD", "symbol": "$", "rate": 0.42 },
#   { "name": "Sweden", "currency": "SEK", "symbol": "kr", "rate": 0.126 },
#   { "name": "Syria", "currency": "SYP", "symbol": "£", "rate": 30.12 },
#   { "name": "Taiwan", "currency": "TWD", "symbol": "NT$", "rate": 0.387 },
#   { "name": "Tanzania", "currency": "TZS", "symbol": "TSh", "rate": 31.20 },
#   { "name": "Thailand", "currency": "THB", "symbol": "฿", "rate": 0.440 },
#   { "name": "Timor-Leste", "currency": "USD", "symbol": "$", "rate": 0.0120 },
#   { "name": "Togo", "currency": "XOF", "symbol": "CFA", "rate": 7.34 },
#   { "name": "Tonga", "currency": "TOP", "symbol": "T$", "rate": 0.028 },
#   { "name": "Trinidad and Tobago", "currency": "TTD", "symbol": "TT$", "rate": 0.081 },
#   { "name": "Tunisia", "currency": "TND", "symbol": "د.ت", "rate": 0.037 },
#   { "name": "Turkey", "currency": "TRY", "symbol": "₺", "rate": 0.395 },
#   { "name": "Turkmenistan", "currency": "TMT", "symbol": "m", "rate": 0.042 },
#   { "name": "Tuvalu", "currency": "AUD", "symbol": "$", "rate": 0.0180 },
#   { "name": "Uganda", "currency": "UGX", "symbol": "USh", "rate": 44.82 },
#   { "name": "Ukraine", "currency": "UAH", "symbol": "₴", "rate": 0.485 },
#   { "name": "Uruguay", "currency": "UYU", "symbol": "$U", "rate": 0.47 },
#   { "name": "Uzbekistan", "currency": "UZS", "symbol": "лв", "rate": 152.05 },
#   { "name": "Vanuatu", "currency": "VUV", "symbol": "VT", "rate": 1.50 },
#   { "name": "Venezuela", "currency": "VES", "symbol": "Bs.", "rate": 437632.53 },
#   { "name": "Vietnam", "currency": "VND", "symbol": "₫", "rate": 305.66 },
#   { "name": "Yemen", "currency": "YER", "symbol": "﷼", "rate": 3.00 },
#   { "name": "Zambia", "currency": "ZMW", "symbol": "ZK", "rate": 0.306 },
#   { "name": "Zimbabwe", "currency": "ZWL", "symbol": "$", "rate": 3.87 }
# ]

# keywords = [
#   "test portal under %{symbol}%{converted_price} in %{country}",
#   "online exam system under %{symbol}%{converted_price} in %{country}",
#   "affordable quiz platform %{symbol}%{converted_price} in %{country}",
#   "start your own test website under %{symbol}%{converted_price} in %{country}",
#   "launch test series portal under %{symbol}%{converted_price} in %{country}"
# ]

# batch_size = 500
# total_pages = 0

# (500..20000).step(500).each do |inr_price|
#   pages_batch = []

#   currencies.each do |country|
#     converted_price = (inr_price * country[:rate]).round(0)

#     keywords.each do |template|
#       keyword = template % {
#         symbol: country[:symbol],
#         converted_price: converted_price,
#         country: country[:name]
#       }

#       slug = keyword.parameterize
#       full_url = "https://talenttest.io/#{slug}"

#       pages_batch << DynamicPage.new(
#         title: keyword.capitalize,
#         slug: slug,
#         content: "#{keyword.capitalize}. Best in class online exam builder with AI support.",
#         meta_description: "#{keyword.capitalize} using Talenttest.io. Fast, secure, AI-powered test creation for coaching, colleges, and educators.",
#         og_title: keyword.capitalize,
#         og_description: "Build your own test portal under #{country[:symbol]}#{converted_price} in #{country[:name]} using Talenttest.io. AI-powered test creation platform.",
#         og_image: "https://talenttest.io/assets/seo-test-portal.jpg",
#         canonical_url: full_url,
#         price: converted_price.to_s,
#         currency: country[:currency],
#         active: true,
#         schema_data: {
#           "@context" => "https://schema.org/",
#           "@type" => "Product",
#           "name" => keyword,
#           "image" => "https://talenttest.io/assets/seo-test-portal.jpg",
#           "description" => "Build your own online exam/test portal under #{country[:symbol]}#{converted_price} in #{country[:name]}. No coding required. Launch in minutes.",
#           "brand" => {
#             "@type" => "Brand",
#             "name" => "Talenttest.io"
#           },
#           "offers" => {
#             "@type" => "Offer",
#             "priceCurrency" => country[:currency],
#             "price" => converted_price.to_s,
#             "availability" => "https://schema.org/InStock",
#             "url" => full_url
#           }
#         }
#       )
#     end
#   end

#   # Import in batch
#   DynamicPage.import pages_batch, batch_size: batch_size
#   total_pages += pages_batch.size

#   puts "✅ Imported #{pages_batch.size} pages for INR price ₹#{inr_price}..."
# end

# puts "🎉 All done! Total pages inserted: #{total_pages}"

# plan_4 = Plan.find(4)
# plan_5 = Plan.find(5)
# plan_6 = Plan.find(6)

# plan_4.update(
#   name: "Standard Plan",
#   price: 199.00,
#   interval: "yearly",
#   description: "Perfect for individuals or small groups starting out. This plan allows up to 50 students to attempt tests.",
#   features: "- Access for up to 50 students\n- Basic support\n- Limited reports\n- Valid for 1 year",
#   tests_allowed: 50,
#   currency: "INR",
#   active: true
# )

# plan_5.update(
#   name: "Pro Plan",
#   price: 499.00,
#   interval: "yearly",
#   description: "Ideal for active users and teams. This plan supports up to 200 students attempting tests, with priority support.",
#   features: "- Access for up to 200 students\n- Priority support\n- Detailed analytics\n- Valid for 1 year",
#   tests_allowed: 200,
#   currency: "INR",
#   active: true
# )

# plan_6.update(
#   name: "Enterprise Plan",
#   price: 999.00,
#   interval: "yearly",
#   description: "Designed for large institutions or heavy users, with full access.This plan supports up to 1000 students attempting tests, with priority support.",
#   features: "- Access for up to 1000 students\n- Dedicated support\n- Custom reporting\n- Valid for 1 year",
#   tests_allowed: 1000,
#   currency: "INR",
#   active: true
# )
