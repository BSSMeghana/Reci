from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from scipy.sparse import hstack
import pandas as pd
from urllib.parse import quote
from urllib.request import urlopen
import json
import ssl

try:
    import certifi
except ImportError:
    certifi = None

# Load model and vectorizers
model = joblib.load('nb_model.pkl')
vectorizer_dish = joblib.load('vectorizer_dish.pkl')
vectorizer_ingredients = joblib.load('vectorizer_ingredients.pkl')
vectorizer_dietary = joblib.load('vectorizer_dietary.pkl')
label_encoder = joblib.load('label_encoder.pkl')

df = pd.read_csv('oosedataset.csv')
df["Dietary Info"] = df["Dietary Info"].fillna("")
df["Category"] = df["Category"].fillna("")


app = Flask(__name__)
CORS(app)

THEMEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1"
PREFERRED_AREA = "Indian"


def infer_cuisine(row):
    dish_text = f"{row.get('Dish Name', '')} {row.get('Ingredients', '')}".lower()
    cuisine_keywords = {
        "South Indian": [
            "idli", "dosa", "sambar", "rasam", "uttapam", "pongal", "avial",
            "appam", "puttu", "upma", "puliyodarai", "curd rice",
        ],
        "North Indian": [
            "paneer", "paratha", "naan", "kulcha", "kofta", "dal makhani",
            "butter masala", "rajma", "chole", "kadhai", "shahi",
        ],
        "Punjabi": ["sarson", "makki", "lassi", "amritsari", "chole bhature"],
        "Gujarati": ["dhokla", "thepla", "khandvi", "undhiyu", "khakhra", "fafda"],
        "Maharashtrian": ["vada pav", "misal", "pav bhaji", "puran poli", "modak"],
        "Bengali": ["rasgulla", "sandesh", "mishti", "macher", "shorshe"],
        "Indo-Chinese": ["chilli", "manchurian", "hakka", "schezwan", "noodles"],
    }

    for cuisine, keywords in cuisine_keywords.items():
        if any(keyword in dish_text for keyword in keywords):
            return cuisine

    return PREFERRED_AREA


if "Cuisine" not in df.columns:
    df["Cuisine"] = df.apply(infer_cuisine, axis=1)
else:
    df["Cuisine"] = df["Cuisine"].fillna(PREFERRED_AREA)


def infer_meal_type(row):
    category = str(row.get("Category", "")).lower()
    dish_text = f"{row.get('Dish Name', '')} {row.get('Ingredients', '')}".lower()

    if category in ["breakfast", "beverage", "dessert", "desserts", "sweet"]:
        return category.title()
    if category in ["snack", "snacks", "salty snack", "appetizer", "street food"]:
        return "Snack"
    if category in ["rice", "bread", "curry", "main", "dal", "pasta"]:
        return "Main Meal"
    if any(term in dish_text for term in ["idli", "dosa", "upma", "pongal", "paratha"]):
        return "Breakfast"
    if any(term in dish_text for term in ["lado", "ladoo", "halwa", "kheer", "payasam", "jalebi"]):
        return "Dessert"
    return "Anytime"


def infer_mood(row):
    category = str(row.get("Category", "")).lower()
    dish_text = f"{row.get('Dish Name', '')} {row.get('Ingredients', '')}".lower()

    if any(term in dish_text for term in ["chilli", "chilies", "chili", "pepper", "masala", "spicy"]):
        return "Spicy"
    if any(term in dish_text for term in ["tamarind", "lemon", "lime", "chaat", "pickle"]):
        return "Tangy"
    if category in ["dessert", "desserts", "sweet", "cakes", "cake"] or any(
        term in dish_text for term in ["sugar", "jaggery", "honey", "kheer", "ladoo", "halwa"]
    ):
        return "Sweet"
    if any(term in dish_text for term in ["curd", "cream", "coconut milk", "malai", "mild"]):
        return "Mild"
    return "Savory"


def infer_dish_type(row):
    category = str(row.get("Category", "")).strip()
    category_lookup = {
        "Cakes": "Cake",
        "Desserts": "Dessert",
        "Snacks": "Snack",
        "Salty Snack": "Snack",
        "Biscuit": "Biscuits",
        "Baked Good": "Baked",
        "Flatbread": "Bread",
        "Wrap": "Wraps",
    }
    return category_lookup.get(category, category or "Other")


