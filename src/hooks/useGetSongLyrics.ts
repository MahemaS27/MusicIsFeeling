import { useEffect, useState } from "react";
import { getLyrics} from 'genius-lyrics-api';

export function useGetSongLyrics(accessToken:string|null){
    const [lyrics, setLyrics] = useState<string|null>(null);
    useEffect(()=> {
        const fetchLyrics = async () => {
            if(accessToken){
                try {
                    const options = {
                        apiKey: 'XXXXXXXXXXXXXXXXXXXXXXX',
                        title: 'Posthumous Forgiveness',
                        artist: 'Tame Impala',
                        optimizeQuery: true
                    }
                    getLyrics(options).then((lyrics:string|null) => console.log(lyrics));
                }
            catch(error){
                console.log('Error fetching lyrics:', error)
            } finally{
                console.log('finished fetching lyrics')
            }
        }}
        fetchLyrics()
    }, [accessToken])
}


