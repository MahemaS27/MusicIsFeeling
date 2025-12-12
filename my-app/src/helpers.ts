export function createArtistsList(artists: any): string {
    console.log('create Artists List ', artists)
    const artistsList =  artists.map((artist: any)=> artist.name) as Array<string>
    return artistsList.join(',')
}