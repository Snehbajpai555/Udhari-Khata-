import "dotenv/config";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import mongoose from "mongoose";
import app from "../src/app.js";
import AuditLog from "../src/models/AuditLog.js";
import Customer from "../src/models/Customer.js";
import Expense from "../src/models/Expense.js";
import Invoice from "../src/models/Invoice.js";
import Payment from "../src/models/Payment.js";
import Product from "../src/models/Product.js";
import Shop from "../src/models/Shop.js";
import Staff from "../src/models/Staff.js";
import StockMovement from "../src/models/StockMovement.js";
import Supplier from "../src/models/Supplier.js";
import Transaction from "../src/models/Transaction.js";
import User from "../src/models/User.js";
import { createCredit } from "../src/services/ledgerService.js";
import { signAccessToken } from "../src/utils/tokens.js";
import { ensureTransactionIndexes } from "../src/utils/ensureTransactionIndexes.js";

const created = { shops: [], users: [] };
let server;
let baseUrl;
let ownerA;
let ownerB;
let shopA;
let shopB;
let customerA;
let customerB;
let productA;
let productB;
let tokenA;
let tokenB;
let staffToken;

const permissions = {
  customers: true,
  transactions: true,
  inventory: true,
  reports: true,
  settings: true,
};
const randomPhone = () => String(Math.floor(1000000000 + Math.random() * 9000000000));

async function createOwner(label) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const user = await User.create({
    name: `${label} Owner`,
    businessName: `${label} Test Shop`,
    email: `${label.toLowerCase()}-${suffix}@example.test`,
    password: "test-password-hash",
    role: "retailer",
    phone: randomPhone(),
  });
  created.users.push(user._id);
  const shop = await Shop.create({
    name: `${label} Test Shop`,
    owner: user._id,
    businessType: "retailer",
  });
  created.shops.push(shop._id);
  await Staff.create({ shop: shop._id, user: user._id, role: "Owner", permissions });
  return { user, shop, token: signAccessToken(user, shop.id) };
}

async function request(path, token, body, method, extraHeaders = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: method || (body === undefined ? "GET" : "POST"),
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...extraHeaders,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(10000),
  });
  return { status: response.status, body: await response.json() };
}

before(async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("Set MONGODB_URI to a transaction-capable MongoDB test database before running integration tests.");
  }
  await mongoose.connect(process.env.MONGODB_URI);
  await ensureTransactionIndexes();
  server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  const ownerOne = await createOwner("One");
  const ownerTwo = await createOwner("Two");
  ownerA = ownerOne.user;
  ownerB = ownerTwo.user;
  shopA = ownerOne.shop;
  shopB = ownerTwo.shop;
  tokenA = ownerOne.token;
  tokenB = ownerTwo.token;

  customerA = await Customer.create({ shop: shopA._id, name: "Customer One", phone: randomPhone() });
  customerB = await Customer.create({ shop: shopB._id, name: "Customer Two", phone: randomPhone() });
  productA = await Product.create({
    shop: shopA._id,
    name: "Product One",
    sku: "ONE-1",
    purchasePricePaise: 10000,
    sellingPricePaise: 25000,
    stock: 5,
    minimumStock: 1,
  });
  productB = await Product.create({
    shop: shopB._id,
    name: "Product Two",
    sku: "TWO-1",
    purchasePricePaise: 10000,
    sellingPricePaise: 25000,
    stock: 5,
    minimumStock: 1,
  });

  const staff = await User.create({
    name: "Limited Staff",
    businessName: shopA.name,
    email: `staff-${Date.now()}@example.test`,
    password: "test-password-hash",
    role: "retailer",
    phone: randomPhone(),
  });
  created.users.push(staff._id);
  await Staff.create({
    shop: shopA._id,
    user: staff._id,
    role: "Staff",
    permissions: { ...permissions, customers: false, inventory: false },
  });
  staffToken = signAccessToken(staff, shopA.id);
});

