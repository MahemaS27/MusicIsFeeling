import { useState } from "react";


// this is how you declare the interface for props in typescript!
interface ColorTileProps  {
    name: string
    bgClass: string
    feeling: string
}

export function ColorTile({name, bgClass, feeling}: ColorTileProps) {
    // STATE
    const [isHovered, setIsHovered] = useState(false)

    return <div>
        i am a block!!!
    </div>
}