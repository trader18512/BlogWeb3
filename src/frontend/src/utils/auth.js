import { AuthClient } from "@dfinity/auth-client";

// that is the url of the webapp for the internet identity. 
const IDENTITY_PROVIDER = `http://${process.env.IDENTITY_CANISTER_ID}.${window.location.hostname}:4943`;
const MAX_TTL = 7 * 24 * 60 * 60 * 1000 * 1000 * 1000;

export async function getAuthClient() {
    return await AuthClient.create();
}

export async function getPrincipal() {
    const authClient = await getAuthClient();
    return authClient.getIdentity()?.getPrincipal();
}

export async function getPrincipalText() {
    return (await getPrincipal()).toText();
}

export async function isAuthenticated() {
    try {
        const authClient = await getAuthClient();
        return await authClient.isAuthenticated();
    } catch (err) {
        logout();
    }
}

export async function login() {
    const authClient = await getAuthClient();
    const isAuthenticated = await authClient.isAuthenticated();

    if (!isAuthenticated) {
        console.log('Attempting to log in...'); 

        try {
            await authClient?.login({
                identityProvider: IDENTITY_PROVIDER,
                onSuccess: async () => {
                    console.log('Login successful, reloading page...'); 
                },
                maxTimeToLive: MAX_TTL,
            });
        } catch (err) {
            console.error('An error occurred during login:', err);
        }
    }
}

export async function logout() {
    const authClient = await getAuthClient();
    authClient.logout();
    window.location.reload();
}