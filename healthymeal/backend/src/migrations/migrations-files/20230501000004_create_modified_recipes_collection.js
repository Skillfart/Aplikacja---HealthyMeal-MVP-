module.exports = {
  async up(db) {
    await db.createCollection("modifiedRecipes", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["originalRecipe", "title", "user", "ingredients", "steps"],
          properties: {
            originalRecipe: {
              bsonType: "object",
              required: ["_id", "title"],
              properties: {
                _id: { bsonType: "objectId" },
                title: { bsonType: "string" }
              }
            },
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
                required: ["ingredient", "quantity", "unit", "isModified"],
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
                  isModified: { bsonType: "bool" },
                  substitutionReason: { bsonType: "string" }
                }
              }
            },
            steps: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["number", "description", "isModified"],
                properties: {
                  number: { bsonType: "number" },
                  description: { bsonType: "string" },
                  estimatedTime: { bsonType: "number" },
                  isModified: { bsonType: "bool" },
                  modificationReason: { bsonType: "string" }
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
                carbsPerServing: { bsonType: "number" },
                carbsReduction: { bsonType: "number" },
                caloriesReduction: { bsonType: "number" }
              }
            },
            changesDescription: { bsonType: "string" },
            aiPrompt: { bsonType: "string" },
            isDeleted: { bsonType: "bool" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" }
          }
        }
      }
    });

    // Tworzenie indeksów
    await db.collection("modifiedRecipes").createIndex({ "user._id": 1, "isDeleted": 1 });
    await db.collection("modifiedRecipes").createIndex({ "originalRecipe._id": 1 });
    await db.collection("modifiedRecipes").createIndex({ "title": "text" });
    await db.collection("modifiedRecipes").createIndex({ "tags": 1 });
    await db.collection("modifiedRecipes").createIndex({ 
      "nutritionalValues.carbsPerServing": 1,
      "nutritionalValues.carbsReduction": 1
    });
    await db.collection("modifiedRecipes").createIndex({ "isDeleted": 1 });
  },

  async down(db) {
    await db.collection("modifiedRecipes").dropIndexes();
    await db.collection("modifiedRecipes").drop();
  }
}; 