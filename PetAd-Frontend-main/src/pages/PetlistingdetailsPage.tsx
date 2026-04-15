import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWriteContract } from 'wagmi';
import petAdoptionABI from '../contract/PetAdoptionABI.json';

// Assets
import dogImage from "../assets/dog.png";
import dog1Image from "../assets/dog_1.png";
import goldenRetriever from "../assets/golden_retriever.png";

// Configuration
const CONTRACT_ADDRESS = import.meta.env.VITE_PET_ADOPTION_ADDRESS;

// --- Interfaces ---
interface PetListing {
  id: number;
  name: string;
  adoptionType: "Temporary Adoption" | "Absolute Adoption";
  petType: string;
  breed: string;
  age: string;
  gender: string;
  vaccinationStatus: string;
  description: string;
  location: string;
  images: string[];
  owner: {
    name: string;
    avatar: string;
    email: string;
    phone: string;
    location: string;
  };
}

// --- Mock Data ---
const mockPet: PetListing = {
  id: 1,
  name: "Pet For Adoption",
  adoptionType: "Temporary Adoption",
  petType: "Dog",
  breed: "German Shepard",
  age: "4 Years Old",
  gender: "Female",
  vaccinationStatus: "Yes",
  description: "This is a loving and playful German Shepherd who enjoys outdoor activities...",
  location: "Lagos, Nigeria",
  images: [dogImage, dog1Image, goldenRetriever, dogImage],
  owner: {
    name: "Angela Christoper",
    avatar: "https://i.pravatar.cc/150?img=47",
    email: "angela@example.com",
    phone: "+234...",
    location: "Lagos, Nigeria",
  },
};

const relatedListings = [
  { id: 2, name: "Pet For Adoption", breed: "Dog, German Shepard", location: "Mainland, Lagos", image: dogImage },
  { id: 3, name: "Pet For Adoption", breed: "Dog, German Shepard", location: "Mainland, Lagos", image: dog1Image },
];

// --- Sub-Components (Icons) ---
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#E84D2A" : "none"} stroke={filled ? "#E84D2A" : "#666"} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const LocationIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const FlagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

