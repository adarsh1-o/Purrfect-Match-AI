const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Retrieve auth token from localStorage if available
function getHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function throwApiError(res: Response, defaultMessage: string): Promise<never> {
  let message = defaultMessage;
  try {
    const err = await res.json();
    if (err && err.detail) {
      if (typeof err.detail === "string") {
        message = err.detail;
      } else if (Array.isArray(err.detail)) {
        message = err.detail.map((d: any) => {
          const field = d.loc ? d.loc.filter((x: any) => x !== "body").join(".") : "";
          return (field ? `${field}: ` : "") + (d.msg || JSON.stringify(d));
        }).join(", ");
      } else {
        message = JSON.stringify(err.detail);
      }
    }
  } catch (_) {}
  throw new Error(message);
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    await throwApiError(res, "Login failed");
  }
  const payload = await res.json();
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", payload.access_token);
    localStorage.setItem("user_role", payload.user.role);
    localStorage.setItem("user_name", payload.user.name);
  }
  return payload.user;
}

export async function signupUser(name: string, email: string, role: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, role, password }),
  });
  if (!res.ok) {
    await throwApiError(res, "Signup failed");
  }
  const user = await res.json();
  return user;
}

export async function fetchCats(filters: { gender?: string; breed?: string; minAge?: number; maxAge?: number; q?: string } = {}) {
  const params = new URLSearchParams();
  if (filters.gender) params.append("gender", filters.gender);
  if (filters.breed) params.append("breed", filters.breed);
  if (filters.minAge !== undefined) params.append("min_age", String(filters.minAge));
  if (filters.maxAge !== undefined) params.append("max_age", String(filters.maxAge));
  if (filters.q) params.append("q", filters.q);

  const res = await fetch(`${API_BASE_URL}/cats/?${params.toString()}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch cats");
  return res.json();
}

export async function fetchCat(id: string) {
  const res = await fetch(`${API_BASE_URL}/cats/${id}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch cat profile");
  return res.json();
}

export async function submitQuestionnaire(data: {
  house_type: string;
  kids: boolean;
  other_pets: boolean;
  experience: string;
  working_hours: number;
  preferred_traits: string;
  play_budget?: string;
  vocal_tolerance?: string;
  grooming_preference?: string;
  ideal_description?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/questionnaire`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to submit questionnaire");
  }
  return res.json();
}

export async function fetchMatchResults() {
  const res = await fetch(`${API_BASE_URL}/results`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch match results");
  return res.json();
}

export async function submitAdoptionRequest(catId: string) {
  const res = await fetch(`${API_BASE_URL}/adoption-request`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ cat_id: catId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to submit adoption request");
  }
  return res.json();
}

export async function updateAdoptionRequestStatus(requestId: string, action: "approve" | "reject") {
  const formData = new FormData();
  formData.append("action", action);

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/adoption-request/${requestId}/status`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to update request status");
  }
  return res.json();
}

export async function fetchDashboardData() {
  const res = await fetch(`${API_BASE_URL}/dashboard`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard records");
  return res.json();
}

export async function uploadBehaviourMedia(catId: string | null | undefined, file: File) {
  const formData = new FormData();
  if (catId) {
    formData.append("cat_id", catId);
  }
  formData.append("file", file);

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/behaviour-analysis`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to perform AI analysis");
  }
  return res.json();
}

export async function fetchBehaviourLogs(catId: string) {
  const res = await fetch(`${API_BASE_URL}/behaviour-logs/${catId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch behaviour logs");
  return res.json();
}

export async function registerCat(formData: FormData) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/cats/`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    await throwApiError(res, "Failed to register new cat");
  }
  return res.json();
}

export async function fetchUserProfile() {
  const res = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    await throwApiError(res, "Failed to load user profile");
  }
  return res.json();
}

export async function updateUserProfile(data: { name: string; address?: string; phone?: string }) {
  const res = await fetch(`${API_BASE_URL}/users/profile`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    await throwApiError(res, "Failed to update profile");
  }
  return res.json();
}

export async function registerCustomPet(formData: FormData) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/users/pets`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    await throwApiError(res, "Failed to register custom pet");
  }
  return res.json();
}

export async function updatePetStatus(catId: string, status: string) {
  const res = await fetch(`${API_BASE_URL}/users/pets/${catId}/status`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    await throwApiError(res, "Failed to update pet status");
  }
  return res.json();
}

export async function transferPet(catId: string, newOwnerEmail: string) {
  const res = await fetch(`${API_BASE_URL}/users/pets/${catId}/transfer`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ new_owner_email: newOwnerEmail }),
  });
  if (!res.ok) {
    await throwApiError(res, "Failed to transfer pet ownership");
  }
  return res.json();
}

export async function deleteCat(catId: string) {
  const res = await fetch(`${API_BASE_URL}/cats/${catId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) {
    await throwApiError(res, "Failed to delete cat profile");
  }
  return res.json();
}
