"use client"

import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { useChartsStore } from "../../stores/chartsStore"
import { formatQuantity } from "../../lib/formatters"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const CHART_COLORS = [
  "rgb(59, 130, 246)",
  "rgb(16, 185, 129)",
  "rgb(245, 158, 11)",
  "rgb(239, 68, 68)",
  "rgb(139, 92, 246)",
  "rgb(236, 72, 153)",
  "rgb(20, 184, 166)",
  "rgb(251, 146, 60)",
]

const formatPeriodLabel = (period, groupBy) => {
  if (!period) return ""
  if (groupBy === "month") {
    const [y, m] = String(period).split("-")
    const date = new Date(Number(y), Number(m) - 1, 1)
    return date.toLocaleDateString("es-AR", { month: "short", year: "2-digit" })
  }
  if (groupBy === "week") {
    return `Sem. ${period}`
  }
  const date = new Date(period)
  return date.toLocaleDateString("es-AR", { month: "short", day: "numeric" })
}

const ProductSalesChart = () => {
  const { chartData, groupBy } = useChartsStore()
  const { periods = [], series = [] } = chartData

  if (!periods.length || !series.length) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
        No hay datos de ventas para el período seleccionado. Ajusta las fechas o selecciona productos.
      </div>
    )
  }

  const labels = periods.map((p) => formatPeriodLabel(p, groupBy))

  const datasets = series.map((s, i) => {
    const color = CHART_COLORS[i % CHART_COLORS.length]
    const label = `${s.productName} (${s.unitType === "kg" ? "kg" : "un."})`
    return {
      label,
      data: s.values,
      borderColor: color,
      backgroundColor: color.replace("rgb", "rgba").replace(")", ", 0.1)"),
      fill: false,
      tension: 0.4,
      pointBackgroundColor: color,
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }
  })

  const data = { labels, datasets }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#374151",
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const s = series[context.datasetIndex]
            const unitType = s?.unitType || "unidades"
            return `${context.dataset.label}: ${formatQuantity(context.parsed.y, unitType)}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#6b7280",
          maxRotation: 45,
          font: { size: 11 },
        },
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.06)" },
        ticks: {
          color: "#6b7280",
          font: { size: 12 },
          callback: (value) => (Number(value) % 1 === 0 ? value : value.toFixed(2)),
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  }

  return (
    <div className="h-80">
      <Line data={data} options={options} />
    </div>
  )
}

export default ProductSalesChart
