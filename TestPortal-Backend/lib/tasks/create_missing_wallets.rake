namespace :users do
  desc "Create wallets with 100 tokens for existing users who don't have one"
  task create_missing_wallets: :environment do
    users_without_wallets = User.left_outer_joins(:user_wallet).where(user_wallets: { id: nil })
    
    puts "Found #{users_without_wallets.count} users without wallets"
    
    users_without_wallets.find_each do |user|
      begin
        user.create_wallet_with_tokens
        puts "Created wallet for user: #{user.email}"
      rescue => e
        puts "Failed to create wallet for user #{user.email}: #{e.message}"
      end
    end
    
    puts "Wallet creation completed!"
  end
end 