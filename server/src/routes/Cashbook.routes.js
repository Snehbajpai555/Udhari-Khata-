import express from "express";
import Transaction from "../models/Transaction.js";
import { requireAuth, requireShop, requirePermission } from "../middlewares/auth.js";

const router = express.Router();
router.use(requireAuth, requireShop, requirePermission("transactions"));

router.get("/", async (req, res, next) => {
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

    const transactions = await Transaction.find(filter)
      .populate("customer", "name")
      .populate("supplier", "name")
      .sort({ transactionDate: -1 })
      .limit(500)
      .lean();

    const data = transactions.flatMap((transaction) => {
      let direction = null;
      let amountPaise = 0;
      if (transaction.type === "Payment Received") {
        direction = "Received";
        amountPaise = transaction.amountPaise;
      } else if (transaction.type === "Cash Sale") {
        direction = "Received";
        amountPaise = transaction.amountPaidPaise || 0;
      } else if (transaction.type === "Purchase") {
        direction = "Paid";
        amountPaise = transaction.amountPaidPaise || 0;
      } else if (transaction.type === "Supplier Payment" || transaction.type === "Expense") {
        direction = "Paid";
        amountPaise = transaction.amountPaise;
      }
      if (!direction || amountPaise <= 0) return [];
      return [{
        id: transaction._id,
        date: transaction.transactionDate,
        type: direction,
        description: transaction.description,
        party: transaction.customer?.name || transaction.supplier?.name || "",
        account: transaction.paymentMethod,
        amountPaise,
        reference: transaction.reference,
      }];
    });

    const summary = data.reduce((result, entry) => {
      const directionKey = entry.type === "Received" ? "receivedPaise" : "paidPaise";
      result[directionKey] += entry.amountPaise;
      if (!result.byMethod[entry.account]) {
        result.byMethod[entry.account] = { receivedPaise: 0, paidPaise: 0 };
      }
      result.byMethod[entry.account][directionKey] += entry.amountPaise;
      return result;
    }, { receivedPaise: 0, paidPaise: 0, byMethod: {} });
    summary.netMovementPaise = summary.receivedPaise - summary.paidPaise;

    return res.json({
      success: true,
      data,
      summary: {
        ...summary,
        openingBalancePaise: null,
        closingBalancePaise: null,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
