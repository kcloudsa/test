import type { Rental, Unit, UnitMove, MaintenanceRequest } from '@/types/rental'

export interface RentalExportData {
  rentalDetails: any
  unitDetails: any
  financialSummary: any
  financialMovements: any[]
  maintenanceRequests: any[]
  exportDate: string
}

export const exportToJSON = (data: RentalExportData, filename: string) => {
  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  downloadFile(dataBlob, `${filename}.json`)
}

export const exportToCSV = (
  rental: Rental,
  moves: UnitMove[],
  maintenance: MaintenanceRequest[],
  filename: string
) => {
  // Financial movements CSV
  const movesCSV = [
    ['Date', 'Description', 'Type', 'Credit', 'Debit'],
    ...moves.map(move => [
      new Date(move.moveDate).toLocaleDateString(),
      move.description,
      move.moveType.name,
      move.credit.toString(),
      move.debit.toString()
    ])
  ].map(row => row.join(',')).join('\n')

  // Maintenance requests CSV
  const maintenanceCSV = [
    ['Title', 'Description', 'Status', 'Priority', 'Created Date', 'Resolved Date', 'Reported By'],
    ...maintenance.map(request => [
      request.title,
      request.description.replace(/,/g, ';'), // Replace commas to avoid CSV issues
      request.status,
      request.priority,
      new Date(request.createdAt).toLocaleDateString(),
      request.resolvedAt ? new Date(request.resolvedAt).toLocaleDateString() : 'Not resolved',
      request.reportedByUser.name
    ])
  ].map(row => row.join(',')).join('\n')

  // Combine all data
  const fullCSV = [
    '=== RENTAL DETAILS ===',
    `Contract Number,${rental.contractNumber}`,
    `Status,${rental.status}`,
    `Start Date,${new Date(rental.startDate).toLocaleDateString()}`,
    `End Date,${new Date(rental.endDate).toLocaleDateString()}`,
    `Current Price,${rental.currentPrice}`,
    `Security Deposit,${rental.securityDeposit}`,
    `Months Count,${rental.monthsCount}`,
    `Months Left,${rental.restMonthsLeft}`,
    '',
    '=== FINANCIAL MOVEMENTS ===',
    movesCSV,
    '',
    '=== MAINTENANCE REQUESTS ===',
    maintenanceCSV
  ].join('\n')

  const dataBlob = new Blob([fullCSV], { type: 'text/csv' })
  downloadFile(dataBlob, `${filename}.csv`)
}

export const exportToPDF = async (
  rental: Rental,
  unit: Unit | undefined,
  moves: UnitMove[],
  maintenance: MaintenanceRequest[]
) => {
  // Generate PDF content and download as file
  const htmlContent = generatePDFHTML(rental, unit, moves, maintenance)
  const filename = `rental-${rental.contractNumber}-${new Date().toISOString().split('T')[0]}.pdf`
  
  // Create blob with PDF-like content (HTML converted to PDF would need a proper library)
  // For now, we'll create an HTML file that can be saved as PDF
  const htmlBlob = new Blob([htmlContent], { type: 'text/html' })
  downloadFile(htmlBlob, filename.replace('.pdf', '.html'))
  
  // Alternative: If you want actual PDF generation, you'd need to use a library like jsPDF or Puppeteer
  // For demonstration, we'll show how to trigger a proper PDF download
  await generateAndDownloadPDF(htmlContent)
}

