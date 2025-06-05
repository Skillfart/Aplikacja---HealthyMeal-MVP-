import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../config/supabaseClient';

const RecipeModification = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: ''
  });

  useEffect(() => {
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) setRecipe(data);
    } catch (error) {
      toast.error('Błąd podczas pobierania przepisu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const recipeData = {
        ...recipe,
        user_id: user.id,
        updated_at: new Date()
      };

      let error;
      if (id) {
        ({ error } = await supabase
          .from('recipes')
          .update(recipeData)
          .eq('id', id));
      } else {
        ({ error } = await supabase
          .from('recipes')
          .insert([{ ...recipeData, created_at: new Date() }]));
      }

      if (error) throw error;
      toast.success(id ? 'Przepis zaktualizowany' : 'Przepis dodany');
      navigate('/recipes');
    } catch (error) {
      toast.error('Wystąpił błąd podczas zapisywania');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2>{id ? 'Edytuj Przepis' : 'Nowy Przepis'}</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Tytuł</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={recipe.title}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Opis</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={recipe.description}
            onChange={handleChange}
            rows={3}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Składniki</Form.Label>
          <Form.Control
            as="textarea"
            name="ingredients"
            value={recipe.ingredients}
            onChange={handleChange}
            rows={5}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Instrukcje</Form.Label>
          <Form.Control
            as="textarea"
            name="instructions"
            value={recipe.instructions}
            onChange={handleChange}
            rows={5}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              <span className="ms-2">Zapisywanie...</span>
            </>
          ) : (
            'Zapisz Przepis'
          )}
        </Button>
      </Form>
    </Container>
  );
};

export default RecipeModification; 