after(async () => {
  if (mongoose.connection.readyState === 1 && created.shops.length) {
    const shopFilter = { shop: { $in: created.shops } };
    await Promise.all([
      Staff.deleteMany(shopFilter),
      Customer.deleteMany(shopFilter),
      Supplier.deleteMany(shopFilter),
      Product.deleteMany(shopFilter),
      Transaction.deleteMany(shopFilter),
      Invoice.deleteMany(shopFilter),
      Payment.deleteMany(shopFilter),
      Expense.deleteMany(shopFilter),
      StockMovement.deleteMany(shopFilter),
      AuditLog.deleteMany(shopFilter),
    ]);
    await Shop.deleteMany({ _id: { $in: created.shops } });
  }
  if (mongoose.connection.readyState === 1 && created.users.length) {
    await User.deleteMany({ _id: { $in: created.users } });
  }
  if (server) await new Promise((resolve) => server.close(resolve));
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

test("reversals, idempotency, tenant scoping, references, and staff permissions", async (t) => {
  await t.test("enforces shop scoping and configured module permissions", async () => {
    const customersForA = await request("/api/customers", tokenA);
    assert.equal(customersForA.status, 200);
    assert.deepEqual(customersForA.body.data.map((item) => String(item._id)), [String(customerA._id)]);
    const customersForB = await request("/api/customers", tokenB);
    assert.deepEqual(customersForB.body.data.map((item) => String(item._id)), [String(customerB._id)]);

    const crossShopEdit = await request(`/api/customers/${customerB._id}`, tokenA, { name: "Changed" }, "PATCH");
    assert.equal(crossShopEdit.status, 404);
    const crossShopCredit = await request("/api/transactions/credit", tokenA, {
      customerId: String(customerB._id),
      amountPaise: 1000,
    });
    assert.equal(crossShopCredit.status, 404);
    const productsForA = await request("/api/products", tokenA);
    assert.equal(productsForA.status, 200);
    assert.deepEqual(productsForA.body.data.map((item) => String(item._id)), [String(productA._id)]);

    assert.equal((await request("/api/customers", staffToken)).status, 403);
    assert.equal((await request("/api/products", staffToken)).status, 403);
    assert.equal((await request("/api/transactions", staffToken)).status, 200);
    assert.equal((await request("/api/shops", staffToken, {
      name: "Unauthorized Staff Shop",
      businessType: "retailer",
    })).status, 403);

    const sharedKey = `shared-shop-key-${Date.now()}`;
    const [localTransaction, foreignTransaction] = await Promise.all([
      createCredit({
        shopId: shopA._id,
        actorId: ownerA._id,
        customerId: customerA._id,
        amountPaise: 2000,
        idempotencyKey: sharedKey,
      }),
      createCredit({
        shopId: shopB._id,
        actorId: ownerB._id,
        customerId: customerB._id,
        amountPaise: 1000,
        idempotencyKey: sharedKey,
      }),
    ]);
    assert.notEqual(String(localTransaction._id), String(foreignTransaction._id));
    assert.notEqual(localTransaction.reference, foreignTransaction.reference);
    assert.equal(await Transaction.countDocuments({ idempotencyKey: sharedKey }), 2);
    const crossShopReverse = await request(
      `/api/transactions/${foreignTransaction._id}/reverse`,
      tokenA,
      {},
    );
    assert.equal(crossShopReverse.status, 404);
    assert.equal((await Customer.findById(customerB._id)).outstandingPaise, 1000);
    const localReverse = await request(`/api/transactions/${localTransaction._id}/reverse`, tokenA, {});
    assert.equal(localReverse.status, 201);
    assert.equal((await Customer.findById(customerA._id)).outstandingPaise, 0);
  });

  await t.test("deduplicates concurrent retries and safely reverses dependent entries", async () => {
    const key = `integration-credit-${Date.now()}`;
    const payload = { customerId: String(customerA._id), amountPaise: 50000 };
    const [first, retry] = await Promise.all([
      request("/api/transactions/credit", tokenA, payload, "POST", { "Idempotency-Key": key }),
      request("/api/transactions/credit", tokenA, payload, "POST", { "Idempotency-Key": key }),
    ]);
    assert.equal(first.status, 201);
    assert.equal(retry.status, 201);
    assert.equal(first.body.data._id, retry.body.data._id);
    assert.equal(await Transaction.countDocuments({ shop: shopA._id, idempotencyKey: key }), 1);
    assert.equal((await Customer.findById(customerA._id)).outstandingPaise, 50000);

    const creditId = first.body.data._id;
    const payment = await request("/api/transactions/payment", tokenA, {
      customerId: String(customerA._id),
      amountPaise: 20000,
      paymentMethod: "Cash",
    });
    assert.equal(payment.status, 201);
    assert.equal((await Customer.findById(customerA._id)).outstandingPaise, 30000);

    const blockedCreditReverse = await request(`/api/transactions/${creditId}/reverse`, tokenA, {});
    assert.equal(blockedCreditReverse.status, 422);

    const paymentReverse = await request(`/api/transactions/${payment.body.data._id}/reverse`, tokenA, {});
    assert.equal(paymentReverse.status, 201);
    assert.equal((await Customer.findById(customerA._id)).outstandingPaise, 50000);

    const creditReverse = await request(`/api/transactions/${creditId}/reverse`, tokenA, {});
    assert.equal(creditReverse.status, 201);
    assert.equal((await Customer.findById(customerA._id)).outstandingPaise, 0);
    assert.equal((await request(`/api/transactions/${creditId}/reverse`, tokenA, {})).status, 409);

    const foreignShopCredit = await createCredit({
      shopId: shopB._id,
      actorId: ownerB._id,
      customerId: customerB._id,
      amountPaise: 1000,
      idempotencyKey: `second-shop-${Date.now()}`,
    });
    const references = await Transaction.find({
      _id: { $in: [creditId, foreignShopCredit._id] },
    }).select("reference").lean();
    assert.equal(new Set(references.map((entry) => entry.reference)).size, 2);
  });

  await t.test("reverses sale stock, invoice, and payment records atomically", async () => {
    const sale = await request("/api/transactions/sale", tokenA, {
      customerId: String(customerA._id),
      amountPaidPaise: 10000,
      paymentMethod: "Cash",
      items: [{ productId: String(productA._id), quantity: 1 }],
    });
    assert.equal(sale.status, 201);
    assert.equal((await Product.findById(productA._id)).stock, 4);
    assert.equal((await Customer.findById(customerA._id)).outstandingPaise, 15000);

    const reversal = await request(`/api/transactions/${sale.body.data._id}/reverse`, tokenA, {});
    assert.equal(reversal.status, 201);
    assert.equal((await Product.findById(productA._id)).stock, 5);
    assert.equal((await Customer.findById(customerA._id)).outstandingPaise, 0);
    assert.equal(await Payment.countDocuments({ shop: shopA._id, transaction: sale.body.data._id, status: "Reversed" }), 1);
    assert.equal(await Invoice.countDocuments({ shop: shopA._id, transaction: sale.body.data._id, status: "Reversed" }), 1);
  });
});
