import { useState } from "react";
import { useAccount } from 'wagmi';
import { FormInput } from "../ui/formInput";
import { FormSelect } from "../ui/formSelect";
import { FileUpload } from "../ui/fileUpload";
import { AuthModal } from "../ui/authModal"; 
import { supabase } from "../../api/supabase";
import { petService } from "../../api/petService";
import { usePetPassport } from "../../hooks/usePetPassport";
import { useEffect } from "react";

interface ListingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ListingFormData {
    adoptionType: string;
    description: string;
    title: string;
    petType: string;
    breed: string;
    age: string;
    gender: string;
    vaccination: string;
    state: string;
    city: string;
    images: (File | null)[];
}

// ... (PET_TYPES, AGE_OPTIONS, etc. remain unchanged)

const PET_TYPES = [
    { value: "dog", label: "Dog" },
    { value: "cat", label: "Cat" },
    { value: "bird", label: "Bird" },
    { value: "other", label: "Other" },
];

const AGE_OPTIONS = [
    { value: "baby", label: "Baby (0-6 months)" },
    { value: "young", label: "Young (6-12 months)" },
    { value: "adult", label: "Adult (1-5 years)" },
    { value: "senior", label: "Senior (5+ years)" },
];

const GENDER_OPTIONS = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "unknown", label: "Unknown" },
];

const VACCINATION_OPTIONS = [
    { value: "yes", label: "Yes, fully vaccinated" },
    { value: "no", label: "No / Unknown" },
    { value: "partial", label: "Partially vaccinated" },
];

const STATE_OPTIONS = [
    { value: "lagos", label: "Lagos" },
    { value: "abuja", label: "Abuja" },
    { value: "rivers", label: "Rivers" },
    { value: "other", label: "Other" },
];

const INIT_STATE: ListingFormData = {
    adoptionType: "",
    description: "",
    title: "",
    petType: "",
    breed: "",
    age: "",
    gender: "",
    vaccination: "",
    state: "",
    city: "",
    images: [null, null, null, null, null],
};