def build_basic_instructions(dish):
    dish_name = dish.get("Dish Name", "the dish")
    ingredients = dish.get("Ingredients", "the listed ingredients")
    dish_type = str(dish.get("Dish Type") or dish.get("Category") or "").lower()
    mood = str(dish.get("Mood") or "").lower()

    spice_note = "Adjust chili, pepper, and garam masala to taste." if mood == "spicy" else "Adjust salt and spices to taste."

    if "rice" in dish_type:
        return (
            f"1. Rinse the rice well and cook it until it is almost done, then keep it aside.\n"
            f"2. Prepare the remaining ingredients: {ingredients}.\n"
            f"3. Heat oil or ghee in a heavy pan. Add whole spices first, then saute onions, chilies, ginger, garlic, or curry leaves if listed.\n"
            f"4. Add the vegetables, paneer, meat, or other main ingredients and cook until they soften and absorb the spices.\n"
            f"5. Fold in the cooked rice gently so the grains do not break. Sprinkle a little water if it feels dry.\n"
            f"6. Cover and cook on low heat for 5 to 8 minutes. Rest {dish_name} for a few minutes before serving."
        )
    if "bread" in dish_type:
        return (
            f"1. Prepare a soft dough using the flour or base ingredient listed: {ingredients}.\n"
            f"2. Rest the dough for 15 to 20 minutes so it becomes easier to roll.\n"
            f"3. If the recipe has a filling, mix the filling ingredients with salt and spices.\n"
            f"4. Divide the dough into portions, roll each one evenly, and add filling if needed.\n"
            f"5. Cook on a hot tawa or pan, brushing with oil or ghee, until both sides have golden spots.\n"
            f"6. Serve {dish_name} warm with chutney, pickle, curd, or curry."
        )
    if "snack" in dish_type or "appetizer" in dish_type:
        return (
            f"1. Wash, chop, and prepare the ingredients: {ingredients}.\n"
            f"2. Mix the ingredients with salt, spices, and a binding ingredient such as flour, crumbs, yogurt, or mashed potato if needed.\n"
            f"3. Shape the mixture into small portions, or coat the pieces evenly with the prepared batter or marinade.\n"
            f"4. Heat oil in a pan. Fry, shallow-fry, bake, or saute until the outside is crisp and the inside is cooked.\n"
            f"5. Drain excess oil if fried. Sprinkle chaat masala, lemon juice, or herbs if suitable.\n"
            f"6. Serve {dish_name} hot with chutney, sauce, or a fresh salad."
        )
    if "dessert" in dish_type or "sweet" in dish_type or "cake" in dish_type:
        return (
            f"1. Measure and prepare the ingredients: {ingredients}.\n"
            f"2. Grease the pan, tray, or mold if the dish needs baking or setting.\n"
            f"3. Cook milk, sugar, jaggery, flour, fruit, or other base ingredients on low to medium heat as needed.\n"
            f"4. Stir often so the mixture does not stick or burn. Add cardamom, saffron, nuts, or flavoring near the end if listed.\n"
            f"5. For cakes or baked sweets, pour into the prepared pan and bake until set and lightly golden.\n"
            f"6. Let {dish_name} cool slightly. Garnish and serve warm, chilled, or at room temperature."
        )
    if "beverage" in dish_type:
        return (
            f"1. Prepare the ingredients: {ingredients}.\n"
            f"2. If using milk, tea, spices, or fruit, simmer or blend them according to the drink style.\n"
            f"3. Strain the mixture if needed for a smoother texture.\n"
            f"4. Adjust sweetness, spice, thickness, and temperature to taste.\n"
            f"5. Serve {dish_name} chilled, warm, or over ice depending on the recipe."
        )

    return (
        f"1. Prepare all ingredients before cooking: {ingredients}.\n"
        f"2. Heat oil or ghee in a pan. Add whole spices first if using them, then saute onions, ginger, garlic, curry leaves, or chilies until aromatic.\n"
        f"3. Add tomatoes, coconut, yogurt, cream, or other sauce ingredients if listed. Cook until the raw smell fades and the masala thickens.\n"
        f"4. Add the main ingredient and mix well so it is coated with the masala. {spice_note}\n"
        f"5. Add a little water if a gravy is needed. Cover and simmer until everything is cooked through and the flavors come together.\n"
        f"6. Finish {dish_name} with herbs, lemon, cream, ghee, or garnish if suitable. Serve hot with rice, roti, dosa, or bread."
    )


