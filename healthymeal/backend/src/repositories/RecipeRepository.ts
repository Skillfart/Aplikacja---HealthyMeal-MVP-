import { BaseRepository, DatabaseError, NotFoundError } from './BaseRepository';
import { Recipe } from '../models/Recipe';
import { prisma } from '../config/database';

export class RecipeRepository implements BaseRepository<Recipe> {
  async findAll(): Promise<Recipe[]> {
    try {
      return await prisma.recipe.findMany({
        include: {
          ingredients: true,
          nutritionalValues: true
        }
      });
    } catch (error) {
      throw new DatabaseError('Błąd podczas pobierania przepisów', error);
    }
  }

  async findById(id: string): Promise<Recipe | null> {
    try {
      const recipe = await prisma.recipe.findUnique({
        where: { id },
        include: {
          ingredients: true,
          nutritionalValues: true
        }
      });

      if (!recipe) {
        throw new NotFoundError(`Przepis o ID ${id} nie został znaleziony`);
      }

      return recipe;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Błąd podczas pobierania przepisu o ID ${id}`, error);
    }
  }

  async create(data: Partial<Recipe>): Promise<Recipe> {
    try {
      return await prisma.recipe.create({
        data: {
          ...data,
          ingredients: {
            create: data.ingredients
          },
          nutritionalValues: {
            create: data.nutritionalValues
          }
        },
        include: {
          ingredients: true,
          nutritionalValues: true
        }
      });
    } catch (error) {
      throw new DatabaseError('Błąd podczas tworzenia przepisu', error);
    }
  }

  async update(id: string, data: Partial<Recipe>): Promise<Recipe> {
    try {
      return await prisma.recipe.update({
        where: { id },
        data: {
          ...data,
          ingredients: {
            deleteMany: {},
            create: data.ingredients
          },
          nutritionalValues: {
            update: data.nutritionalValues
          }
        },
        include: {
          ingredients: true,
          nutritionalValues: true
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError(`Przepis o ID ${id} nie został znaleziony`);
      }
      throw new DatabaseError(`Błąd podczas aktualizacji przepisu o ID ${id}`, error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.recipe.delete({
        where: { id }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError(`Przepis o ID ${id} nie został znaleziony`);
      }
      throw new DatabaseError(`Błąd podczas usuwania przepisu o ID ${id}`, error);
    }
  }
} 