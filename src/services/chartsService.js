import api from "@/config/api"

export const chartsService = {
  /**
   * Obtiene ventas por producto (kg y unidades) agrupadas por período.
   * @param {Object} params - start_date, end_date, group_by (day|week|month), product_ids (opcional, string separada por comas)
   */
  getProductSalesByPeriod: async (params = {}) => {
    const queryParams = new URLSearchParams()

    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
        queryParams.append(key, params[key])
      }
    })

    const queryString = queryParams.toString()
    const url = queryString ? `/reports/charts/product-sales?${queryString}` : "/reports/charts/product-sales"

    return await api.get(url)
  },
}
