"use client"

import { useEffect } from "react"
import { useChartsStore } from "../stores/chartsStore"
import LoadingSpinner from "../components/common/LoadingSpinner"
import ChartsFilters from "../components/charts/ChartsFilters"
import ProductSalesChart from "../components/charts/ProductSalesChart"

const Charts = () => {
  const { loading, error, fetchChartData, clearError } = useChartsStore()

  useEffect(() => {
    fetchChartData()
  }, [fetchChartData])

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gráficos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ventas por producto (kg y unidades) por período
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center min-h-64">
          <p className="text-red-600 font-medium mb-2">Error al cargar los datos</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            type="button"
            onClick={() => {
              clearError()
              fetchChartData()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gráficos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ventas por producto (kg y unidades) por período. Por defecto se muestra por día.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Período y productos</h3>
        <ChartsFilters />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-80 bg-white rounded-lg border border-gray-200">
          <LoadingSpinner size="xl" />
          <span className="ml-3 text-gray-600">Cargando datos...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Ventas por producto (kg y unidades)
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Cantidad vendida en el período seleccionado
            </p>
          </div>
          <div className="p-6">
            <ProductSalesChart />
          </div>
        </div>
      )}
    </div>
  )
}

export default Charts
