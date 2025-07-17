class SharedTestMailer < ApplicationMailer
  default from: ENV['SMTP_USER_NAME']

  def send_test_link(candidate_email, candidate_name, test, link)
    @candidate_name = candidate_name
    @test = test
    @link = link

    mail( to: candidate_email, subject: "Your access link for the test: #{@test.title}")
  end
end
