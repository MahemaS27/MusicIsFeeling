import { useState } from "react";
import { Track } from "./useGetCurrentlyPlayingTrack";


export function useGetRecentListening(accessToken:string|null){
    const [songs, setSongs] = useState<Track[]|null>

    useEffect(()=> {
        const loadSongs = async () => {
            if(accessToken){

            }
        }
    }, [accessToken])
}