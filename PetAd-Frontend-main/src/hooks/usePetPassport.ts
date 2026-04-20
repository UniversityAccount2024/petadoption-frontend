import { useWriteContract } from 'wagmi';
import petAdptionABI from '../contract/PetAdoptionABI.json'

// Defining Address from .env
const CONTRACT_ADDRESS = import.meta.env.VITE_PET_ADOPTION_ADDRESS as `0x${string}`;

export function usePetPassport() {
    const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract();

    const mintPet = (pet: any) => {
        // Enums usually: 0 = Male, 1 = Female | 0 = Temporary, 1 = Absolute
        const genderEnum = pet.gender?.toLowerCase() === "female" ? 1 : 0;
        const adoptionTypeEnum = pet.adoptionType?.toLowerCase() === "absolute" ? 1 : 0;

        // Extracting just the number from "4 Years Old" or "2 Years"
        const ageNumber = parseInt(pet.age) || 0;

        writeContract({
            address: CONTRACT_ADDRESS,
            abi: petAdptionABI,
            functionName: 'registerPet',
            args: [
                pet.name,
                pet.breed,
                pet.location,
                genderEnum,
                adoptionTypeEnum,
                ageNumber,
                pet.image_url || "" // Passing the real Supabase image link to the blockchain
            ],
        });
    };

    return {
        mintPet,
        isMinting: isPending,
        isMinted: isSuccess,
        mintError: error,
        txHash: hash // Useful for checking on Etherscan/Explorer
    }
}

