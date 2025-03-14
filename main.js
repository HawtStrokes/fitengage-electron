const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const authService = require("./database/authService");
const gymService = require("./database/gymService");
const userService = require("./database/userService");

let mainWindow;

app.whenReady().then(() => {
  console.log("Electron app is ready.");

  const indexPath = path.resolve(__dirname, "renderer/dist/index.html");
  console.log(`Attempting to load: file://${indexPath}`);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  console.log("BrowserWindow created successfully.");

  mainWindow
    .loadURL(`file://${indexPath}`)
    .then(() => console.log("Renderer Load Initiated."))
    .catch((err) => console.error("Error loading URL:", err));

  mainWindow.webContents.once("did-finish-load", () => {
    console.log("Renderer Loaded Successfully.");
  });

  mainWindow.webContents.once("did-fail-load", (_, errorCode, errorDescription) => {
    console.error(`Failed to load: ${errorCode} - ${errorDescription}`);
  });

  mainWindow.webContents.on("console-message", (event, level, message, line, source) => {
    console.log(`Renderer Log [${level}]: ${message} (source: ${source}:${line})`);
  });

  mainWindow.webContents.openDevTools({ mode: "detach" });
});

// Authentication
ipcMain.handle("register-user", async (_, data) => {
  console.log("Register user requested:", data);
  try {
    return await authService.registerUser(data);
  } catch (error) {
    console.error("Error in register-user:", error);
    return { success: false, message: "Registration failed." };
  }
});

ipcMain.handle("login-user", async (_, data) => {
  console.log("Login user requested for email:", data.email);
  try {
    const response = await authService.loginUser(data);
    console.log("Login response:", response);
    return response;
  } catch (error) {
    console.error("Error in login-user:", error);
    return { success: false, message: "Login failed." };
  }
});

ipcMain.handle("check-session", async (_, token) => {
  console.log("Checking session:", token);
  return authService.checkSession(token);
});

// Membership & Payments
ipcMain.handle("get-members", async () => {
  console.log("Fetching all members...");
  return gymService.getAllMembers();
});


ipcMain.handle("add-member", async (_, data) => {
  console.log("Adding new member:", data);
  try {
    const result = await gymService.addNewMember(data);
    if (!result.success) throw new Error(result.message);
    return result;
  } catch (error) {
    console.error("❌ Error in add-member:", error.message);
    return { success: false, message: error.message }; // Return the error message
  }
});


ipcMain.handle("add-payment", async (_, data) => {
  console.log("Adding payment:", data);
  return gymService.addPayment(data);
});
ipcMain.handle("delete-payment", async (_, id) => gymService.deletePayment(id));


// User Data
ipcMain.handle("get-user-profile", async (_, userId) => {
  console.log("🔍 Fetching user profile for ID:", userId); // Debugging log

  try {
    const result = await userService.getUserData(userId);
    return result; // ✅ Return the response properly
  } catch (error) {
    console.error("❌ Error occurred in handler for 'get-user-profile':", error);
    return { success: false, message: "Failed to fetch user data." };
  }
});

const db = require("./database/db");  // Import SQLite database
ipcMain.handle("get-session", async () => {
  console.log("Fetching active session...");

  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM sessions ORDER BY created_at DESC LIMIT 1", [], (err, session) => {
      if (err) {
        console.error("Error retrieving session:", err);
        return resolve(null);
      }
      if (!session) {
        console.warn("No active session found.");
        return resolve(null);
      }

      console.log("Active session:", session);
      resolve({ userId: session.user_id, sessionToken: session.session_token });
    });
  });
});

ipcMain.handle("get-payments", async () => {
  console.log("🔍 Fetching payments from database...");

  try {
    const payments = await gymService.getPayments();
    return { success: true, payments };
  } catch (error) {
    console.error("❌ Error fetching payments:", error);
    return { success: false, message: "Failed to fetch payments." };
  }
});


ipcMain.handle("get-membership-types", async () => {
  console.log("🔍 Fetching membership types...");

  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM membership_types", [], (err, rows) => {
      if (err) {
        console.error("❌ Error fetching membership types:", err);
        return reject({ success: false, message: "Database query failed." });
      }
      console.log("✅ Membership types retrieved:", rows);
      resolve(rows);
    });
  });
});

ipcMain.handle("update-member", async (_, data) => {
  console.log("✏ Updating member:", data);
  return gymService.updateMember(data);
});


ipcMain.handle("delete-member", async (_, data) => {
  console.log("Deleting members:", data);
  return gymService.deleteMember(data);
});




ipcMain.handle("logout-user", async (_, token) => {
  console.log("🔒 Logging out user...");
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM sessions WHERE session_token = ?", [token], (err) => {
      if (err) {
        console.error("❌ Logout failed:", err);
        return reject({ success: false, message: "Logout failed." });
      }
      console.log("✅ User logged out successfully.");
      resolve({ success: true });
    });
  });
});



app.on("window-all-closed", () => {
  console.log("All windows closed.");
  if (process.platform !== "darwin") {
    console.log("Quitting app.");
    app.quit();
  }
});

