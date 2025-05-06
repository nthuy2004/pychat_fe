import Cookies from "js-cookie";
import CONFIG from "../app.config";

export function request(url, opts = {}) {
    if (!url) {
        throw new Error("A URL is required to make a request");
    }

    opts.headers = opts.headers || {};
    //opts.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;

    if (!opts.method && opts.body) {
        opts.method = "POST";
    }

    if (opts.token) {
        opts.headers["Authorization"] = opts.token;
    }
    else {
        let token = Cookies.get(CONFIG.COOKIE_NAME);
        if (token) {
            opts.headers["Authorization"] = token;
        }
    }

    if (opts.body) {
        if (
            opts.headers &&
            (opts.headers["Content-Type"] || opts.headers["content-type"])
        ) {
            console.log(
                `Custom content-type: ${opts.headers["Content-Type"] || opts.headers["content-type"]
                }`
            );
        } else {
            if (opts.json) {
                opts.headers["Content-Type"] = "application/json";
                opts.body = JSON.stringify(opts.body);
            } else {

                if (opts.body && opts.body instanceof FormData) {
                    console.log("body already FormData");
                }
                else {
                    let formData = new FormData();
                    // TODO: Add header support

                    for (var key in opts.body) {
                        if (opts.body.hasOwnProperty(key)) {
                            formData.append(key, opts.body[key]);
                        }
                    }

                    opts.body = formData;
                }
            }
        }
    }

    opts.credentials = opts.credentials || "omit";
    opts.method = opts.method || "GET";

    return fetch(url, opts)
        .then(async (res) => {
            // console.log("Request:", res);

            if (res.status === 204) {
                return res;
            }

            let data = await res.json()

            if (res.status !== 200) {
                return Promise.reject(data);
            }

            return data;
        })
        .then((json) => {
            if (opts.callback) {
                opts.callback(json);
            }
            return json;
        })
        .catch((err) => {
            return Promise.reject(
                err instanceof Error
                    ? err
                    : new Error(err.message || JSON.stringify(err))
            );
        });
}


export function requestEndpoint(param, opt) {
    return request(CONFIG.SERVICE_AUTH + param, opt);
}