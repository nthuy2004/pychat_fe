import { createContext, useContext, ReactNode } from "react";


const CacheContext = createContext(null);

export function useCache() {
    return useContext(CacheContext);
}

export default function CacheProvider({ children }) {
    const map = new Map();

    function getCache(key) {
        const cacheValue = map.get(key);
        if (!cacheValue) return undefined;
        if (new Date().getTime() > cacheValue.expiry.getTime()) {
            map.delete(key);
            return undefined;
        }
        return cacheValue.data;
    }

    function setCache(key, value, ttl = 10) {
        var t = new Date();
        t.setSeconds(t.getSeconds() + ttl);
        map.set(key, {
            expiry: t,
            data: value
        });
    }

    function clearCache() {
        map.clear();
    }

    function deleteCache(key) {
        map.delete(key);
    }

    const contextValue = {
        getCache,
        setCache,
        clearCache,
        deleteCache
    };

    return (
        <CacheContext.Provider value={contextValue}>
            {children}
        </CacheContext.Provider>
    );
}