export function createArtistsList(artists: any): string {
    const artistsList =  artists.map((artist: any)=> artist.name) as Array<string>
    return artistsList.join(',')
}