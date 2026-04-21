import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { petService } from "../api/petService"; 
import ListingInfoTab from "../components/listings/ListingInfoTab";
import InterestedUsersTab from "../components/listings/InterestedUsersTab";

export default function PetlistingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address } = useAccount(); // Get current user wallet address
  
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "interested">("details");

  useEffect(() => {
    async function fetchPetData() {
      if (!id) return;
      try {
        setLoading(true);
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

  // --- NEW: DELETE LOGIC ---
  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm("Are you sure you want to remove this pet from the distributed network?");
    if (!confirmed) return;

    try {
      await petService.deletePet(id);
      alert("Listing deleted successfully.");
      navigate("/home", { replace: true });
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  const handleEdit = () => {
    navigate(`/edit-listing/${id}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Loading listing details...</div>;
  if (!pet) return <div className="min-h-screen flex items-center justify-center text-red-500 font-medium">Listing not found.</div>;

  // Check if the current user is the owner
  const isOwner = address && pet?.lister_address 
  ? address.toLowerCase() === pet.lister_address.toLowerCase() 
  : false;

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#0D162B]">
            {pet.name}
          </h1>
          
          {/* Only show these if the user is the owner */}
          {isOwner && activeTab === "details" && (
            <div className="flex gap-3">
              <button onClick={handleEdit} className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 border rounded-lg">
                Edit Details
              </button>
              <button onClick={handleDelete} className="text-sm font-semibold text-red-600 hover:text-red-700 px-4 py-2 bg-red-50 rounded-lg">
                Delete Listing
              </button>
            </div>
          )}
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
            <ListingInfoTab pet={pet} /> 
          ) : (
            <InterestedUsersTab petId={id!} />
          )}
        </div>
      </div>
    </div>
  );
}