const Recipe = require('../../models/Recipe');
const ModifiedRecipe = require('../../models/ModifiedRecipe');
const { PrintError } = require('../../errors/PrintError');
const logger = require('../../utils/logger');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

/**
 * Kontroler do drukowania przepisów
 * @class PrintController
 */
class PrintController {
  /**
   * Generuje wersję do druku przepisu
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async printRecipe(req, res) {
    try {
      const { id } = req.params;
      const { format = 'html' } = req.query;
      const isModified = req.query.type === 'modified';

      // Pobierz przepis
      const recipe = isModified
        ? await ModifiedRecipe.findById(id)
        : await Recipe.findById(id);

      if (!recipe) {
        throw new PrintError('Nie znaleziono przepisu', 404);
      }

      // Przygotuj dane do szablonu
      const templateData = {
        title: recipe.title,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        preparationTime: recipe.preparationTime,
        servings: recipe.servings,
        nutritionalValues: recipe.nutritionalValues,
        isModified,
        modificationInfo: isModified ? {
          originalTitle: recipe.originalRecipe.title,
          changesDescription: recipe.changesDescription,
          carbsReduction: recipe.nutritionalValues.carbsReduction
        } : null
      };

      // Wygeneruj HTML
      const template = await ejs.renderFile(
        path.join(__dirname, '../../views/print-recipe.ejs'),
        templateData
      );

      if (format === 'html') {
        res.setHeader('Content-Type', 'text/html');
        res.send(template);
      } else if (format === 'pdf') {
        // Generuj PDF
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setContent(template);
        
        const pdf = await page.pdf({
          format: 'A4',
          margin: {
            top: '2cm',
            right: '2cm',
            bottom: '2cm',
            left: '2cm'
          }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="przepis-${recipe.title}.pdf"`);
        res.send(pdf);
      } else {
        throw new PrintError('Nieobsługiwany format', 400);
      }

      logger.info('Wygenerowano wersję do druku', { 
        recipeId: id, 
        format,
        isModified 
      });
    } catch (error) {
      logger.error('Błąd podczas generowania wersji do druku', { error });
      throw error;
    }
  }
}

module.exports = new PrintController(); 