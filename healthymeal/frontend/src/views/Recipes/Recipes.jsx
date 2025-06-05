import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../config/supabaseClient';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      toast.error('Błąd podczas pobierania przepisów');
      console.error(error);
    } finally {
      setLoading(false);
    }
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
      <Row className="mb-4">
        <Col>
          <h2>Moje Przepisy</h2>
          <Button 
            variant="primary" 
            onClick={() => navigate('/recipes/new')}
          >
            Dodaj Nowy Przepis
          </Button>
        </Col>
      </Row>
      
      <Row>
        {recipes.map((recipe) => (
          <Col key={recipe.id} md={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>{recipe.title}</Card.Title>
                <Card.Text>{recipe.description}</Card.Text>
                <Button 
                  variant="outline-primary"
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                >
                  Zobacz Szczegóły
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Recipes; 