import { useEffect, useState } from "react";
import { createArtistsList } from "../helpers";

export interface Track {
    songTitle: string
    artistName: string
}

export function useGetCurrentlyPlayingTrack(accessToken: string|null){
    const [currentlyPlaying, setCurrentlyPlaying] = useState<Track|null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // note that in react, useEffects themselves cannot be async, you have to create an ASYNC wrapper function. 
        const loadCurrentTrack = async () => {
            console.log('in loadCurrentTrack')
            if (accessToken){
            try {
                const track = await fetchCurrentlyPlayingTrack(accessToken);
                const artists = track.item.artists;
                const artistsList = createArtistsList(artists);
                
                if (track) {
                    const trackObject: Track = {
                        songTitle: track.item.name, 
                        artistName: artistsList
                    };
                    setCurrentlyPlaying(trackObject);
                }
            } catch(error) {
                console.log('error', error);
            } finally {
                setLoading(false);
            }} 
        };

        loadCurrentTrack();
    }, [accessToken]);

    return {currentlyPlaying, loading};
}


async function fetchCurrentlyPlayingTrack(token: string): Promise<any>{
    const result = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        method: 'GET',
        headers: {Authorization: `Bearer ${token}`}
    });
    return result.json()
}