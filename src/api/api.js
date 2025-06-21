const API_BASE = "http://localhost:5000"; 
export async function loginUser(username, password) {
  console.log(`API: Attempting login for ${username}`);
  const res = await fetch(
    `${API_BASE}/users?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
  );
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Login request failed" }));
    throw new Error(errorData.message || 'Login request failed');
  }
  const users = await res.json();
  const user = users.length > 0 ? users[0] : null;
  if (user) {
    return { ...user, isAdmin: user.username === 'admin' }; 
  }
  return null; 
}
export async function registerUser(userData) {
  console.log("API: Attempting registration for", userData.username);
  const res = await fetch(`${API_BASE}/register`, { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Registration failed" }));
    throw new Error(errorData.message || "Registration failed");
  }
  return res.json();
}
export async function fetchPackages() {
  const res = await fetch(`${API_BASE}/packages`);
  if (!res.ok) throw new Error("Failed to fetch packages");
  return res.json();
}
export async function fetchPackageById(id) {
  const res = await fetch(`${API_BASE}/packages/${id}`);
  if (!res.ok) throw new Error("Failed to fetch package");
  return res.json();
}
export async function fetchUserBookings(userId) {
  const res = await fetch(`${API_BASE}/bookings?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}
export async function createBooking(bookingData) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });
  if (!res.ok) throw new Error("Failed to create booking");
  return res.json();
}
export const fetchUserExpenses = async (userId, tripId = null) => {
  const url = tripId
    ? `${API_BASE}/expenses?userId=${userId}&tripId=${tripId}`
    : `${API_BASE}/expenses?userId=${userId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch expenses");
  return res.json();
};
export const fetchExpenseById = async (id) => {
  const res = await fetch(`${API_BASE}/expenses/${id}`);
  if (!res.ok) throw new Error("Failed to fetch expense");
  return res.json();
};
export const createExpense = async (expense) => {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  if (!res.ok) throw new Error("Failed to create expense");
  return res.json();
};
export const updateExpense = async (id, expense) => {
  const res = await fetch(`${API_BASE}/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  if (!res.ok) throw new Error("Failed to update expense");
  return res.json();
};
export const deleteExpense = async (id) => {
  const res = await fetch(`${API_BASE}/expenses/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete expense");
  return res.ok;
};
export const createTrip = async (trip) => {
  const res = await fetch(`${API_BASE}/trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trip),
  });
  if (!res.ok) throw new Error("Failed to create trip");
  return res.json();
};
export const fetchTripById = async (id) => {
  const res = await fetch(`${API_BASE}/trips/${id}`);
  if (!res.ok) throw new Error("Trip not found");
  return res.json();
};
export const fetchUserTrips = async (userId) => {
  const res = await fetch(`${API_BASE}/trips?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch trips");
  return res.json();
};
export const updateBooking = async (bookingId, updatedData) => {
  try {
    const response = await fetch(`http://localhost:5000/bookings/${bookingId}`, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error updating booking ${bookingId}:`, error);
    throw error;
  }
};
export const updateTrip = async (id, trip) => {
  const res = await fetch(`${API_BASE}/trips/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trip),
  });
  if (!res.ok) throw new Error("Failed to update trip");
  return res.json();
};
export const deleteTrip = async (id) => {
  const res = await fetch(`${API_BASE}/trips/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete trip");
  return res.ok;
};
export const fetchAllBookings = async () => {
  console.log("Admin API: Fetching all bookings...");
  const res = await fetch(`${API_BASE}/admin/bookings`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Failed to fetch all bookings" }));
    throw new Error(errorData.message || "Failed to fetch all bookings");
  }
  return res.json();
};

export const updateBookingStatus = async (bookingId, newStatus) => {
  console.log(`Admin API: Updating booking ${bookingId} status to ${newStatus}`);
  const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Failed to update booking status" }));
    throw new Error(errorData.message || "Failed to update booking status");
  }
  return res.json();
};
export const fetchAllUsers = async () => {
  console.log("Admin API: Fetching all users...");
  const res = await fetch(`${API_BASE}/admin/users`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Failed to fetch all users" }));
    throw new Error(errorData.message || "Failed to fetch all users");
  }
  return res.json();
};

export const createUser = async (userData) => {
  console.log("Admin API: Creating user", userData);
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Failed to create user" }));
    throw new Error(errorData.message || "Failed to create user");
  }
  return res.json();
};

export const updateUser = async (userId, userData) => {
  console.log(`Admin API: Updating user ${userId}`, userData);
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Failed to update user" }));
    throw new Error(errorData.message || "Failed to update user");
  }
  return res.json();
};

export const deleteUser = async (userId) => {
  console.log(`Admin API: Deleting user ${userId}`);
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "DELETE"
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Failed to delete user" }));
    throw new Error(errorData.message || "Failed to delete user");
  }
  return res.ok; 
};
export const addPackage = async (packageData) => {
  console.log("Admin API: Adding package", packageData);
  const res = await fetch(`${API_BASE}/admin/packages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(packageData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Failed to add package" }));
    throw new Error(errorData.message || "Failed to add package");
  }
  return res.json();
};
export const updatePackage = async (packageId, packageData) => {
  console.log(`Admin API: Updating package ${packageId}`, packageData);
  const res = await fetch(`${API_BASE}/admin/packages/${packageId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(packageData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Failed to update package" }));
    throw new Error(errorData.message || "Failed to update package");
  }
  return res.json();
};
export const deletePackage = async (packageId) => {
  console.log(`Admin API: Deleting package ${packageId}`);
  const res = await fetch(`${API_BASE}/admin/packages/${packageId}`, {
    method: "DELETE"
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Failed to delete package" }));
    throw new Error(errorData.message || "Failed to delete package");
  }
  return res.ok; 
};