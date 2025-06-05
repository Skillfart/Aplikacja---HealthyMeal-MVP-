/**
 * @vitest-environment jsdom 
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProfileByUserId, createProfile, updateProfile, deleteProfile } from '../../../frontend/src/services/profilesService';
import mockSupabase from '../../mocks/supabase';

// Mock Supabase
vi.mock('../../../frontend/src/config/supabaseClient', () => ({
  default: mockSupabase
}));

describe('User Profile Service', () => {
  const userId = 'test-user-123';
  const mockProfile = {
    id: userId,
    name: 'Test User',
    diet_type: 'vegetarian',
    max_carbs: 100,
    excluded_products: ['milk', 'eggs'],
    allergens: ['gluten']
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfileByUserId', () => {
    it('powinien pobierać profil użytkownika po ID', async () => {
      // Ustaw mock dla supabase.single()
      mockSupabase.single.mockResolvedValue({
        data: mockProfile,
        error: null
      });

      const result = await getProfileByUserId(userId);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', userId);
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result.data).toEqual(mockProfile);
      expect(result.error).toBeNull();
    });

    it('powinien obsługiwać błędy przy pobieraniu profilu', async () => {
      const mockError = new Error('Database error');
      mockSupabase.single.mockRejectedValue(mockError);

      const result = await getProfileByUserId(userId);
      
      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('createProfile', () => {
    it('powinien tworzyć nowy profil użytkownika', async () => {
      mockSupabase.insert.mockResolvedValue({ error: null });

      const result = await createProfile(userId, 'Test User', {
        dietType: 'vegetarian',
        maxCarbs: 100,
        excludedProducts: ['milk', 'eggs'],
        allergens: ['gluten']
      });
      
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        id: userId,
        name: 'Test User',
        diet_type: 'vegetarian',
        max_carbs: 100,
        excluded_products: ['milk', 'eggs'],
        allergens: ['gluten']
      }));
      expect(result.error).toBeNull();
    });

    it('powinien używać domyślnych preferencji, gdy nie podano', async () => {
      mockSupabase.insert.mockResolvedValue({ error: null });

      await createProfile(userId, 'Test User');
      
      expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        diet_type: 'normal',
        max_carbs: 0,
        excluded_products: [],
        allergens: []
      }));
    });

    it('powinien obsługiwać błędy przy tworzeniu profilu', async () => {
      const mockError = new Error('Insert error');
      mockSupabase.insert.mockRejectedValue(mockError);

      const result = await createProfile(userId, 'Test User');
      
      expect(result.error).toEqual(mockError);
    });
  });

  describe('updateProfile', () => {
    it('powinien aktualizować profil użytkownika', async () => {
      mockSupabase.update.mockResolvedValue({ error: null });

      const result = await updateProfile(userId, {
        name: 'Updated Name',
        diet_type: 'keto'
      });
      
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Updated Name',
        diet_type: 'keto',
        updated_at: expect.any(Date)
      }));
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', userId);
      expect(result.error).toBeNull();
    });

    it('powinien obsługiwać błędy przy aktualizacji profilu', async () => {
      const mockError = new Error('Update error');
      mockSupabase.update.mockRejectedValue(mockError);

      const result = await updateProfile(userId, { name: 'Updated Name' });
      
      expect(result.error).toEqual(mockError);
    });
  });

  describe('deleteProfile', () => {
    it('powinien usuwać profil użytkownika', async () => {
      mockSupabase.delete.mockResolvedValue({ error: null });

      const result = await deleteProfile(userId);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', userId);
      expect(result.error).toBeNull();
    });

    it('powinien obsługiwać błędy przy usuwaniu profilu', async () => {
      const mockError = new Error('Delete error');
      mockSupabase.delete.mockRejectedValue(mockError);

      const result = await deleteProfile(userId);
      
      expect(result.error).toEqual(mockError);
    });
  });

  // Testy wydajnościowe
  describe('performance', () => {
    it('powinien szybko pobierać profil użytkownika (< 200ms)', async () => {
      mockSupabase.single.mockResolvedValue({ data: mockProfile, error: null });
      
      const startTime = performance.now();
      await getProfileByUserId(userId);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  // Testy bezpieczeństwa
  describe('security', () => {
    it('powinien obsługiwać przypadki braku autoryzacji', async () => {
      const authError = {
        code: 401,
        message: 'Unauthorized',
        details: 'JWT token invalid'
      };
      
      mockSupabase.single.mockRejectedValue(authError);
      
      const result = await getProfileByUserId(userId);
      
      expect(result.data).toBeNull();
      expect(result.error).toEqual(authError);
    });
  });
}); 