for column, inferer in {
    "Meal Type": infer_meal_type,
    "Mood": infer_mood,
    "Dish Type": infer_dish_type,
}.items():
    if column not in df.columns:
        df[column] = df.apply(inferer, axis=1)
    else:
        df[column] = df[column].fillna("")


def fetch_themealdb(path):
    ssl_context = None
    if certifi:
        ssl_context = ssl.create_default_context(cafile=certifi.where())

    with urlopen(f"{THEMEALDB_BASE_URL}/{path}", timeout=8, context=ssl_context) as response:
        return json.loads(response.read().decode("utf-8"))


def normalize_ingredient(ingredient):
    return ingredient.strip().lower().replace(" ", "_")


def meal_ingredients(meal):
    ingredients = []
    for index in range(1, 21):
        ingredient = (meal.get(f"strIngredient{index}") or "").strip()
        measure = (meal.get(f"strMeasure{index}") or "").strip()
        if ingredient:
            ingredients.append(f"{measure} {ingredient}".strip())
    return ingredients


def recipe_match_score(meal, requested_ingredients):
    recipe_ingredients = " ".join(meal_ingredients(meal)).lower()
    return sum(1 for ingredient in requested_ingredients if ingredient.lower() in recipe_ingredients)


def expand_search_terms(terms):
    expanded_terms = []
    term_groups = {
        "cake": ["cake", "cakes", "cheesecake"],
        "cakes": ["cake", "cakes", "cheesecake"],
        "sweet": ["sweet", "sweets", "dessert", "desserts", "sugar", "jaggery"],
        "sweets": ["sweet", "sweets", "dessert", "desserts", "sugar", "jaggery"],
        "dessert": ["dessert", "desserts", "sweet", "sugar", "jaggery"],
        "desserts": ["dessert", "desserts", "sweet", "sugar", "jaggery"],
        "spicy": ["spicy", "chilli", "chilies", "chili", "pepper", "masala", "garam masala"],
        "hot": ["spicy", "chilli", "chilies", "chili", "pepper", "masala"],
        "snack": ["snack", "snacks", "appetizer", "pakora", "cutlet"],
        "snacks": ["snack", "snacks", "appetizer", "pakora", "cutlet"],
        "breakfast": ["breakfast", "idli", "dosa", "upma", "pongal", "paratha"],
        "rice": ["rice", "biryani", "pulao"],
        "drink": ["drink", "beverage", "lassi", "tea", "milk"],
        "drinks": ["drink", "beverage", "lassi", "tea", "milk"],
    }

    for term in terms:
        normalized_term = term.strip().lower()
        if not normalized_term:
            continue
        expanded_terms.extend(term_groups.get(normalized_term, [normalized_term]))

    return list(dict.fromkeys(expanded_terms))


def csv_match_score(row, ingredients):
    dish_name = str(row.get("Dish Name", "")).lower()
    row_ingredients = str(row.get("Ingredients", "")).lower()
    row_category = str(row.get("Category", "")).lower()
    row_cuisine = str(row.get("Cuisine", "")).lower()
    row_dietary = str(row.get("Dietary Info", "")).lower()
    score = 0

    for term in expand_search_terms(ingredients):
        if not term:
            continue
        if term in dish_name:
            score += 3
        if term in row_ingredients:
            score += 2
        if term in row_category:
            score += 2
        if term in row_cuisine:
            score += 1
        if term in row_dietary:
            score += 1

    return score


def matches_filters(row, filters=None):
    filters = filters or {}
    dietary_filter = filters.get("dietary")
    cuisine_filter = filters.get("cuisine")
    meal_type_filter = filters.get("mealType")
    mood_filter = filters.get("mood")
    dish_type_filter = filters.get("dishType")

    if dietary_filter:
        dietary_values = [
            value.strip().lower()
            for value in str(row.get("Dietary Info", "")).replace("/", ",").split(",")
        ]
        if dietary_filter.lower() not in dietary_values:
            return False

    if cuisine_filter:
        row_cuisine = str(row.get("Cuisine", "")).lower()
        if row_cuisine != cuisine_filter.lower():
            return False

    if meal_type_filter:
        row_meal_type = str(row.get("Meal Type", "")).lower()
        if row_meal_type != meal_type_filter.lower():
            return False

    if mood_filter:
        row_mood = str(row.get("Mood", "")).lower()
        if row_mood != mood_filter.lower():
            return False

    if dish_type_filter:
        row_dish_type = str(row.get("Dish Type", "")).lower()
        if row_dish_type != dish_type_filter.lower():
            return False

    return True


