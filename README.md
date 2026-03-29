# 🧠 Tumor Detection System (Full-Stack AI Web App)

An advanced **AI-powered Tumor Detection Web Application** that allows users to upload medical images and receive instant predictions using a trained Machine Learning model.

> 🚀 Evolved from a basic ML model into a complete **full-stack application** with backend API and interactive frontend.

---

## ✨ Features

* 📤 Upload medical images (MRI/CT scans)
* 🤖 AI-based tumor prediction
* ⚡ Fast backend using API architecture
* 🎨 Modern, responsive frontend UI
* 🔄 Real-time prediction results
* 🧩 Modular and scalable project structure

---

## 🛠️ Tech Stack

### 🔹 Frontend

* React.js
* Framer Motion (animations)
* Axios

### 🔹 Backend

* FastAPI
* Uvicorn

### 🔹 Machine Learning

* TensorFlow / PyTorch / Scikit-learn *(based on your model)*
* NumPy
* Pillow

---

## 📁 Project Structure

```
tumor-detection/
│
├── backend/        # FastAPI server
├── frontend/       # React application
├── model/          # ML model & prediction logic
├── assets/         # Images / screenshots
└── README.md
```

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally 👇

---

### 🔹 1. Clone Repository

```
git clone https://github.com/meet1984/Tumor-Detection.git
cd Tumor-Detection
```

---

### 🔹 2. Backend Setup (FastAPI)

```
cd backend
python -m venv venv
```

#### ▶ Activate Virtual Environment

* Windows:

```
venv\Scripts\activate
```

#### ▶ Install Dependencies

```
pip install -r requirements.txt
```

#### ▶ Run Backend Server

```
uvicorn main:app --reload
```

👉 Backend runs at:

```
http://127.0.0.1:8000
```

👉 API Docs:

```
http://127.0.0.1:8000/docs
```

---

### 🔹 3. Frontend Setup (React)

Open a new terminal:

```
cd frontend
npm install
npm start
```

👉 Frontend runs at:

```
http://localhost:3000
```

---

## 🧪 How It Works

1. User uploads an image via frontend
2. Image is sent to backend API
3. Backend processes image using ML model
4. Prediction is returned and displayed

---

## 📸 Screenshots

> Add your UI screenshots in `/assets` and link here

---

## 🚀 Future Improvements

* 🌐 Deploy on cloud (Render / Vercel)
* 🔐 User authentication system
* 📊 Confidence score visualization
* 🧠 Improve model accuracy with more data
* 📱 Mobile responsiveness improvements

---

## 📌 Project Journey

This project started as a **basic tumor detection ML model** and was later transformed into a **complete full-stack application**, demonstrating:

* Backend API development
* Frontend integration
* Real-world AI deployment

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork and improve.

---

## 📬 Contact

If you liked this project or want to collaborate, feel free to connect 🚀

---

⭐ Don’t forget to star the repo if you found it useful!
