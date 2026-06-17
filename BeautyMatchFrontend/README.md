AI Beauty Frontend Application.
This is the frontend application for the "AI Beauty" final project, built with React.js. 
It connects directly to the project's backend API to provide a dynamic and interactive user experience.

Features
-User Authentication: Secure login connected to the backend API.

-Profile Management: Users can view and update their personal account settings.

-Dynamic Data Display: Fetches and presents data from the backend using reusable components and tables.

-Client-Side Routing: Seamless navigation using React Router.
Project Setup & Running Instructions
To run this project locally, follow these steps:

Install Dependencies:
Open your terminal in the project directory and run:

Bash
npm install
Start the Development Server:
Run the following command to start the application:

Bash
npm start
The application will be available at http://localhost:5173 .

API Configuration
Base URL: The frontend is configured to communicate with the backend at http://localhost:3000. Please ensure your backend server is running at this address.

Project Structure
-src/components/ - Reusable UI elements (e.g., Navbar, Footer, Tables, Cards).

-src/pages/ - Main views (Login, Dashboard, Settings).

-src/services/ - API integration logic (Axios).

-src/App.js - Main entry point and routing configuration.

