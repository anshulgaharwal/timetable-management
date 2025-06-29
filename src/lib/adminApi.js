// src/lib/adminApi.js
import { apiRequest } from "./api"

export async function addProfessor({ name, email, password }) {
  return apiRequest("/api/professors", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role: "professor" }),
  })
}

export async function updateProfessor(id, { name, email, password }) {
  return apiRequest(`/api/professors/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name, email, password }),
  })
}

export async function deleteProfessor(id) {
  return apiRequest(`/api/professors/${id}`, {
    method: "DELETE",
  })
}
