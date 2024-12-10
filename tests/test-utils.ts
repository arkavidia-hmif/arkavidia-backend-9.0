export function createRequest(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    url: string,
    body?: object,
    authToken?: string,
    options?: RequestInit
) {
    return new Request(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + authToken,
        },
        body: JSON.stringify(body),
        ...options,
    });
}
