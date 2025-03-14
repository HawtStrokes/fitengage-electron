const db = require("./db");
const bcrypt = require("bcrypt");

const authService = {
  // ✅ Register a new user
  registerUser: async ({ name, email, password = "member" }) => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return reject({ success: false, message: "Error hashing password." });

        db.run(
          "INSERT INTO users (name, email, password) VALUES (?, ?, ?, ?)",
          [name, email, hashedPassword],
          function (err) {
            if (err) return reject({ success: false, message: "Registration failed. Email might already exist." });
            resolve({ success: true, userId: this.lastID });
          }
        );
      });
    });
  },

 loginUser: async ({ email, password }) => {
  return new Promise((resolve, reject) => {
    console.log(`🔍 Checking login for email: ${email}`);

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
      if (err) {
        console.error("❌ Database Error:", err);
        return reject({ success: false, message: "Login failed." });
      }
      if (!user) {
        console.warn("⚠️ No user found for email:", email);
        return resolve({ success: false, message: "Invalid email or password." });
      }

      console.log("✅ User found in database:", user);
      console.log("🔑 Entered password:", password);
      console.log("🗄️ Stored hashed password:", user.password);

      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error("❌ Bcrypt Error:", err);
          return resolve({ success: false, message: "Invalid email or password." });
        }
        if (!result) {
          console.warn("⚠️ Password mismatch! Login failed.");
          return resolve({ success: false, message: "Invalid email or password." });
        }

        console.log("🔓 Password match! Generating session...");

        const sessionToken = Math.random().toString(36).substr(2);
        db.run(
          "INSERT INTO sessions (user_id, session_token) VALUES (?, ?)",
          [user.id, sessionToken],
          function (err) {
            if (err) {
              console.error("❌ Session creation failed:", err);
              return reject({ success: false, message: "Session creation failed." });
            }
            console.log("✅ Session created:", sessionToken);
            resolve({ success: true, user, sessionToken });
          }
        );
      });
    });
  });
},


  // ✅ Check session token (for auto-login)
  checkSession: async (sessionToken) => {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT users.* FROM users JOIN sessions ON users.id = sessions.user_id WHERE sessions.session_token = ?",
        [sessionToken],
        (err, user) => {
          if (err || !user) return resolve({ success: false, message: "Invalid session." });
          resolve({ success: true, user });
        }
      );
    });
  },
};

module.exports = authService;

