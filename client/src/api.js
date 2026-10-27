
const API_URL = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
    const token = localStorage.getItem("cybershieldToken");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}

// SIGNUP
export function signupUser(formData) {
    return request("/auth/signup", {
        method: "POST",
        body: JSON.stringify(formData)
    });
}

// LOGIN
export function loginUser(formData) {
    return request("/auth/login", {
        method: "POST",
        body: JSON.stringify(formData)
    });
}

// READ: Get all threats
export function getThreats() {
    return request("/threats");
}

// CREATE: Add a threat
export function createThreat(threatData) {
    return request("/threats", {
        method: "POST",
        body: JSON.stringify(threatData)
    });
}

// UPDATE: Edit a threat
export function updateThreat(id, threatData) {
    return request(`/threats/${id}`, {
        method: "PUT",
        body: JSON.stringify(threatData)
    });
}

// DELETE: Remove a threat
export function deleteThreat(id) {
    return request(`/threats/${id}`, {
        method: "DELETE"
    });
}
