# config/initializers/razorpay.rb
Razorpay.setup(
  ENV['RAZORPAY_KEY_ID'],
  ENV['RAZORPAY_KEY_SECRET']
)
