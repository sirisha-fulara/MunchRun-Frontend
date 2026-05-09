import api from "./api";

export const menuService = {
    getAll: (category) => api.get('/menu/', { params: { category } }),
    getItem: (id) => api.get(`/menu/${id}`),
    getCategories: () => api.get("/menu/categories"),
    addItem: (data) => api.post("/menu/", data),
    updateItem: (id, data) => api.put(`/menu/${id}`, data),
    toggleAvailability: (id) => api.patch(`/menu/${id}/toggle`),
    deleteItem: (id) => api.delete(`/menu/${id}`),
}