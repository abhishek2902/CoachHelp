class TestLinkGeneratorService
  def initialize(test)
    @test = test
  end

  def generate_link
    "#{ENV['FRONTEND_URL']}/respondent-details/#{@test.slug}"
  end
end
