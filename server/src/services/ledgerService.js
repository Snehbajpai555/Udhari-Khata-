import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";
import StockMovement from "../models/StockMovement.js";
import AuditLog from "../models/AuditLog.js";
import Expense from "../models/Expense.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import Counter from "../models/Counter.js";

async function nextReference(prefix, model) {
  const counterId = `reference:${prefix}`;
  let counter = await Counter.findById(counterId).lean();
  if (!counter) {
    const references = await model.find({
      reference: new RegExp(`^${prefix}-(\\d+)$`),
    }).select("reference").lean();
    const initialSequence = references.reduce((highest, item) => {
      const sequence = Number(item.reference.slice(prefix.length + 1));
      return Number.isSafeInteger(sequence) ? Math.max(highest, sequence) : highest;
    }, 1000);
    try {
      await Counter.updateOne(
        { _id: counterId },
        { $setOnInsert: { sequence: initialSequence } },
        { upsert: true },
      );
    } catch (error) {
      if (error?.code !== 11000) throw error;
    }
  }

  counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { sequence: 1 } },
    { returnDocument: "after" },
  ).lean();
  if (!counter) throw new Error(`Could not allocate a ${prefix} reference.`);
  return `${prefix}-${counter.sequence}`;
}

async function replayIdempotentDuplicate(error, shopId, idempotencyKey) {
  const isIdempotencyDuplicate = error?.code === 11000 && (
    error.keyPattern?.idempotencyKey ||
    error.message?.includes("shop_1_idempotencyKey_1")
  );
  if (!isIdempotencyDuplicate || !idempotencyKey) return null;
  return Transaction.findOne({ shop: shopId, idempotencyKey }).lean();
}

async function audit(session, data) {
  await AuditLog.create([data], { session });
}

async function existingByIdempotency(shopId, idempotencyKey, session) {
  if (!idempotencyKey) return null;
  return Transaction.findOne({ shop: shopId, idempotencyKey }).session(session);
}

