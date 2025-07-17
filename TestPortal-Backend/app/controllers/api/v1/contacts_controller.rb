class Api::V1::ContactsController < ApplicationController

  def index
    @messages = ContactMessage.order(created_at: :desc).page(params[:page]).per(ENV.fetch("DEFAULT_DASHBOARD_PER_PAGE", 10).to_i)
    render json: {
      messages: @messages,
      current_page: @messages.current_page,
      total_pages: @messages.total_pages,
      total_count: @messages.total_count
    }, status: :ok
  end

  def create
    contact = ContactMessage.create!(contact_params)
    
    ContactMailer.with(contact_params).notify_admin().deliver_now
    
    render json: { message: 'Contact message sent' }, status: :ok
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  def resolve
    @message = ContactMessage.find(params[:id])
    @message.update(resolved: !@message.resolved)
    render json: { message: 'Message marked as resolved' }, status: :ok
  end

  def destroy
    @message = ContactMessage.find(params[:id])
    if @message.destroy
      render json: { message: 'Message deleted successfully' }, status: :ok
    else
      render json: { error: 'Error deleting message' }, status: :unprocessable_entity
    end
  end

  private

  def contact_params
    params.permit(:name, :email, :message, :mobile)
  end
end
