import { useEffect, useState } from "react";
import { CLIENTID } from "../constants/SpotifyConstants";

const redirectURI = window.location.origin + '/';

interface SpotifyTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}

export function useSpotifyAuth() {
    const [tokens, setTokens] = useState<SpotifyTokens | null>(() => {
        // Initialize from sessionStorage if available
        const stored = sessionStorage.getItem('spotify_tokens');
        return stored ? JSON.parse(stored) : null;
    });
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Persist tokens to sessionStorage whenever they change
    useEffect(() => {
        if (tokens) {
            sessionStorage.setItem('spotify_tokens', JSON.stringify(tokens));
        } else {
            sessionStorage.removeItem('spotify_tokens');
        }
    }, [tokens]);

    useEffect(() => {
        const handleAuth = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");
            
            if (code) {
                // Exchange code for tokens
                try {
                    const tokenData = await getAccessToken(CLIENTID, code);
                    const expiresAt = Date.now() + tokenData.expires_in * 1000;
                    
                    setTokens({
                        accessToken: tokenData.access_token,
                        refreshToken: tokenData.refresh_token,
                        expiresAt
                    });
                    
                    const userProfile = await fetchProfile(tokenData.access_token);
                    setProfile(userProfile);
                    
                    // Clean up URL
                    window.history.replaceState({}, document.title, "/");
                    sessionStorage.removeItem("verifier");
                } catch (error) {
                    console.error('Auth error:', error);
                    sessionStorage.removeItem('spotify_tokens');
                } finally {
                    setLoading(false);
                }
            } else if (tokens) {
                // Check if token is expired
                if (Date.now() >= tokens.expiresAt) {
                    try {
                        const refreshedData = await refreshAccessToken(CLIENTID, tokens.refreshToken);
                        const expiresAt = Date.now() + refreshedData.expires_in * 1000;
                        
                        setTokens({
                            accessToken: refreshedData.access_token,
                            refreshToken: refreshedData.refresh_token || tokens.refreshToken,
                            expiresAt
                        });
                        
                        const userProfile = await fetchProfile(refreshedData.access_token);
                        setProfile(userProfile);
                    } catch (error) {
                        console.error('Token refresh error:', error);
                        setTokens(null);
                        setProfile(null);
                    }
                } else {
                    // Use existing valid token
                    try {
                        const userProfile = await fetchProfile(tokens.accessToken);
                        setProfile(userProfile);
                    } catch (error) {
                        console.error('Profile fetch error:', error);
                    }
                }
                setLoading(false);
            } else if (!sessionStorage.getItem("verifier")) {
                // Start auth flow
                await redirectToAuthCodeFlow(CLIENTID);
            } else {
                setLoading(false);
            }
        };
        
        handleAuth();
    }, [tokens]);

    const logout = () => {
        setTokens(null);
        setProfile(null);
        sessionStorage.removeItem('spotify_tokens');
        sessionStorage.removeItem('verifier');
    };

    return { 
        profile, 
        loading, 
        accessToken: tokens?.accessToken || null,
        logout 
    };
}

async function redirectToAuthCodeFlow(clientId: string) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    sessionStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectURI);
    params.append("scope", "user-read-private user-read-email user-read-currently-playing");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length: number) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
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

async function getAccessToken(clientId: string, code: string) {
    const verifier = sessionStorage.getItem("verifier");

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

    if (!result.ok) {
        const data = await result.json();
        throw new Error(data.error_description || 'Failed to get access token');
    }

    return await result.json();
}

async function refreshAccessToken(clientId: string, refreshToken: string) {
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    if (!result.ok) {
        const data = await result.json();
        throw new Error(data.error_description || 'Failed to refresh token');
    }

    return await result.json();
}

async function fetchProfile(token: string) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", 
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!result.ok) {
        throw new Error('Failed to fetch profile');
    }

    return await result.json();
}