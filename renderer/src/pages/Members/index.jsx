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

  useEffect(() => {
    let isMounted = true;
    const fetchMembershipData = async () => {
      try {
        const members = await window.api.getMembers();
        if (isMounted) {
          if (!Array.isArray(members)) {
            setError("Invalid data received.");
            return;
          }
          setMembershipData(members);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
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

  const handleRegisterClick = () => {
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

  const handleEdit = (member) => {
    setFormData({ ...member, membership_type_id: String(member.membership_type_id) });
    setEditingMemberId(member.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.membership_type_id) {
      setError("Missing required fields.");
      return;
    }
    try {
      if (editingMemberId) {
        await window.api.updateMember(formData);
        setMembershipData((prev) => prev.map((m) => (m.id === formData.id ? { ...m, ...formData } : m)));
      } else {
        const newMember = await window.api.addMember({
          ...formData,
          membership_type_id: Number(formData.membership_type_id),
        });
        setMembershipData((prev) => [...prev, newMember]);
      }
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError("Failed to save member.");
    }
  };

  const handleDelete = async (memberId) => {
    try {
      await window.api.deleteMember(memberId);
      setMembershipData((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      setError("Failed to delete member.");
    }
  };

  const filteredMembers = membershipData.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center text-xl font-semibold">Loading...</div>;
  }

  return (
    <div className="p-6 min-h-screen flex flex-col items-center w-full max-w-7xl mx-auto">
      {error && <div className="text-red-500">{error}</div>}
      <input
        type="text"
        placeholder="Search Member"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-3 rounded w-full max-w-lg mb-4"
      />
      <button onClick={handleRegisterClick} className="bg-maroon text-white px-4 py-2 rounded mb-4">
        Register Member
      </button>
      <MemberList membershipData={filteredMembers} handleEdit={handleEdit} handleDelete={handleDelete} />
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-[#2C3E50] p-4 rounded-lg shadow-md max-w-md w-full mx-auto">
            <MemberForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} isEditMode={!!editingMemberId} />
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
