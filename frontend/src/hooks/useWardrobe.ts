// Custom hook for wardrobe context
// This is the hook (useWardrobe) we will use when we want to acess any functionality of the wardrobe inventory
import { WardrobeContext } from "../contexts/WardrobeContext";
import { useContext } from "react";

export const useWardrobe = () => {
    const context = useContext(WardrobeContext)

    if(!context){
        throw new Error('useWardrobe must be used within WardrobeProvider')
    }
    return context

}