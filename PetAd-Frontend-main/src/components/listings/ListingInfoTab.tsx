import { useState } from "react";
import InfoRow from "./InfoRow";
import StatusInfo from "./StatusInfo";

interface PetData {
  id: string;
  name: string;
  category: string;
  breed: string;
  age: string;
  gender: string;
  vaccination_status: string;
  status: string;
  image_url: string;
  gallery?: string[]; 
}

interface ListingInfoTabProps {
  pet: PetData;
}

export default function ListingInfoTab({ pet }: ListingInfoTabProps) {
  const [activeImage, setActiveImage] = useState(0);

  // Fallback to image_url if gallery doesn't exist
  const images = pet.gallery && pet.gallery.length > 0 
    ? pet.gallery 
    : [pet.image_url];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[120px_1fr_1fr] gap-8">
      {/* Thumbnail Gallery */}
      <div className="hidden lg:flex flex-col gap-4">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`${pet.name} thumb ${i}`}
            onClick={() => setActiveImage(i)}
            className={`w-24 h-24 object-cover rounded-lg cursor-pointer border-2 transition-all ${
              activeImage === i ? "border-[#E84D2A]" : "border-transparent hover:border-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Main Image Display */}
      <div className="rounded-xl overflow-hidden bg-gray-100">
        <img
          src={images[activeImage]}
          alt={pet.name}
          className="w-full h-[420px] object-cover rounded-xl"
        />
      </div>

      {/* Pet Details Information */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-bold text-[#0D162B]">
            {pet.name}
          </h2>
          <p className="text-sm text-gray-400 mt-1 tracking-wide uppercase">
            {pet.category} ADOPTION
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-100">
          <InfoRow label="Pet Type" value={pet.category} />
          <InfoRow label="Breed" value={pet.breed} />
          <InfoRow label="Age" value={pet.age} />
          <InfoRow label="Gender" value={pet.gender || "Not specified"} />
          <InfoRow label="Vaccinated Status" value={pet.vaccination_status || "Unknown"} />
        </div>

        {/* Dynamic Status Display */}
        <StatusInfo status={pet.status} />

        <div className="flex gap-4 mt-4">
          <button 
            className="flex-1 py-3 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors"
            onClick={() => console.log("Delete logic for:", pet.id)}
          >
            Delete Listing
          </button>
          <button className="flex-1 py-3 rounded-lg border border-gray-300 font-semibold hover:bg-gray-50 transition-colors">
            Edit Details
          </button>
        </div>
      </div>
    </div>
  );
}