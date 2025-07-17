class SubscriptionMailerJob < ApplicationJob
  queue_as :mailers

  def perform(mail_type, user_id, plan_id, invoice_id)
    user = User.find(user_id)
    plan = Plan.find(plan_id)
    invoice = Invoice.find(invoice_id)
    subscription = invoice.subscription

    case mail_type
    when "subscription_success"
      SubscriptionMailer.subscription_success_email(user, plan, invoice, subscription).deliver_later

    when "notify_admin"
      SubscriptionMailer.notify_admin_of_subscription(user, plan, invoice, subscription).deliver_later
    end
  end
end
