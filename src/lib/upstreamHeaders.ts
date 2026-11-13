export function getBaseHeaders() {
    const origin = process.env.APP_ORIGIN!;

    return {
        accept: "application/json",
        Origin: origin,
        Referer: `${origin}/`,
    };
}

export function getJsonHeaders() {
    return {
        ...getBaseHeaders(),
        "Content-Type": "application/json",
    };
}

export function getAuthHeaders(token: string) {
    return {
        ...getBaseHeaders(),
        Authorization: token,
    };
}

export function getJsonAuthHeaders(token: string) {
    return {
        ...getBaseHeaders(),
        "Content-Type": "application/json",
        Authorization: token,
    };
}
