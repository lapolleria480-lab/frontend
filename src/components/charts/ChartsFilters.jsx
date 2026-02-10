"use client"

import { useEffect } from "react"
import { useChartsStore } from "../../stores/chartsStore"
import { CalendarIcon, ChartBarIcon } from "@heroicons/react/24/outline"

const ChartsFilters = () => {
  const {
    dateRange,
    selectedPeriod,
    groupBy,
    setPeriod,
    setDateRange,
    setGroupBy,
    setSelectedProductIds,
    loadProducts,
    products,
    selectedProductIds,
  } = useChartsStore()

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const periods = [
    { value: "today", label: "Hoy" },
    { value: "yesterday", label: "Ayer" },
    { value: "last7days", label: "Últimos 7 días" },
    { value: "last30days", label: "Últimos 30 días" },
    { value: "thisMonth", label: "Este mes" },
    { value: "lastMonth", label: "Mes anterior" },
    { value: "thisYear", label: "Este año" },
    { value: "custom", label: "Personalizado" },
  ]

  const groupByOptions = [
    { value: "day", label: "Por día" },
    { value: "week", label: "Por semana" },
    { value: "month", label: "Por mes" },
  ]

  const handleDateChange = (field, value) => {
    const newRange = { ...dateRange, [field]: value }
    setDateRange(newRange.start, newRange.end)
  }

  const handleProductToggle = (id) => {
    const ids = selectedProductIds.includes(id)
      ? selectedProductIds.filter((i) => i !== id)
      : [...selectedProductIds, id]
    setSelectedProductIds(ids)
  }

  const clearProducts = () => setSelectedProductIds([])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-gray-400 shrink-0" />
          <select
            value={selectedPeriod}
            onChange={(e) => setPeriod(e.target.value)}
            className="block w-full min-w-[160px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {selectedPeriod === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateChange("start", e.target.value)}
              className="block px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500 text-sm">hasta</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateChange("end", e.target.value)}
              className="block px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-gray-400 shrink-0" />
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="block min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {groupByOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Filtrar por productos (opcional)
          </label>
          {selectedProductIds.length > 0 && (
            <button
              type="button"
              onClick={clearProducts}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Ver todos
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 border border-gray-200 rounded-lg bg-gray-50">
          {products.length === 0 ? (
            <span className="text-sm text-gray-500 py-1">Cargando productos...</span>
          ) : (
            products.map((p) => (
              <label
                key={p.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedProductIds.includes(p.id)}
                  onChange={() => handleProductToggle(p.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {p.name}
                  <span className="text-gray-400 ml-1">({p.unit_type === "kg" ? "kg" : "un."})</span>
                </span>
              </label>
            ))
          )}
        </div>
        <p className="text-xs text-gray-500">
          Si no seleccionas ningún producto, se muestran todos los que tuvieron ventas en el período.
        </p>
      </div>
    </div>
  )
}

export default ChartsFilters
