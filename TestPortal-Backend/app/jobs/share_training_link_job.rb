class ShareTrainingLinkJob
  include Sidekiq::Worker

  def perform(candidate_email, candidate_name, training_code)
    training = Training.find_by!(code: training_code)
    link = TrainingLinkGeneratorService.new(training).generate_link

    SharedTrainingMailer.send_training_link(
      candidate_email,
      candidate_name,
      training,
      link
    ).deliver_now
  end
end
