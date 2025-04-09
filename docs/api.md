# HealthyMeal API Documentation

## AI Endpoints

### Modify Recipe with AI

Modyfikuje przepis przy użyciu AI na podstawie preferencji użytkownika.

**URL**: `/api/ai/modify/:recipeId`

**Method**: `POST`

**Authentication**: Required (JWT token)

**URL Params**:
- `recipeId` - ID przepisu do modyfikacji

**Headers**:
- `Authorization: Bearer {token}` - Token JWT

**Success Response**:
- **Code**: 200 OK
- **Content**:
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
      "steps": [
        {
          "number": 1,
          "description": "Mix all ingredients in a bowl",
          "isModified": false
        }
      ],
      "nutritionalValues": {
        "totalCarbs": 6,
        "carbsReduction": 40
      },
      "changesDescription": "Reduced carbs by replacing remaining flour with coconut flour"
    },
    "fromCache": false
  }
  ```

**Error Responses**:
- **Code**: 401 Unauthorized
  - **Content**: `{ "message": "Authentication required" }`
- **Code**: 403 Forbidden
  - **Content**: `{ "message": "Daily AI modification limit exceeded. Limit: 5 modifications per day." }`
- **Code**: 404 Not Found
  - **Content**: `{ "message": "Recipe not found" }`
- **Code**: 500 Internal Server Error
  - **Content**: `{ "message": "Error processing recipe with AI. Please try again later." }`

### Check AI Usage Limits

Pobiera informacje o limitach użycia AI.

**URL**: `/api/ai/usage`

**Method**: `GET`

**Authentication**: Required (JWT token)

**Headers**:
- `Authorization: Bearer {token}` - Token JWT

**Success Response**:
- **Code**: 200 OK
- **Content**:
  ```json
  {
    "hasRemainingModifications": true,
    "aiUsage": {
      "date": "2023-05-01T00:00:00.000Z",
      "count": 2
    },
    "dailyLimit": 5,
    "remainingModifications": 3
  }
  ```

**Error Response**:
- **Code**: 401 Unauthorized
  - **Content**: `{ "message": "Authentication required" }`

## Bezpieczeństwo

- Wszystkie endpointy wymagają uwierzytelnienia za pomocą tokenu JWT
- Tokeny JWT mają czas ważności 24 godziny
- Limity użycia AI są śledzone per użytkownik
- Dane są walidowane przed przetwarzaniem
- Cache z odpowiedziami AI wygasa automatycznie po 24 godzinach