export function ListingModal({ isOpen, onClose }: ListingModalProps) {
    const { address } = useAccount();
    const { mintPet, isMinting, isMinted, mintError } = usePetPassport();
    const [step, setStep] = useState<1 | 2>(1);
    const [formData, setFormData] = useState<ListingFormData>(INIT_STATE);
    const [errors, setErrors] = useState<Partial<Record<keyof ListingFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (isMinted) {
            setShowSuccess(true);
        }
    }, [isMinted]);

    useEffect(() => {
        if (mintError) {
         alert(mintError.message || "Minting failed");
        }
    }, [mintError]);


    useEffect(() => {
        if (isMinted) {
        window.dispatchEvent(new Event("pet-listed"));
        setShowSuccess(true);
        }
    }, [isMinted]);

    const handleChange = (field: keyof ListingFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleImageChange = (index: number, file: File | null) => {
        setFormData((prev) => {
            const newImages = [...prev.images];
            newImages[index] = file;
            return { ...prev, images: newImages };
        });
        if (errors.images) {
            setErrors((prev) => ({ ...prev, images: undefined }));
        }
    };

    const validateStep1 = () => {
        const newErrors: Partial<Record<keyof ListingFormData, string>> = {};
        if (!formData.adoptionType) newErrors.adoptionType = "Required";
        if (!formData.description.trim()) newErrors.description = "Required";
        if (!formData.title.trim()) newErrors.title = "Required";
        if (!formData.petType) newErrors.petType = "Required";
        if (!formData.breed.trim()) newErrors.breed = "Required";
        if (!formData.age) newErrors.age = "Required";
        if (!formData.gender) newErrors.gender = "Required";
        if (!formData.vaccination) newErrors.vaccination = "Required";
        if (!formData.state) newErrors.state = "Required";
        if (!formData.city.trim()) newErrors.city = "Required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Partial<Record<keyof ListingFormData, string>> = {};
        const imgCount = formData.images.filter((img) => img !== null).length;
        if (imgCount < 3) {
            newErrors.images = "Please add at least 3 different angle images";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProceed = () => {
        if (validateStep1()) setStep(2);
    };

    const uploadImages = async (files: (File | null)[], petId: string) => {
        const uploadPromises = files.map(async (file, index) => {
            if (!file) return null;
            const fileExt = file.name.split('.').pop();
            const fileName = `${petId}/${index}-${Date.now()}.${fileExt}`;
            const filePath = `pet-images/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('pets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('pets').getPublicUrl(filePath);
            return data.publicUrl;
        });

        const urls = await Promise.all(uploadPromises);
        return urls.filter((url): url is string => url !== null);
    };

    const handleSubmit = async () => {
        if (!validateStep2() || !address) return;

        setIsSubmitting(true);

        try {
            const petId = crypto.randomUUID();
            const imageUrls = await uploadImages(formData.images, petId);

            const petData = {
                id: petId,
                name: formData.title,
                petType: formData.petType,
                breed: formData.breed,
                age: formData.age,
                gender: formData.gender,
                location: `${formData.city}, ${formData.state}`,
                description: formData.description,
                images: imageUrls,
                vaccination: formData.vaccination,
                image_url: imageUrls[0],
                adoptionType: formData.adoptionType
            };

            // Save to Supabase
            await petService.createPet(petData, address);

            // Mint NFT
            mintPet(petData);

        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };


    if (!isOpen && !showSuccess) return null;

    if (showSuccess) {
        return (
            <AuthModal
                isOpen={true}
                title="Pet Listed Successfully!"
                description="You have successfully listed a pet for adoption"
                buttonText="View Listing"
                onAction={() => {
                    setShowSuccess(false);
                    setFormData(INIT_STATE);
                    setStep(1);
                    setErrors({});
                    onClose();
                }}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm px-4 lg:px-8">
            <div className="w-full max-w-[500px] bg-white rounded-2xl p-6 lg:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">
                            {step === 1 ? "Adoption & Pet Information" : "Add Images"}
                        </h2>
                        <p className="text-[13px] text-gray-500 mt-1">
                            {step === 1 ? "All fields are required" : "Add at least 3 images"}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-minimal pr-2">
                    {step === 1 ? (
                        <div className="space-y-4 py-2">
                            <FormSelect
                                id="adoptionType"
                                label="Adoption Type"
                                options={[
                                    { value: "temporary", label: "Temporary Adoption" },
                                    { value: "absolute", label: "Absolute Adoption" },
                                ]}
                                value={formData.adoptionType}
                                onChange={(e) => handleChange("adoptionType", e.target.value)}
                                error={errors.adoptionType}
                            />
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="description" className="text-[13px] font-medium text-gray-700">Description</label>
                                <textarea
                                    id="description"
                                    className={`w-full rounded-xl border border-gray-200 p-3 text-[14px] outline-none ${errors.description ? "border-red-500" : ""}`}
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                />
                                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                            </div>
                            <FormInput
                                id="title" // Added missing ID
                                label="Listing Title"
                                value={formData.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                                error={errors.title}
                            />
                            <FormSelect 
                                id="petType" // Added missing ID
                                label="Pet Type" 
                                options={PET_TYPES} 
                                value={formData.petType} 
                                onChange={(e) => handleChange("petType", e.target.value)} 
                                error={errors.petType} 
                            />
                            <FormInput 
                                id="breed" // Added missing ID
                                label="Breed" 
                                value={formData.breed} 
                                onChange={(e) => handleChange("breed", e.target.value)} 
                                error={errors.breed} 
                            />
                            <FormSelect 
                                id="age" // Added missing ID
                                label="Age" 
                                options={AGE_OPTIONS} 
                                value={formData.age} 
                                onChange={(e) => handleChange("age", e.target.value)} 
                                error={errors.age} 
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormSelect 
                                    id="gender" // Added missing ID
                                    label="Gender" 
                                    options={GENDER_OPTIONS} 
                                    value={formData.gender} 
                                    onChange={(e) => handleChange("gender", e.target.value)} 
                                    error={errors.gender} 
                                />
                                <FormSelect 
                                    id="vaccination" // Added missing ID
                                    label="Vaccination" 
                                    options={VACCINATION_OPTIONS} 
                                    value={formData.vaccination} 
                                    onChange={(e) => handleChange("vaccination", e.target.value)} 
                                    error={errors.vaccination} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormSelect 
                                    id="state" // Added missing ID
                                    label="State" 
                                    options={STATE_OPTIONS} 
                                    value={formData.state} 
                                    onChange={(e) => handleChange("state", e.target.value)} 
                                    error={errors.state} 
                                />
                                <FormInput 
                                    id="city" // Added missing ID
                                    label="City" 
                                    value={formData.city} 
                                    onChange={(e) => handleChange("city", e.target.value)} 
                                    error={errors.city} 
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 py-2">
                        {formData.images.map((_, i) => (
                            <FileUpload
                                key={i}
                                id={`pet-image-${i}`} 
                                label={`Image ${i + 1} ${i < 3 ? "(Required)" : "(Optional)"}`}
                                selectedFile={formData.images[i]}
                                onChange={(file) => handleImageChange(i, file)}
                            />
                        ))}
                            {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t flex gap-3">
                    {step === 2 && (
                        <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-100 py-3 rounded-xl font-semibold">Back</button>
                    )}
                    <button
                        type="button"
                        onClick={step === 1 ? handleProceed : handleSubmit}
                        disabled={isSubmitting || isMinting}
                        className="flex-1 bg-[#0D1B2A] text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {(isSubmitting || isMinting) && (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}

                        {step === 1
                            ? "Proceed"
                            : isSubmitting
                            ? "Uploading..."
                            : isMinting
                            ? "Waiting for Wallet..."
                            : "Submit Listing"}
                    </button>
                </div>
            </div>
        </div>
    );
}