"use server"

export const getLinks = async (type = "" as string) => {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/links?type=${type}`, {
      method: "GET",
    });
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching links:", error);
    return [];
  }
};

export const createLink = async (original: string, customShort: string) => {
  const formData = new FormData();
  formData.append("url", original);
  formData.append("short", customShort || "");
  console.log("Creating link with data:", {
    original,
    customShort,
    formData,
  });

  const res = await fetch(`${process.env.BACKEND_URL}/submit`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to create link");

  return true;
};

export const deleteLink = async (id: string) => {
  const res = await fetch(`${process.env.BACKEND_URL}/links/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete link");
  return true;
};