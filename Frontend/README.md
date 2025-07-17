# 🚀 TestPortal Frontend

Welcome to the **TestPortal Frontend** — a sleek, high-performance React application built with Vite and Tailwind CSS. This portal allows users to take tests, view results, and access a range of interactive features, all optimized for speed and scalability.

Live backend repo: [TestPortal Backend](https://github.com/Shadbox-Infosystem/TestPortal-Backend)

---

## 🖥️ Tech Stack & Why It's Used

| Technology             | Purpose |
|------------------------|---------|
| **React 19**           | Core library for building UI with reusable components. |
| **Tailwind CSS 4**     | Utility-first CSS framework for fast and responsive design. |
| **Vite**               | Lightning-fast dev server and bundler for React projects. |
| **Axios**              | HTTP client used to make API requests to the backend. |
| **Chart.js**           | For rendering charts and graphs to visualize test data. |
| **React Chart.js 2**   | React wrapper around Chart.js for seamless integration. |
| **Day.js & Date-fns**  | Lightweight date libraries for manipulating and formatting time values. |
| **Framer Motion**      | Animation library for React used for smooth UI transitions. |
| **Formik & Yup**       | For handling forms (`Formik`) and validating inputs (`Yup`). |
| **Headless UI**        | Unstyled, accessible UI components (e.g., modals, popovers). |
| **Lucide React**       | Icon library with beautiful, consistent vector icons. |
| **React Router 7**     | Client-side routing — used to handle navigation in the app. |

---


## 🛠️ Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Shadbox-Infosystem/TestPortal-Frontend.git
cd TestPortal-Frontend/frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Start the Development Server

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚙️ Available Scripts

| Script              | Description                          |
|---------------------|--------------------------------------|
| `npm run dev`       | Starts the development server        |
| `npm run build`     | Builds the app for production        |
| `npm run lint`      | Lints the code using ESLint          |
| `npm run preview`   | Previews the production build        |

To run any script, use:

```bash
npm run <script-name>
```

Example:

```bash
npm run build
```

---

## 📁 Project Structure

```bash
TestPortal-Frontend/frontend
├── public/             # Static assets
├── src/                # React source code
│   ├── components/     # Reusable components
│   ├── admin/          # Admin related components
│   ├── pages/          # Route-based components
│   ├── utils/          # Utility functions
│   ├── context/        # to pass data through the component tree without having to pass props down manually at every level.
│   └── ...
├── .eslintrc.cjs       # ESLint config
├── tailwind.config.js  # Tailwind config
├── vite.config.js      # Vite config
└── package.json
```

---

## 🧪 ESLint

To check for code quality and consistency:

```bash
npm run lint
```

---

## 🧊 Build for Production

```bash
npm run build
```

The output will be in the `dist/` folder. You can preview the production build using:

```bash
npm run preview
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

## 📃 License

This project is licensed under the [MIT License](LICENSE).
