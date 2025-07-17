#!/bin/bash

set -e

cd /var/www/TestPortal-Backend

# Pull the latest changes from the staging branch
git pull origin staging

# Load RVM into the shell session
source /etc/profile.d/rvm.sh

# Use the specified Ruby version (change if your app uses a different version)
rvm use 3.0.0 --default


# Install project dependencies, excluding development and test groups
bundle install #--without development test --jobs 4 --retry 3

# Run database migrations and precompile assets
rails db:migrate RAILS_ENV=production

#rails assets:precompile RAILS_ENV=production

# Set correct permissions for all files
#sudo chown -R www-data:www-data /var/www//var/www/TestPortal-Backend

# Restart redis
sudo systemctl restart redis

#restart sidekiq
sudo systemctl restart sidekiq

# Restart Apache to apply changes
sudo systemctl restart apache2
sudo service apache2 restart

# Print a completion message
echo "Deployment complete!"
