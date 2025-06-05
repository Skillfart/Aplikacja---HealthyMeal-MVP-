-- Schemat bazy danych dla HealthyMeal

-- Tabela preferencji użytkownika
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    diet_type TEXT NOT NULL DEFAULT 'normal',
    max_carbs INTEGER DEFAULT 0,
    excluded_products TEXT[] DEFAULT '{}',
    allergens TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela przepisów
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    ingredients JSONB NOT NULL,
    steps JSONB NOT NULL,
    preparation_time INTEGER,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    servings INTEGER,
    tags TEXT[],
    nutritional_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela modyfikacji AI
CREATE TABLE ai_modifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    recipe_id UUID REFERENCES recipes(id) NOT NULL,
    modified_recipe JSONB NOT NULL,
    changes_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela zgłoszeń błędów
CREATE TABLE recipe_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    recipe_id UUID REFERENCES recipes(id) NOT NULL,
    feedback_type TEXT CHECK (feedback_type IN ('error', 'suggestion', 'improvement')),
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Polityki bezpieczeństwa RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_feedback ENABLE ROW LEVEL SECURITY;

-- Polityki dla user_preferences
CREATE POLICY "Users can read own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Polityki dla recipes
CREATE POLICY "Users can read own recipes"
    ON recipes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes"
    ON recipes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
    ON recipes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
    ON recipes FOR DELETE
    USING (auth.uid() = user_id);

-- Polityki dla ai_modifications
CREATE POLICY "Users can read own modifications"
    ON ai_modifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own modifications"
    ON ai_modifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Polityki dla recipe_feedback
CREATE POLICY "Users can read own feedback"
    ON recipe_feedback FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert feedback"
    ON recipe_feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Indeksy
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_title ON recipes USING gin(to_tsvector('english', title));
CREATE INDEX idx_ai_modifications_user_id ON ai_modifications(user_id);
CREATE INDEX idx_ai_modifications_recipe_id ON ai_modifications(recipe_id);
CREATE INDEX idx_recipe_feedback_user_id ON recipe_feedback(user_id);
CREATE INDEX idx_recipe_feedback_recipe_id ON recipe_feedback(recipe_id); 