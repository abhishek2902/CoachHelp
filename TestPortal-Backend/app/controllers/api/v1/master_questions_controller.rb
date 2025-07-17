class Api::V1::MasterQuestionsController < ApplicationController
	before_action :authenticate_user!
	before_action :set_category, only: [:index, :create]

	def index
		questions = @category.master_questions
		render json: questions
	end

	def create
		master_question = @category.master_questions.build(master_question_params)

		if master_question.save
			render json: master_question, status: :created
		else
			render json: { errors: master_question.errors.full_messages }, status: :unprocessable_entity
		end
	end

	private

	def set_category
		@category = Category.friendly.find(params[:category_id] || params[:id])
	rescue ActiveRecord::RecordNotFound
		render json: { error: "Category not found" }, status: :not_found
	end

	def master_question_params
		params.require(:master_question).permit(
			:content, :code_snippet, :option_1, :option_2, :option_3, :option_4,
			:correct_answer, :language, :question_type, :marks
		)
	end
end