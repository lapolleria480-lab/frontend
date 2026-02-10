// Formateo de moneda argentina
export const formatCurrency = (amount, currency = "ARS") => {
  // Validar que amount sea un número válido
  const numAmount = Number(amount)
  if (isNaN(numAmount)) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(0)
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(numAmount)
}

// Formateo de números
export const formatNumber = (number) => {
  const num = Number(number)
  if (isNaN(num)) return "0"
  return new Intl.NumberFormat("es-AR").format(num)
}

// ACTUALIZADO: Formateo de cantidad con unidad de medida mejorado
export const formatQuantity = (quantity, unitType = "unidades") => {
  const num = Number(quantity)
  if (isNaN(num)) return "0"

  // Para kg, mostrar hasta 3 decimales pero eliminar ceros innecesarios
  if (unitType === "kg") {
    const formattedNumber = num.toFixed(3).replace(/\.?0+$/, "")
    return `${formattedNumber} ${getUnitLabel(unitType)}`
  }

  // Para unidades, mostrar sin decimales
  const formattedNumber = Math.floor(num).toString()
  return `${formattedNumber} ${getUnitLabel(unitType)}`
}

// NUEVO: Obtener etiqueta de unidad
export const getUnitLabel = (unitType) => {
  switch (unitType) {
    case "kg":
      return "kg"
    case "unidades":
    default:
      return "unidades"
  }
}

// ACTUALIZADO: Formateo de stock con unidad mejorado
export const formatStock = (stock, unitType = "unidades", showUnit = true) => {
  const num = Number(stock)
  if (isNaN(num)) return "0"

  let formattedNumber
  if (unitType === "kg") {
    // Para kg, mostrar hasta 3 decimales pero eliminar ceros innecesarios
    formattedNumber = num.toFixed(3).replace(/\.?0+$/, "")
  } else {
    // Para unidades, mostrar sin decimales
    formattedNumber = Math.floor(num).toString()
  }

  if (!showUnit) return formattedNumber

  return `${formattedNumber} ${getUnitLabel(unitType)}`
}

// ACTUALIZADO: Validar cantidad según tipo de unidad
export const validateQuantity = (quantity, unitType) => {
  const num = Number(quantity)
  if (isNaN(num) || num <= 0) return false

  // Para unidades, debe ser entero positivo
  if (unitType === "unidades") {
    return Number.isInteger(num) && num > 0
  }

  // Para kg, permitir decimales positivos (mínimo 0.001)
  if (unitType === "kg") {
    return num >= 0.001
  }

  return true
}

// ACTUALIZADO: Formatear input de cantidad
export const formatQuantityInput = (value, unitType) => {
  if (!value) return ""

  const num = Number(value)
  if (isNaN(num)) return ""

  if (unitType === "kg") {
    // Para kg, mantener hasta 3 decimales pero eliminar ceros innecesarios
    return num.toFixed(3).replace(/\.?0+$/, "")
  }

  // Para unidades, solo enteros
  return Math.floor(Math.abs(num)).toString()
}

// NUEVO: Formatear cantidad para mostrar en movimientos
export const formatMovementQuantity = (quantity, unitType) => {
  const num = Number(quantity)
  if (isNaN(num)) return "0"

  const absNum = Math.abs(num)

  if (unitType === "kg") {
    const formattedNumber = absNum.toFixed(3).replace(/\.?0+$/, "")
    return `${formattedNumber} kg`
  }

  const formattedNumber = Math.floor(absNum).toString()
  return `${formattedNumber} unidades`
}

// NUEVO: Obtener el paso correcto para inputs según tipo de unidad
export const getQuantityStep = (unitType) => {
  return unitType === "kg" ? "0.001" : "1"
}

// NUEVO: Obtener el valor mínimo para inputs según tipo de unidad
export const getQuantityMin = (unitType) => {
  return unitType === "kg" ? "0.001" : "1"
}

// Formateo de fechas
export const formatDate = (date, options = {}) => {
  // Validar que la fecha sea válida
  if (!date) return "Fecha no disponible"

  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return "Fecha inválida"
  }

  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }

  return new Intl.DateTimeFormat("es-AR", { ...defaultOptions, ...options }).format(dateObj)
}

// Formateo de fecha y hora - FUNCIÓN CORREGIDA
export const formatDateTime = (date) => {
  // Validar que la fecha exista y sea válida
  if (!date) {
    return "Fecha no disponible"
  }

  const dateObj = new Date(date)

  // Verificar que la fecha sea válida
  if (isNaN(dateObj.getTime())) {
    console.warn("Invalid date passed to formatDateTime:", date)
    return "Fecha inválida"
  }

  try {
    return new Intl.DateTimeFormat("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(dateObj)
  } catch (error) {
    console.error("Error formatting date:", error, "Date value:", date)
    return "Error al formatear fecha"
  }
}

// Formateo de porcentajes
export const formatPercentage = (value) => {
  const num = Number(value)
  if (isNaN(num)) return "0%"

  return new Intl.NumberFormat("es-AR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(num / 100)
}

// Función auxiliar para validar fechas
export const isValidDate = (date) => {
  if (!date) return false
  const dateObj = new Date(date)
  return !isNaN(dateObj.getTime())
}

/**
 * Parsea un string "YYYY-MM-DD" o ISO ("YYYY-MM-DDTHH:mm:ss.sssZ") como fecha local (no UTC).
 * Evita que new Date("YYYY-MM-DD") se interprete como medianoche UTC y muestre el día anterior en zonas como Argentina.
 */
export const parseLocalDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return null
  let dateOnly = dateStr.trim()
  if (dateOnly.includes("T")) dateOnly = dateOnly.split("T")[0]
  const parts = dateOnly.split("-").map(Number)
  if (parts.length < 3 || parts.some(Number.isNaN)) return null
  const [y, m, d] = parts
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Formatea un valor de período (string YYYY-MM-DD, ISO, o similar) para mostrar en UI.
 * Nunca devuelve el string crudo tipo "2026-02-10T00:00:00.000Z"; siempre fecha legible en español.
 */
export const formatPeriodLabelShort = (period) => {
  if (period == null) return ""
  const str = String(period)
  const match = str.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return str
  const [, y, m, d] = match
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  if (Number.isNaN(date.getTime())) return str
  return date.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })
}

/**
 * Formatea un rango de fechas para subtítulos (ej. "10 feb 2026" o "1 feb – 10 feb 2026").
 */
export const formatDateRangeSubtitle = (startStr, endStr) => {
  const start = parseLocalDate(String(startStr))
  const end = parseLocalDate(String(endStr))
  if (!start || !end) return `${startStr} hasta ${endStr}`
  const same = start.getTime() === end.getTime()
  if (same) return start.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
  return `${start.toLocaleDateString("es-AR", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}`
}

// Función auxiliar para obtener fecha actual formateada
export const getCurrentDateTime = () => {
  return formatDateTime(new Date())
}
