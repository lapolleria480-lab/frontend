import api from "@/config/api"

const configService = {
  // Obtener configuración del negocio
  getBusinessConfig: async () => {
    try {
      const response = await api.get("/config/business")
      return response
    } catch (error) {
      console.error("Error en getBusinessConfig:", error)
      throw error
    }
  },

  // Actualizar configuración del negocio
  updateBusinessConfig: async (data) => {
    try {
      const response = await api.put("/config/business", data)
      return response
    } catch (error) {
      console.error("Error en updateBusinessConfig:", error)
      throw error
    }
  },

  // Obtener configuración de tickets
  getTicketConfig: async () => {
    try {
      const response = await api.get("/config/ticket")
      return response
    } catch (error) {
      console.error("Error en getTicketConfig:", error)
      throw error
    }
  },

  // Actualizar configuración de tickets
  updateTicketConfig: async (data) => {
    try {
      const response = await api.put("/config/ticket", data)
      return response
    } catch (error) {
      console.error("Error en updateTicketConfig:", error)
      throw error
    }
  },

  // Obtener toda la configuración
  getAllConfig: async () => {
    try {
      const response = await api.get("/config/all")
      return response
    } catch (error) {
      console.error("Error en getAllConfig:", error)
      throw error
    }
  }
}

export default configService
