class SharedTrainingMailer < ApplicationMailer
  default from: ENV['SMTP_USER_NAME'] || "no-reply@testportal.com"


  def send_training_link(candidate_email, candidate_name, training, link)
    @candidate_name = candidate_name
    @training = training
    @link = link

    mail(to: candidate_email, subject: "Your access link for the training: #{@training.title}")
  end
end
