const db = require("./db");

const userService = {
  getUserData: async (userId) => {
    return new Promise((resolve, reject) => {
      console.log("🔍 Fetching user data for ID:", userId); // Debugging log

      db.get("SELECT id, name, email FROM users WHERE id = ?", [userId], (err, user) => {
        if (err) {
          console.error("❌ Database Error in getUserData:", err);
          return reject({ success: false, message: "Database query failed." });
        }
        if (!user) {
          console.warn("⚠️ No user found with ID:", userId);
          return resolve({ success: false, message: "User not found." });
        }

        console.log("✅ User found:", user);
        resolve({ success: true, user });
      });
    });
  },
};

module.exports = userService;

