class Admin::UsersController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!, except: :destroy_current
  
  def index
    users = User.includes(:subscriptions, :profile_picture_attachment, :profile_picture_blob)

    if params[:search].present?
      query = "%#{params[:search].downcase}%"
      users = users.where("LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ? OR LOWER(email) LIKE ?", query, query, query)
    end

    users = users.order(created_at: :desc)
               .page(params[:page])
               .per(ENV.fetch("CARD_DASHBOARD_PER_PAGE", 6).to_i)

    render json: {
      users: users.map { |user|
        user.as_json(include: :subscriptions).merge(profile_picture_url: user.profile_picture_url)
      },
      current_page: users.current_page,
      total_pages: users.total_pages,
      total_count: users.total_count
    }
  end

  def destroy_current
    if current_user
      current_user.destroy
      render json: { message: "Account deleted successfully" }, status: :ok
    else
      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end

  def destroy
    user = User.find(params[:id])
    if user.id == current_user.id
      render json: { error: "You cannot delete your own account through this action." }, status: :forbidden
    else
      user.destroy
      render json: { message: "User deleted successfully" }
    end
  end

  def update
    @user = User.find(params[:id])
    if @user.update(user_params)
      render json: @user
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def upload_profile_picture
    user = User.find(params[:id])
    if params[:profile_picture].present?
      user.profile_picture.attach(params[:profile_picture])
      render json: { profile_picture_url: url_for(user.profile_picture) }
    else
      render json: { error: "No image uploaded" }, status: :unprocessable_entity
    end
  end

  def create
    user = User.new(user_params)
    user.password = SecureRandom.hex(8)
    if user.save
      # Send admin notification for new user registration
      UserMailer.notify_admin_of_new_user(user).deliver_later
      render json: user, status: :created
    else
      render json: user.errors, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:first_name, :last_name, :email, :admin)
  end
end
