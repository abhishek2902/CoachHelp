class MasterQuestionCloneService
  def initialize(category_id = nil, user)
    @user = user
    if category_id
      @category = Category.friendly.find(category_id)
      # Collect all master questions from this category and all descendants
      @master_questions = @category.all_descendant_master_questions
    end
  end

  def clone_to_test
    ActiveRecord::Base.transaction do
      test = Test.create!(
        title: @category.name,
        description: "Cloned test from #{@category.name}",
        user: @user,
        test_type: "mock",
        total_marks: @master_questions.count,
        duration: 30 # TODO: Make dynamic if needed
      )

      section = test.sections.create!(
        name: @category.name,
        duration: 30 # TODO: Make dynamic if needed
      )

      @master_questions.each do |mq|
        section.questions.create!(
          test_id: test.id,
          content: mq.content,
          marks: mq.marks,
          question_type: mq.question_type,
          correct_answer: mq.correct_answer,
          option_1: mq.option_1,
          option_2: mq.option_2,
          option_3: mq.option_3,
          option_4: mq.option_4
        )
      end

      test
    end
  end

  def clone_to_existing_test(test, category_id)
    category = Category.friendly.find(category_id)
    # Collect all master questions from this category and all descendants
    master_questions = category.all_descendant_master_questions
    section = test.sections.create!(
      name: category.name,
      duration: 30 # TODO: Make dynamic if needed
    )
    master_questions.each do |mq|
      section.questions.create!(
        test_id: test.id,
        content: mq.content,
        marks: mq.marks,
        question_type: mq.question_type,
        correct_answer: mq.correct_answer,
        option_1: mq.option_1,
        option_2: mq.option_2,
        option_3: mq.option_3,
        option_4: mq.option_4
      )
    end
    section
  end
end 
