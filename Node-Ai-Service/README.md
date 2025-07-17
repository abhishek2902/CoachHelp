# 🤖 FAQ AI Microservice

Welcome to the **FAQ AI Microservice** — a fast, lightweight Node.js service built with Express that uses **Cohere AI** to answer user queries based on your platform’s FAQs. Designed to work independently of the main Rails backend, it ensures modularity, flexibility, and AI-driven support.

Live Backend Repo: [TestPortal Backend](https://github.com/Shadbox-Infosystem/TestPortal-faq-node-js-ai-services)

---

## 💡 Why a Separate Microservice?

| Reason               | Benefit                                                                 |
|----------------------|-------------------------------------------------------------------------|
| 🧩 **Modular Design**  | Keeps AI logic out of core app logic                                     |
| ⚡ **Faster**          | Doesn’t block the Rails app during AI/embedding processing              |
| 🔁 **Independent**     | Restart/update this service anytime without affecting other systems     |
| 🧠 **AI-Ready**        | Easily upgrade to use OpenAI, Mistral, etc., in the future              |
| 🔧 **Scalable**        | Deploy this service separately depending on traffic and usage needs     |

---

## 🧠 Features

- Loads FAQ data from your Rails API and embeds questions using Cohere.
- Uses **cosine similarity** to match user questions with the best-fit FAQs.
- Uses **LLM prompts** to generate natural-language answers.
- Returns only confident, relevant answers based on your FAQ.
- Stateless and restart-safe.

---

## 🛠️ Tech Stack & Purpose

| Dependency           | Use Case                                                                 |
|----------------------|--------------------------------------------------------------------------|
| **Express**          | Backend web framework                                                    |
| **Axios**            | To fetch FAQs from the Rails API                                         |
| **Cohere AI SDK**    | Generate embeddings + answer queries                                     |
| **Cosine-Similarity**| Find the closest matching question using vector similarity               |
| **Morgan**           | Logging incoming requests for debug                                      |
| **CORS**             | Allow requests from frontend apps                                        |
| **Dotenv**           | Load API keys and config safely from `.env` file                         |

### `package.json` Snapshot

```json
{
  "name": "faq-ai-service",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "axios": "^1.9.0",
    "cohere-ai": "^7.17.1",
    "cors": "^2.8.5",
    "cosine-similarity": "^1.0.1",
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "morgan": "^1.10.0"
  }
}
```

## 🛠️ Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Shadbox-Infosystem/TestPortal-faq-node-js-ai-services.git
cd TestPortal-faq-node-js-ai-services
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
COHERE_API_KEY=your-cohere-api-key
RAILS_API_URL=https://your-backend.com/api/faqs
```

> ✅ **Note**: Never commit `.env` to version control.

### 4. Start the Development Server

```bash
node index.js
```
Server will run on http://localhost:4000
---

## 🧪 Testing the Endpoint
POST /faq-chat

curl -X POST http://localhost:4000/faq-chat \
  -H "Content-Type: application/json" \
  -d '{"question": "How can I update my email address?"}'

Response:
{
  "answer": "To update your email, go to your profile settings and click 'Edit Email'."
}

---

## 📁 Project Structure

```bash
faq-ai-service/
├── index.js        # Entry point (Express app)
├── .env            # Environment variables
├── package.json    # Project metadata & dependencies
└── README.md       # This file
```

---

## 🚀 Deployment (Ubuntu Production)

1. Install Node.js + PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```
2. Clone & Run the Project

```bash
git clone https://github.com/Shadbox-Infosystem/TestPortal-faq-node-js-ai-services.git /var/www/faq-ai-service
cd /var/www/TestPortal-faq-node-js-ai-services
npm install

cat <<EOF > .env
COHERE_API_KEY=your-cohere-key
RAILS_API_URL=https://your-backend.com/api/faqs
EOF

pm2 start index.js --name faq-ai
pm2 startup
pm2 save
```
---


## 🙌 Contributing

1. Fork this repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add some feature"
```

4. Push to the branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## 💡 Author

Made with ❤️ by **Shadbox Infosystem**

---

