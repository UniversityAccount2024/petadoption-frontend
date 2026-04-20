import { useState } from "react";

// Define interface
interface InterestedUsersTabProps {
  petId: string;
}

// Accepting petId prop
export default function InterestedUsersTab({ petId }: InterestedUsersTabProps) {
  // Later change to other people who liked the pet 
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Angela Christoper",
      location: "Mainland, Lagos Nigeria",
      date: "10 Jan 2026",
      status: "pending",
    },
  ]);

  const handleApprove = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "approved" } : u)),
    );
    console.log(`Approved user ${id} for pet ${petId}`);
  };

  const handleReject = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "rejected" } : u)),
    );
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-500 italic">
          Showing interest requests for listing ID: {petId}
        </h3>
      </div>

      {users.length > 0 ? (
        users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between border border-gray-100 rounded-xl p-4 transition-all hover:border-gray-200"
          >
            <div>
              <p className="font-semibold text-[#0D162B]">{user.name}</p>
              <p className="text-sm text-gray-400">{user.location}</p>
              <p className="text-xs text-gray-400">{user.date}</p>
            </div>

            <div>
              {user.status === "pending" ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(user.id)}
                    className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(user.id)}
                    className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                  >
                    Approve
                  </button>
                </div>
              ) : (
                <span
                  className={`px-3 py-1 rounded-md text-xs font-bold tracking-wider ${
                    user.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {user.status.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-400">No interest requests yet for this pet.</p>
        </div>
      )}
    </div>
  );
}