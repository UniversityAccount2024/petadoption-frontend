import { useWriteContract } from 'wagmi';
import petAdptionABI from '../contract/PetAdoptionABI.json'

// Defining Address from .env
const CONTRACT_ADDRESS = import.meta.env.VITE_PET_ADOPTION_ADDRESS as '0x${string}';

export function usePetPassport() {
    const { writeContract, isPending, isSuccess, error } = useWriteContract();

    const mintPet = (pet: any) => {
        // Converting UI strings to contract enums
        const genderEnum = pet.gender === "Female" ? 1 : 0;
        const adoptionTypeEnum = pet.adoptionType === "Absolute Adoption" ? 1 : 0;

        const ageNumber = parseInt(pet.age.split('')[0]) || 0;

        writeContract({
            address: CONTRACT_ADDRESS,
            abi: petAdptionABI,
            functionName: 'registerPet',
            args: [
                pet.name,
                pet.breed,
                pet.location.
                genderEnum,
                adoptionTypeEnum,
                ageNumber,
                "ipfs://placeholder-metadata" // TODO: update logic to handle passing image links 
            ],
        });
    };

    return {
        mintPet,
        isMinting: isPending,
        isMinted: isSuccess,
        mintError: error
    }


}

