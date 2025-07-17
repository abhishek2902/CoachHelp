namespace :data_migration do
  desc "Assign users to organizations based on their company"
  task assign_users_to_organizations: :environment do
    puts "Starting user-organization assignment..."

    User.where.not(company: [nil, '']).find_each do |user|
      org = Organization.find_or_create_by!(name: user.company)
      user.update!(organization_id: org.id)
    end

    if User.where(company: [nil, '']).exists?
      org = Organization.find_or_create_by!(name: "N/A")
      User.where(company: [nil, '']).find_each do |user|
        user.update!(organization_id: org.id)
      end
    end

    puts "User-organization assignment complete."
  end
end