def get_direct_csv_recommendations(ingredients, filters=None):
    scored_results = []
    seen_dishes = set()

    for _, row in df.iterrows():
        if not matches_filters(row, filters):
            continue

        score = csv_match_score(row, ingredients)
        if score == 0:
            continue

        dish_name = row["Dish Name"]
        normalized_dish_name = dish_name.strip().lower()
        if normalized_dish_name in seen_dishes:
            continue

        seen_dishes.add(normalized_dish_name)
        scored_results.append({
            "Dish Name": dish_name,
            "Ingredients": row["Ingredients"],
            "Category": row["Category"],
            "Cuisine": row["Cuisine"],
            "Meal Type": row["Meal Type"],
            "Mood": row["Mood"],
            "Dish Type": row["Dish Type"],
            "Dietary Info": row["Dietary Info"],
            "Instructions": build_basic_instructions(row),
            "matchScore": score,
        })

    scored_results.sort(key=lambda recipe: recipe["matchScore"], reverse=True)
    return scored_results[:10]


def get_filtered_csv_recommendations(filters=None):
    filtered_results = []
    seen_dishes = set()

    for _, row in df.iterrows():
        if not matches_filters(row, filters):
            continue

        dish_name = row["Dish Name"]
        normalized_dish_name = dish_name.strip().lower()
        if normalized_dish_name in seen_dishes:
            continue

        seen_dishes.add(normalized_dish_name)
        filtered_results.append({
            "Dish Name": dish_name,
            "Ingredients": row["Ingredients"],
            "Category": row["Category"],
            "Cuisine": row["Cuisine"],
            "Meal Type": row["Meal Type"],
            "Mood": row["Mood"],
            "Dish Type": row["Dish Type"],
            "Dietary Info": row["Dietary Info"],
            "Instructions": build_basic_instructions(row),
            "matchScore": 0,
        })

    return filtered_results[:10]


def get_recipe_details(meals, ingredients):
    recipes = []
    for meal in meals[:12]:
        meal_id = meal.get("idMeal")
        if not meal_id:
            continue

        detail_data = fetch_themealdb(f"lookup.php?i={quote(meal_id)}")
        detail = (detail_data.get("meals") or [None])[0]
        if not detail:
            continue

        ingredients_list = meal_ingredients(detail)
        recipes.append({
            "Dish Name": detail.get("strMeal"),
            "Ingredients": ", ".join(ingredients_list),
            "Image": detail.get("strMealThumb"),
            "Instructions": detail.get("strInstructions"),
            "Source": detail.get("strSource") or detail.get("strYoutube"),
            "Area": detail.get("strArea"),
            "Category": detail.get("strCategory"),
            "matchScore": recipe_match_score(detail, ingredients),
        })

    recipes.sort(key=lambda recipe: recipe["matchScore"], reverse=True)
    return [recipe for recipe in recipes if recipe["Dish Name"]][:10]


def get_indian_themealdb_recommendations(ingredients):
    area_data = fetch_themealdb(f"filter.php?a={quote(PREFERRED_AREA)}")
    indian_meals = area_data.get("meals") or []
    recipes = get_recipe_details(indian_meals, ingredients)
    matched_recipes = [recipe for recipe in recipes if recipe["matchScore"] > 0]
    return matched_recipes or recipes


def get_themealdb_recommendations(ingredients):
    primary_ingredient = normalize_ingredient(ingredients[0])
    filtered_data = fetch_themealdb(f"filter.php?i={quote(primary_ingredient)}")
    meals = filtered_data.get("meals") or []
    recipes = get_recipe_details(meals, ingredients)
    indian_recipes = [recipe for recipe in recipes if recipe.get("Area") == PREFERRED_AREA]
    return indian_recipes or recipes


