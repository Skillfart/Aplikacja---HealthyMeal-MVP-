module.exports = {
  async up(db) {
    await db.createCollection("users", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["email", "password", "preferences", "aiUsage"],
          properties: {
            email: {
              bsonType: "string",
              pattern: "^.+@.+\\..+$"
            },
            password: {
              bsonType: "string",
              minLength: 8
            },
            preferences: {
              bsonType: "object",
              required: ["dietType", "maxCarbs"],
              properties: {
                dietType: { bsonType: "string" },
                maxCarbs: { bsonType: "number" },
                excludedProducts: { bsonType: "array" },
                allergens: { bsonType: "array" }
              }
            },
            aiUsage: {
              bsonType: "object",
              required: ["date", "count"],
              properties: {
                date: { bsonType: "date" },
                count: { bsonType: "number" }
              }
            },
            isActive: { bsonType: "bool" },
            lastLogin: { bsonType: "date" }
          }
        }
      }
    });

    // Tworzenie indeksów
    await db.collection("users").createIndex({ "email": 1 }, { unique: true });
    await db.collection("users").createIndex({ "aiUsage.date": 1 });
  },

  async down(db) {
    await db.collection("users").dropIndexes();
    await db.collection("users").drop();
  }
}; 