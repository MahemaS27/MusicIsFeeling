import { useEffect, useState } from "react";
import { Track } from "./useGetCurrentlyPlayingTrack";
import { createArtistsList } from "../helpers";


export function useGetRecentListening(accessToken:string|null){
    const [songs, setSongs] = useState<Track[]>([])

    useEffect(()=> {
        const loadSongs = async () => {
            if(accessToken){
                try{
                    const recentListening = await fetchRecentListening(accessToken)
                    if(recentListening.items){
                        console.log('recent listening ', recentListening)
                        const recentListenedTracks:Track[] = recentListening.items.map((item:any)=> {
                            const artists = item.track.artists
                            const artistsList = createArtistsList(artists);
                            return {songTitle: item.track.name, artistName: artistsList }
                        })
                        setSongs(recentListenedTracks)
                    }
                }
            catch(error){
                console.log('error fetching recent listing', error)
            } finally {
                console.log('finished fetching recent listening')
            }}
            
        }
        loadSongs()
    }, [accessToken, setSongs])
    return {songs}
}


async function fetchRecentListening(token:string): Promise<any>{
    const result = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
        method: 'GET',
        headers: {Authorization: `Bearer ${token}`}
    });
    return result.json()
}