# REST API Plan

## 1. Resources
- **Users** - Maps to `User` collection for user accounts and preferences
- **Authentication** - Handles user registration, login, and session management
- **Recipes** - Maps to `Recipe` collection for managing original recipes
- **ModifiedRecipes** - Maps to `ModifiedRecipe` collection for AI-modified recipes
- **Ingredients** - Maps to `Ingredient` collection for ingredient information
- **AI** - Handles AI recipe modification and usage limits
- **Feedback** - Maps to `RecipeFeedback` collection for error reporting and suggestions
- **Dashboard** - Aggregate resource for user dashboard data

## 2. Endpoints

### Authentication

#### Register User
- **Method**: POST
- **Path**: `/api/auth/register`
- **Description**: Create a new user account
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response Body**:
  ```json
  {
    "message": "User registered successfully",
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "preferences": {
        "dietType": "normal",
        "maxCarbs": 0,
        "excludedProducts": [],
        "allergens": []
      }
    }
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 409 Conflict (Email already exists)

#### User Login
- **Method**: POST
- **Path**: `/api/auth/login`
- **Description**: Authenticate user and get JWT token
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response Body**:
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "preferences": {
        "dietType": "normal",
        "maxCarbs": 0,
        "excludedProducts": [],
        "allergens": []
      },
      "aiUsage": {
        "date": "2023-05-01T00:00:00.000Z",
        "count": 2
      }
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized (Invalid credentials)

### User Profile

#### Get User Profile
- **Method**: GET
- **Path**: `/api/users/profile`
- **Description**: Get the authenticated user's profile
- **Response Body**:
  ```json
  {
    "id": "user_id",
    "email": "user@example.com",
    "preferences": {
      "dietType": "lowCarb",
      "maxCarbs": 50,
      "excludedProducts": ["sugar", "white bread"],
      "allergens": ["nuts", "dairy"]
    },
    "aiUsage": {
      "date": "2023-05-01T00:00:00.000Z",
      "count": 2
    },
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

#### Update User Preferences
- **Method**: PUT
- **Path**: `/api/users/preferences`
- **Description**: Update the user's dietary preferences
- **Request Body**:
  ```json
  {
    "dietType": "lowCarb",
    "maxCarbs": 50,
    "excludedProducts": ["sugar", "white bread"],
    "allergens": ["nuts", "dairy"]
  }
  ```
- **Response Body**:
  ```json
  {
    "message": "Preferences updated successfully",
    "preferences": {
      "dietType": "lowCarb",
      "maxCarbs": 50,
      "excludedProducts": ["sugar", "white bread"],
      "allergens": ["nuts", "dairy"]
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### Change Password
- **Method**: PUT
- **Path**: `/api/users/password`
- **Description**: Update the user's password
- **Request Body**:
  ```json
  {
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456"
  }
  ```
- **Response Body**:
  ```json
  {
    "message": "Password changed successfully"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized

### Recipes

#### Get User Recipes
- **Method**: GET
- **Path**: `/api/recipes`
- **Description**: Get a list of the user's recipes with filtering and pagination
- **Query Parameters**:
  - `search` (string) - Search term for recipe title or ingredients
  - `tags` (string) - Comma-separated list of tags to filter by
  - `difficulty` (string) - Filter by difficulty level ("easy", "medium", "hard")
  - `maxPreparationTime` (number) - Maximum preparation time in minutes
  - `page` (number, default: 1) - Page number for pagination
  - `limit` (number, default: 10) - Number of results per page
- **Response Body**:
  ```json
  {
    "total": 25,
    "page": 1,
    "limit": 10,
    "recipes": [
      {
        "id": "recipe_id",
        "title": "Low-carb Pancakes",
        "ingredients": [
          {"name": "Almond Flour", "quantity": 100, "unit": "g"}
        ],
        "preparationTime": 15,
        "difficulty": "easy",
        "servings": 2,
        "tags": ["breakfast", "lowCarb"],
        "nutritionalValues": {
          "carbsPerServing": 5
        },
        "createdAt": "2023-04-15T00:00:00.000Z"
      }
    ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

#### Get Recipe by ID
- **Method**: GET
- **Path**: `/api/recipes/:id`
- **Description**: Get detailed information about a specific recipe
- **Response Body**:
  ```json
  {
    "id": "recipe_id",
    "title": "Low-carb Pancakes",
    "user": {
      "id": "user_id",
      "email": "user@example.com"
    },
    "ingredients": [
      {
        "ingredient": {
          "id": "ingredient_id",
          "name": "Almond Flour"
        },
        "quantity": 100,
        "unit": "g",
        "isOptional": false
      }
    ],
    "steps": [
      {
        "number": 1,
        "description": "Mix all ingredients in a bowl",
        "estimatedTime": 5
      }
    ],
    "preparationTime": 15,
    "difficulty": "easy",
    "servings": 2,
    "tags": ["breakfast", "lowCarb"],
    "nutritionalValues": {
      "totalCalories": 350,
      "totalCarbs": 10,
      "totalProtein": 15,
      "totalFat": 30,
      "totalFiber": 5,
      "caloriesPerServing": 175,
      "carbsPerServing": 5
    },
    "createdAt": "2023-04-15T00:00:00.000Z",
    "updatedAt": "2023-04-16T00:00:00.000Z"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

#### Create Recipe
- **Method**: POST
- **Path**: `/api/recipes`
- **Description**: Create a new recipe
- **Request Body**:
  ```json
  {
    "title": "Low-carb Pancakes",
    "ingredients": [
      {
        "ingredient": {
          "id": "ingredient_id",
          "name": "Almond Flour"
        },
        "quantity": 100,
        "unit": "g",
        "isOptional": false
      }
    ],
    "steps": [
      {
        "number": 1,
        "description": "Mix all ingredients in a bowl",
        "estimatedTime": 5
      }
    ],
    "preparationTime": 15,
    "difficulty": "easy",
    "servings": 2,
    "tags": ["breakfast", "lowCarb"],
    "nutritionalValues": {
      "totalCalories": 350,
      "totalCarbs": 10,
      "totalProtein": 15,
      "totalFat": 30,
      "totalFiber": 5,
      "caloriesPerServing": 175,
      "carbsPerServing": 5
    }
  }
  ```
- **Response Body**:
  ```json
  {
    "message": "Recipe created successfully",
    "recipeId": "recipe_id"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized

#### Update Recipe
- **Method**: PUT
- **Path**: `/api/recipes/:id`
- **Description**: Update an existing recipe
- **Request Body**:
  ```json
  {
    "title": "Updated Low-carb Pancakes",
    "ingredients": [...],
    "steps": [...],
    "preparationTime": 20,
    "difficulty": "medium",
    "servings": 4,
    "tags": ["breakfast", "lowCarb", "glutenFree"],
    "nutritionalValues": {...}
  }
  ```
- **Response Body**:
  ```json
  {
    "message": "Recipe updated successfully",
    "recipeId": "recipe_id"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

#### Delete Recipe
- **Method**: DELETE
- **Path**: `/api/recipes/:id`
- **Description**: Soft delete a recipe (sets isDeleted flag)
- **Response Body**:
  ```json
  {
    "message": "Recipe deleted successfully"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

### Modified Recipes

#### Get Modified Recipes
- **Method**: GET
- **Path**: `/api/recipes/modified`
- **Description**: Get a list of the user's modified recipes
- **Query Parameters**:
  - `originalRecipeId` (string, optional) - Filter by original recipe ID
  - `page` (number, default: 1) - Page number for pagination
  - `limit` (number, default: 10) - Number of results per page
- **Response Body**:
  ```json
  {
    "total": 15,
    "page": 1,
    "limit": 10,
    "modifiedRecipes": [
      {
        "id": "modified_recipe_id",
        "title": "Low-carb Keto Pancakes",
        "originalRecipe": {
          "id": "original_recipe_id",
          "title": "Low-carb Pancakes"
        },
        "changesDescription": "Reduced carbs by replacing remaining flour with coconut flour",
        "nutritionalValues": {
          "carbsReduction": 40
        },
        "createdAt": "2023-04-20T00:00:00.000Z"
      }
    ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

#### Get Modified Recipe by ID
- **Method**: GET
- **Path**: `/api/recipes/modified/:id`
- **Description**: Get detailed information about a specific modified recipe
- **Response Body**:
  ```json
  {
    "id": "modified_recipe_id",
    "originalRecipe": {
      "id": "original_recipe_id",
      "title": "Low-carb Pancakes"
    },
    "title": "Low-carb Keto Pancakes",
    "user": {
      "id": "user_id",
      "email": "user@example.com"
    },
    "ingredients": [
      {
        "ingredient": {
          "id": "ingredient_id",
          "name": "Coconut Flour"
        },
        "quantity": 80,
        "unit": "g",
        "isOptional": false,
        "isModified": true,
        "substitutionReason": "Lower carb alternative to almond flour"
      }
    ],
    "steps": [...],
    "preparationTime": 15,
    "difficulty": "medium",
    "servings": 2,
    "tags": ["breakfast", "keto", "lowCarb"],
    "nutritionalValues": {
      "totalCalories": 320,
      "totalCarbs": 6,
      "totalProtein": 18,
      "totalFat": 28,
      "totalFiber": 8,
      "caloriesPerServing": 160,
      "carbsPerServing": 3,
      "carbsReduction": 40,
      "caloriesReduction": 8.5
    },
    "changesDescription": "Reduced carbs by replacing remaining flour with coconut flour",
    "aiPrompt": "Modify this recipe to be keto-friendly",
    "createdAt": "2023-04-20T00:00:00.000Z",
    "updatedAt": "2023-04-20T00:00:00.000Z"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

#### Save Modified Recipe
- **Method**: POST
- **Path**: `/api/recipes/modified`
- **Description**: Save a modified recipe after AI processing
- **Request Body**:
  ```json
  {
    "originalRecipeId": "original_recipe_id",
    "title": "Low-carb Keto Pancakes",
    "ingredients": [...],
    "steps": [...],
    "preparationTime": 15,
    "difficulty": "medium",
    "servings": 2,
    "tags": ["breakfast", "keto", "lowCarb"],
    "nutritionalValues": {...},
    "changesDescription": "Reduced carbs by replacing remaining flour with coconut flour",
    "aiPrompt": "Modify this recipe to be keto-friendly"
  }
  ```
- **Response Body**:
  ```json
  {
    "message": "Modified recipe saved successfully",
    "modifiedRecipeId": "modified_recipe_id"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found (original recipe)

#### Delete Modified Recipe
- **Method**: DELETE
- **Path**: `/api/recipes/modified/:id`
- **Description**: Soft delete a modified recipe
- **Response Body**:
  ```json
  {
    "message": "Modified recipe deleted successfully"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

### AI Operations

#### Check AI Usage Limits
- **Method**: GET
- **Path**: `/api/ai/usage`
- **Description**: Check the user's current AI usage and limits
- **Response Body**:
  ```json
  {
    "aiUsage": {
      "date": "2023-05-01T00:00:00.000Z",
      "count": 2
    },
    "hasRemainingModifications": true,
    "dailyLimit": 5,
    "remainingModifications": 3
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

#### Modify Recipe with AI
- **Method**: POST
- **Path**: `/api/ai/modify/:recipeId`
- **Description**: Process a recipe with AI to create a modified version based on user preferences
- **Response Body**:
  ```json
  {
    "message": "Recipe modified successfully",
    "modifiedRecipe": {
      "title": "Low-carb Keto Pancakes",
      "ingredients": [
        {
          "ingredient": {
            "name": "Coconut Flour"
          },
          "quantity": 80,
          "unit": "g",
          "isModified": true,
          "substitutionReason": "Lower carb alternative to almond flour"
        }
      ],
      "steps": [...],
      "nutritionalValues": {
        "totalCarbs": 6,
        "carbsReduction": 40
      },
      "changesDescription": "Reduced carbs by replacing remaining flour with coconut flour"
    },
    "fromCache": false
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 
  - 401 Unauthorized
  - 403 Forbidden (AI usage limit exceeded)
  - 404 Not Found (recipe not found)
  - 500 Internal Server Error (AI service error)

### Ingredients

#### Get Ingredients
- **Method**: GET
- **Path**: `/api/ingredients`
- **Description**: Search or list ingredients with pagination
- **Query Parameters**:
  - `search` (string) - Search term for ingredient name
  - `category` (string) - Filter by category
  - `page` (number, default: 1) - Page number for pagination
  - `limit` (number, default: 20) - Number of results per page
- **Response Body**:
  ```json
  {
    "total": 250,
    "page": 1,
    "limit": 20,
    "ingredients": [
      {
        "id": "ingredient_id",
        "name": "Almond Flour",
        "alternativeNames": ["Ground Almonds"],
        "nutritionalValues": {
          "calories": 571,
          "carbs": 21.4,
          "protein": 21.1,
          "fat": 50.6,
          "fiber": 12.5
        },
        "glycemicIndex": 25,
        "allergens": ["nuts"],
        "category": "grain"
      }
    ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

#### Get Ingredient by ID
- **Method**: GET
- **Path**: `/api/ingredients/:id`
- **Description**: Get detailed information about a specific ingredient
- **Response Body**:
  ```json
  {
    "id": "ingredient_id",
    "name": "Almond Flour",
    "alternativeNames": ["Ground Almonds"],
    "nutritionalValues": {
      "calories": 571,
      "carbs": 21.4,
      "protein": 21.1,
      "fat": 50.6,
      "fiber": 12.5,
      "sugar": 4.9
    },
    "glycemicIndex": 25,
    "allergens": ["nuts"],
    "category": "grain"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

### Feedback

#### Submit Feedback
- **Method**: POST
- **Path**: `/api/feedback`
- **Description**: Submit feedback about a recipe or the application
- **Request Body**:
  ```json
  {
    "recipeId": "recipe_id",
    "recipeType": "original",
    "feedbackType": "error",
    "description": "The amount of almond flour seems incorrect, the batter is too runny."
  }
  ```
- **Response Body**:
  ```json
  {
    "message": "Feedback submitted successfully",
    "feedbackId": "feedback_id"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found (recipe not found)

#### Get User Feedback
- **Method**: GET
- **Path**: `/api/feedback`
- **Description**: Get a list of feedback submitted by the user
- **Query Parameters**:
  - `status` (string) - Filter by status ("pending", "resolved", "rejected")
  - `page` (number, default: 1) - Page number for pagination
  - `limit` (number, default: 10) - Number of results per page
- **Response Body**:
  ```json
  {
    "total": 5,
    "page": 1,
    "limit": 10,
    "feedbacks": [
      {
        "id": "feedback_id",
        "recipe": {
          "title": "Low-carb Pancakes"
        },
        "feedbackType": "error",
        "description": "The amount of almond flour seems incorrect, the batter is too runny.",
        "status": "pending",
        "createdAt": "2023-05-01T00:00:00.000Z"
      }
    ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

#### Get Feedback by ID
- **Method**: GET
- **Path**: `/api/feedback/:id`
- **Description**: Get detailed information about specific feedback
- **Response Body**:
  ```json
  {
    "id": "feedback_id",
    "user": {
      "id": "user_id",
      "email": "user@example.com"
    },
    "recipeType": "original",
    "recipe": {
      "id": "recipe_id",
      "title": "Low-carb Pancakes"
    },
    "feedbackType": "error",
    "description": "The amount of almond flour seems incorrect, the batter is too runny.",
    "status": "pending",
    "createdAt": "2023-05-01T00:00:00.000Z",
    "updatedAt": "2023-05-01T00:00:00.000Z"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

#### Update Feedback
- **Method**: PUT
- **Path**: `/api/feedback/:id`
- **Description**: Update feedback description (only for pending feedback)
- **Request Body**:
  ```json
  {
    "description": "The amount of almond flour should be 120g instead of 100g for the right consistency."
  }
  ```
- **Response Body**:
  ```json
  {
    "message": "Feedback updated successfully",
    "feedbackId": "feedback_id"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

### Dashboard

#### Get Dashboard Data
- **Method**: GET
- **Path**: `/api/dashboard`
- **Description**: Get all data needed for the user dashboard
- **Response Body**:
  ```json
  {
    "recipeOfDay": {
      "id": "recipe_id",
      "title": "Keto-friendly Avocado Smoothie",
      "preparationTime": 5,
      "difficulty": "easy",
      "nutritionalValues": {
        "carbsPerServing": 4
      }
    },
    "recentRecipes": [
      {
        "id": "recipe_id",
        "title": "Low-carb Pancakes",
        "createdAt": "2023-04-15T00:00:00.000Z"
      }
    ],
    "aiUsage": {
      "date": "2023-05-01T00:00:00.000Z",
      "count": 2,
      "dailyLimit": 5,
      "remaining": 3
    },
    "preferences": {
      "dietType": "lowCarb",
      "maxCarbs": 50,
      "excludedProducts": ["sugar", "white bread"],
      "allergens": ["nuts", "dairy"]
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized

#### Print Recipe
- **Method**: GET
- **Path**: `/api/recipes/:id/print`
- **Description**: Get a printer-friendly version of a recipe
- **Query Parameters**:
  - `format` (string, default: "html") - Response format ("html" or "pdf")
- **Response Body**: HTML or PDF document
- **Response Headers**:
  - For HTML: `Content-Type: text/html`
  - For PDF: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="recipe.pdf"`
- **Success Codes**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

#### Compare Recipes
- **Method**: GET
- **Path**: `/api/recipes/compare`
- **Description**: Compare an original recipe with its modified version
- **Query Parameters**:
  - `originalId` (string, required) - Original recipe ID
  - `modifiedId` (string, required) - Modified recipe ID
- **Response Body**:
  ```json
  {
    "original": {
      "id": "recipe_id",
      "title": "Low-carb Pancakes",
      "ingredients": [...],
      "steps": [...],
      "nutritionalValues": {...}
    },
    "modified": {
      "id": "modified_recipe_id",
      "title": "Low-carb Keto Pancakes",
      "ingredients": [...],
      "steps": [...],
      "nutritionalValues": {...}
    },
    "changes": {
      "ingredients": [
        {
          "original": {
            "name": "Almond Flour",
            "quantity": 100,
            "unit": "g"
          },
          "modified": {
            "name": "Coconut Flour",
            "quantity": 80,
            "unit": "g"
          },
          "reason": "Lower carb alternative to almond flour"
        }
      ],
      "steps": [...],
      "nutritionalChanges": {
        "carbsReduction": 40,
        "caloriesReduction": 8.5
      },
      "summary": "Reduced carbs by replacing remaining flour with coconut flour"
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 404 Not Found

## 3. Authentication and Authorization

### Authentication Mechanism
- JWT (JSON Web Tokens) based authentication
- Tokens issued at login/registration and used for subsequent API requests
- JWT includes user ID and expiration time
- Tokens expire after 24 hours as specified in tech stack document

### Implementation Details
- **Token Format**: Bearer token in Authorization header
- **Token Generation**: On successful login/registration
- **Token Validation**: For all protected endpoints
- **Token Expiration**: After 24 hours (configurable)
- **Token Storage**: Client-side in localStorage or secure cookie

### Authorization Rules
- Users can only access and modify their own data (recipes, profile, etc.)
- All endpoints except registration and login require authentication
- AI modification endpoints also require checking AI usage limits

## 4. Validation and Business Logic

### User Validation
- Email must be in valid format (matching pattern: ^.+@.+\..+$)
- Password must be at least 8 characters
- Diet type must be one of the enumerated values: 'keto', 'lowCarb', 'paleo', 'vegetarian', 'vegan', 'glutenFree', 'dairyFree', 'normal'
- MaxCarbs must be a non-negative number

### Recipe Validation
- Title is required
- At least one ingredient is required
- At least one step is required
- Preparation time must be a positive number
- Difficulty must be one of: 'easy', 'medium', 'hard'
- Servings must be a positive number (min: 1)
- Ingredients must reference valid ingredient IDs
- Nutritional values must be non-negative numbers

### Modified Recipe Validation
- Must reference a valid, existing original recipe
- Changes description is required
- Must follow the same validation rules as regular recipes
- Modified ingredients must include isModified flag for tracking changes

### Ingredient Validation
- Name must be unique
- Nutritional values (calories, carbs, protein, fat) are required and must be non-negative
- Category must be one of the enumerated values: 'dairy', 'meat', 'vegetable', 'fruit', 'grain', 'legume', 'fat', 'sweetener', 'spice', 'other'
- Allergens must be from the predefined list: 'gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish', 'peanuts'

### Feedback Validation
- Recipe type must be "original" or "modified"
- Feedback type must be one of: "error", "suggestion", "improvement"
- Description is required
- Referenced recipe must exist

### Business Logic Implementation

#### AI Usage Limits
- Users are limited to 5 AI modifications per day
- The limit resets at the beginning of each day
- The API tracks usage via the aiUsage field in the User collection
- When a user requests an AI modification, the system checks their remaining limit
- After successful AI processing, the counter is incremented

#### Recipe Modifications
- When modifying a recipe with AI, the system:
  1. Retrieves the original recipe and user preferences
  2. Checks for a cached result using inputHash based on recipe ID and preferences
  3. If a cached result exists, returns it immediately
  4. Otherwise, makes API call to AI service with recipe data and user preferences
  5. Processes the AI response and formats it for client consumption
  6. Stores the result in cache with a 24-hour TTL
  7. Increments the user's AI usage counter

#### Recipe Comparison
- The system can compare original and modified recipes:
  1. Retrieves both recipes
  2. Identifies changed ingredients by comparing ingredient IDs and quantities
  3. Identifies changed steps by comparing step content
  4. Calculates nutritional differences and percentage reductions
  5. Provides a structured comparison highlighting all changes

#### Nutritional Calculations
- The system can calculate nutritional values for recipes:
  1. Retrieves nutritional data for each ingredient
  2. Scales values based on the quantity used in the recipe
  3. Sums values across all ingredients
  4. Calculates per-serving values based on the servings count

#### Recipe Print Format
- When generating a printer-friendly version:
  1. Creates a simplified HTML layout focused on readability
  2. Removes UI elements and navigation
  3. Optionally converts to PDF for download
  4. Includes complete recipe details, ingredients, and instructions

#### Caching Strategy
- AI responses are cached using a TTL index in the AICache collection
- The cache key (inputHash) is based on a combination of:
  1. Recipe ID
  2. User dietary preferences
  3. Excluded products and allergens
- Cache entries automatically expire after 24 hours
- This reduces API costs and improves response times for repeated queries

#### Data Security
- All endpoints require authentication except registration and login
- Users can only access and modify their own data
- Passwords are hashed using bcrypt before storage
- Soft delete is implemented for all resources, preserving data integrity
- JWT tokens have a limited lifespan (24 hours) 