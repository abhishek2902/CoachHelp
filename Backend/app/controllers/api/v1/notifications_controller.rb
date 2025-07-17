class Api::V1::NotificationsController < ApplicationController
  before_action :authenticate_user!

  def index
    notifications = current_user.notifications.order(created_at: :desc)
                             .page(params[:page])
                             .per(params[:per_page] || 10)

    response.headers['X-Total-Count'] = notifications.total_count.to_s
    response.headers['X-Total-Pages'] = notifications.total_pages.to_s
    response.headers['X-Current-Page'] = notifications.current_page.to_s
    response.headers['X-Per-Page'] = notifications.limit_value.to_s

    render json: notifications
  end

  def unread_count
    count = current_user.notifications.where(read: [false,nil]).count
    render json: { unread_count: count }
  end

  def mark_as_read
    current_user.notifications.where(read: [false,nil]).update_all(read: true)
    head :no_content
  end

  def destroy
    notification = current_user.notifications.find(params[:id])
    notification.destroy
    head :no_content
  end

  def clear_all
    current_user.notifications.destroy_all
    render json: { message: "All notifications cleared successfully." }, status: :ok
  end
end
