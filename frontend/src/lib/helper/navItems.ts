 import { AutoAwesome } from '@mui/icons-material'
 import { Brain, ShirtIcon, Camera, Calendar, Plus, User, Heart, Home, Plane, Folder } from 'lucide-react'

 export const navItems = [
   { path: '/', icon: Home, label: 'Home' }, 
   { path: '/wardrobe', icon: ShirtIcon, label: 'Wardrobe' }, 
    // { path: '/add-clothing', icon: Camera, label: 'Add Clothing Item' }, 
    { path: '/create-outfit', icon: Plus, label: 'Create Outfit' }, 
    { path: '/saved-outfit', icon: Heart, label: 'My Outfits' }, 
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/collection', icon: Folder, label: 'Collection' },
    { path: '/travels', icon: Plane, label: 'Travel Lists' },
    { path: '/ai-recommendations', icon: Brain, label: 'AI Recommendation' }, 
    { path: '/profile', icon: User, label: 'Profile' }, 
  ]
