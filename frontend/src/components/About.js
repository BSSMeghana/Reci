import React from 'react';
import './About.css';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="about-inner">
        <h2>Reci is a recipe discovery app with playful 3D food visuals.</h2>
        <p>
          The project helps users discover recipes from simple inputs like paneer, cake, sweets,
          spicy food, or a set of ingredients. It also supports filter feature which helps in discovery, so users
          can browse by diet, cuisine, meal type, mood, and dish type even when they do not know
          exactly what they want to cook.
        </p>

        <div className="about-stack">
          <article className="about-card about-card-wide">
            <h3>Info</h3>
            <p>
              Reci is built as a full-stack recipe discovery experience. The frontend focuses on
              interaction, visual identity, filters, and recipe presentation. The backend handles
              recommendation logic, data processing, search expansion, filtering, API enrichment,
              and fallback instructions. The goal is to keep recommendations Indian-food focused
              while still making the app feel modern and exploratory.
            </p>
          </article>

          <div className="about-column">
            <article className="about-card">
              <h3>Technologies</h3>
              <ul>
                <li>React for the frontend interface.</li>
                <li>CSS modules and component CSS for styling.</li>
                <li>Swiper for the animated food carousel.</li>
                <li>Three.js with React Three Fiber for GLB food models.</li>
                <li>Axios for frontend to backend API requests.</li>
                <li>Flask for the Python backend API.</li>
                <li>Pandas for CSV recipe data handling.</li>
                <li>Scikit-learn and Joblib for the saved recommendation model/vectorizers.</li>
                <li>TheMealDB free API for optional recipe enrichment.</li>
              </ul>
            </article>

            <article className="about-card">
              <h3>Frontend</h3>
              <p>
                The frontend is organized into reusable React components such as <code>Header</code>,
                <code>Box</code>, <code>ThreeModel</code>, <code>BubbleText</code>, <code>Reci</code>,
                and <code>About</code>. The <code>Reci</code> component manages search text, filter
                state, loading state, errors, and recommendation results with React state hooks. It
                sends a structured POST request to the Flask backend using Axios, then renders the
                response as recipe cards with metadata, ingredients, source links, and instructions.
                The app also uses simple page state in <code>App.js</code> to switch between the Home
                and About pages without adding a routing dependency.
              </p>
            </article>

            <article className="about-card">
              <h3>Recommendation Logic</h3>
              <p>
                The recommendation flow is designed as a layered retrieval system. It first
                prioritizes high-confidence matches from the local recipe dataset by comparing the
                user input against dish names, ingredients, diet, cuisine, meal type, mood, and
                dish type. Broad cravings such as spicy, sweets, cake, snacks, rice, and drinks are
                expanded into related food terms so the search feels natural instead of requiring
                exact keywords. When direct matching is not enough, the backend can fall back to the
                saved machine learning category model and then return the strongest matching recipes
                for the frontend to display.
              </p>
            </article>

            <article className="about-card">
              <h3>3D Food Showcase</h3>
              <p>
                The animated food boxes in <code>Box.js</code> combine GIF backgrounds, Swiper
                scrolling, and Three.js GLB models. The idea was inspired by the playful food animations on the AWWWARDS. The GLB models are free from Sketchfab and Google Poly, and they are displayed in a 3D scene with a subtle rotation and lighting effect.
              </p>
            </article>
          </div>

          <div className="about-column">
            <article className="about-card">
              <h3>Interface Design</h3>
              <p>
                The interface balances an eye-catching 3D food showcase with a more focused recipe
                search experience. The animated models make the landing view feel playful and
                interactive, while the recommendation area keeps filtering separate from typing
                through a left-side panel. The result cards use readable spacing and collapsible
                instructions so users can scan recipes first and open details only when needed.
                The project also supports keyboard-friendly search, so pressing Enter in the input
                triggers the same action as clicking the RECIs button.
              </p>
            </article>

            <article className="about-card">
              <h3>Backend</h3>
              <p>
                The backend exposes a Flask <code>/recommend</code> endpoint. It accepts ingredients
                and filters, searches the recipe dataset, ranks matches, enriches recipes where
                possible, and returns structured JSON for the frontend. It also handles empty-input
                filter searches, so users can browse recommendations without typing ingredients.
              </p>
            </article>

            <article className="about-card">
              <h3>Filters and Metadata</h3>
              <p>
                Some metadata is available directly from the dataset, while other fields are inferred
                from dish names and ingredients. Cuisine, meal type, mood, and dish type help users
                narrow results without needing perfect search terms. Diet filtering was also improved
                so Veg, Non-Veg, and Vegan behave as separate choices.
              </p>
            </article>

            <article className="about-card">
              <h3>Future Improvements</h3>
              <p>
                Reci can be improved further by adding a richer recipe dataset, storing real
                instructions for every dish, adding better image coverage, supporting saved favorites,
                and improving the recommendation model with more recipe metadata.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
