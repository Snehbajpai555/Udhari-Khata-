export const inventorySeed = [
  { id: 1, name: 'Basmati Rice 25 kg', sku: 'RICE-25', category: 'Grocery', purchasePrice: 145000, sellingPrice: 168000, stock: 18, minimumStock: 8, expiry: '2027-03-31' },
  { id: 2, name: 'Refined Sugar 1 kg', sku: 'SUGAR-1', category: 'Grocery', purchasePrice: 4200, sellingPrice: 5200, stock: 5, minimumStock: 12, expiry: '2027-01-15' },
  { id: 3, name: 'Whole Wheat Atta 10 kg', sku: 'ATTA-10', category: 'Grocery', purchasePrice: 38000, sellingPrice: 44500, stock: 32, minimumStock: 10, expiry: '2026-12-20' },
  { id: 4, name: 'Sunflower Oil 5 litre', sku: 'OIL-5', category: 'Cooking oil', purchasePrice: 62000, sellingPrice: 73500, stock: 4, minimumStock: 6, expiry: '2027-02-28' },
]

export const supplierSeed = [
  { id: 1, name: 'National Suppliers', contact: 'Ramesh Kumar', phone: '9812345670', email: 'accounts@nationalsuppliers.example', purchases: 3200000, paid: 2000000, balance: 1200000, lastPurchase: '2026-11-25' },
  { id: 2, name: 'Sharma Distributors', contact: 'Vikas Sharma', phone: '9899123456', email: 'vikas@sharma.example', purchases: 1850000, paid: 1850000, balance: 0, lastPurchase: '2026-11-20' },
]

export const invoiceSeed = [
  { id: 'INV-1024', customer: 'Amaan Traders', date: '2026-11-26', total: 1850000, paid: 1000000, status: 'Partial', method: 'Cash' },
  { id: 'INV-1023', customer: 'Sharma General Store', date: '2026-11-26', total: 750000, paid: 750000, status: 'Paid', method: 'UPI' },
]

export const cashbookSeed = [
  { id: 1, date: '2026-11-27', type: 'Received', description: 'Customer payment', account: 'Cash', amount: 250000 },
  { id: 2, date: '2026-11-27', type: 'Paid', description: 'Shop electricity bill', account: 'UPI', amount: 48000 },
  { id: 3, date: '2026-11-27', type: 'Received', description: 'Cash sale', account: 'Cash', amount: 620000 },
  { id: 4, date: '2026-11-26', type: 'Paid', description: 'Office supplies', account: 'Bank', amount: 18500 },
]

export const customerSeed = [
  { id: 1, name: 'Amaan Verma', phone: '9876543210', address: 'Station Road, Jaipur', category: 'Retail', balance: 185000, creditLimit: 500000, lastTransaction: '2026-11-26' },
  { id: 2, name: 'Sharma General Store', phone: '9123456789', address: 'Market Chowk, Jaipur', category: 'Wholesale', balance: 75000, creditLimit: 300000, lastTransaction: '2026-11-26' },
  { id: 3, name: 'Priya Medical Store', phone: '9988776655', address: 'Civil Lines, Jaipur', category: 'Retail', balance: 120000, creditLimit: 250000, lastTransaction: '2026-11-24' },
  { id: 4, name: 'Sunita Kirana', phone: '9876101234', address: 'Mansarovar, Jaipur', category: 'Regular', balance: 62000, creditLimit: 150000, lastTransaction: '2026-11-23' },
]

export const transactionSeed = [
  { id: 'VCH-1024', date: '2026-11-26', type: 'Sales Bill', party: 'Amaan Traders', description: 'Rice 25kg, Sugar 10kg', total: 1850000, paid: 1000000, paymentMethod: 'Cash', notes: '' },
  { id: 'VCH-1023', date: '2026-11-26', type: 'Receipt', party: 'Sharma General Store', description: 'Payment received', total: 750000, paid: 750000, paymentMethod: 'UPI', notes: '' },
  { id: 'VCH-1022', date: '2026-11-25', type: 'Purchase Bill', party: 'National Suppliers', description: 'Wheat flour 50kg', total: 3200000, paid: 2000000, paymentMethod: 'Bank Transfer', notes: '' },
  { id: 'VCH-1021', date: '2026-11-24', type: 'Expense', party: 'Electricity office', description: 'Monthly electricity bill', total: 480000, paid: 480000, paymentMethod: 'UPI', notes: '' },
]
