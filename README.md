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
        
⚙️ Installation
Prerequisites
-Node.js 18+
-MySQL 8+
-A Groq API key (free at console.groq.com)
1. Install dependencies:
cd BeautyMachBackend && npm install
cd ../BeautyMatchFrontend/client && npm install

2. Database setup:
mysql -u root -p -e "CREATE DATABASE beauty_match;"
mysql -u root -p beauty_match < BeautyMachBackend/migrations/001-initial-schema.sql
On first server start, sequelize.sync() will also ensure all tables/columns exist.
Optional – seed sample products and admin:
cd BeautyMachBackend && node src/seeders/seed.js

3. Environment variables
Backend
Copy BeautyMachBackend/.env.example to BeautyMachBackend/.env and fill in:
Variable,Description
PORT,Backend port (default 3000)
CLIENT_URL,Frontend URL for CORS (http://localhost:5173)
DB_HOST,MySQL host (localhost)
DB_PORT,MySQL port (3306)
DB_NAME,Database name (beauty_match)
DB_USER,MySQL username (root)
DB_PASSWORD,MySQL password
JWT_SECRET,Any long random string
GROQ_API_KEY,Your Groq API key
GROQ_MODEL,Model name (default llama-3.3-70b-versatile)

Frontend
Copy BeautyMatchFrontend/client/.env.example to .env:
Variable,Description
REACT_APP_API_URL,http://localhost:3000/api
REACT_APP_SOCKET_URL,http://localhost:3000

4. Run the application
Terminal 1 (Backend):
cd BeautyMachBackend && npm start
Terminal 2 (Frontend):
cd BeautyMatchFrontend/client && npm start
-Frontend: http://localhost:5173
-Backend: http://localhost:3000

🗄️ ORM Setup (Sequelize)
Models live in BeautyMachBackend/models/ and are wired in models/index.js.
Model,File,Notes
User,User.js,customer / logistics
Admin,Admin.js,separate auth table
Product,Product.js,main project resource
Order,Order.js,belongs to User
OrderItem,OrderItem.js,junction between Order and Product

Relationships
-One-to-Many: User → Orders, Order → OrderItems, Product → OrderItems
-Many-to-Many: User ↔ Product through OrderItem
-All data persists in MySQL across server restarts.

🚀 API Endpoints
All responses follow the unified format:
{ "success": true, "data": {}, "error": null }
{ "success": false, "data": null, "error": { "code": "...", "message": "...", "details": {} } }

Users /api/users
Method,Path,Description
POST,/register,Register a new customer
POST,/login,Customer login (JWT)
GET,/,List users
GET,/:id,Get user
GET,/:id/orders,User + orders + items + products (JOIN)
PUT,/:id,Update user
DELETE,/:id,Delete user

Admins /api/admins
-POST /login, POST /, GET /, DELETE /:id

Products /api/products
-Full CRUD: GET /, GET /:id, POST /, PUT /:id, DELETE /:id

Orders /api/orders
-GET /, GET /:id, POST /, PATCH /:id/status, PATCH /:id/deliver, DELETE /:id

AI /api/ai
-POST /quiz-recommendations – body: { skinType, concern, freeText? }

Settings / Health
-Settings: GET /api/settings, PUT /api/settings
Health: GET /api/health
A full Postman collection is included in BeautyMatch.postman_collection.json.

WebSocket Feature (Real-Time Updates):

-Using Socket.IO, the application facilitates live data streams across clients:
-When a customer successfully places an order, a custom order:new event is emitted.
-All active staff room members (Logistics and Admin accounts) receive an instantaneous, reactive notification and UI card injection on their dashboards without a manual page reload.

Custom Events:
Event,Direction,Payload
user:online,client → server,"{ userId, role } – joins room"
order:new,server → staff,full order object on creation
order:statusUpdate,server → user + staff,"{ orderId, status }"
order:delivered,server → staff,{ orderId }
notification:read,client → staff,"{ count, at }"

-Rooms: staff (admin + logistics), user:{id} (per customer).
-Test it: Open two tabs (customer + admin) and place an order — the admin bell updates instantly.

🤖 AI Feature (Groq)
Endpoint: POST /api/ai/quiz-recommendations

Flow:
1-Frontend QuizPage collects skin type, main concern and optional free text.
2-Backend loads the full product catalog from MySQL.
3-aiService.js calls Groq (llama-3.3-70b-versatile) with the catalog embedded in the prompt and asks for a personalized morning/evening routine.
4-The response is enriched with full product objects and returned to the client.
5-The API key lives only in the backend .env (GROQ_API_KEY) and is never exposed to the browser.


  
⚠️ Known Limitations
No automated tests yet.
-AI calls are not cached – every quiz submission hits Groq.
-File uploads for product images are not implemented; images are referenced by URL.
-Payment integration in checkout is mocked.
