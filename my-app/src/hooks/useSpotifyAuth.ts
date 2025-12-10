import { useEffect, useState } from "react";

const clientId = '0b5b54f0a405487c9991bdcca27c3197'
const redirectURI = window.location.origin + '/';


export function useSpotifyAuth(){
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const handleAuth = async () => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        
        if (code) {
            // We have a code from Spotify callback, exchange it for token
            try {
                const accessToken = await getAccessToken(clientId, code);
                const userProfile = await fetchProfile(accessToken);
                console.log(userProfile);
                setProfile(userProfile);
                window.history.replaceState({}, document.title, "/");
                localStorage.removeItem("verifier");
            } catch (error) {
                console.error('Auth error:', error);
            } finally {
                setLoading(false);
            }
        } else if (!localStorage.getItem("verifier")) {
            // No code and no verifier stored, start the auth flow
            await redirectToAuthCodeFlow(clientId);
        } else {
            // Waiting for redirect back from Spotify
            setLoading(false);
        }
    };
    
    handleAuth();
}, []);

    return {profile, loading}
}


async function redirectToAuthCodeFlow(clientId: string) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectURI); // Now uses the constant
    params.append("scope", "user-read-private user-read-email");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(digest);
    
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}


async function getAccessToken(clientId: string, code: string): Promise<string> {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectURI);
    params.append("code_verifier", verifier!);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const data = await result.json();
    console.log('Token response:', data); // Check for errors
    
    if (!result.ok) {
        console.error('Token error:', data);
        throw new Error(data.error_description || 'Failed to get access token');
    }

    return data.access_token;
}

async function fetchProfile(token: string): Promise<any> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}