def enrich_csv_recommendations_with_themealdb(results, enrichment_limit=5):
    enriched_results = []
    for index, result in enumerate(results):
        enriched_result = dict(result)
        dish_name = enriched_result.get("Dish Name")
        if not dish_name:
            enriched_results.append(enriched_result)
            continue

        if index >= enrichment_limit:
            enriched_result["Area"] = PREFERRED_AREA
            enriched_result.setdefault("Instructions", build_basic_instructions(enriched_result))
            enriched_results.append(enriched_result)
            continue

        try:
            search_data = fetch_themealdb(f"search.php?s={quote(dish_name)}")
            meal = (search_data.get("meals") or [None])[0]
            if meal:
                api_ingredients = meal_ingredients(meal)
                enriched_result.update({
                    "Ingredients": ", ".join(api_ingredients) or enriched_result.get("Ingredients"),
                    "Image": meal.get("strMealThumb"),
                    "Instructions": meal.get("strInstructions"),
                    "Source": meal.get("strSource") or meal.get("strYoutube"),
                    "Area": meal.get("strArea") or PREFERRED_AREA,
                    "Category": meal.get("strCategory"),
                })
            else:
                enriched_result["Area"] = PREFERRED_AREA
                enriched_result.setdefault("Instructions", build_basic_instructions(enriched_result))
        except Exception as error:
            print(f"TheMealDB enrichment failed for {dish_name}: {error}")
            enriched_result["Area"] = PREFERRED_AREA
            enriched_result.setdefault("Instructions", build_basic_instructions(enriched_result))

        enriched_results.append(enriched_result)

    return enriched_results


def get_csv_recommendations(ingredients, filters=None):
    filters = filters or {}
    dietary_filter = filters.get("dietary")
    cuisine_filter = filters.get("cuisine")

    if not ingredients:
        return "Filtered Matches", get_filtered_csv_recommendations(filters)

    direct_results = get_direct_csv_recommendations(ingredients, filters)
    if direct_results:
        return "Ingredient Matches", direct_results

    input_text = " ".join(ingredients)

    # Vectorize input
    input_dish = vectorizer_dish.transform([input_text])
    input_ingredients = vectorizer_ingredients.transform([input_text])
    input_dietary = vectorizer_dietary.transform(["Veg"])  # You can extend to accept this dynamically

    input_vectorized = hstack([input_dish, input_ingredients, input_dietary])

    # Predict category
    prediction_encoded = model.predict(input_vectorized)[0]
    category = label_encoder.inverse_transform([prediction_encoded])[0]

    # Get top 10 dishes from dataset with predicted category
    filtered_df = df[df['Category'] == category]
    if dietary_filter:
        filtered_df = filtered_df[
            filtered_df['Dietary Info']
            .str.replace("/", ",", regex=False)
            .str.lower()
            .str.split(",")
            .apply(lambda values: dietary_filter.lower() in [value.strip() for value in values])
        ]
    if cuisine_filter:
        filtered_df = filtered_df[filtered_df['Cuisine'].str.lower() == cuisine_filter.lower()]
    if filters.get("mealType"):
        filtered_df = filtered_df[filtered_df['Meal Type'].str.lower() == filters["mealType"].lower()]
    if filters.get("mood"):
        filtered_df = filtered_df[filtered_df['Mood'].str.lower() == filters["mood"].lower()]
    if filters.get("dishType"):
        filtered_df = filtered_df[filtered_df['Dish Type'].str.lower() == filters["dishType"].lower()]

    results = filtered_df[[
        'Dish Name', 'Ingredients', 'Category', 'Cuisine', 'Meal Type',
        'Mood', 'Dish Type', 'Dietary Info'
    ]].head(10).to_dict(orient='records')
    return category, results


@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    if data is None:
        return jsonify({"error": "No JSON payload received"}), 400

    ingredients = data.get('ingredients', [])
    filters = data.get('filters', {})
    has_filters = bool(
        filters.get("dietary") or filters.get("cuisine") or filters.get("mealType")
        or filters.get("mood") or filters.get("dishType")
    )
    if not ingredients and not has_filters:
        return jsonify({"error": "Add ingredients or choose at least one filter"}), 400

    try:
        category, csv_results = get_csv_recommendations(ingredients, filters)
        if csv_results:
            enriched_results = enrich_csv_recommendations_with_themealdb(csv_results)
            return jsonify({
                "category": f"Indian {category}",
                "dishes": enriched_results,
                "source": "csv-themealdb",
            })
    except Exception as error:
        print(f"Indian recommendation lookup failed: {error}")

    if ingredients:
        try:
            api_results = get_themealdb_recommendations(ingredients)
            if api_results:
                return jsonify({
                    "category": f"TheMealDB results for {ingredients[0]}",
                    "dishes": api_results,
                    "source": "themealdb",
                })
        except Exception as error:
            print(f"TheMealDB lookup failed: {error}")

    return jsonify({"category": "No recipes found", "dishes": [], "source": "none"})

if __name__ == '__main__':
    app.run(debug=True)
