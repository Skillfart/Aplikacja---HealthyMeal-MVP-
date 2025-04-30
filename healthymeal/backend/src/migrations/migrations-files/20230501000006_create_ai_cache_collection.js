module.exports = {
  async up(db) {
    await db.createCollection("aiCache", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["inputHash", "recipeId", "userPreferences", "response", "createdAt", "expiresAt"],
          properties: {
            inputHash: { bsonType: "string" },
            recipeId: { bsonType: "objectId" },
            userPreferences: {
              bsonType: "object",
              properties: {
                dietType: { bsonType: "string" },
                maxCarbs: { bsonType: "number" },
                excludedProducts: { bsonType: "array" },
                allergens: { bsonType: "array" }
              }
            },
            response: { bsonType: "object" },
            createdAt: { bsonType: "date" },
            expiresAt: { bsonType: "date" }
          }
        }
      }
    });

    // Tworzenie indeksów
    await db.collection("aiCache").createIndex({ "inputHash": 1 }, { unique: true });
    await db.collection("aiCache").createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
  },

  async down(db) {
    await db.collection("aiCache").dropIndexes();
    await db.collection("aiCache").drop();
  }
}; 