class TestAttemptMailer < ApplicationMailer
  def send_otp(test_attempt, otp)
    @test_attempt = test_attempt
    @otp = otp
    @test = test_attempt.test

    mail(
      to: @test_attempt.email,
      subject: "Your OTP for #{@test.title} test"
    )
  end

  def response_sheet_email(test_attempt)
    @test_attempt = test_attempt
    frontend_url = ENV['FRONTEND_URL']
    @url = "#{frontend_url}/response/#{@test_attempt.guest_token}"

    mail(
      to: @test_attempt.email,
      subject: "Your Response Sheet for #{@test_attempt.test.title}"
    )
  end
end 