import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import './Reci.css';

function Reci() {
  const [input, setInput] = useState('');
  const [dietary, setDietary] = useState('');
  const [cuisine, setCuisine] = useState('Indian');
  const [mealType, setMealType] = useState('');
  const [mood, setMood] = useState('');
  const [dishType, setDishType] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dietaryOptions = ['', 'Vegan', 'Veg', 'Non-Veg', 'Non-Veg/Veg', 'Veg/Non-Veg'];
  const cuisineOptions = [
    '',
    'Indian',
    'South Indian',
    'North Indian',
    'Punjabi',
    'Gujarati',
    'Maharashtrian',
    'Bengali',
    'Indo-Chinese',
  ];
  const mealTypeOptions = ['', 'Breakfast', 'Main Meal', 'Snack', 'Dessert', 'Beverage', 'Anytime'];
  const moodOptions = ['', 'Spicy', 'Sweet', 'Tangy', 'Savory', 'Mild'];
  const dishTypeOptions = [
    '',
    'Curry',
    'Rice',
    'Bread',
    'Snack',
    'Appetizer',
    'Dessert',
    'Sweet',
    'Soup',
    'Beverage',
    'Street Food',
    'Pasta',
    'Chutney',
    'Pickle',
    'Cake',
    'Biscuits',
  ];

  const fetchRecommendations = useCallback(async (ingredients, filters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://127.0.0.1:5000/recommend', {
        ingredients,
        filters,
      });
      setResults(response.data);
    } catch (err) {
      setError('Oops! Couldn’t fetch recipes. Try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations([], {
      dietary: '',
      cuisine: 'Indian',
      mealType: '',
      mood: '',
      dishType: '',
    });
  }, [fetchRecommendations]);

  const handleSearch = async (event) => {
    if (event) {
      event.preventDefault();
    }

    const ingredients = input.split(',').map(i => i.trim()).filter(Boolean);

    fetchRecommendations(ingredients, {
      dietary,
      cuisine,
      mealType,
      mood,
      dishType,
    });
  };

  return (
    <div className="reci-container">
      <div className="reci-shell">
        <aside className="reci-filter-panel">
          <p className="reci-panel-label">Filters</p>
          <label className="reci-field">
            <span>Diet</span>
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="reci-select"
            >
              {dietaryOptions.map((option) => (
                <option key={option || 'Any diet'} value={option}>
                  {option || 'Any diet'}
                </option>
              ))}
            </select>
          </label>
          <label className="reci-field">
            <span>Cuisine</span>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="reci-select"
            >
              {cuisineOptions.map((option) => (
                <option key={option || 'Any cuisine'} value={option}>
                  {option || 'Any cuisine'}
                </option>
              ))}
            </select>
          </label>
          <label className="reci-field">
            <span>Meal Type</span>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="reci-select"
            >
              {mealTypeOptions.map((option) => (
                <option key={option || 'Any meal'} value={option}>
                  {option || 'Any meal'}
                </option>
              ))}
            </select>
          </label>
          <label className="reci-field">
            <span>Mood</span>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="reci-select"
            >
              {moodOptions.map((option) => (
                <option key={option || 'Any mood'} value={option}>
                  {option || 'Any mood'}
                </option>
              ))}
            </select>
          </label>
          <label className="reci-field">
            <span>Dish Type</span>
            <select
              value={dishType}
              onChange={(e) => setDishType(e.target.value)}
              className="reci-select"
            >
              {dishTypeOptions.map((option) => (
                <option key={option || 'Any dish type'} value={option}>
                  {option || 'Any dish type'}
                </option>
              ))}
            </select>
          </label>
        </aside>

        <main className="reci-main">
          <form className="reci-search-row" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="e.g., paneer, spinach"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="reci-input"
            />
            <button type="submit" disabled={loading} className="reci-button">
              {loading ? 'Searching...' : 'RECIs'}
            </button>
          </form>

          {error && <p className="reci-error">{error}</p>}

          {results && (
            <div className="reci-results">
              <h2 className="reci-category">Category: {results.category}</h2>
              {results.dishes.map((dish, idx) => (
                <div key={idx} className={`reci-card ${dish.Image ? 'reci-card-with-image' : ''}`}>
                  {dish.Image && (
                    <img src={dish.Image} alt={dish['Dish Name']} className="reci-card-image" />
                  )}
                  <h3>{dish['Dish Name']}</h3>
                  {dish.Area && <p><strong>Area:</strong> {dish.Area}</p>}
                  {dish.Cuisine && <p><strong>Cuisine:</strong> {dish.Cuisine}</p>}
                  {dish['Meal Type'] && <p><strong>Meal:</strong> {dish['Meal Type']}</p>}
                  {dish.Mood && <p><strong>Mood:</strong> {dish.Mood}</p>}
                  {dish['Dish Type'] && <p><strong>Dish Type:</strong> {dish['Dish Type']}</p>}
                  {dish['Dietary Info'] && <p><strong>Diet:</strong> {dish['Dietary Info']}</p>}
                  <p><strong>Ingredients:</strong> {dish.Ingredients}</p>
                  {dish.Instructions && (
                    <details className="reci-instructions">
                      <summary>Instructions</summary>
                      <p>{dish.Instructions}</p>
                    </details>
                  )}
                  {dish.Source && (
                    <a
                      href={dish.Source}
                      target="_blank"
                      rel="noreferrer"
                      className="reci-source-link"
                    >
                      View recipe
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Reci;
