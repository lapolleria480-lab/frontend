"use client"

import { useState, useEffect } from "react"
import { useChartsStore } from "../stores/chartsStore"
import LoadingSpinner from "../components/common/LoadingSpinner"
import ChartsFilters from "../components/charts/ChartsFilters"
import ProductSalesChart from "../components/charts/ProductSalesChart"
import SimpleChartsView from "../components/charts/SimpleChartsView"
import { ChartBarIcon, TableCellsIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"

const Charts = () => {
  const [activeTab, setActiveTab] = useState("simple")
  const { loading, error, fetchChartData, clearError, setPeriodWithoutFetch } = useChartsStore()

  useEffect(() => {
    if (activeTab === "simple") {
      setPeriodWithoutFetch("today")
    }
  }, [activeTab, setPeriodWithoutFetch])

  useEffect(() => {
    if (activeTab === "avanzado") {
      fetchChartData()
    }
  }, [activeTab, fetchChartData])

  const tabs = [
    { id: "simple", name: "Simple", icon: TableCellsIcon },
    { id: "avanzado", name: "Avanzado", icon: ChartBarIcon },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gráficos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Consultá ventas por producto por período: vista simple por día o análisis avanzado con gráficos.
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "simple" && <SimpleChartsView />}

      {activeTab === "avanzado" && (
        <>
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
        </>
      )}
    </div>
  )
}

export default Charts
