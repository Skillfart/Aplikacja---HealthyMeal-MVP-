module.exports = {
  async up(db) {
    await db.createCollection("recipes", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["title", "user", "ingredients", "steps"],
          properties: {
            title: { bsonType: "string" },
            user: {
              bsonType: "object",
              required: ["_id", "email"],
              properties: {
                _id: { bsonType: "objectId" },
                email: { bsonType: "string" }
              }
            },
            ingredients: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["ingredient", "quantity", "unit"],
                properties: {
                  ingredient: {
                    bsonType: "object",
                    required: ["_id", "name"],
                    properties: {
                      _id: { bsonType: "objectId" },
                      name: { bsonType: "string" }
                    }
                  },
                  quantity: { bsonType: "number" },
                  unit: { bsonType: "string" },
                  isOptional: { bsonType: "bool" },
                  alternatives: { 
                    bsonType: "array",
                    items: {
                      bsonType: "object",
                      required: ["ingredient", "quantity", "unit"],
                      properties: {
                        ingredient: {
                          bsonType: "object",
                          required: ["_id", "name"],
                          properties: {
                            _id: { bsonType: "objectId" },
                            name: { bsonType: "string" }
                          }
                        },
                        quantity: { bsonType: "number" },
                        unit: { bsonType: "string" }
                      }
                    }
                  }
                }
              }
            },
            steps: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["number", "description"],
                properties: {
                  number: { bsonType: "number" },
                  description: { bsonType: "string" },
                  estimatedTime: { bsonType: "number" }
                }
              }
            },
            preparationTime: { bsonType: "number" },
            difficulty: { bsonType: "string" },
            servings: { bsonType: "number" },
            tags: { bsonType: "array" },
            nutritionalValues: {
              bsonType: "object",
              properties: {
                totalCalories: { bsonType: "number" },
                totalCarbs: { bsonType: "number" },
                totalProtein: { bsonType: "number" },
                totalFat: { bsonType: "number" },
                totalFiber: { bsonType: "number" },
                caloriesPerServing: { bsonType: "number" },
                carbsPerServing: { bsonType: "number" }
              }
            },
            isDeleted: { bsonType: "bool" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" }
          }
        }
      }
    });

    // Tworzenie indeksów
    await db.collection("recipes").createIndex({ "user._id": 1, "isDeleted": 1 });
    await db.collection("recipes").createIndex({ "title": "text" });
    await db.collection("recipes").createIndex({ "tags": 1 });
    await db.collection("recipes").createIndex({ 
      "preparationTime": 1, 
      "difficulty": 1, 
      "tags": 1, 
      "nutritionalValues.carbsPerServing": 1 
    });
    await db.collection("recipes").createIndex({ "isDeleted": 1 });
  },

  async down(db) {
    await db.collection("recipes").dropIndexes();
    await db.collection("recipes").drop();
  }
}; 