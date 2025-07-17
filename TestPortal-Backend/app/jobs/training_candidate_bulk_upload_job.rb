class TrainingCandidateBulkUploadJob
  include Sidekiq::Job

  def perform(training_id, candidates, sender_email)
    training = Training.find(training_id)
    link = TrainingLinkGeneratorService.new(training).generate_link

    candidates.each do |candidate|
      candidate_email = candidate['email'] || candidate[:email]
      candidate_name = candidate['name'] || candidate[:name]

      begin
        SharedTrainingMailer.send_training_link(
          candidate_email,
          candidate_name,
          training,
          link,
        ).deliver_now
      rescue => e
        Rails.logger.error "Failed to send email to #{candidate_email}: #{e.message}"
      end
    end
  end
end
