import React, { useState, useEffect } from "react";
import MemberList from "../../components/Members/MemberList";
import MemberForm from "../../components/Members/MemberForm";

const Members = () => {
  const [membershipData, setMembershipData] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    membership_type_id: "",
    membership_start: "",
    membership_end: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

    const handleEdit = (member) => {
      console.log("✏ Editing member:", member);
      
      // Set form data to the selected member's info
      setFormData({
        id: member.id,  // Make sure to include the ID for updates
        name: member.name || "",
        email: member.email || "",
        phone: member.phone || "",
        address: member.address || "",
        membership_type_id: String(member.membership_type_id) || "", // Convert to string for dropdown
        membership_start: member.membership_start || "",
        membership_end: member.membership_end || "",
        notes: member.notes || "",
      });

      setEditingMemberId(member.id); // Track which member is being edited
      setShowForm(true); // Open the form for editing
    };


  // 🔍 Fetch Members from Database
  useEffect(() => {
    let isMounted = true;

    const fetchMembershipData = async () => {
      try {
        console.log("🔍 Fetching members from database...");
        const members = await window.api.getMembers();

        if (isMounted) {
          console.log("✅ Members fetched:", JSON.stringify(members, null, 2));

          if (!Array.isArray(members)) {
            console.error("❌ API returned an invalid members list:", members);
            setError("Invalid data received.");
            return;
          }

          const formattedMembers = members.map((member) => ({
            id: member.id || "N/A",
            name: member.name || "**MISSING NAME**",
            email: member.email || "N/A",
            phone: member.phone || "N/A",
            address: member.address || "N/A",
            membership_type_id: member.membership_type_id || "N/A",
            membership_start: member.membership_start || "N/A",
            membership_end: member.membership_end || "N/A",
            notes: member.notes || "N/A",
          }));

          setMembershipData(formattedMembers);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("❌ Error fetching members:", err);
          setError("Failed to load members.");
          setLoading(false);
        }
      }
    };

    fetchMembershipData();

    return () => {
      isMounted = false;
    };
  }, []);

  // 🔥 Handle Register Button Click
  const handleRegisterClick = () => {
    console.log("➕ Open Register Form");
    setShowForm(true);
    setEditingMemberId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      membership_type_id: "",
      membership_start: "",
      membership_end: "",
      notes: "",
    });
  };

  // 🔥 Handle Form Submission (Register New Member)
    const handleSubmit = async (e) => {
      e.preventDefault();

      console.log("📤 Submitting form data:", formData);

      if (!formData.name || !formData.email || !formData.membership_type_id) {
        console.error("❌ Missing required fields.");
        setError("Missing required fields.");
        return;
      }

      try {
        if (editingMemberId) {
          console.log("✏ Updating member:", formData);
          await window.api.updateMember(formData);
          
          // Update the local state with the edited member
          setMembershipData((prevData) =>
            prevData.map((m) => (m.id === formData.id ? { ...m, ...formData } : m))
          );
        } else {
          console.log("➕ Adding new member:", formData);
          const newMember = await window.api.addMember({
            ...formData,
            membership_type_id: Number(formData.membership_type_id),
          });

          setMembershipData((prevData) => [...prevData, newMember]);
        }

        // Reset form & close modal
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          membership_type_id: "",
          membership_start: "",
          membership_end: "",
          notes: "",
        });

        setEditingMemberId(null);
        setShowForm(false);
        setError(null);
        console.log("✅ Member successfully saved.");
      } catch (err) {
        console.error("❌ Error saving member:", err);
        setError("Failed to save member.");
      }
    };


const handleDelete = async (memberId) => {
  try {
    console.log("🗑 Deleting member ID:", memberId);
    await window.api.deleteMember(memberId);

    // Remove the deleted member from the list
    setMembershipData((prevData) => prevData.filter((m) => m.id !== memberId));
    console.log("✅ Member deleted successfully.");
  } catch (err) {
    console.error("❌ Error deleting member:", err);
    setError("Failed to delete member.");
  }
};


  // 🔍 Search Members
  const filteredMembers = membershipData.filter((member) =>
    (member.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}

      {/* 🔥 ✅ Single Search Bar */}
      <input
        type="text"
        placeholder="Search Member"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />

      {/* 🔥 ✅ Single Register Button */}
      <button onClick={handleRegisterClick} className="bg-maroon text-white px-4 py-2 rounded">
        Register Member
      </button>

      {/* 🔥 ✅ Only displaying members here */}
        <MemberList 
          membershipData={filteredMembers} 
          handleEdit={handleEdit}  // ✅ Pass edit function
          handleDelete={handleDelete} 
        />


      {/* 🔥 ✅ Member Form is only displayed when showForm is true */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-[#2C3E50] p-4 rounded-lg shadow-md max-w-md w-full mx-auto">
            <MemberForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isEditMode={!!editingMemberId}
            />
            <button onClick={() => setShowForm(false)} className="text-white mt-2">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;

