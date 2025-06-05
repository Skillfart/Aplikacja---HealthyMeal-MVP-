const Recipe = require('../../models/Recipe');
const ModifiedRecipe = require('../../models/ModifiedRecipe');
const { CompareError } = require('../../errors/CompareError');
const logger = require('../../utils/logger');

/**
 * Kontroler do porównywania przepisów
 * @class CompareController
 */
class CompareController {
  /**
   * Porównuje oryginalny przepis z jego zmodyfikowaną wersją
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async compareRecipes(req, res) {
    try {
      const { originalId, modifiedId } = req.query;

      if (!originalId || !modifiedId) {
        throw new CompareError('Wymagane ID obu przepisów', 400);
      }

      // Pobierz oba przepisy
      const originalRecipe = await Recipe.findById(originalId);
      const modifiedRecipe = await ModifiedRecipe.findById(modifiedId);

      if (!originalRecipe || !modifiedRecipe) {
        throw new CompareError('Nie znaleziono jednego lub obu przepisów', 404);
      }

      // Sprawdź czy zmodyfikowany przepis jest powiązany z oryginalnym
      if (modifiedRecipe.originalRecipe._id.toString() !== originalId) {
        throw new CompareError('Przepisy nie są ze sobą powiązane', 400);
      }

      // Przygotuj porównanie
      const comparison = {
        original: {
          id: originalRecipe._id,
          title: originalRecipe.title,
          ingredients: originalRecipe.ingredients,
          steps: originalRecipe.steps,
          nutritionalValues: originalRecipe.nutritionalValues
        },
        modified: {
          id: modifiedRecipe._id,
          title: modifiedRecipe.title,
          ingredients: modifiedRecipe.ingredients,
          steps: modifiedRecipe.steps,
          nutritionalValues: modifiedRecipe.nutritionalValues
        },
        changes: {
          ingredients: modifiedRecipe.ingredients
            .filter(i => i.isModified)
            .map(i => ({
              original: originalRecipe.ingredients.find(
                oi => oi.ingredient._id.toString() === i.ingredient._id.toString()
              ),
              modified: i,
              reason: i.substitutionReason
            })),
          steps: modifiedRecipe.steps
            .filter(s => s.isModified)
            .map(s => ({
              original: originalRecipe.steps.find(os => os.number === s.number),
              modified: s,
              reason: s.modificationReason
            })),
          nutritionalChanges: {
            carbsReduction: modifiedRecipe.nutritionalValues.carbsReduction,
            caloriesReduction: modifiedRecipe.nutritionalValues.caloriesReduction
          },
          summary: modifiedRecipe.changesDescription
        }
      };

      logger.info('Porównano przepisy', { 
        originalId, 
        modifiedId,
        changesCount: comparison.changes.ingredients.length + comparison.changes.steps.length 
      });

      res.json(comparison);
    } catch (error) {
      logger.error('Błąd podczas porównywania przepisów', { error });
      throw error;
    }
  }
}

module.exports = new CompareController(); 