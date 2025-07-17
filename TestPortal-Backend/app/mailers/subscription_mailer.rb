class SubscriptionMailer < ApplicationMailer
	default from: ENV['SMTP_USER_NAME']

	def subscription_success_email(user, plan, invoice, subscription)
	  @user = user
	  @plan = plan
	  @invoice = invoice
	  @subscription = subscription

		pdf_html = render_to_string(
		  template: "api/v1/invoices/show",
		  layout: "pdf", # or false
		  assigns: { invoice: @invoice }
		)
	  pdf = WickedPdf.new.pdf_from_string(pdf_html)

	  attachments["Invoice_#{@invoice.invoice_number}.pdf"] = {
	    mime_type: 'application/pdf',
	    content: pdf
	  }

	  mail(to: @user.email, subject: "Subscription Successful for #{plan.name}")
	end

	def notify_admin_of_subscription(user, plan, invoice, subscription)
		@user = user
		@plan = plan
		@invoice = invoice
		@subscription = subscription

		mail(to: ENV['SMTP_USER_NAME'], subject: "New Subscription Purchase - #{user.name}")
	end
end
