module.exports = {
  async up(db) {
    await db.createCollection("recipeFeedback", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["user", "recipeType", "recipe", "feedbackType", "description", "status"],
          properties: {
            user: {
              bsonType: "object",
              required: ["_id", "email"],
              properties: {
                _id: { bsonType: "objectId" },
                email: { bsonType: "string" }
              }
            },
            recipeType: { 
              bsonType: "string",
              enum: ["original", "modified"]
            },
            recipe: {
              bsonType: "object",
              required: ["_id", "title"],
              properties: {
                _id: { bsonType: "objectId" },
                title: { bsonType: "string" }
              }
            },
            feedbackType: { 
              bsonType: "string",
              enum: ["error", "suggestion", "improvement"]
            },
            description: { bsonType: "string" },
            status: { 
              bsonType: "string",
              enum: ["pending", "resolved", "rejected"]
            },
            adminNotes: { bsonType: "string" },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
            resolvedAt: { bsonType: "date" }
          }
        }
      }
    });

    // Tworzenie indeksów
    await db.collection("recipeFeedback").createIndex({ "user._id": 1 });
    await db.collection("recipeFeedback").createIndex({ "recipeType": 1, "recipe._id": 1 });
    await db.collection("recipeFeedback").createIndex({ "status": 1 });
  },

  async down(db) {
    await db.collection("recipeFeedback").dropIndexes();
    await db.collection("recipeFeedback").drop();
  }
}; 