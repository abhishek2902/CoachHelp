class Users::ConfirmationsController < Devise::ConfirmationsController
  def show
    self.resource = resource_class.confirm_by_token(params[:confirmation_token])
    if resource.errors.empty?
      redirect_to "#{ENV['FRONTEND_URL']}/login", allow_other_host: true
    else
      redirect_to "#{ENV['FRONTEND_URL']}/signup", allow_other_host: true
    end
  end
end
