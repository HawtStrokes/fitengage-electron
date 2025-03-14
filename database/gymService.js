const db = require("./db");

// Function to format dates to YYYY-MM-DD
const formatToISO = (dateString) => {
  if (!dateString) return null;
  const parsedDate = new Date(dateString);
  return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString().split("T")[0];
};

const gymService = {
  // 🔹 Get all members
  getAllMembers: async () => {
    return new Promise((resolve, reject) => {
      console.log("🔍 Fetching all members...");
      db.all("SELECT * FROM members", [], (err, rows) => {
        if (err) {
          console.error("❌ Error fetching members:", err);
          return reject({ success: false, message: "Database query failed." });
        }

        const formattedRows = rows.map((member) => ({
          ...member,
          membership_start: formatToISO(member.membership_start),
          membership_end: formatToISO(member.membership_end),
        }));

        console.log("✅ Members fetched:", formattedRows);
        resolve(formattedRows);
      });
    });
  },

  // 🔹 Get all membership types
  getMembershipTypes: async () => {
    return new Promise((resolve, reject) => {
      console.log("🔍 Fetching membership types...");
      db.all("SELECT * FROM membership_types", [], (err, rows) => {
        if (err) {
          console.error("❌ Error fetching membership types:", err);
          return reject({ success: false, message: "Failed to fetch membership types." });
        }
        console.log("✅ Membership types fetched:", rows);
        resolve(rows);
      });
    });
  },

  // ✅ Add a new member
  addNewMember: async ({ name, email, phone, address, membership_type_id, membership_start, membership_end, notes }) => {
    return new Promise((resolve, reject) => {
      console.log(`➕ Adding new member: ${name} (Type ID: ${membership_type_id})`);

      if (!membership_type_id) {
        console.error("❌ Invalid membership type: ID is missing.");
        return reject({ success: false, message: "Invalid membership type ID." });
      }

      db.get("SELECT * FROM membership_types WHERE id = ?", [membership_type_id], (err, type) => {
        if (err) {
          console.error("❌ Database error fetching membership type:", err);
          return reject({ success: false, message: "Database query error." });
        }
        if (!type) {
          console.error(`❌ No membership type found for ID: ${membership_type_id}`);
          return reject({ success: false, message: "Invalid membership type." });
        }

        console.log(`✅ Found membership type: ${type.name} (${type.duration_days} days)`);

        db.run(
          `INSERT INTO members (name, email, phone, address, membership_type_id, membership_start, membership_end, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [name, email, phone, address, membership_type_id, formatToISO(membership_start), formatToISO(membership_end), notes],
          function (err) {
            if (err) {
              console.error("❌ Failed to add member:", err);
              return reject({ success: false, message: "Failed to add member." });
            }
            console.log(`✅ Member added successfully with ID: ${this.lastID}`);
            resolve({ success: true, memberId: this.lastID });
          }
        );
      });
    });
  },

  // ✅ Update an existing member
  updateMember: async ({ id, name, email, phone, address, membership_type_id, membership_start, membership_end, notes }) => {
    return new Promise((resolve, reject) => {
      console.log(`✏ Updating member ID: ${id}...`);

      db.get("SELECT * FROM members WHERE id = ?", [id], (err, member) => {
        if (err) {
          console.error("❌ Database error fetching member:", err);
          return reject({ success: false, message: "Database error." });
        }
        if (!member) {
          console.error(`❌ Member ID ${id} not found.`);
          return reject({ success: false, message: "Member not found." });
        }

        db.run(
          `UPDATE members 
           SET name = ?, email = ?, phone = ?, address = ?, 
               membership_type_id = ?, membership_start = ?, membership_end = ?, notes = ?
           WHERE id = ?;`,
          [name, email, phone, address, membership_type_id, formatToISO(membership_start), formatToISO(membership_end), notes, id],
          function (err) {
            if (err) {
              console.error("❌ Failed to update member:", err);
              return reject({ success: false, message: "Failed to update member." });
            }
            console.log(`✅ Member ID ${id} updated successfully.`);
            resolve({ success: true });
          }
        );
      });
    });
  },

  // ✅ Delete a member
  deleteMember: async (id) => {
    return new Promise((resolve, reject) => {
      console.log(`🗑 Deleting member ID: ${id}...`);

      db.run("DELETE FROM members WHERE id = ?;", [id], function (err) {
        if (err) {
          console.error("❌ Failed to delete member:", err);
          return reject({ success: false, message: "Failed to delete member." });
        }
        console.log(`✅ Member ID ${id} deleted successfully.`);
        resolve({ success: true });
      });
    });
  },

  // ✅ Add a payment
  addPayment: async ({ member_id, amount, payment_type }) => {
    return new Promise((resolve, reject) => {
      console.log(`💰 Adding payment for Member ID ${member_id} - Amount: ${amount}`);

      db.run(
        "INSERT INTO payments (member_id, date, amount, payment_type) VALUES (?, DATE('now'), ?, ?)",
        [member_id, amount, payment_type],
        function (err) {
          if (err) {
            console.error("❌ Failed to add payment:", err);
            return reject({ success: false, message: "Failed to add payment." });
          }
          console.log(`✅ Payment recorded successfully with ID: ${this.lastID}`);
          resolve({ success: true, paymentId: this.lastID });
        }
      );
    });
  },

  // ✅ Get all payments
  getPayments: async () => {
    return new Promise((resolve, reject) => {
      console.log("🔍 Fetching payments from database...");

      const query = `
        SELECT payments.id, payments.date, payments.amount, payments.payment_type, 
               members.name AS member_name 
        FROM payments
        JOIN members ON payments.member_id = members.id
        ORDER BY payments.date DESC;
      `;

      db.all(query, [], (err, rows) => {
        if (err) {
          console.error("❌ Database Error in getPayments:", err);
          return reject({ success: false, message: "Database query failed." });
        }

        console.log("✅ Payments retrieved:", rows);
        resolve({ success: true, payments: rows });
      });
    });
  },

  // ✅ Delete a payment
  deletePayment: async (id) => {
    return new Promise((resolve, reject) => {
      console.log(`🗑 Deleting payment ID: ${id}...`);

      db.run("DELETE FROM payments WHERE id = ?;", [id], function (err) {
        if (err) {
          console.error("❌ Failed to delete payment:", err);
          return reject({ success: false, message: "Failed to delete payment." });
        }
        console.log(`✅ Payment ID ${id} deleted successfully.`);
        resolve({ success: true });
      });
    });
  },
};

module.exports = gymService;

