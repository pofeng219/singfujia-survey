declare const __APP_BUILD_ID__: string | undefined;

export const CURRENT_BUILD_ID =
    typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : 'dev';

const RELOADED_BUILD_KEY = 'singfujia_reloaded_build_id';
const VERSION_QUERY_PARAM = '_v';

/**
 * Remove any legacy Service Workers and Cache Storage entries that might serve stale HTML/JS
 */
export const clearStaleBrowserCaches = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    try {
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((reg) => reg.unregister()));
        }
    } catch {
        // Ignore browser restrictions on serviceWorker access
    }
    try {
        if ('caches' in window) {
            const keys = await window.caches.keys();
            await Promise.all(keys.map((key) => window.caches.delete(key)));
        }
    } catch {
        // Ignore browser restrictions on Cache Storage access
    }
};

/**
 * Clean temporary cache-busting query param from URL bar once latest version has loaded
 */
export const cleanupVersionQueryParam = (): void => {
    if (typeof window === 'undefined') return;
    try {
        const url = new URL(window.location.href);
        if (url.searchParams.has(VERSION_QUERY_PARAM)) {
            url.searchParams.delete(VERSION_QUERY_PARAM);
            window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        }
    } catch {
        // Ignore URL parsing errors
    }
};

/**
 * Fetch /version.json bypassing caches and return the remote buildId if it differs from CURRENT_BUILD_ID
 */
export const checkServerBuildVersion = async (): Promise<string | null> => {
    if (typeof window === 'undefined' || !CURRENT_BUILD_ID || CURRENT_BUILD_ID === 'dev') {
        return null;
    }
    try {
        const res = await fetch(`/version.json?t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                Pragma: 'no-cache',
            },
        });
        if (!res.ok) return null;
        const payload = (await res.json()) as { buildId?: string };
        const remoteBuildId = typeof payload?.buildId === 'string' ? payload.buildId.trim() : '';
        if (remoteBuildId && remoteBuildId !== CURRENT_BUILD_ID) {
            return remoteBuildId;
        }
        return null;
    } catch {
        return null;
    }
};

/**
 * Force reload to load the newly deployed HTML & hashed bundles, protected against reload loops
 */
export const applyVersionReload = async (
    targetBuildId: string,
    forceManual = false,
): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    try {
        if (!forceManual && sessionStorage.getItem(RELOADED_BUILD_KEY) === targetBuildId) {
            return false;
        }
        sessionStorage.setItem(RELOADED_BUILD_KEY, targetBuildId);
    } catch {
        // Ignore sessionStorage restriction in private mode
    }

    await clearStaleBrowserCaches();

    try {
        const url = new URL(window.location.href);
        url.searchParams.set(VERSION_QUERY_PARAM, targetBuildId);
        window.location.replace(url.toString());
    } catch {
        window.location.reload();
    }
    return true;
};
