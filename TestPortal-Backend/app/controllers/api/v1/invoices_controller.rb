class Api::V1::InvoicesController < ApplicationController
	before_action :authenticate_user!
	include ActionController::MimeResponds

	def index
		per_page = ENV.fetch("DEFAULT_DASHBOARD_PER_PAGE", 10).to_i
	  page = params[:page] || 1

	  if current_user.admin?
	    invoices = Invoice.order(created_at: :desc).page(page).per(per_page)
	  else
	    invoices = Invoice
	      .left_outer_joins(:subscription, :token_transaction)
	      .where("subscriptions.user_id = :user_id OR token_transactions.user_id = :user_id", user_id: current_user.id)
	      .order(created_at: :desc)
	      .distinct
	      .page(page).per(per_page)
	  end

	  render json: {
	    invoices: invoices.map do |inv|
	      inv.as_json.merge({
	        base_amount: inv.base_amount,
	        discounted_amount: inv.discounted_amount,
	        gst_amount: inv.gst_amount,
	        total_amount: inv.total_amount,
	        discount_percent: inv.discount
	      })
	    end,
	    current_page: invoices.current_page,
	    total_pages: invoices.total_pages,
	    total_count: invoices.total_count
	  }
	end

	def show
		@invoice = Invoice.find_by(id: params[:id])

		if @invoice.subscription.present?
			@invoice.subscription.user
		elsif @invoice.token_transaction.present?
			@invoice.token_transaction.user
		else
			nil
		end

		if request.format.pdf?
			pdf_html = ActionController::Base.new.render_to_string(template: 'api/v1/invoices/show', 
				layout: 'pdf', assigns: { invoice: @invoice })
			pdf = WickedPdf.new.pdf_from_string(pdf_html)

			send_data pdf,
			filename: "Invoice_#{@invoice.invoice_number}.pdf",
			type: 'application/pdf',
			disposition: 'attachment'
		else
			render json: @invoice.as_json.merge({
				base_amount: @invoice.base_amount,
				discounted_amount: @invoice.discounted_amount,
				gst_amount: @invoice.gst_amount,
				total_amount: @invoice.total_amount,
				discount_percent: @invoice.discount,
				converted_total_amount: @invoice.converted_total_amount
			})
		end
	end
end
