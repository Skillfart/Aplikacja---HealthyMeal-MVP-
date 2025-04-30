import { Database } from "./db/database.types";

// Podstawowe typy
export type DatabaseEntities = Database["public"]["Tables"];
export type UserEntity = DatabaseEntities["users"]["Row"];
export type RecipeEntity = DatabaseEntities["recipes"]["Row"];
export type ModifiedRecipeEntity = DatabaseEntities["modifiedRecipes"]["Row"];
export type IngredientEntity = DatabaseEntities["ingredients"]["Row"];
export type RecipeFeedbackEntity = DatabaseEntities["recipeFeedback"]["Row"];
export type AICacheEntity = DatabaseEntities["aiCache"]["Row"];

// Typy pomocnicze
export type ID = string;
export type ObjectId = string;
export type ISODateString = string;

// Enumy
export enum DietType {
  NORMAL = "normal",
  KETO = "keto",
  LOW_CARB = "lowCarb",
  PALEO = "paleo",
  VEGETARIAN = "vegetarian",
  VEGAN = "vegan",
  GLUTEN_FREE = "glutenFree",
  DAIRY_FREE = "dairyFree"
}

export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard"
}

export enum FeedbackType {
  ERROR = "error",
  SUGGESTION = "suggestion",
  IMPROVEMENT = "improvement"
}

export enum RecipeType {
  ORIGINAL = "original",
  MODIFIED = "modified"
}

export enum FeedbackStatus {
  PENDING = "pending",
  RESOLVED = "resolved",
  REJECTED = "rejected"
}

export enum AllergenType {
  GLUTEN = "gluten",
  DAIRY = "dairy",
  NUTS = "nuts",
  EGGS = "eggs",
  SOY = "soy",
  SHELLFISH = "shellfish",
  FISH = "fish",
  PEANUTS = "peanuts"
}

export enum IngredientCategory {
  DAIRY = "dairy",
  MEAT = "meat",
  VEGETABLE = "vegetable",
  FRUIT = "fruit",
  GRAIN = "grain",
  LEGUME = "legume",
  FAT = "fat",
  SWEETENER = "sweetener",
  SPICE = "spice",
  OTHER = "other"
}

// ===== User & Authentication DTOs =====

