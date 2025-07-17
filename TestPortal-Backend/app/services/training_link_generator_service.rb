class TrainingLinkGeneratorService
  def initialize(training)
    @training = training
  end

  def generate_link
    "#{ENV['FRONTEND_URL']}/enrolled-trainings?code=#{@training.code}"
  end
end
