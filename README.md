# BeautyMatch – Full Stack Application

A skincare e-commerce platform with personalized AI-powered product recommendations, real-time order notifications for staff, and a full admin/warehouse management interface.

**Stack:** React (CRA) · Node.js + Express · MySQL · Sequelize ORM · Socket.IO · Groq AI

---

## 🎯 Project Purpose

BeautyMatch helps customers find the right skincare products through a guided quiz that is sent to an AI model, which returns a personalized morning/evening routine based on the live product catalog stored in MySQL.

Three user roles are supported:
* **Customer** – browses catalog, takes the AI quiz, places orders.
* **Logistics (warehouse)** – sees incoming orders in real time, updates status, marks orders as delivered.
* **Admin** – manages products, users, orders and access requests.

---

## 📂 Project Structure

```text
BeautyMatch-Final/
├── BeautyMachBackend/
│   ├── src/
│   │   ├── server.js               # Express + Socket.IO entry point
│   │   ├── config/
│   │   │   └── database.js         # Sequelize connection
│   │   ├── controllers/            # Route handlers
│   │   ├── routes/                 # Express routers
│   │   ├── middleware/             # Auth, errorHandler, logger
│   │   ├── services/               # aiService (Groq), aiPrompts
│   │   ├── sockets/                # Socket.IO event handlers
│   │   ├── seeders/
│   │   │   └── seed.js             # Sample data
│   │   ├── utils/
│   │   │   └── response.js         # Unified API response shape
│   │   └── models/                 # Sequelize models + associations
│   ├── migrations/                 # Raw SQL schema
│   ├── .env.example
│   └── package.json
│
└── BeautyMatchFrontend/
    └── client/                     # Create-React-App
        ├── src/
        │   ├── pages/
        │   ├── components/
        │   ├── context/
        │   └── services/           # api.js, socket.js
        ├── .env.example
        └── package.json
