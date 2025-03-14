import sqlite3
import csv
import argparse

# Argument parser to get file paths
parser = argparse.ArgumentParser()
parser.add_argument("--db", required=True, help="Path to the SQLite database")
parser.add_argument("--csv", required=True, help="Path to the CSV file")
args = parser.parse_args()

# Connect to the SQLite database
conn = sqlite3.connect(args.db)
cursor = conn.cursor()

# Open CSV file
with open(args.csv, "r", encoding="utf-8") as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        # Process Name (Concatenating First Name & Last Name)
        full_name = f"{row['First Name'].strip()} {row['Last Name'].strip()}".strip()

        # Handle missing email (Create placeholder: "N/A")
        email = f"na-{row['First Name'].lower()}_{row['Last Name'].lower()}@fitengage.com" if not row['First Name'] or not row['Last Name'] else "N/A"

        # Handle phone (Use "N/A" if empty)
        phone = "N/A"

        # Handle membership type (Assign a default if missing)
        membership_type_id = None  # Adjust if you have a default type ID

        # Handle membership dates (Use "N/A" if empty)
        membership_start = row["Membership Renewal"].strip() if row["Membership Renewal"] else "N/A"
        membership_end = row["Membership Expiry Date"].strip() if row["Membership Expiry Date"] else "N/A"

        # Combine multiple "Notes" columns into one
        notes = " | ".join(filter(None, [row["Notes"], row["Notes.1"], row["Notes.2"]])).strip() or "N/A"

        try:
            cursor.execute(
                """
                INSERT INTO members (name, email, phone, membership_type_id, membership_start, membership_end, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (full_name, email, phone, membership_type_id, membership_start, membership_end, notes),
            )
        except sqlite3.IntegrityError as e:
            print(f"Skipping row due to error: {e}")

# Commit and close
conn.commit()
conn.close()
print("Data import complete!")

