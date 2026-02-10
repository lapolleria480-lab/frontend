"use client"

import { useState, useEffect, useRef } from "react"
import { useChartsStore } from "../../stores/chartsStore"
import { formatQuantity, formatPeriodLabelShort, formatDateRangeSubtitle } from "../../lib/formatters"
import LoadingSpinner from "../common/LoadingSpinner"
import { MagnifyingGlassIcon, CalendarIcon } from "@heroicons/react/24/outline"

const SimpleChartsView = () => {
  const {
    products,
    loadProducts,
    dateRange,
    selectedPeriod,
    setPeriod,
    setDateRange,
    setSimpleProductAndFetch,
    setSelectedProductIdsOnly,
    selectedProductIds,
    fetchChartData,
    loading,
    error,
    chartData,
    clearError,
  } = useChartsStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const didInitialFetchForNoProduct = useRef(false)

  const selectedProduct = products.find((p) => p.id === selectedProductIds[0])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    if (selectedProductIds.length > 0) return
    if (didInitialFetchForNoProduct.current) {
      fetchChartData()
    } else {
      didInitialFetchForNoProduct.current = true
    }
  }, [selectedProductIds.length, fetchChartData])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredProducts = searchQuery.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products

  const handleSelectProduct = (product) => {
    setSimpleProductAndFetch(product.id)
    setSearchQuery(product.name)
    setShowDropdown(false)
  }

  const handleClearProduct = () => {
    setSelectedProductIdsOnly([])
    setSearchQuery("")
  }

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value)
  }

  const handleDateChange = (field, value) => {
    const newRange = { ...dateRange, [field]: value }
    setDateRange(newRange.start, newRange.end)
  }

  const periods = [
    { value: "today", label: "Hoy (1 día)" },
    { value: "last7days", label: "Últimos 7 días" },
    { value: "last30days", label: "Últimos 30 días" },
    { value: "thisMonth", label: "Este mes" },
    { value: "custom", label: "Personalizado" },
  ]

  const singleSeries = chartData?.series?.[0]
  const periodsList = chartData?.periods ?? []
  const unitType = singleSeries?.unitType ?? "unidades"
  const productName = singleSeries?.productName ?? selectedProduct?.name ?? ""
  const values = singleSeries?.values ?? []
  const total = values.reduce((sum, v) => sum + Number(v), 0)

  const topProductsByQuantity =
    !selectedProductIds.length && chartData?.series?.length
      ? chartData.series
          .map((s) => ({
            productName: s.productName,
            unitType: s.unitType || "unidades",
            total: (s.values || []).reduce((sum, v) => sum + Number(v), 0),
          }))
          .filter((row) => row.total > 0)
          .sort((a, b) => b.total - a.total)
      : []

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Buscar producto y rango de fechas</h3>

        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Escribí el nombre del producto..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {showDropdown && (
                  <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                    {filteredProducts.length === 0 ? (
                      <li className="px-3 py-2 text-sm text-gray-500">Ningún producto coincide</li>
                    ) : (
                      filteredProducts.slice(0, 50).map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectProduct(p)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 flex justify-between items-center"
                          >
                            <span>{p.name}</span>
                            <span className="text-gray-400 text-xs">
                              {p.unit_type === "kg" ? "kg" : "un."}
                            </span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
              {selectedProductIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearProduct}
                  className="shrink-0 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cambiar
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rango de fechas</label>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-gray-400 shrink-0" />
                <select
                  value={selectedPeriod}
                  onChange={handlePeriodChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {periods.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedPeriod === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => handleDateChange("start", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500 text-sm">hasta</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => handleDateChange("end", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => { clearError(); fetchChartData() }}
            className="text-sm font-medium text-red-600 hover:text-red-800"
          >
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-48 bg-white rounded-lg border border-gray-200">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Cargando reporte...</span>
        </div>
      ) : !selectedProductIds.length ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Productos más vendidos</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatDateRangeSubtitle(dateRange.start, dateRange.end)}
            </p>
          </div>
          <div className="overflow-x-auto">
            {topProductsByQuantity.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay ventas en el período seleccionado. Cambiá el rango de fechas o consultá otro día.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad vendida
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topProductsByQuantity.map((row) => (
                    <tr key={row.productName}>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                        {row.productName}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatQuantity(row.total, row.unitType)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Ventas por día — {productName}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatDateRangeSubtitle(dateRange.start, dateRange.end)}
            </p>
          </div>
          <div className="overflow-x-auto">
            {periodsList.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay ventas de este producto en el período seleccionado.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad vendida
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {periodsList.map((period, i) => (
                    <tr key={`${period}-${i}`}>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatPeriodLabelShort(period)}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatQuantity(values[i] ?? 0, unitType)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">Total</td>
                    <td className="px-6 py-3 text-sm font-semibold text-gray-900 text-right">
                      {formatQuantity(total, unitType)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleChartsView
