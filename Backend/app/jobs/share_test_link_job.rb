class ShareTestLinkJob
  include Sidekiq::Worker

  def perform(candidate_email, candidate_name, test_slug)
    test = Test.find_by!(slug: test_slug)
    link = TestLinkGeneratorService.new(test).generate_link

    SharedTestMailer.send_test_link(
      candidate_email,
      candidate_name,
      test,
      link
    ).deliver_now
  end
end
