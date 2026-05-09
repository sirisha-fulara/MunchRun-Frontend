import api from "./api"

export const orderService = {
  placeOrder: (data) => api.post("/orders/", data),
  myOrders: () => api.get("/orders/my-orders"),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),
  getSlots: () => api.get("/slots/"),
}