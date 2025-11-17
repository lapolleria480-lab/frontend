import { useState, useEffect } from "react"
import { useConfigStore } from "@/stores/configStore"
import { useToast } from "@/contexts/ToastContext"
import Button from "@/components/common/Button"
import LoadingButton from "@/components/common/LoandingButton"
import ticketPrintService from "@/services/ticketPrintService"
import escposFrontendService from "@/services/escposService"
import {
  XMarkIcon,
  PrinterIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline"

const TicketPrintModal = ({ isOpen, onClose, saleData }) => {
  const { businessConfig, ticketConfig, fetchBusinessConfig, fetchTicketConfig } = useConfigStore()
  const { showToast } = useToast()
  const [printing, setPrinting] = useState(false)
  const [copies, setCopies] = useState(1)
  const [useEscpos, setUseEscpos] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (!businessConfig?.business_name) {
        fetchBusinessConfig()
      }
      if (!ticketConfig?.enable_print) {
        fetchTicketConfig()
      }
      setCopies(ticketConfig?.copies_count || 1)
      const escposEnabled = localStorage.getItem('escposEnabled') === 'true'
      setUseEscpos(escposEnabled)
    }
  }, [isOpen, businessConfig, ticketConfig])

  if (!isOpen) return null

  const handlePrintEscpos = async () => {
    setPrinting(true)
    try {
      const printMethod = localStorage.getItem('printMethod') || 'preview'
      
      for (let i = 0; i < copies; i++) {
        const escposCommands = await escposFrontendService.generateEscposCommands(
          saleData.sale.id,
          businessConfig,
          ticketConfig
        )

        let result
        switch (printMethod) {
          case 'bluetooth':
            result = await escposFrontendService.printViaBluetooth(escposCommands)
            break
          case 'serial':
            result = await escposFrontendService.printViaSerialPort(escposCommands)
            break
          case 'local':
            result = await escposFrontendService.printViaLocalServer(escposCommands)
            break
          default:
            result = await escposFrontendService.printViaPreview(escposCommands)
        }

        if (i < copies - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      showToast(
        copies > 1 ? `Se imprimieron ${copies} copias correctamente` : "El ticket se imprimió correctamente",
        "success"
      )
      onClose()
    } catch (error) {
      console.error("Error al imprimir ESC/POS:", error)
      showToast(error.message || "No se pudo imprimir el ticket", "error")
    } finally {
      setPrinting(false)
    }
  }

  const handlePrint = async () => {
    if (useEscpos) {
      return handlePrintEscpos()
    }

    setPrinting(true)
    try {
      ticketPrintService.configure(
        ticketConfig.printer_name,
        ticketConfig.paper_width
      )

      for (let i = 0; i < copies; i++) {
        const result = await ticketPrintService.printTicket(
          saleData,
          businessConfig,
          ticketConfig
        )

        if (!result.success) {
          throw new Error(result.error)
        }

        if (i < copies - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      showToast(
        copies > 1 ? `Se imprimieron ${copies} copias correctamente` : "El ticket se imprimió correctamente",
        "success"
      )

      onClose()
    } catch (error) {
      console.error("Error al imprimir:", error)
      showToast(error.message || "No se pudo imprimir el ticket", "error")
    } finally {
      setPrinting(false)
    }
  }

  const handlePreview = () => {
    ticketPrintService.configure(
      ticketConfig.printer_name,
      ticketConfig.paper_width
    )

    const result = ticketPrintService.previewTicket(
      saleData,
      businessConfig,
      ticketConfig
    )

    if (!result.success) {
      showToast(result.error || "No se pudo mostrar la vista previa", "error")
    }
  }

  const handleDownload = () => {
    ticketPrintService.configure(
      ticketConfig.printer_name,
      ticketConfig.paper_width
    )

    const result = ticketPrintService.downloadTicket(
      saleData,
      businessConfig,
      ticketConfig
    )

    if (result.success) {
      showToast("El ticket se descargó correctamente", "success")
    } else {
      showToast(result.error || "No se pudo descargar el ticket", "error")
    }
  }

  const handleSkip = () => {
    onClose()
  }

  if (!ticketConfig?.enable_print) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Venta Completada
              </h3>
              <p className="text-sm text-gray-500">
                Venta #{saleData?.sale?.id}
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="text-center mb-6">
            <PrinterIcon className="mx-auto h-16 w-16 text-blue-500 mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Imprimir Ticket
            </h4>
            <p className="text-sm text-gray-600">
              ¿Desea imprimir el ticket de esta venta?
            </p>
          </div>

          {/* Información de la venta */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-gray-900">
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS'
                  }).format(saleData?.sale?.total || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente:</span>
                <span className="text-gray-900">
                  {saleData?.sale?.customer_name || 'Consumidor Final'}
                </span>
              </div>
              {ticketConfig?.copies_count > 1 && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Copias:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setCopies(Math.max(1, copies - 1))}
                      className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="font-semibold text-gray-900 w-8 text-center">
                      {copies}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCopies(Math.min(5, copies + 1))}
                      className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <LoadingButton
              onClick={handlePrint}
              loading={printing}
              loadingText="Imprimiendo..."
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg flex items-center justify-center font-medium"
            >
              <PrinterIcon className="h-5 w-5 mr-2" />
              Imprimir Ticket
            </LoadingButton>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePreview}
                className="py-2 text-sm"
              >
                <EyeIcon className="h-4 w-4 mr-1 inline" />
                Vista Previa
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleDownload}
                className="py-2 text-sm"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1 inline" />
                Descargar
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              className="w-full py-2"
            >
              No imprimir
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketPrintModal
