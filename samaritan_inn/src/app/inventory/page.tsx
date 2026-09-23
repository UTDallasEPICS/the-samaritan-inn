

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function InventoryPage()
{

    return(
    // Outer wrapper for the entire page
    <div className="min-h-screen flex flex-col">

    {/* Imports nav bar */}
      <Navigation />
      
  {/* Main page area */}
  <div className="w-full flex-grow bg-gray-100 p-4 flex flex-col items-center">
    
    {/* Wrapper for the text. */}
    <div className="w-full max-w-4xl p-6 bg-white shadow-md rounded-md">
      
    {/* Main Heading. */}
      <h1 className="text-4xl font-bold mb-4 text-black">
        Inventory
      </h1>
  
    {/* Text */}
      <p className="text-lg text-black">
        The inventory page is there to keep track of content.
      </p>
    </div>
  </div>
</div>

    )

}