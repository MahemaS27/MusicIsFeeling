import { useEffect, useState } from "react";
import { CLIENTID } from "../constants/SpotifyConstants";

const redirectURI = window.location.origin + '/';

interface SpotifyTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}

function getStoredTokens(): SpotifyTokens | null {
    try {
        const stored = localStorage.getItem('spotify_tokens');
        if (!stored) return null;
        return JSON.parse(stored);
    } catch {
        return null;
    }
}

function saveTokens(tokens: SpotifyTokens) {
    localStorage.setItem('spotify_tokens', JSON.stringify(tokens));
    console.log('💾 Tokens saved to localStorage');
}

function clearAllAuth() {
    localStorage.removeItem('spotify_tokens');
    localStorage.removeItem('verifier');
    console.log('🗑️ Cleared all auth data');
}

export function useSpotifyAuth() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        const handleAuth = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const code = params.get("code");
                
                // STEP 1: Coming back from Spotify with code
                if (code) {
                    console.log('📝 Got code from Spotify, exchanging for tokens...');
                    try {
                        const tokenData = await getAccessToken(CLIENTID, code);
                        const expiresAt = Date.now() + (tokenData.expires_in * 1000);
                        
                        const tokens: SpotifyTokens = {
                            accessToken: tokenData.access_token,
                            refreshToken: tokenData.refresh_token,
                            expiresAt
                        };
                        
                        // Save tokens
                        saveTokens(tokens);
                        setAccessToken(tokens.accessToken);
                        
                        const userProfile = await fetchProfile(tokens.accessToken);
                        setProfile(userProfile);
                        
                        // Clean up URL and verifier only
                        window.history.replaceState({}, document.title, "/");
                        localStorage.removeItem('verifier');
                        
                        console.log('✅ Authentication complete!');
                    } catch (error) {
                        console.error('❌ Token exchange failed:', error);
                        clearAllAuth();
                    } finally {
                        setLoading(false);
                    }
                    return;
                }
                
                // STEP 2: Check for existing tokens
                const storedTokens = getStoredTokens();
                
                if (storedTokens) {
                    console.log('✅ Found stored tokens');
                    console.log('Token expires at:', new Date(storedTokens.expiresAt).toLocaleString());
                    console.log('Current time:', new Date().toLocaleString());
                    
                    // Check if token is expired
                    if (Date.now() >= storedTokens.expiresAt) {
                        console.log('⏰ Token expired, refreshing...');
                        try {
                            const refreshedData = await refreshAccessToken(CLIENTID, storedTokens.refreshToken);
                            const expiresAt = Date.now() + (refreshedData.expires_in * 1000);
                            
                            const newTokens: SpotifyTokens = {
                                accessToken: refreshedData.access_token,
                                refreshToken: refreshedData.refresh_token || storedTokens.refreshToken,
                                expiresAt
                            };
                            
                            saveTokens(newTokens);
                            setAccessToken(newTokens.accessToken);
                            
                            const userProfile = await fetchProfile(newTokens.accessToken);
                            setProfile(userProfile);
                            
                            console.log('✅ Token refreshed successfully!');
                        } catch (error) {
                            console.error('❌ Token refresh failed:', error);
                            clearAllAuth();
                            await redirectToAuthCodeFlow(CLIENTID);
                        }
                    } else {
                        console.log('✅ Token still valid, using it!');
                        setAccessToken(storedTokens.accessToken);
                        
                        try {
                            const userProfile = await fetchProfile(storedTokens.accessToken);
                            setProfile(userProfile);
                            console.log('✅ Profile loaded from existing token!');
                        } catch (error) {
                            console.error('❌ Profile fetch failed, token might be invalid:', error);
                            clearAllAuth();
                            await redirectToAuthCodeFlow(CLIENTID);
                        }
                    }
                    setLoading(false);
                    return;
                }
                
                // STEP 3: No tokens, start auth flow
                console.log('🚀 No tokens found, redirecting to Spotify...');
                await redirectToAuthCodeFlow(CLIENTID);
                
            } catch (error) {
                console.error('❌ Auth error:', error);
                clearAllAuth();
                setLoading(false);
            }
        };
        
        handleAuth();
    }, []);

    const logout = () => {
        setProfile(null);
        setAccessToken(null);
        clearAllAuth();
        window.location.reload();
    };

    return { 
        profile, 
        loading, 
        accessToken,
        logout 
    };
}

async function redirectToAuthCodeFlow(clientId: string) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

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

    if (!result.ok) {
        const data = await result.json();
        console.error('Token exchange error:', data);
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
        console.error('Token refresh error:', data);
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