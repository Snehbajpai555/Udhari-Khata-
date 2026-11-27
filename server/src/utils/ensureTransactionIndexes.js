import Transaction from "../models/Transaction.js";

const isIndex = (index, fields) =>
  Object.keys(index.key).length === Object.keys(fields).length &&
  Object.entries(fields).every(([field, direction]) => index.key[field] === direction);

export async function ensureTransactionIndexes() {
  const collection = Transaction.collection;
  let indexes = await collection.indexes();

  const idempotencyIndex = indexes.find((index) =>
    isIndex(index, { shop: 1, idempotencyKey: 1 }),
  );
  const hasUniqueIdempotencyIndex = idempotencyIndex?.unique === true &&
    idempotencyIndex.partialFilterExpression?.idempotencyKey?.$type === "string";

  if (idempotencyIndex && !hasUniqueIdempotencyIndex) {
    const duplicates = await collection.aggregate([
      { $match: { idempotencyKey: { $type: "string" } } },
      { $group: { _id: { shop: "$shop", key: "$idempotencyKey" }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $limit: 1 },
    ]).toArray();
    if (duplicates.length) {
      throw new Error("Cannot enforce transaction idempotency: duplicate shop/key records already exist.");
    }
    await collection.dropIndex(idempotencyIndex.name);
    indexes = indexes.filter((index) => index.name !== idempotencyIndex.name);
  }

  const redundantIdempotencyIndex = indexes.find((index) =>
    isIndex(index, { idempotencyKey: 1 }),
  );
  if (redundantIdempotencyIndex) {
    await collection.dropIndex(redundantIdempotencyIndex.name);
    indexes = indexes.filter((index) => index.name !== redundantIdempotencyIndex.name);
  }

  const referenceIndex = indexes.find((index) => isIndex(index, { reference: 1 }));
  if (referenceIndex && referenceIndex.unique !== true) {
    const duplicates = await collection.aggregate([
      { $group: { _id: "$reference", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $limit: 1 },
    ]).toArray();
    if (duplicates.length) {
      throw new Error("Cannot enforce transaction reference uniqueness: duplicate references already exist.");
    }
    await collection.dropIndex(referenceIndex.name);
    indexes = indexes.filter((index) => index.name !== referenceIndex.name);
  }

  await Promise.all([
    collection.createIndex(
      { shop: 1, idempotencyKey: 1 },
      {
        unique: true,
        partialFilterExpression: { idempotencyKey: { $type: "string" } },
        name: "shop_1_idempotencyKey_1",
      },
    ),
    collection.createIndex(
      { reference: 1 },
      { unique: true, name: "reference_1" },
    ),
    collection.createIndex({ shop: 1 }),
    collection.createIndex({ shop: 1, transactionDate: -1 }),
  ]);
}
