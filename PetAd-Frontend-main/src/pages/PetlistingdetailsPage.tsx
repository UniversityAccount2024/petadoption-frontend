import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { petService } from "../api/petService"; // Import your service
import ListingInfoTab from "../components/listings/ListingInfoTab";
import InterestedUsersTab from "../components/listings/InterestedUsersTab";

export default function ListingDetailsPage() {
  const { id } = useParams();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "interested">("details");

  useEffect(() => {
    async function fetchPetData() {
      if (!id) return;
      try {
        setLoading(true);
        // Use the same service method we fixed earlier
        const data = await petService.getPetId(id);
        setPet(data);
      } catch (error) {
        console.error("Error fetching pet details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPetData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Loading listing details...</div>;
  if (!pet) return <div className="min-h-screen flex items-center justify-center text-red-500 font-medium">Listing not found.</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-[#0D162B]">
            {pet.name} {/* Show real pet name instead of just ID */}
          </h1>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-6 py-4 text-sm font-semibold transition-colors ${
              activeTab === "details"
                ? "text-[#0D162B] border-b-2 border-[#E84D2A]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Listing Details
          </button>

          <button
            onClick={() => setActiveTab("interested")}
            className={`px-6 py-4 text-sm font-semibold transition-colors ${
              activeTab === "interested"
                ? "text-[#0D162B] border-b-2 border-[#E84D2A]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Interested Users
          </button>
        </div>

        <div className="p-6">
          {activeTab === "details" ? (
            /* Pass the real pet data into the tab */
            <ListingInfoTab pet={pet} /> 
          ) : (
            <InterestedUsersTab petId={id!} />
          )}
        </div>
      </div>
    </div>
  );
}