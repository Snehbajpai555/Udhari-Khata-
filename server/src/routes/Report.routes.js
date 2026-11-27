import express from "express";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import StockMovement from "../models/StockMovement.js";
import Transaction from "../models/Transaction.js";
import { requireAuth, requireShop, requirePermission } from "../middlewares/auth.js";

const router = express.Router();
router.use(requireAuth, requireShop, requirePermission("reports"));

router.get("/summary", async (req, res, next) => {
  try {
    const filter = { shop: req.shopId, status: "Completed" };
    if (req.query.from || req.query.to) {
      filter.transactionDate = {};
      if (req.query.from) filter.transactionDate.$gte = new Date(req.query.from);
      if (req.query.to) {
        const to = new Date(req.query.to);
        to.setHours(23, 59, 59, 999);
        filter.transactionDate.$lte = to;
      }
    }

    const [transactions, customers, suppliers, products, movements] = await Promise.all([
      Transaction.find(filter).lean(),
      Customer.aggregate([{ $match: { shop: req.shopId, active: true } }, { $group: { _id: null, totalPaise: { $sum: "$outstandingPaise" }, count: { $sum: 1 } } }]),
      Supplier.aggregate([{ $match: { shop: req.shopId, active: true } }, { $group: { _id: null, totalPaise: { $sum: "$outstandingPaise" }, count: { $sum: 1 } } }]),
      Product.find({ shop: req.shopId, active: true }).lean(),
      StockMovement.find({ shop: req.shopId, type: "Sale" }).populate("transaction", "status transactionDate").lean(),
    ]);

    const summary = transactions.reduce((totals, transaction) => {
      if (transaction.type === "Cash Sale") {
        totals.salesPaise += transaction.amountPaise;
        totals.receivedPaise += transaction.amountPaidPaise || 0;
      }
      if (transaction.type === "Credit Given") totals.ledgerCreditPaise += transaction.amountPaise;
      if (transaction.type === "Payment Received") totals.receivedPaise += transaction.amountPaise;
      if (transaction.type === "Expense") totals.expensesPaise += transaction.amountPaise;
      if (transaction.type === "Purchase") {
        totals.purchasesPaise += transaction.amountPaise;
        totals.paidToSuppliersPaise += transaction.amountPaidPaise || 0;
      }
      if (transaction.type === "Supplier Payment") totals.paidToSuppliersPaise += transaction.amountPaise;
      return totals;
    }, { salesPaise: 0, ledgerCreditPaise: 0, receivedPaise: 0, expensesPaise: 0, purchasesPaise: 0, paidToSuppliersPaise: 0 });

    const cogsPaise = movements.reduce((total, movement) => {
      if (!movement.transaction || movement.transaction.status !== "Completed") return total;
      if (filter.transactionDate) {
        const date = movement.transaction.transactionDate;
        if (filter.transactionDate.$gte && date < filter.transactionDate.$gte) return total;
        if (filter.transactionDate.$lte && date > filter.transactionDate.$lte) return total;
      }
      return total + Math.abs(movement.quantity) * (movement.unitCostPaise || 0);
    }, 0);

    return res.json({
      success: true,
      data: {
        ...summary,
        cogsPaise,
        grossProfitPaise: summary.salesPaise - cogsPaise,
        customerOutstandingPaise: customers[0]?.totalPaise || 0,
        customerCount: customers[0]?.count || 0,
        supplierOutstandingPaise: suppliers[0]?.totalPaise || 0,
        supplierCount: suppliers[0]?.count || 0,
        inventoryValuationPaise: products.reduce((sum, product) => sum + product.stock * product.purchasePricePaise, 0),
        lowStockProducts: products.filter((product) => product.stock <= product.minimumStock).map((product) => ({
          id: product._id,
          name: product.name,
          stock: product.stock,
          minimumStock: product.minimumStock,
        })),
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
