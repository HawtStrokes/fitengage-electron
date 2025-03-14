import React, { useState, useEffect, useCallback } from "react";

const InputField = ({ label, name, type = "text", value, onChange, required = false }) => (
  <div className="mb-2">
    <label className="block text-gray-700 mb-1 text-sm">{label}</label>
    <input
      type={type}
      name={name}
      className="w-full p-2 border rounded-md text-sm"
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
);

const MemberForm = ({ formData, setFormData, onSubmit, isEditMode }) => {
  const [membershipTypes, setMembershipTypes] = useState([]);

  // Fetch membership types on mount
  useEffect(() => {
    const fetchMembershipTypes = async () => {
      try {
        console.log("🔄 Fetching membership types...");
        const types = await window.api.getMembershipTypes();
        console.log("✅ Membership types received:", types);

        if (Array.isArray(types)) {
          setMembershipTypes(types);
        } else {
          console.error("⚠️ Unexpected response format for membership types:", types);
        }
      } catch (err) {
        console.error("❌ Error fetching membership types:", err);
      }
    };

    fetchMembershipTypes();
  }, []); // ✅ Runs only on component mount

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      console.log(`🔄 Updating field [${name}]:`, value);

      setFormData((prevData) => ({
        ...prevData,
        [name]: name === "membership_type_id" ? Number(value) : value, // ✅ Ensure number conversion
      }));
    },
    [setFormData]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📤 Submitting form data:", formData);

    try {
      if (isEditMode) {
        console.log("✏ Editing member...");
        await window.api.updateMember(formData);
      } else {
        console.log("➕ Adding new member...");
        await window.api.addMember(formData);
      }
    } catch (err) {
      console.error("❌ API Error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4">{isEditMode ? "Edit Member" : "Register a New Member"}</h3>

      <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
      <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
      <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
      <InputField label="Address" name="address" value={formData.address} onChange={handleChange} />
      <InputField label="Membership Start Date" name="membership_start" type="date" value={formData.membership_start} onChange={handleChange} required />
      <InputField label="Membership End Date" name="membership_end" type="date" value={formData.membership_end} onChange={handleChange} required />

      {/* ✅ Dynamic Membership Type Selection */}
      <div className="mb-2">
        <label className="block text-gray-700 mb-1 text-sm">Membership Type</label>
        <select
          name="membership_type_id"
          className="w-full p-2 border rounded-md text-sm"
          value={formData.membership_type_id || ""}
          onChange={handleChange}
          required
        >
          <option value="">Select Membership Type</option>
          {membershipTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <InputField label="Notes" name="notes" value={formData.notes} onChange={handleChange} />

      <button type="submit" className="w-full bg-maroon text-white py-2 rounded-md">
        {isEditMode ? "Update Member" : "Register Member"}
      </button>
    </form>
  );
};

export default MemberForm;

