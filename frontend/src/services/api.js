const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers: {
                ...(options.body instanceof FormData
                    ? {}
                    : {
                        "Content-Type": "application/json",
                    }),
                ...(options.headers || {}),
            },
        }
    );

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const message =
            data?.detail ||
            data?.message ||
            `Request gagal dengan status ${response.status}.`;

        throw new Error(message);
    }

    return data;
}


/*
 * =========================================================
 * HEALTH CHECK
 * =========================================================
 */

export async function checkBackendHealth() {
    return request("/health");
}


/*
 * =========================================================
 * DIPLOMA OCR
 * =========================================================
 */

export async function processDiplomaOCR(file) {
    const formData = new FormData();

    formData.append("file", file);

    return request("/api/diplomas/ocr", {
        method: "POST",
        body: formData,
    });
}


/*
 * =========================================================
 * SAVE DIPLOMA
 * =========================================================
 */

export async function saveDiploma(data) {
    return request("/api/diplomas/save", {
        method: "POST",
        body: JSON.stringify(data),
    });
}


/*
 * =========================================================
 * ANCHOR DIPLOMA
 * =========================================================
 */

export async function anchorDiploma(diplomaId) {
    return request(
        `/api/verification/anchor/${encodeURIComponent(diplomaId)}`,
        {
            method: "POST",
        }
    );
}


/*
 * =========================================================
 * VERIFY DIPLOMA BY ID
 * =========================================================
 */

export async function verifyDiploma(
    diplomaId,
    source = "api"
) {
    return request(
        `/api/verification/diploma/${encodeURIComponent(
            diplomaId
        )}?source=${encodeURIComponent(source)}`
    );
}


/*
 * =========================================================
 * VERIFY DIPLOMA BY NUMBER
 * =========================================================
 */

export async function verifyDiplomaByNumber(
    diplomaNumber
) {
    return request(
        `/api/verification/number/${encodeURIComponent(
            diplomaNumber
        )}`
    );
}


/*
 * =========================================================
 * VERIFY DIPLOMA DOCUMENT
 * =========================================================
 */

export async function verifyDiplomaDocument(file) {
    const formData = new FormData();

    formData.append("file", file);

    return request(
        "/api/verification/document",
        {
            method: "POST",
            body: formData,
        }
    );
}


/*
 * =========================================================
 * VERIFICATION LOGS
 * =========================================================
 */

export async function getVerificationLogs({
    limit = 50,
    source = null,
    result = null,
} = {}) {
    const params = new URLSearchParams();

    params.set("limit", String(limit));

    if (source) {
        params.set("source", source);
    }

    if (result) {
        params.set("result", result);
    }

    return request(
        `/api/verification/logs?${params.toString()}`
    );
}


/*
 * =========================================================
 * EXPORT DEFAULT API OBJECT
 * =========================================================
 */

const api = {
    checkBackendHealth,
    processDiplomaOCR,
    saveDiploma,
    anchorDiploma,
    verifyDiploma,
    verifyDiplomaByNumber,
    verifyDiplomaDocument,
    getVerificationLogs,
};

export default api;