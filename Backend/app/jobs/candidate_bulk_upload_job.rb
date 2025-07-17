class CandidateBulkUploadJob
  include Sidekiq::Job

  def perform(test_id, candidates, sender_email)
    test = Test.find(test_id)
    link = TestLinkGeneratorService.new(test).generate_link

    candidates.each do |candidate|
      candidate_email = candidate['email'] || candidate[:email]
      candidate_name = candidate['name'] || candidate[:name]

      SharedTestMailer.send_test_link(
        candidate_email,
        candidate_name,
        test,
        link,
        sender_email
      ).deliver_now
    end
  end
end
