module.exports = {
  async up(db) {
    // Najpierw próbujemy usunąć istniejące kolekcje
    try {
      await db.collection('users').drop();
    } catch (error) {
      console.log('Kolekcja users nie istnieje lub nie może zostać usunięta');
    }

    try {
      await db.collection('recipes').drop();
    } catch (error) {
      console.log('Kolekcja recipes nie istnieje lub nie może zostać usunięta');
    }

    // Tworzenie kolekcji users
    await db.createCollection('users', {
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
            supabaseId: {
              bsonType: "string",
              description: "ID użytkownika z Supabase"
            },
            name: {
              bsonType: "string",
              description: "Nazwa użytkownika"
            },
            preferences: {
              bsonType: "object",
              required: ["dietType", "maxCarbs"],
              properties: {
                dietType: {
                  bsonType: "string"
                },
                maxCarbs: {
                  bsonType: "number"
                },
                excludedProducts: {
                  bsonType: "array"
                },
                allergens: {
                  bsonType: "array"
                }
              }
            },
            aiUsage: {
              bsonType: "object",
              required: ["date", "count"],
              properties: {
                date: {
                  bsonType: "date"
                },
                count: {
                  bsonType: "number"
                }
              }
            },
            isActive: {
              bsonType: "bool"
            },
            lastLogin: {
              bsonType: "date"
            }
          }
        }
      }
    });

    // Tworzenie kolekcji recipes
    await db.createCollection('recipes', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["title", "userId", "ingredients", "instructions"],
          properties: {
            title: {
              bsonType: "string",
              description: "Tytuł przepisu - wymagany"
            },
            userId: {
              bsonType: "string",
              description: "ID właściciela przepisu - wymagane"
            },
            ingredients: {
              bsonType: "array",
              description: "Lista składników - wymagana",
              items: {
                bsonType: "object",
                required: ["name", "amount", "unit"],
                properties: {
                  name: {
                    bsonType: "string"
                  },
                  amount: {
                    bsonType: "number"
                  },
                  unit: {
                    bsonType: "string"
                  }
                }
              }
            },
            instructions: {
              bsonType: "array",
              description: "Lista kroków przygotowania - wymagana",
              items: {
                bsonType: "string"
              }
            },
            tags: {
              bsonType: "array",
              description: "Tagi przepisu",
              items: {
                bsonType: "string"
              }
            },
            aiGenerated: {
              bsonType: "bool",
              description: "Czy przepis został wygenerowany przez AI"
            },
            createdAt: {
              bsonType: "date",
              description: "Data utworzenia przepisu"
            },
            updatedAt: {
              bsonType: "date",
              description: "Data ostatniej modyfikacji przepisu"
            }
          }
        }
      }
    });

    // Tworzenie indeksów
    await db.collection('users').createIndex({ "email": 1 }, { unique: true });
    await db.collection('users').createIndex({ "supabaseId": 1 }, { unique: true });
    await db.collection('recipes').createIndex({ "userId": 1 });
    await db.collection('recipes').createIndex({ "title": "text", "tags": "text" });
  },

  async down(db) {
    // Usuwanie kolekcji w przypadku cofnięcia migracji
    try {
      await db.collection('users').drop();
    } catch (error) {
      console.log('Kolekcja users nie istnieje lub nie może zostać usunięta');
    }

    try {
      await db.collection('recipes').drop();
    } catch (error) {
      console.log('Kolekcja recipes nie istnieje lub nie może zostać usunięta');
    }
  }
}; 