export async function createCredit({ shopId, actorId, customerId, amountPaise, paymentMethod, description, transactionDate, idempotencyKey, ipAddress }) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const existing = await existingByIdempotency(shopId, idempotencyKey, session);
      if (existing) { result = existing; return; }
      const customer = await Customer.findOne({ _id: customerId, shop: shopId }).session(session);
      if (!customer) throw Object.assign(new Error("Customer not found in this shop."), { statusCode: 404 });
      if (customer.creditLimitPaise > 0 && customer.outstandingPaise + amountPaise > customer.creditLimitPaise) {
        throw Object.assign(new Error("Credit limit exceeded."), { statusCode: 422 });
      }
      const before = customer.outstandingPaise;
      customer.outstandingPaise += amountPaise;
      await customer.save({ session });
      const [transaction] = await Transaction.create([{
        shop: shopId,
        reference: await nextReference("VCH", Transaction),
        idempotencyKey: idempotencyKey || null,
        type: "Credit Given",
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        customer: customer._id,
        amountPaise,
        amountPaidPaise: 0,
        paymentMethod: paymentMethod || "Credit",
        description,
        createdBy: actorId,
      }], { session });
      await audit(session, {
        shop: shopId,
        actor: actorId,
        action: "CUSTOMER_CREDIT",
        entityType: "Customer",
        entityId: customer._id,
        before: { outstandingPaise: before },
        after: { outstandingPaise: customer.outstandingPaise },
        ipAddress,
      });
      result = transaction;
    });
    return result;
  } catch (error) {
    const replay = await replayIdempotentDuplicate(error, shopId, idempotencyKey);
    if (replay) return replay;
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function createPayment({ shopId, actorId, customerId, amountPaise, paymentMethod, description, transactionDate, idempotencyKey, ipAddress }) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const existing = await existingByIdempotency(shopId, idempotencyKey, session);
      if (existing) { result = existing; return; }
      const customer = await Customer.findOne({ _id: customerId, shop: shopId }).session(session);
      if (!customer) throw Object.assign(new Error("Customer not found in this shop."), { statusCode: 404 });
      if (amountPaise > customer.outstandingPaise) {
        throw Object.assign(new Error("Payment cannot exceed customer outstanding balance."), { statusCode: 422 });
      }
      const before = customer.outstandingPaise;
      customer.outstandingPaise -= amountPaise;
      await customer.save({ session });
      const [transaction] = await Transaction.create([{
        shop: shopId,
        reference: await nextReference("VCH", Transaction),
        idempotencyKey: idempotencyKey || null,
        type: "Payment Received",
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        customer: customer._id,
        amountPaise,
        amountPaidPaise: amountPaise,
        paymentMethod: paymentMethod || "Cash",
        description,
        createdBy: actorId,
      }], { session });
      await Payment.create([{
        shop: shopId,
        transaction: transaction._id,
        partyType: "Customer",
        party: customer._id,
        amountPaise,
        method: paymentMethod || "Cash",
        createdBy: actorId,
      }], { session });
      await audit(session, {
        shop: shopId,
        actor: actorId,
        action: "PAYMENT_RECEIVED",
        entityType: "Customer",
        entityId: customer._id,
        before: { outstandingPaise: before },
        after: { outstandingPaise: customer.outstandingPaise },
        ipAddress,
      });
      result = transaction;
    });
    return result;
  } catch (error) {
    const replay = await replayIdempotentDuplicate(error, shopId, idempotencyKey);
    if (replay) return replay;
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function createSale({ shopId, actorId, customerId, items, amountPaidPaise, paymentMethod, idempotencyKey, ipAddress }) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const existing = await existingByIdempotency(shopId, idempotencyKey, session);
      if (existing) { result = existing; return; }

      let totalPaise = 0;
      const resolvedItems = [];
      const quantities = new Map();
      for (const item of items) {
        quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
      }
      for (const [productId, quantity] of quantities) {
        const product = await Product.findOne({ _id: productId, shop: shopId }).session(session);
        if (!product) throw Object.assign(new Error("Product not found in this shop."), { statusCode: 404 });
        if (product.stock < quantity) throw Object.assign(new Error(`Insufficient stock for ${product.name}.`), { statusCode: 422 });
        totalPaise += product.sellingPricePaise * quantity;
        resolvedItems.push({ product, quantity });
      }
      if (amountPaidPaise > totalPaise) throw Object.assign(new Error("Amount paid cannot exceed sale total."), { statusCode: 422 });

      const customer = customerId
        ? await Customer.findOne({ _id: customerId, shop: shopId }).session(session)
        : null;
      if (customerId && !customer) throw Object.assign(new Error("Customer not found in this shop."), { statusCode: 404 });
      const creditPaise = totalPaise - amountPaidPaise;
      if (customer) {
        if (customer.creditLimitPaise > 0 && customer.outstandingPaise + creditPaise > customer.creditLimitPaise) {
          throw Object.assign(new Error("Customer credit limit exceeded."), { statusCode: 422 });
        }
        customer.outstandingPaise += creditPaise;
        await customer.save({ session });
      }

      const [transaction] = await Transaction.create([{
        shop: shopId,
        reference: await nextReference("VCH", Transaction),
        idempotencyKey: idempotencyKey || null,
        type: "Cash Sale",
        customer: customer?._id || null,
        amountPaise: totalPaise,
        amountPaidPaise,
        paymentMethod: paymentMethod || "Cash",
        description: "Sale invoice",
        createdBy: actorId,
      }], { session });
      if (customer && amountPaidPaise > 0) {
        await Payment.create([{
          shop: shopId,
          transaction: transaction._id,
          partyType: "Customer",
          party: customer._id,
          amountPaise: amountPaidPaise,
          method: paymentMethod || "Cash",
          createdBy: actorId,
        }], { session });
      }

      await Invoice.create([{
        shop: shopId,
        customer: customer?._id || null,
        transaction: transaction._id,
        reference: await nextReference("INV", Invoice),
        items: resolvedItems.map(({ product, quantity }) => ({
          product: product._id,
          quantity,
          unitPricePaise: product.sellingPricePaise,
          lineTotalPaise: product.sellingPricePaise * quantity,
        })),
        subtotalPaise: totalPaise,
        discountPaise: 0,
        totalPaise,
        amountPaidPaise,
        status: amountPaidPaise === totalPaise ? "Paid" : amountPaidPaise > 0 ? "Partial" : "Unpaid",
        paymentMethod: paymentMethod || "Cash",
        createdBy: actorId,
      }], { session });

      for (const item of resolvedItems) {
        item.product.stock -= item.quantity;
        await item.product.save({ session });
        await StockMovement.create([{
          shop: shopId,
          product: item.product._id,
          transaction: transaction._id,
          type: "Sale",
          quantity: -item.quantity,
          balanceAfter: item.product.stock,
          unitCostPaise: item.product.purchasePricePaise,
          reason: "Sale",
          createdBy: actorId,
        }], { session });
      }
      await audit(session, {
        shop: shopId,
        actor: actorId,
        action: "SALE_CREATED",
        entityType: "Transaction",
        entityId: transaction._id,
        before: null,
        after: { amountPaise: totalPaise, amountPaidPaise, customerId: customer?._id || null },
        ipAddress,
      });
      result = transaction;
    });
    return result;
  } catch (error) {
    const replay = await replayIdempotentDuplicate(error, shopId, idempotencyKey);
    if (replay) return replay;
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function createPurchase({ shopId, actorId, supplierId, items, amountPaidPaise, paymentMethod, idempotencyKey, ipAddress }) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const existing = await existingByIdempotency(shopId, idempotencyKey, session);
      if (existing) { result = existing; return; }
      const supplier = await Supplier.findOne({ _id: supplierId, shop: shopId }).session(session);
      if (!supplier) throw Object.assign(new Error("Supplier not found in this shop."), { statusCode: 404 });

      let totalPaise = 0;
      const resolvedItems = [];
      const quantities = new Map();
      for (const item of items) {
        quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
      }
      for (const [productId, quantity] of quantities) {
        const product = await Product.findOne({ _id: productId, shop: shopId }).session(session);
        if (!product) throw Object.assign(new Error("Product not found in this shop."), { statusCode: 404 });
        totalPaise += product.purchasePricePaise * quantity;
        resolvedItems.push({ product, quantity });
      }
      if (amountPaidPaise > totalPaise) throw Object.assign(new Error("Amount paid cannot exceed purchase total."), { statusCode: 422 });

      supplier.outstandingPaise += totalPaise - amountPaidPaise;
      await supplier.save({ session });
      const [transaction] = await Transaction.create([{
        shop: shopId,
        reference: await nextReference("VCH", Transaction),
        idempotencyKey: idempotencyKey || null,
        type: "Purchase",
        supplier: supplier._id,
        amountPaise: totalPaise,
        amountPaidPaise,
        paymentMethod: paymentMethod || "Cash",
        description: "Supplier purchase",
        createdBy: actorId,
      }], { session });
      for (const item of resolvedItems) {
        item.product.stock += item.quantity;
        await item.product.save({ session });
        await StockMovement.create([{
          shop: shopId,
          product: item.product._id,
          transaction: transaction._id,
          type: "Purchase",
          quantity: item.quantity,
          balanceAfter: item.product.stock,
          unitCostPaise: item.product.purchasePricePaise,
          reason: "Supplier purchase",
          createdBy: actorId,
        }], { session });
      }
      await audit(session, {
        shop: shopId,
        actor: actorId,
        action: "PURCHASE_CREATED",
        entityType: "Transaction",
        entityId: transaction._id,
        before: null,
        after: { amountPaise: totalPaise, amountPaidPaise, supplierId: supplier._id },
        ipAddress,
      });
      result = transaction;
    });
    return result;
  } catch (error) {
    const replay = await replayIdempotentDuplicate(error, shopId, idempotencyKey);
    if (replay) return replay;
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function createExpense({ shopId, actorId, category, amountPaise, paymentMethod, description, expenseDate, idempotencyKey, ipAddress }) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const existing = await existingByIdempotency(shopId, idempotencyKey, session);
      if (existing) { result = existing; return; }
      const [transaction] = await Transaction.create([{
        shop: shopId,
        reference: await nextReference("VCH", Transaction),
        idempotencyKey: idempotencyKey || null,
        type: "Expense",
        transactionDate: expenseDate ? new Date(expenseDate) : new Date(),
        amountPaise,
        amountPaidPaise: amountPaise,
        paymentMethod: paymentMethod || "Cash",
        description,
        createdBy: actorId,
      }], { session });
      await Expense.create([{
        shop: shopId,
        transaction: transaction._id,
        category,
        amountPaise,
        paymentMethod: paymentMethod || "Cash",
        description,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        createdBy: actorId,
      }], { session });
      await audit(session, {
        shop: shopId,
        actor: actorId,
        action: "EXPENSE_CREATED",
        entityType: "Expense",
        entityId: transaction._id,
        before: null,
        after: { category, amountPaise, paymentMethod },
        ipAddress,
      });
      result = transaction;
    });
    return result;
  } catch (error) {
    const replay = await replayIdempotentDuplicate(error, shopId, idempotencyKey);
    if (replay) return replay;
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function createSupplierPayment({ shopId, actorId, supplierId, amountPaise, paymentMethod, description, idempotencyKey, ipAddress }) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const existing = await existingByIdempotency(shopId, idempotencyKey, session);
      if (existing) { result = existing; return; }
      const supplier = await Supplier.findOne({ _id: supplierId, shop: shopId }).session(session);
      if (!supplier) throw Object.assign(new Error("Supplier not found in this shop."), { statusCode: 404 });
      if (amountPaise > supplier.outstandingPaise) throw Object.assign(new Error("Payment cannot exceed supplier outstanding balance."), { statusCode: 422 });
      const before = supplier.outstandingPaise;
      supplier.outstandingPaise -= amountPaise;
      await supplier.save({ session });
      const [transaction] = await Transaction.create([{
        shop: shopId,
        reference: await nextReference("VCH", Transaction),
        idempotencyKey: idempotencyKey || null,
        type: "Supplier Payment",
        supplier: supplier._id,
        amountPaise,
        amountPaidPaise: amountPaise,
        paymentMethod: paymentMethod || "Cash",
        description,
        createdBy: actorId,
      }], { session });
      await Payment.create([{
        shop: shopId,
        transaction: transaction._id,
        partyType: "Supplier",
        party: supplier._id,
        amountPaise,
        method: paymentMethod || "Cash",
        createdBy: actorId,
      }], { session });
      await audit(session, {
        shop: shopId,
        actor: actorId,
        action: "SUPPLIER_PAYMENT",
        entityType: "Supplier",
        entityId: supplier._id,
        before: { outstandingPaise: before },
        after: { outstandingPaise: supplier.outstandingPaise },
        ipAddress,
      });
      result = transaction;
    });
    return result;
  } catch (error) {
    const replay = await replayIdempotentDuplicate(error, shopId, idempotencyKey);
    if (replay) return replay;
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function reverseTransaction({ shopId, actorId, transactionId, ipAddress }) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const original = await Transaction.findOne({ _id: transactionId, shop: shopId }).session(session);
      if (!original) throw Object.assign(new Error("Transaction not found in this shop."), { statusCode: 404 });
      if (original.status === "Reversed") throw Object.assign(new Error("Transaction is already reversed."), { statusCode: 409 });

      if (original.customer) {
        const customer = await Customer.findOne({ _id: original.customer, shop: shopId }).session(session);
        if (customer) {
          if (original.type === "Credit Given" && customer.outstandingPaise < original.amountPaise) {
            throw Object.assign(new Error("Cannot reverse this credit while later payments are applied. Reverse those payments first."), { statusCode: 422 });
          }
          if (original.type === "Credit Given") customer.outstandingPaise -= original.amountPaise;
          if (original.type === "Payment Received") customer.outstandingPaise += original.amountPaise;
          if (original.type === "Cash Sale") {
            const creditPaise = original.amountPaise - (original.amountPaidPaise || 0);
            if (customer.outstandingPaise < creditPaise) {
              throw Object.assign(new Error("Cannot reverse this sale while later payments are applied. Reverse those payments first."), { statusCode: 422 });
            }
            customer.outstandingPaise -= creditPaise;
          }
          await customer.save({ session });
        }
      }
      if (original.supplier) {
        const supplier = await Supplier.findOne({ _id: original.supplier, shop: shopId }).session(session);
        if (supplier) {
          if (original.type === "Purchase") {
            const creditPaise = original.amountPaise - (original.amountPaidPaise || 0);
            if (supplier.outstandingPaise < creditPaise) {
              throw Object.assign(new Error("Cannot reverse this purchase while later payments are applied. Reverse those payments first."), { statusCode: 422 });
            }
            supplier.outstandingPaise -= creditPaise;
          }
          if (original.type === "Supplier Payment") supplier.outstandingPaise += original.amountPaise;
          await supplier.save({ session });
        }
      }

      if (original.type === "Cash Sale" || original.type === "Purchase") {
        const movements = await StockMovement.find({ shop: shopId, transaction: original._id }).session(session);
        for (const movement of movements) {
          const product = await Product.findOne({ _id: movement.product, shop: shopId }).session(session);
          if (!product) continue;
          if (original.type === "Cash Sale") product.stock += Math.abs(movement.quantity);
          if (original.type === "Purchase") {
            if (product.stock < Math.abs(movement.quantity)) {
              throw Object.assign(new Error(`Cannot reverse this purchase because ${product.name} stock has since been sold.`), { statusCode: 422 });
            }
            product.stock -= Math.abs(movement.quantity);
          }
          await product.save({ session });
          await StockMovement.create([{
            shop: shopId,
            product: product._id,
            transaction: original._id,
            type: "Reversal",
            quantity: original.type === "Cash Sale" ? Math.abs(movement.quantity) : -Math.abs(movement.quantity),
            balanceAfter: product.stock,
            unitCostPaise: movement.unitCostPaise,
            reason: `Reversal of ${original.reference}`,
            createdBy: actorId,
          }], { session });
        }
      }

      original.status = "Reversed";
      await original.save({ session });
      await Payment.updateMany({ shop: shopId, transaction: original._id }, { $set: { status: "Reversed" } }, { session });
      await Invoice.updateOne({ shop: shopId, transaction: original._id }, { $set: { status: "Reversed" } }, { session });
      const [reversal] = await Transaction.create([{
        shop: shopId,
        reference: await nextReference("VCH", Transaction),
        type: "Reversal",
        customer: original.customer,
        supplier: original.supplier,
        amountPaise: original.amountPaise,
        amountPaidPaise: original.amountPaidPaise,
        paymentMethod: original.paymentMethod,
        description: `Reversal of ${original.reference}`,
        reversalOf: original._id,
        createdBy: actorId,
      }], { session });
      await audit(session, {
        shop: shopId,
        actor: actorId,
        action: "TRANSACTION_REVERSED",
        entityType: "Transaction",
        entityId: original._id,
        before: { status: "Completed" },
        after: { status: "Reversed", reversalId: reversal._id },
        ipAddress,
      });
      result = reversal;
    });
    return result;
  } finally {
    await session.endSession();
  }
}