export interface RegisterUserDto {
  email: string;
  password: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface UserPreferencesDto {
  dietType: DietType;
  maxCarbs: number;
  excludedProducts: string[];
  allergens: AllergenType[];
}

export interface AIUsageDto {
  date: ISODateString;
  count: number;
}

export interface UserDto {
  id: ID;
  email: string;
  preferences: UserPreferencesDto;
  aiUsage?: AIUsageDto;
}

export interface AuthResponseDto {
  message: string;
  token: string;
  user: UserDto;
}

export interface UserProfileDto extends UserDto {
  createdAt: ISODateString;
}

export type UpdateUserPreferencesDto = UserPreferencesDto;

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface MessageResponseDto {
  message: string;
}

// ===== Recipe DTOs =====

export interface IngredientReferenceDto {
  id: ID;
  name: string;
}

export interface RecipeIngredientDto {
  ingredient: IngredientReferenceDto;
  quantity: number;
  unit: string;
  isOptional: boolean;
}

export interface RecipeStepDto {
  number: number;
  description: string;
  estimatedTime?: number;
}

export interface NutritionalValuesDto {
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  totalFiber: number;
  caloriesPerServing: number;
  carbsPerServing: number;
}

export interface RecipeListItemDto {
  id: ID;
  title: string;
  ingredients: Array<{ name: string; quantity: number; unit: string }>;
  preparationTime: number;
  difficulty: Difficulty;
  servings: number;
  tags: string[];
  nutritionalValues: {
    carbsPerServing: number;
  };
  createdAt: ISODateString;
}

export interface UserReferenceDto {
  id: ID;
  email: string;
}

export interface RecipeDetailsDto {
  id: ID;
  title: string;
  user: UserReferenceDto;
  ingredients: RecipeIngredientDto[];
  steps: RecipeStepDto[];
  preparationTime: number;
  difficulty: Difficulty;
  servings: number;
  tags: string[];
  nutritionalValues: NutritionalValuesDto;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateRecipeDto {
  title: string;
  ingredients: RecipeIngredientDto[];
  steps: RecipeStepDto[];
  preparationTime: number;
  difficulty: Difficulty;
  servings: number;
  tags: string[];
  nutritionalValues: NutritionalValuesDto;
}

export type UpdateRecipeDto = Partial<CreateRecipeDto>;

export interface RecipeResponseDto {
  message: string;
  recipeId: ID;
}

// ===== Modified Recipe DTOs =====

export interface RecipeReferenceDto {
  id: ID;
  title: string;
}

export interface ModifiedIngredientDto extends RecipeIngredientDto {
  isModified: boolean;
  substitutionReason?: string;
}

export interface ModifiedStepDto extends RecipeStepDto {
  isModified: boolean;
  modificationReason?: string;
}

export interface ModifiedNutritionalValuesDto extends NutritionalValuesDto {
  carbsReduction: number;
  caloriesReduction: number;
}

export interface ModifiedRecipeListItemDto {
  id: ID;
  title: string;
  originalRecipe: RecipeReferenceDto;
  changesDescription: string;
  nutritionalValues: {
    carbsReduction: number;
  };
  createdAt: ISODateString;
}

export interface ModifiedRecipeDetailsDto {
  id: ID;
  originalRecipe: RecipeReferenceDto;
  title: string;
  user: UserReferenceDto;
  ingredients: ModifiedIngredientDto[];
  steps: ModifiedStepDto[];
  preparationTime: number;
  difficulty: Difficulty;
  servings: number;
  tags: string[];
  nutritionalValues: ModifiedNutritionalValuesDto;
  changesDescription: string;
  aiPrompt?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface SaveModifiedRecipeDto {
  originalRecipeId: ID;
  title: string;
  ingredients: ModifiedIngredientDto[];
  steps: ModifiedStepDto[];
  preparationTime: number;
  difficulty: Difficulty;
  servings: number;
  tags: string[];
  nutritionalValues: ModifiedNutritionalValuesDto;
  changesDescription: string;
  aiPrompt?: string;
}

export interface ModifiedRecipeResponseDto {
  message: string;
  modifiedRecipeId: ID;
}

// ===== AI DTOs =====

export interface AIUsageLimitDto {
  aiUsage: AIUsageDto;
  hasRemainingModifications: boolean;
  dailyLimit: number;
  remainingModifications: number;
}

export interface AIModifiedIngredientDto {
  ingredient: {
    name: string;
  };
  quantity: number;
  unit: string;
  isModified: boolean;
  substitutionReason?: string;
}

export interface AIModifiedStepDto {
  number: number;
  description: string;
  isModified: boolean;
  modificationReason?: string;
}

export interface ModifyRecipeResultDto {
  message: string;
  modifiedRecipe: {
    title: string;
    ingredients: AIModifiedIngredientDto[];
    steps: AIModifiedStepDto[];
    nutritionalValues: {
      totalCarbs: number;
      carbsReduction: number;
    };
    changesDescription: string;
  };
  fromCache: boolean;
}

// ===== Ingredient DTOs =====

export interface IngredientNutritionalValuesDto {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  sugar?: number;
}

export interface IngredientListItemDto {
  id: ID;
  name: string;
  alternativeNames: string[];
  nutritionalValues: IngredientNutritionalValuesDto;
  glycemicIndex?: number;
  allergens: AllergenType[];
  category: IngredientCategory;
}

export interface IngredientDetailsDto extends IngredientListItemDto {
  nutritionalValues: IngredientNutritionalValuesDto & { sugar: number };
}

export interface CreateIngredientDto {
  name: string;
  alternativeNames?: string[];
  nutritionalValues: IngredientNutritionalValuesDto;
  glycemicIndex?: number;
  allergens?: AllergenType[];
  category: IngredientCategory;
}

// ===== Feedback DTOs =====

export interface SubmitFeedbackDto {
  recipeId: ID;
  recipeType: RecipeType;
  feedbackType: FeedbackType;
  description: string;
}

export interface FeedbackListItemDto {
  id: ID;
  recipe: {
    title: string;
  };
  feedbackType: FeedbackType;
  description: string;
  status: FeedbackStatus;
  createdAt: ISODateString;
}

export interface FeedbackDetailsDto {
  id: ID;
  user: UserReferenceDto;
  recipeType: RecipeType;
  recipe: RecipeReferenceDto;
  feedbackType: FeedbackType;
  description: string;
  status: FeedbackStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface UpdateFeedbackDto {
  description: string;
}

export interface FeedbackResponseDto {
  message: string;
  feedbackId: ID;
}

// ===== Dashboard DTOs =====

export interface DashboardRecipeDto {
  id: ID;
  title: string;
  preparationTime: number;
  difficulty: Difficulty;
  nutritionalValues: {
    carbsPerServing: number;
  };
}

export interface DashboardRecentRecipeDto {
  id: ID;
  title: string;
  createdAt: ISODateString;
}

export interface DashboardAIUsageDto extends AIUsageDto {
  dailyLimit: number;
  remaining: number;
}

export interface DashboardDataDto {
  recipeOfDay: DashboardRecipeDto;
  recentRecipes: DashboardRecentRecipeDto[];
  aiUsage: DashboardAIUsageDto;
  preferences: UserPreferencesDto;
}

// ===== Recipe Comparison DTOs =====

export interface IngredientComparisonDto {
  original: {
    name: string;
    quantity: number;
    unit: string;
  };
  modified: {
    name: string;
    quantity: number;
    unit: string;
  };
  reason: string;
}

export interface StepComparisonDto {
  original: {
    number: number;
    description: string;
  };
  modified: {
    number: number;
    description: string;
  };
  reason: string;
}

export interface RecipeComparisonDto {
  original: {
    id: ID;
    title: string;
    ingredients: RecipeIngredientDto[];
    steps: RecipeStepDto[];
    nutritionalValues: NutritionalValuesDto;
  };
  modified: {
    id: ID;
    title: string;
    ingredients: ModifiedIngredientDto[];
    steps: ModifiedStepDto[];
    nutritionalValues: ModifiedNutritionalValuesDto;
  };
  changes: {
    ingredients: IngredientComparisonDto[];
    steps: StepComparisonDto[];
    nutritionalChanges: {
      carbsReduction: number;
      caloriesReduction: number;
    };
    summary: string;
  };
}

// ===== Pagination DTOs =====

export interface PaginatedResponseDto<T> {
  total: number;
  page: number;
  limit: number;
  items: T[];
}

export type PaginatedRecipesDto = PaginatedResponseDto<RecipeListItemDto> & { recipes: RecipeListItemDto[] };
export type PaginatedModifiedRecipesDto = PaginatedResponseDto<ModifiedRecipeListItemDto> & { modifiedRecipes: ModifiedRecipeListItemDto[] };
export type PaginatedIngredientsDto = PaginatedResponseDto<IngredientListItemDto> & { ingredients: IngredientListItemDto[] };
export type PaginatedFeedbackDto = PaginatedResponseDto<FeedbackListItemDto> & { feedbacks: FeedbackListItemDto[] }; 