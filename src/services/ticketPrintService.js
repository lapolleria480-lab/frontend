// Servicio de impresión de tickets térmicos para Argentina
import { formatCurrency, formatDate } from "@/lib/formatters"

class TicketPrintService {
  constructor() {
    this.printerName = null
    this.paperWidth = 80 // 58mm o 80mm
  }

  /**
   * Configura el servicio de impresión
   */
  configure(printerName, paperWidth = 80) {
    this.printerName = printerName
    this.paperWidth = paperWidth
  }

  /**
   * Genera el HTML del ticket para impresión
   */
  generateTicketHTML(saleData, businessConfig, ticketConfig) {
    const { sale, items } = saleData
    const width = this.paperWidth === 58 ? '220px' : '300px'
    
    // Determinar tamaño de fuente
    const fontSize = ticketConfig.font_size === 'small' ? '10px' : 
                     ticketConfig.font_size === 'large' ? '14px' : '12px'

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @media print {
            @page {
              margin: 0;
              size: ${this.paperWidth}mm auto;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: ${fontSize};
            line-height: 1.4;
            width: ${width};
            margin: 0 auto;
            padding: 10px;
            color: #000;
          }
          
          .ticket {
            width: 100%;
          }
          
          .center {
            text-align: center;
          }
          
          .bold {
            font-weight: bold;
          }
          
          .separator {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          
          .double-separator {
            border-top: 2px solid #000;
            margin: 8px 0;
          }
          
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          
          .business-name {
            font-size: ${ticketConfig.font_size === 'small' ? '14px' : 
                         ticketConfig.font_size === 'large' ? '18px' : '16px'};
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .info-line {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          
          .item-row {
            margin: 5px 0;
          }
          
          .item-name {
            font-weight: bold;
          }
          
          .item-details {
            display: flex;
            justify-content: space-between;
            font-size: ${ticketConfig.font_size === 'small' ? '9px' : 
                         ticketConfig.font_size === 'large' ? '13px' : '11px'};
          }
          
          .total-section {
            margin-top: 10px;
            font-weight: bold;
          }
          
          .footer {
            text-align: center;
            margin-top: 15px;
            font-size: ${ticketConfig.font_size === 'small' ? '9px' : 
                         ticketConfig.font_size === 'large' ? '13px' : '11px'};
          }
          
          .barcode {
            text-align: center;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
    `

    // Encabezado con información del negocio
    if (ticketConfig.show_business_info && businessConfig) {
      html += `<div class="header">`
      
      if (ticketConfig.show_logo && businessConfig.business_logo) {
        html += `<img src="${businessConfig.business_logo}" style="max-width: 80px; margin-bottom: 5px;" alt="Logo">`
      }
      
      html += `
        <div class="business-name">${businessConfig.business_name || 'MI NEGOCIO'}</div>
      `
      
      if (businessConfig.business_address) {
        html += `<div>${businessConfig.business_address}</div>`
      }
      
      if (businessConfig.business_phone) {
        html += `<div>Tel: ${businessConfig.business_phone}</div>`
      }
      
      if (ticketConfig.show_cuit && businessConfig.business_cuit) {
        html += `<div>CUIT: ${businessConfig.business_cuit}</div>`
      }
      
      if (businessConfig.business_email) {
        html += `<div>${businessConfig.business_email}</div>`
      }
      
      html += `</div>`
    }

    // Mensaje de encabezado personalizado
    if (ticketConfig.header_message) {
      html += `
        <div class="separator"></div>
        <div class="center">${ticketConfig.header_message}</div>
      `
    }

    html += `<div class="double-separator"></div>`

    // Tipo fiscal y número de comprobante
    html += `
      <div class="center bold">
        ${ticketConfig.fiscal_type || 'TICKET'} #${sale.id}
      </div>
      <div class="center">
        ${formatDate(sale.created_at, 'DD/MM/YYYY HH:mm')}
      </div>
    `

    html += `<div class="separator"></div>`

    // Información del cliente
    if (ticketConfig.show_customer && sale.customer_name && sale.customer_name !== 'Consumidor Final') {
      html += `
        <div class="info-line">
          <span>Cliente:</span>
          <span>${sale.customer_name}</span>
        </div>
      `
      
      if (sale.customer_document) {
        html += `
          <div class="info-line">
            <span>DNI/CUIT:</span>
            <span>${sale.customer_document}</span>
          </div>
        `
      }
    }

    // Información del cajero
    if (ticketConfig.show_cashier && sale.cashier_name) {
      html += `
        <div class="info-line">
          <span>Cajero:</span>
          <span>${sale.cashier_name}</span>
        </div>
      `
    }

    html += `<div class="separator"></div>`

    // Detalle de productos
    html += `<div class="bold">DETALLE DE COMPRA</div>`
    html += `<div class="separator"></div>`

    items.forEach(item => {
      const quantity = Number.parseFloat(item.quantity)
      const unitPrice = Number.parseFloat(item.unit_price)
      const totalPrice = Number.parseFloat(item.quantity) * Number.parseFloat(item.unit_price)
      
      // Determinar unidad
      const unit = item.product_unit_type === 'kg' ? 'kg' : 'un'
      
      html += `
        <div class="item-row">
          <div class="item-name">${item.product_name}</div>
          <div class="item-details">
            <span>${quantity} ${unit} x ${formatCurrency(unitPrice)}</span>
            <span>${formatCurrency(totalPrice)}</span>
          </div>
        </div>
      `
    })

    html += `<div class="double-separator"></div>`

    // Totales
    const subtotal = Number.parseFloat(sale.subtotal)
    const tax = Number.parseFloat(sale.tax || 0)
    const total = Number.parseFloat(sale.total)

    html += `
      <div class="info-line">
        <span>Subtotal:</span>
        <span>${formatCurrency(subtotal)}</span>
      </div>
    `

    // Desglose de IVA si está habilitado
    if (ticketConfig.show_tax_breakdown && tax > 0) {
      html += `
        <div class="info-line">
          <span>IVA (21%):</span>
          <span>${formatCurrency(tax)}</span>
        </div>
      `
    }

    html += `
      <div class="double-separator"></div>
      <div class="info-line total-section" style="font-size: ${ticketConfig.font_size === 'small' ? '12px' : 
                                                              ticketConfig.font_size === 'large' ? '16px' : '14px'};">
        <span>TOTAL:</span>
        <span>${formatCurrency(total)}</span>
      </div>
    `

    // Método de pago
    if (ticketConfig.show_payment_method) {
      html += `<div class="separator"></div>`
      
      if (sale.payment_method === 'multiple' && sale.payment_methods_formatted) {
        html += `<div class="bold">FORMAS DE PAGO:</div>`
        sale.payment_methods_formatted.forEach(pm => {
          const methodLabel = this.getPaymentMethodLabel(pm.method)
          html += `
            <div class="info-line">
              <span>${methodLabel}:</span>
              <span>${formatCurrency(pm.amount)}</span>
            </div>
          `
        })
      } else {
        const methodLabel = this.getPaymentMethodLabel(sale.payment_method)
        html += `
          <div class="info-line">
            <span>Forma de pago:</span>
            <span>${methodLabel}</span>
          </div>
        `
      }
    }

    // CAE (AFIP) si está configurado
    if (ticketConfig.include_cae && sale.cae) {
      html += `
        <div class="separator"></div>
        <div class="center">
          <div>CAE: ${sale.cae}</div>
          <div>Vto. CAE: ${sale.cae_expiration}</div>
        </div>
      `
    }

    // Código de barras si está habilitado
    if (ticketConfig.show_barcode) {
      html += `
        <div class="barcode">
          <svg id="barcode-${sale.id}"></svg>
        </div>
      `
    }

    // Política de devoluciones
    if (ticketConfig.return_policy) {
      html += `
        <div class="double-separator"></div>
        <div class="footer">
          <div class="bold">POLÍTICA DE DEVOLUCIONES</div>
          <div>${ticketConfig.return_policy}</div>
        </div>
      `
    }

    // Mensaje de pie de página
    if (ticketConfig.footer_message || businessConfig.business_footer_message) {
      html += `
        <div class="double-separator"></div>
        <div class="footer">
          ${ticketConfig.footer_message || businessConfig.business_footer_message}
        </div>
      `
    }

    // Información adicional del negocio
    if (businessConfig.business_slogan) {
      html += `
        <div class="footer">
          ${businessConfig.business_slogan}
        </div>
      `
    }

    if (businessConfig.business_website) {
      html += `
        <div class="footer">
          ${businessConfig.business_website}
        </div>
      `
    }

    html += `
        </div>
      </body>
      </html>
    `

    return html
  }

  /**
   * Obtiene la etiqueta legible del método de pago
   */
  getPaymentMethodLabel(method) {
    const labels = {
      efectivo: 'Efectivo',
      tarjeta_credito: 'Tarjeta de Crédito',
      tarjeta_debito: 'Tarjeta de Débito',
      transferencia: 'Transferencia',
      cuenta_corriente: 'Cuenta Corriente',
      multiple: 'Múltiples'
    }
    return labels[method] || method
  }

  /**
   * Imprime el ticket usando la API de impresión del navegador
   */
  async printTicket(saleData, businessConfig, ticketConfig) {
    try {
      const html = this.generateTicketHTML(saleData, businessConfig, ticketConfig)
      
      // Crear un iframe oculto para la impresión
      const iframe = document.createElement('iframe')
      iframe.style.position = 'absolute'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = 'none'
      
      document.body.appendChild(iframe)
      
      // Escribir el contenido en el iframe
      const doc = iframe.contentWindow.document
      doc.open()
      doc.write(html)
      doc.close()

      // Esperar a que se cargue el contenido
      await new Promise(resolve => setTimeout(resolve, 250))

      // Imprimir
      iframe.contentWindow.focus()
      iframe.contentWindow.print()

      // Limpiar después de imprimir
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 1000)

      return { success: true }
    } catch (error) {
      console.error('Error al imprimir ticket:', error)
      return { 
        success: false, 
        error: error.message || 'Error al imprimir el ticket'
      }
    }
  }

  /**
   * Vista previa del ticket en una nueva ventana
   */
  previewTicket(saleData, businessConfig, ticketConfig) {
    try {
      const html = this.generateTicketHTML(saleData, businessConfig, ticketConfig)
      
      const previewWindow = window.open('', '_blank', 'width=400,height=600')
      if (!previewWindow) {
        throw new Error('No se pudo abrir la ventana de vista previa. Verifique que las ventanas emergentes estén habilitadas.')
      }
      
      previewWindow.document.write(html)
      previewWindow.document.close()
      
      return { success: true }
    } catch (error) {
      console.error('Error al mostrar vista previa:', error)
      return { 
        success: false, 
        error: error.message || 'Error al mostrar vista previa del ticket'
      }
    }
  }

  /**
   * Descarga el ticket como HTML
   */
  downloadTicket(saleData, businessConfig, ticketConfig) {
    try {
      const html = this.generateTicketHTML(saleData, businessConfig, ticketConfig)
      
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ticket-${saleData.sale.id}-${Date.now()}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      return { success: true }
    } catch (error) {
      console.error('Error al descargar ticket:', error)
      return { 
        success: false, 
        error: error.message || 'Error al descargar el ticket'
      }
    }
  }
}

// Exportar instancia única
const ticketPrintService = new TicketPrintService()
export default ticketPrintService
