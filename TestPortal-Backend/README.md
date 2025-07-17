 📚 TestPortal Backend

TestPortal is an API-only application built with Ruby on Rails for creating, managing, and attempting online tests. This backend serves as the core for handling user authentication, test creation, test attempts, subscriptions, payments, and other management functionalities.

---

 📦 Tech Stack

- **Ruby**: 3.0.0  
- **Rails**: 7.1.5.1  
- **PostgreSQL**: Relational Database  
- **Puma**: Web Server  
- **Devise + Devise JWT**: User Authentication & Token-based Auth  
- **ActiveModelSerializers**: JSON API Serialization  
- **Razorpay**: Payment Integration  
- **Rack-CORS**: CORS Handling  
- **Dotenv**: Environment Variable Management  
- **Letter Opener**: Email preview in development  
- **Byebug**: Debugging tool

---

 📁 Setup Instructions

 📌 Prerequisites

- Ruby 3.0.0 installed
- PostgreSQL installed and running
- Bundler **2.4.6** installed (`gem install bundler -v 2.4.6`)

---

 📌 Installation

 1. #### Clone the Repository

 `git clone https://github.com/Shadbox-Infosystem/TestPortal-Backend`    

 `cd TestPortal-Backend`   

 2. #### Install dependencies:

 ```bundle install```

 3. #### Set up the database:

 ``` rails db:create ```

 ```rails db:migrate```

 4. #### Environment Variables

 Create a `.env` file in the root directory and set your environment variables:

 ``` RAZORPAY_KEY_ID=your_key_id```
 
 ``` RAZORPAY_KEY_SECRET=your_key_secret```
 
 ``` DEVISE_JWT_SECRET_KEY=your_jwt_secret```
 

 5. Start the Server
  
  ``` rails server```