const generateAndDownloadPDF = async (htmlContent: string) => {
  // This creates a temporary page that automatically downloads as PDF
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Download PDF</title>
      <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .download-container { text-align: center; padding: 40px; }
        .download-btn { 
          background: #3b82f6; 
          color: white; 
          padding: 12px 24px; 
          border: none; 
          border-radius: 6px; 
          cursor: pointer; 
          font-size: 16px;
          margin-top: 20px;
        }
        .download-btn:hover { background: #2563eb; }
      </style>
    </head>
    <body>
      <div class="download-container">
        <h2>PDF Report Ready</h2>
        <p>Click the button below to download your rental report as PDF:</p>
        <button class="download-btn" onclick="downloadPDF()">Download PDF</button>
        <p><small>Or use Ctrl+P to print and save as PDF</small></p>
      </div>
      
      <div id="pdf-content" style="display: none;">
        ${htmlContent}
      </div>
      
      <script>
        function downloadPDF() {
          // Show the content and trigger print dialog with PDF option
          document.getElementById('pdf-content').style.display = 'block';
          document.querySelector('.download-container').style.display = 'none';
          
          setTimeout(() => {
            window.print();
          }, 100);
        }
        
        // Auto-trigger download after a short delay
        setTimeout(() => {
          downloadPDF();
        }, 1000);
      </script>
    </body>
    </html>
  `)
  
  printWindow.document.close()
}

export const printToPDF = async (
  rental: Rental,
  unit: Unit | undefined,
  moves: UnitMove[],
  maintenance: MaintenanceRequest[]
) => {
  const htmlContent = generatePDFHTML(rental, unit, moves, maintenance)
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  if (!printWindow) return

  printWindow.document.write(htmlContent)
  printWindow.document.close()
  
  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 500)
}

const generatePDFHTML = (
  rental: Rental,
  unit: Unit | undefined,
  moves: UnitMove[],
  maintenance: MaintenanceRequest[]
) => {
  const totalIncome = moves.reduce((sum, move) => sum + move.credit, 0)
  const totalExpenses = moves.reduce((sum, move) => sum + move.debit, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Rental Report - ${rental.contractNumber}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @media print {
          @page {
            margin: 1in;
            size: A4;
          }
          body {
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.4;
          }
          .page-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .no-print {
            display: none !important;
          }
          table {
            font-size: 11px;
          }
          .print-header {
            margin-bottom: 20px;
          }
        }
        @media screen {
          body {
            padding: 20px;
            max-width: 210mm;
            margin: 0 auto;
            background: white;
          }
        }
      </style>
    </head>
    <body class="bg-white text-gray-900 font-sans">
      <div class="max-w-full mx-auto">
        <!-- Header -->
        <div class="text-center border-b-2 border-gray-800 pb-6 mb-8 print-header">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Rental Agreement Report</h1>
          <h2 class="text-lg font-semibold text-blue-600 mb-2">${rental.contractNumber}</h2>
          <p class="text-gray-600 text-sm">Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <!-- Rental Details -->
        <div class="mb-6 page-break">
          <h3 class="text-lg font-semibold text-blue-600 border-b border-gray-200 pb-2 mb-4">Rental Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex justify-between py-1 border-b border-gray-100 text-sm">
                <span class="font-medium text-gray-700">Contract Number:</span>
                <span class="text-gray-900">${rental.contractNumber}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-gray-100 text-sm">
                <span class="font-medium text-gray-700">Status:</span>
                <span class="inline-block px-2 py-1 rounded text-xs font-semibold ${rental.status === 'active' ? 'bg-green-100 text-green-800' : rental.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}">${rental.status}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-gray-100 text-sm">
                <span class="font-medium text-gray-700">Move Type:</span>
                <span class="text-gray-900">${rental.moveType.name}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-gray-100 text-sm">
                <span class="font-medium text-gray-700">Rental Source:</span>
                <span class="text-gray-900">${rental.rentalSource.name}</span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between py-1 border-b border-gray-100 text-sm">
                <span class="font-medium text-gray-700">Start Date:</span>
                <span class="text-gray-900">${formatDate(rental.startDate)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-gray-100 text-sm">
                <span class="font-medium text-gray-700">End Date:</span>
                <span class="text-gray-900">${formatDate(rental.endDate)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-gray-100 text-sm">
                <span class="font-medium text-gray-700">Current Price:</span>
                <span class="text-gray-900 font-semibold">${formatCurrency(rental.currentPrice)}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-gray-100 text-sm">
                <span class="font-medium text-gray-700">Security Deposit:</span>
                <span class="text-gray-900 font-semibold">${formatCurrency(rental.securityDeposit)}</span>
              </div>
            </div>
          </div>
        </div>

        ${unit ? `
        <!-- Unit Information -->
        <div class="mb-6 page-break">
          <h3 class="text-lg font-semibold text-blue-600 border-b border-gray-200 pb-2 mb-4">Unit Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex justify-between py-1 border-b border-gray-100 text-sm">
                <span class="font-medium text-gray-700">Unit Number:</span>
                <span class="text-gray-900">${unit.number}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-gray-100 text-sm">
                <span class="font-medium text-gray-700">Type:</span>
                <span class="text-gray-900">${unit.unitType.name}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-gray-100 text-sm">
                <span class="font-medium text-gray-700">Status:</span>
                <span class="text-gray-900">${unit.unitStatus}</span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between py-1 border-b border-gray-100 text-sm">
                <span class="font-medium text-gray-700">Address:</span>
                <span class="text-gray-900">${unit.location.address}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-gray-100 text-sm">
                <span class="font-medium text-gray-700">City:</span>
                <span class="text-gray-900">${unit.location.city}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-gray-100 text-sm">
                <span class="font-medium text-gray-700">Country:</span>
                <span class="text-gray-900">${unit.location.country}</span>
              </div>
            </div>
          </div>
          <div class="mt-3">
            <div class="flex justify-between py-1 text-sm">
              <span class="font-medium text-gray-700">Description:</span>
              <span class="text-gray-900">${unit.description}</span>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Financial Summary -->
        <div class="mb-6 page-break">
          <h3 class="text-lg font-semibold text-blue-600 border-b border-gray-200 pb-2 mb-4">Financial Summary</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div class="bg-green-50 p-3 rounded-lg border border-green-200">
              <div class="flex justify-between">
                <span class="font-medium text-green-700 text-sm">Total Income:</span>
                <span class="text-green-600 font-bold">${formatCurrency(totalIncome)}</span>
              </div>
            </div>
            <div class="bg-red-50 p-3 rounded-lg border border-red-200">
              <div class="flex justify-between">
                <span class="font-medium text-red-700 text-sm">Total Expenses:</span>
                <span class="text-red-600 font-bold">${formatCurrency(totalExpenses)}</span>
              </div>
            </div>
            <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div class="flex justify-between">
                <span class="font-medium text-blue-700 text-sm">Net Income:</span>
                <span class="${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'} font-bold">${formatCurrency(totalIncome - totalExpenses)}</span>
              </div>
            </div>
          </div>
        </div>

        ${moves.length > 0 ? `
        <!-- Financial Movements -->
        <div class="mb-6 page-break">
          <h3 class="text-lg font-semibold text-blue-600 border-b border-gray-200 pb-2 mb-4">Financial Movements</h3>
          <div class="overflow-hidden border border-gray-200 rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${moves.map(move => `
                  <tr>
                    <td class="px-3 py-2 text-xs text-gray-900">${formatDate(move.moveDate)}</td>
                    <td class="px-3 py-2 text-xs text-gray-900">${move.description}</td>
                    <td class="px-3 py-2 text-xs text-gray-900">${move.moveType.name}</td>
                    <td class="px-3 py-2 text-xs font-medium ${move.credit > 0 ? 'text-green-600' : 'text-gray-400'}">${move.credit > 0 ? formatCurrency(move.credit) : '-'}</td>
                    <td class="px-3 py-2 text-xs font-medium ${move.debit > 0 ? 'text-red-600' : 'text-gray-400'}">${move.debit > 0 ? formatCurrency(move.debit) : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ` : ''}

        ${maintenance.length > 0 ? `
        <!-- Maintenance Requests -->
        <div class="mb-6 page-break">
          <h3 class="text-lg font-semibold text-blue-600 border-b border-gray-200 pb-2 mb-4">Maintenance Requests</h3>
          <div class="overflow-hidden border border-gray-200 rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                  <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${maintenance.map(request => `
                  <tr>
                    <td class="px-3 py-2 text-xs font-medium text-gray-900">${request.title}</td>
                    <td class="px-3 py-2 text-xs">
                      <span class="inline-block px-2 py-1 rounded text-xs font-semibold ${request.status === 'closed' ? 'bg-green-100 text-green-800' : request.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}">${request.status}</span>
                    </td>
                    <td class="px-3 py-2 text-xs">
                      <span class="inline-block px-2 py-1 rounded text-xs font-semibold ${request.priority === 'high' ? 'bg-red-100 text-red-800' : request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">${request.priority}</span>
                    </td>
                    <td class="px-3 py-2 text-xs text-gray-900">${formatDate(request.createdAt)}</td>
                    <td class="px-3 py-2 text-xs text-gray-900">${request.resolvedAt ? formatDate(request.resolvedAt) : 'Not resolved'}</td>
                    <td class="px-3 py-2 text-xs text-gray-900">${request.reportedByUser.name}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ` : ''}

        ${rental.notes ? `
        <!-- Notes -->
        <div class="mb-6 page-break">
          <h3 class="text-lg font-semibold text-blue-600 border-b border-gray-200 pb-2 mb-4">Notes</h3>
          <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p class="text-gray-800 text-sm">${rental.notes}</p>
          </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="text-center text-gray-500 text-xs mt-6 border-t border-gray-200 pt-3">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export const exportToExcel = (
  rental: Rental,
  unit: Unit | undefined,
  moves: UnitMove[],
  maintenance: MaintenanceRequest[],
  filename: string
) => {
  // Create workbook structure with proper typing
  interface Worksheet {
    [key: string]: any
    '!ref'?: string
  }
  
  interface Workbook {
    SheetNames: string[]
    Sheets: { [key: string]: Worksheet }
  }

  const workbook: Workbook = {
    SheetNames: ['Rental Details', 'Financial Movements', 'Maintenance'],
    Sheets: {}
  }

  // Rental Details Sheet
  const rentalDetailsData = [
    ['RENTAL INFORMATION', ''],
    ['Contract Number', rental.contractNumber],
    ['Status', rental.status],
    ['Move Type', rental.moveType.name],
    ['Rental Source', rental.rentalSource.name],
    ['Start Date', new Date(rental.startDate).toLocaleDateString()],
    ['End Date', new Date(rental.endDate).toLocaleDateString()],
    ['Current Price', rental.currentPrice],
    ['Start Price', rental.startPrice],
    ['Security Deposit', rental.securityDeposit],
    ['Months Count', rental.monthsCount],
    ['Months Left', rental.restMonthsLeft],
    ['Roommates', rental.roommates],
    ['Is Monthly', rental.isMonthly ? 'Yes' : 'No'],
    ['', ''],
    ...(unit ? [
      ['UNIT INFORMATION', ''],
      ['Unit Number', unit.number],
      ['Type', unit.unitType.name],
      ['Status', unit.unitStatus],
      ['Address', unit.location.address],
      ['City', unit.location.city],
      ['Country', unit.location.country],
      ['Description', unit.description],
      ['Processing Cost', unit.processingCost],
      ['', '']
    ] : []),
    ...(rental.periodicIncrease ? [
      ['PERIODIC INCREASE', ''],
      ['Increase Value', rental.periodicIncrease.increaseValue],
      ['Periodic Duration', rental.periodicIncrease.periodicDuration],
      ['Is Percentage', rental.periodicIncrease.isPercentage ? 'Yes' : 'No'],
      ['', '']
    ] : []),
    ...(rental.notes ? [
      ['NOTES', ''],
      ['Notes', rental.notes]
    ] : [])
  ]

  // Financial Movements Sheet
  const financialData = [
    ['Date', 'Description', 'Type', 'Credit', 'Debit', 'Net Amount'],
    ...moves.map(move => [
      new Date(move.moveDate).toLocaleDateString(),
      move.description,
      move.moveType.name,
      move.credit,
      move.debit,
      move.credit - move.debit
    ]),
    ['', '', '', '', '', ''],
    ['SUMMARY', '', '', '', '', ''],
    ['Total Income', '', '', moves.reduce((sum, move) => sum + move.credit, 0), '', ''],
    ['Total Expenses', '', '', '', moves.reduce((sum, move) => sum + move.debit, 0), ''],
    ['Net Income', '', '', '', '', moves.reduce((sum, move) => sum + (move.credit - move.debit), 0)]
  ]

  // Maintenance Sheet
  const maintenanceData = [
    ['Title', 'Description', 'Status', 'Priority', 'Created Date', 'Resolved Date', 'Reported By'],
    ...maintenance.map(request => [
      request.title,
      request.description,
      request.status,
      request.priority,
      new Date(request.createdAt).toLocaleDateString(),
      request.resolvedAt ? new Date(request.resolvedAt).toLocaleDateString() : 'Not resolved',
      request.reportedByUser.name
    ])
  ]

  // Convert data to worksheet format
  workbook.Sheets['Rental Details'] = arrayToWorksheet(rentalDetailsData)
  workbook.Sheets['Financial Movements'] = arrayToWorksheet(financialData)
  workbook.Sheets['Maintenance'] = arrayToWorksheet(maintenanceData)

  // Convert to Excel format and download
  const excelBuffer = workbookToExcel(workbook)
  const dataBlob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
  downloadFile(dataBlob, `${filename}.xlsx`)
}

// Helper function to convert array to worksheet with proper typing
const arrayToWorksheet = (data: any[][]): { [key: string]: any } => {
  interface Cell {
    v: any
    t: 's' | 'n' | 'b'
  }
  
  const ws: { [key: string]: any } = {}
  const range = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } }

  for (let R = 0; R < data.length; ++R) {
    for (let C = 0; C < data[R].length; ++C) {
      if (range.s.r > R) range.s.r = R
      if (range.s.c > C) range.s.c = C
      if (range.e.r < R) range.e.r = R
      if (range.e.c < C) range.e.c = C

      const cellRef = encodeCell({ c: C, r: R })
      const cellValue = data[R][C]

      if (cellValue === null || cellValue === undefined) continue

      const cell: Cell = { v: cellValue, t: 's' }

      if (typeof cellValue === 'number') {
        cell.t = 'n'
      } else if (typeof cellValue === 'boolean') {
        cell.t = 'b'
      } else {
        cell.t = 's'
      }

      ws[cellRef] = cell
    }
  }

  if (range.s.c < 10000000) ws['!ref'] = encodeRange(range)
  return ws
}

// Helper function to convert workbook to Excel buffer with proper typing
const workbookToExcel = (workbook: { SheetNames: string[], Sheets: { [key: string]: any } }) => {
  // Simple XLSX generation (basic implementation)
  // In a real application, you'd use a library like xlsx or exceljs
  const xlsxContent = generateBasicXLSX(workbook)
  return xlsxContent
}

// Basic XLSX generation (simplified) with proper typing
const generateBasicXLSX = (workbook: { SheetNames: string[], Sheets: { [key: string]: any } }) => {
  // This is a simplified implementation
  // For production, use a proper library like xlsx or exceljs
  
  let csvContent = ''
  
  // Convert first sheet to CSV format as fallback
  const firstSheetName = workbook.SheetNames[0]
  const firstSheet = workbook.Sheets[firstSheetName]
  
  // Extract data from worksheet
  const data: string[][] = []
  const ref = firstSheet['!ref'] as string | undefined
  if (ref) {
    const range = decodeRange(ref)
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const row: string[] = []
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = encodeCell({ c: C, r: R })
        const cell = firstSheet[cellRef]
        row.push(cell ? String(cell.v) : '')
      }
      data.push(row)
    }
  }
  
  // Convert to CSV
  csvContent = data.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n')
  
  return new TextEncoder().encode(csvContent)
}

// Helper function to decode range
const decodeRange = (range: string) => {
  const parts = range.split(':')
  return {
    s: decodeCell(parts[0]),
    e: decodeCell(parts[1])
  }
}

// Helper function to decode cell reference
const decodeCell = (cellRef: string) => {
  let col = 0
  let row = 0
  let i = 0
  
  // Parse column
  while (i < cellRef.length && cellRef[i] >= 'A' && cellRef[i] <= 'Z') {
    col = col * 26 + (cellRef.charCodeAt(i) - 64)
    i++
  }
  col--
  
  // Parse row
  row = parseInt(cellRef.slice(i)) - 1
  
  return { c: col, r: row }
}

// Helper function to encode cell reference
const encodeCell = (cell: { c: number, r: number }) => {
  let col = ''
  let c = cell.c
  while (c >= 0) {
    col = String.fromCharCode(65 + (c % 26)) + col
    c = Math.floor(c / 26) - 1
  }
  return col + (cell.r + 1)
}

// Helper function to encode range
const encodeRange = (range: { s: { c: number, r: number }, e: { c: number, r: number } }) => {
  return encodeCell(range.s) + ':' + encodeCell(range.e)
}

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}