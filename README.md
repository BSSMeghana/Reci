Here’s a good updated `README.md` for the root of your project:

```md
# Reci

Reci is a recipe discovery web app with search, filters, recommendations, and playful 3D food visuals. The project combines a React frontend with a Flask backend to help users discover recipes from ingredients, cravings, or filters such as diet, cuisine, meal type, mood, and dish type.

## Features

- Search recipes by ingredients, dish names, or broad cravings like `spicy`, `sweets`, `cake`, or `snacks`
- Filter recipes by:
  - Diet
  - Cuisine
  - Meal Type
  - Mood
  - Dish Type
- Filter-only recommendations when users do not type an ingredient
- Indian recipe-focused recommendation logic using a local CSV dataset
- Optional recipe enrichment using TheMealDB free API
- Recipe cards with ingredients, metadata, source links, and cooking instructions
- Interactive frontend with animated 3D food model showcase
- Separate About page explaining the project, technologies, frontend, backend, and recommendation logic

## Tech Stack

### Frontend

- React
- Create React App
- Axios
- Swiper
- Three.js
- React Three Fiber
- React Three Drei
- CSS / CSS Modules

### Backend

- Python
- Flask
- Flask-CORS
- Pandas
- Scikit-learn
- Joblib
- SciPy
- TheMealDB API

## Project Structure

```txt
reci/
├── backend/
│   ├── app.py
│   ├── oosedataset.csv
│   ├── nb_model.pkl
│   ├── label_encoder.pkl
│   ├── vectorizer_dish.pkl
│   ├── vectorizer_ingredients.pkl
│   └── vectorizer_dietary.pkl
├── frontend/
│   ├── public/
│   │   ├── *.glb
│   │   ├── *.gif
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── About.js
│       │   ├── Box.js
│       │   ├── Header.js
│       │   ├── Reci.js
│       │   └── ThreeModel.js
│       └── App.js
├── requirements.txt
└── README.md
```

## How It Works

The recommendation flow uses multiple layers:

1. The backend receives ingredients and filters from the React frontend.
2. It searches the local Indian recipe dataset for direct matches.
3. It expands broad user terms like `spicy`, `sweets`, `cake`, and `rice` into related recipe terms.
4. It ranks recipes using dish name, ingredients, diet, cuisine, meal type, mood, and dish type.
5. If direct matching is not enough, it can fall back to the saved machine learning category model.
6. It enriches recipe results with TheMealDB data when available.
7. If API instructions are not available, it generates practical fallback cooking steps based on dish type.

## Frontend Highlights

The frontend includes:

- A header with simple in-app navigation
- A 3D food showcase using GLB models, GIF backgrounds, Swiper, and Three.js
- A recipe search interface with a left-side filter panel
- Search support with both button click and Enter/Return key
- Recipe result cards with collapsible instructions
- A detailed About page
- Calm, dark UI styling for the recommendation section

The 3D food showcase was inspired by playful food animations seen through Awwwards. The exact reference website is not known, but the idea influenced the interactive visual direction of the `Box.js` section.

## Backend Highlights

The backend provides a Flask `/recommend` endpoint.

It supports:

- Ingredient-based search
- Filter-only search
- Diet filtering
- Cuisine filtering
- Meal type filtering
- Mood filtering
- Dish type filtering
- CSV-backed recommendation ranking
- TheMealDB enrichment
- Generated fallback instructions
- Machine learning category fallback using saved model/vectorizer files

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd reci
```

### 2. Backend Setup

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
cd backend
python app.py
```

The backend runs on:

```txt
http://127.0.0.1:5000
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

The frontend runs on:

```txt
http://localhost:3000
```

If port `3000` is busy, React may start on another port such as `3001`.

## API Endpoint

### `POST /recommend`

Request example:

```json
{
  "ingredients": ["paneer", "spinach"],
  "filters": {
    "dietary": "Veg",
    "cuisine": "North Indian",
    "mealType": "Main Meal",
    "mood": "Spicy",
    "dishType": "Curry"
  }
}
```

Response example:

```json
{
  "category": "Indian Ingredient Matches",
  "source": "csv-themealdb",
  "dishes": [
    {
      "Dish Name": "Palak Paneer",
      "Ingredients": "Paneer, Spinach, Garlic, Ginger, Spices",
      "Cuisine": "North Indian",
      "Meal Type": "Main Meal",
      "Mood": "Spicy",
      "Dish Type": "Curry",
      "Dietary Info": "Veg",
      "Instructions": "1. Prepare all ingredients before cooking..."
    }
  ]
}
```

## Notes

You may see a warning like this in the frontend:

```txt
Failed to parse source map from @mediapipe/tasks-vision
```

This comes from a dependency inside `node_modules`, not from the project code. The app still compiles and runs.

To hide source map warnings, create `frontend/.env`:

```env
GENERATE_SOURCEMAP=false
```

Then restart the frontend.

## Future Improvements

- Add a richer recipe dataset with complete instructions
- Improve image coverage for every recipe
- Add saved favorites
- Add user ratings
- Improve the ML recommendation model with more metadata
- Add authentication for personalized recommendations
- Add deployment configuration for frontend and backend

## Credits

- Recipe data: local Indian recipe CSV dataset
- Recipe enrichment: [TheMealDB](https://www.themealdb.com/api.php)
- 3D models: free GLB assets used in the frontend showcase
- Visual inspiration: food-focused interactive websites discovered through Awwwards
```
