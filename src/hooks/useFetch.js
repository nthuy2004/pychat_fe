//https://dev.to/nisabmohd/create-your-own-api-fetching-caching-mechanism-in-react-49oc
// with my custom fetch

import { useEffect, useState } from "react";
import { useCache } from "../contexts/CacheContext";
import { requestEndpoint } from "../utils/request";

function keyify(key) {
    return key.map((item) => JSON.stringify(item)).join("-");
}

export default function useFetch({
    key,
    initialEnabled = true,
    cache,
    url,
    ...config
}) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState();
    const [error, setError] = useState();
    const { getCache, setCache, deleteCache } = useCache();

    const refetch = (hard = false) => {
        setLoading(true);
        setError(undefined);
        const cacheKey = keyify(key);
        if (cache?.enabled && getCache(cacheKey) !== undefined && !hard) {
            setData(getCache(cacheKey));
            setLoading(false);
            setError(undefined);
            return;
        }

        requestEndpoint(
            url,
            config
        )
            .then((data) => {
                setData(data);
                if (cache?.enabled) setCache(cacheKey, data, cache.ttl);
            })
            .catch((err) => {
                setError(err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    function inValidate(invalidationKey) {
        deleteCache(keyify(invalidationKey));
    }

    useEffect(() => {
        if (initialEnabled) refetch();
    }, []);

    return { loading, data, error, refetch, inValidate };
}