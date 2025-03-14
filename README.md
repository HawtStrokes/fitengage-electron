# **FitEngage - Gym Management System**

FitEngage is a **desktop application** for managing gym memberships, payments, and users. It is built with **Electron, React (Vite), SQLite, and TailwindCSS**.

## **Features**
- **Dashboard** – View total members, overdue memberships, and revenue trends.
- **Member Management** – Add, update, and delete members.
- **Payments** – Track and manage payments.
- **Memberships** – Handle different membership types.
- **Admin Access Only** – Restricted login for admins.

## **Installation**
1. **Clone the Repository**
   ```sh
   git clone https://github.com/HawtStrokes/fitengnage.git
   cd fitengnage
   ```

2. **Install Dependencies**
   ```sh
   npm install
   ```
   Do this step for renderer as well.

3. **Start the Application**
   ```sh
   cd renderer/
   npm run build
   cd ..
   npm start
   ```

## **Project Structure**
```
fitengage/
│── database/              # Service files
│── renderer/              # React frontend
│   ├── src/
│   │   ├── pages/         # Pages (Dashboard, Members, Payments, Login)
│   │   ├── components/    # UI Components
│   │   ├── App.jsx        # Main React App
│   │   ├── main.jsx       # React entry point
│── main.js                # Electron main process
│── preload.js             # Secure API bridge for Electron
│── schema.sql             # Database schema
│── package.json           # Project configuration
│── .gitignore             # Ignored files
│── README.md              # Documentation
```

## **API Functions (Electron)**
| Function | Description |
|----------|------------|
| `api.getMembers()` | Fetches all members |
| `api.addMember(data)` | Adds a new member |
| `api.updateMember(data)` | Updates a member |
| `api.deleteMember(id)` | Deletes a member |
| `api.getPayments()` | Fetches payments |
| `api.addPayment(data)` | Adds a payment |
| `api.deletePayment(id)` | Deletes a payment |

## **Contributions & Support**
For issues or contributions, open an issue on [GitHub](https://github.com/HawtStrokes/fitengnage).