// --- Main Page Component ---
export default function PetListingDetailsPage() {
  const navigate = useNavigate();
  const { writeContract, isPending } = useWriteContract();

  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"owner" | "description">("owner");
  const [isFav, setIsFav] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [intLoading, setIntLoading] = useState(false);

  // --- Blockchain Logic ---
  const mintPetPassport = () => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: petAdoptionABI,
      functionName: 'registerPet',
      args: [
        mockPet.name,
        mockPet.breed,
        mockPet.location,
        mockPet.gender === "Female" ? 1 : 0, // Enum: Male=0, Female=1
        mockPet.adoptionType === "Absolute Adoption" ? 1 : 0, // Enum: Temp=0, Absolute=1
        4, // Age
        "ipfs://placeholder-metadata-uri" // Link to full desc/images
      ],
    });
  };

  const handleFav = async () => {
    setFavLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setIsFav(f => !f);
    setFavLoading(false);
  };

  const handleInterest = async () => {
    setIntLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setIsInterested(f => !f);
    setIntLoading(false);
  };

  return (
    <div className="pld">
      <style>{`
        .pld * { box-sizing: border-box; margin: 0; padding: 0; }
        .pld { font-family: 'DM Sans', sans-serif; background: #fff; min-height: 100vh; color: #1a1a1a; }
        .pld-container { max-width: 1200px; margin: 0 auto; padding: 32px 24px 80px; }
        .pld-top { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 32px; }
        @media (max-width: 768px) { .pld-top { grid-template-columns: 1fr; } }
        .pld-gallery { display: flex; gap: 12px; }
        .pld-gallery__thumbs { display: flex; flex-direction: column; gap: 10px; }
        .pld-gallery__thumb { width: 60px; height: 60px; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid transparent; }
        .pld-gallery__thumb--active { border-color: #E84D2A; }
        .pld-gallery__thumb img { width: 100%; height: 100%; object-fit: cover; }
        .pld-gallery__main { flex: 1; border-radius: 12px; overflow: hidden; background: #f0f0f0; aspect-ratio: 4/3; }
        .pld-gallery__main img { width: 100%; height: 100%; object-fit: cover; }
        .pld-details { display: flex; flex-direction: column; gap: 16px; }
        .pld-details__name { font-size: 24px; font-weight: 800; color: #0D162B; }
        .pld-details__badge { padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 700; background: #FFF2E5; color: #E84D2A; border: 1px solid #E84D2A; width: fit-content; }
        .pld-details__table { border: 1px solid #e8e8e8; border-radius: 10px; overflow: hidden; }
        .pld-details__row { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #f0f0f0; }
        .pld-details__cell { padding: 12px 16px; font-size: 14px; }
        .pld-details__cell:first-child { color: #888; border-right: 1px solid #f0f0f0; }
        .pld-details__cell:last-child { font-weight: 600; }
        .pld-cta { display: flex; gap: 12px; flex-wrap: wrap; }
        .pld-btn { flex: 1; min-width: 160px; padding: 12px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; border: none; }
        .pld-btn--outline { background: #fff; border: 1.5px solid #d0d0d0; }
        .pld-btn--red { background: #E84D2A; color: #fff; }
        .pld-btn--dark { background: #0D1B2A; color: #fff; }
        .pld-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pld-tabs { border-bottom: 1.5px solid #e8e8e8; display: flex; margin-bottom: 24px; }
        .pld-tab { padding: 12px 24px; font-size: 14px; font-weight: 600; color: #888; cursor: pointer; border: none; background: none; border-bottom: 2.5px solid transparent; }
        .pld-tab--active { color: #1a1a1a; border-bottom-color: #1a1a1a; }
        .pld-owner { display: flex; align-items: center; gap: 20px; }
        .pld-owner__avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
        .pld-owner__fields { display: flex; gap: 40px; flex: 1; }
        .pld-owner__field { display: flex; flex-direction: column; }
        .pld-owner__field-label { font-size: 11px; color: #aaa; text-transform: uppercase; }
        .pld-owner__field-value { font-size: 14px; font-weight: 600; }
      `}</style>

      <div className="pld-container">
        <div className="pld-top">
          {/* Gallery */}
          <div className="pld-gallery">
            <div className="pld-gallery__thumbs">
              {mockPet.images.map((img, i) => (
                <div key={i} className={`pld-gallery__thumb ${i === activeImage ? "pld-gallery__thumb--active" : ""}`} onClick={() => setActiveImage(i)}>
                  <img src={img} alt="Thumb" />
                </div>
              ))}
            </div>
            <div className="pld-gallery__main">
              <img src={mockPet.images[activeImage]} alt="Main" />
            </div>
          </div>

          {/* Details */}
          <div className="pld-details">
            <h1 className="pld-details__name">{mockPet.name}</h1>
            <span className="pld-details__badge">{mockPet.adoptionType}</span>

            <div className="pld-details__table">
              <div className="pld-details__row"><div className="pld-details__cell">Breed</div><div className="pld-details__cell">{mockPet.breed}</div></div>
              <div className="pld-details__row"><div className="pld-details__cell">Age</div><div className="pld-details__cell">{mockPet.age}</div></div>
              <div className="pld-details__row"><div className="pld-details__cell">Gender</div><div className="pld-details__cell">{mockPet.gender}</div></div>
            </div>

            <div className="pld-cta">
              <button className="pld-btn pld-btn--outline" onClick={handleFav} disabled={favLoading}>
                {favLoading ? <span className="pld-spinner" style={{borderColor: '#666'}} /> : <HeartIcon filled={isFav} />}
                {isFav ? "Saved" : "Add To Favourites"}
              </button>
              
              <button className="pld-btn pld-btn--red" onClick={handleInterest} disabled={intLoading}>
                {intLoading && <span className="pld-spinner" />}
                {isInterested ? "Interested ✓" : "Show Interest"}
              </button>

              {/* Blockchain Button */}
              <button className="pld-btn pld-btn--dark" onClick={mintPetPassport} disabled={isPending}>
                {isPending ? <span className="pld-spinner" /> : "🚀 Mint Pet Passport"}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="pld-tabs">
          <button className={`pld-tab ${activeTab === "owner" ? "pld-tab--active" : ""}`} onClick={() => setActiveTab("owner")}>Owner Info</button>
          <button className={`pld-tab ${activeTab === "description" ? "pld-tab--active" : ""}`} onClick={() => setActiveTab("description")}>Description</button>
        </div>

        {activeTab === "owner" ? (
          <div className="pld-owner">
            <img src={mockPet.owner.avatar} className="pld-owner__avatar" alt="Owner" />
            <div className="pld-owner__fields">
              <div className="pld-owner__field"><span className="pld-owner__field-label">Full Name</span><span className="pld-owner__field-value">{mockPet.owner.name}</span></div>
              <div className="pld-owner__field"><span className="pld-owner__field-label">Location</span><span className="pld-owner__field-value">{mockPet.owner.location}</span></div>
            </div>
            <button className="pld-btn pld-btn--outline" style={{width: 'auto'}}><FlagIcon /> Report</button>
          </div>
        ) : (
          <p style={{lineHeight: 1.6}}>{mockPet.description}</p>
        )}
      </div>
    </div>
  );
}