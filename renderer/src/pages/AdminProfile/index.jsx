import React, { useEffect, useState } from "react";
import styles from "./AdminProfile.module.css";

const profilePicture = new URL("../../assets/lenus-final.png", import.meta.url).href;

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const session = await window.api.getSession();
        if (!session || !session.userId) return;

        const user = await window.api.getUserProfile(session.userId);
        if (user.success) {
          setAdmin(user.user);
        } else {
          console.error("Failed to fetch user data:", user.message);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchAdminData();
  }, []);

  if (!admin) {
    return <div className="text-center text-xl font-semibold">Loading...</div>;
  }

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Profile Image Overlapping Panels */}
          <img src={profilePicture} alt="Profile" className={styles.profileImage} />
          <div className={styles.leftPanel}></div>
          <div className={styles.rightPanel}>
            <div className={styles.field}>
              <label>Name:</label>
              <p>{admin.name}</p>
            </div>
            <div className={styles.field}>
              <label>Email:</label>
              <p>{admin.email}</p>
            </div>
            <div className={styles.field}>
              <label>Role:</label>
              <p>{admin.role ? admin.role : "Administrator"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
