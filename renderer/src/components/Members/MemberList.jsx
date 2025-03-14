import React from "react";
import { MdEdit, MdDelete } from "react-icons/md";

// ✅ Format dates safely
const formatDate = (dateString) => {
  if (!dateString || dateString === "N/A") return "N/A";
  const parsedDate = new Date(dateString);
  return isNaN(parsedDate.getTime()) ? "Invalid Date" : parsedDate.toLocaleDateString();
};

const MemberList = ({ membershipData, handleEdit, handleDelete }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-full mx-auto mt-6">
      <h1 className="text-3xl font-bold text-maroon text-center mb-6">
        Member List
      </h1>

      {/* ✅ TABLE: Displays member data */}
      <div className="relative overflow-x-auto shadow-lg border border-gray-200 rounded-lg max-h-[510px] overflow-y-auto">
        <table className="w-full border-collapse text-sm table-fixed">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-center">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Address</th>
              <th className="p-2">Membership Type</th>
              <th className="p-2">Start Date</th>
              <th className="p-2">End Date</th>
              <th className="p-2">Notes</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {membershipData.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-4 text-center text-gray-500">
                  No members found.
                </td>
              </tr>
            ) : (
              membershipData.map((member, index) => (
                <tr key={index} className="border-b last:border-b-0 text-center">
                  <td className="p-2 text-left">{member.name || "N/A"}</td>
                  <td className="p-2">{member.email || "N/A"}</td>
                  <td className="p-2">{member.phone || "N/A"}</td>
                  <td className="p-2">{member.address || "N/A"}</td>
                  <td className="p-2">{member.membership_type_id || "N/A"}</td>
                  <td className="p-2">{formatDate(member.membership_start)}</td>
                  <td className="p-2">{formatDate(member.membership_end)}</td>
                  <td className="p-2">{member.notes || "N/A"}</td>
                  <td className="p-2 flex justify-center items-center">
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-yellow-500 text-sm mr-2"
                    >
                      <MdEdit size="1.5em" />
                    </button>
                  
<button onClick={() => handleDelete(member.id)} className="text-red-500 text-sm">
  <MdDelete size="1.5em" />
</button>

                  
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberList;

