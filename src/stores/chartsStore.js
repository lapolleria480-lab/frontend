import { create } from "zustand"
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { chartsService } from "../services/chartsService"
import { productsService } from "../services/productsService"

export const useChartsStore = create((set, get) => ({
  dateRange: {
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  },
  selectedPeriod: "last30days",
  groupBy: "day",
  selectedProductIds: [],
  loading: false,
  error: null,
  products: [],
  chartData: {
    periods: [],
    series: [],
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  setDateRange: (start, end) => {
    set({ dateRange: { start, end } })
    get().fetchChartData()
  },

  setGroupBy: (groupBy) => {
    set({ groupBy })
    get().fetchChartData()
  },

  setSelectedProductIds: (ids) => {
    set({ selectedProductIds: ids })
    get().fetchChartData()
  },

  /** Solo actualiza los IDs sin disparar fetch (ej. al limpiar producto en vista Simple). */
  setSelectedProductIdsOnly: (ids) => set({ selectedProductIds: ids }),

  /** Para vista Simple: un solo producto y siempre por día. Una sola petición. */
  setSimpleProductAndFetch: (productId) => {
    set({ groupBy: "day", selectedProductIds: productId ? [productId] : [] })
    if (productId) get().fetchChartData()
  },

  getDateRangeForPeriod: (period) => {
    const today = new Date()
    let start, end
    switch (period) {
      case "today":
        start = end = format(today, "yyyy-MM-dd")
        break
      case "yesterday": {
        const yesterday = subDays(today, 1)
        start = end = format(yesterday, "yyyy-MM-dd")
        break
      }
      case "last7days":
        start = format(subDays(today, 7), "yyyy-MM-dd")
        end = format(today, "yyyy-MM-dd")
        break
      case "last30days":
        start = format(subDays(today, 30), "yyyy-MM-dd")
        end = format(today, "yyyy-MM-dd")
        break
      case "thisMonth":
        start = format(startOfMonth(today), "yyyy-MM-dd")
        end = format(endOfMonth(today), "yyyy-MM-dd")
        break
      case "lastMonth": {
        const lastMonth = subDays(startOfMonth(today), 1)
        start = format(startOfMonth(lastMonth), "yyyy-MM-dd")
        end = format(endOfMonth(lastMonth), "yyyy-MM-dd")
        break
      }
      case "thisYear":
        start = format(startOfYear(today), "yyyy-MM-dd")
        end = format(endOfYear(today), "yyyy-MM-dd")
        break
      default:
        start = format(subDays(today, 30), "yyyy-MM-dd")
        end = format(today, "yyyy-MM-dd")
    }
    return { start, end }
  },

  /** Actualiza período y fechas sin disparar fetch (para default "Hoy" en tab Simple). */
  setPeriodWithoutFetch: (period) => {
    const { start, end } = get().getDateRangeForPeriod(period)
    set({ selectedPeriod: period, dateRange: { start, end } })
  },

  setPeriod: (period) => {
    const { start, end } = get().getDateRangeForPeriod(period)
    set({ selectedPeriod: period, dateRange: { start, end } })
    get().fetchChartData()
  },

  loadProducts: async () => {
    try {
      const res = await productsService.getProducts({ active: "true", limit: 500 })
      const data = res?.data?.data
      const list = data?.products ?? res?.data?.products ?? []
      const products = Array.isArray(list) ? list : []
      set({ products })
      return products
    } catch (err) {
      console.error("Error cargando productos para gráficos:", err)
      set({ products: [] })
      return []
    }
  },

  fetchChartData: async () => {
    const { dateRange, groupBy, selectedProductIds } = get()
    set({ loading: true, error: null })

    try {
      const params = {
        start_date: dateRange.start,
        end_date: dateRange.end,
        group_by: groupBy,
      }
      if (selectedProductIds.length > 0) {
        params.product_ids = selectedProductIds.join(",")
      }

      const res = await chartsService.getProductSalesByPeriod(params)

      if (res?.data?.success && res.data.data) {
        set({
          chartData: res.data.data,
          loading: false,
        })
      } else {
        set({
          chartData: { periods: [], series: [] },
          loading: false,
        })
      }
    } catch (err) {
      console.error("Error obteniendo datos de gráficos:", err)
      set({
        loading: false,
        error: err.response?.data?.message || err.message || "Error al cargar datos de gráficos",
        chartData: { periods: [], series: [] },
      })
    }
  },

  clearError: () => set({ error: null }),
}))
