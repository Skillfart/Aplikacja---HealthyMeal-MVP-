module.exports = {
  async up(db) {
    await db.createCollection("ingredients", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "nutritionalValues"],
          properties: {
            name: { bsonType: "string" },
            alternativeNames: { bsonType: "array" },
            nutritionalValues: {
              bsonType: "object",
              required: ["calories", "carbs", "protein", "fat"],
              properties: {
                calories: { bsonType: "number" },
                carbs: { bsonType: "number" },
                protein: { bsonType: "number" },
                fat: { bsonType: "number" },
                fiber: { bsonType: "number" },
                sugar: { bsonType: "number" }
              }
            },
            glycemicIndex: { bsonType: "number" },
            allergens: { bsonType: "array" },
            category: { bsonType: "string" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" }
          }
        }
      }
    });

    // Tworzenie indeksów
    await db.collection("ingredients").createIndex({ "name": 1 }, { unique: true });
    await db.collection("ingredients").createIndex({ name: "text", alternativeNames: "text" });
    await db.collection("ingredients").createIndex({ "allergens": 1 });
    await db.collection("ingredients").createIndex({ "category": 1 });
  },

  async down(db) {
    await db.collection("ingredients").dropIndexes();
    await db.collection("ingredients").drop();
  }
}; 