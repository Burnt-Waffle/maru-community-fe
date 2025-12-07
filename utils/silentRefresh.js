import { refreshToken } from "./authClient.js";

export const performSilentRefresh = async () => {
    try {
        await refreshToken();
    } catch (error) {
        console.warn("Silent Refresh failed.", error);
    }
}