import { useEffect, useState } from 'react';
import api from '../../api';

interface Ingredient {
  id: number;
  name: string;
  quantity: number;
}

interface Recipe {
  title: string;
  instructions: string;
}

const PantryList = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // New state for handling AI Recipes
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState("models/gemini-3-flash-preview");

  const fetchPantry = async () => {
    try {
      setLoading(true);
      const res = await api.get<Ingredient[]>('ingredients/');
      setIngredients(res.data);
    } catch (err) {
      console.error("Failed to fetch pantry", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPantry();
  }, []);

  const deleteItem = async (id: number) => {
    try {
      await api.delete(`ingredients/${id}/`);
      fetchPantry(); 
    } catch (err) {
      console.error("Failed to delete item", err);
    }
  };

  // NEW FUNCTION: Send pantry items to Gemini
const generatePantryRecipes = async () => {
  setLoadingRecipes(true);
  const ingredientNames = ingredients.map(item => item.name);

  try {
    // Send the model choice to the backend
    const res = await api.post('recipes/suggest/', { 
      ingredients: ingredientNames,
      model: selectedModel 
    });
    setRecipes(res.data.recipes);
  } catch (err) {
    alert("This model is tired! Try switching to another one.");
  } finally {
    setLoadingRecipes(false);
  }
};

  return (
    <div className="max-w-5xl mx-auto p-4 mt-10 grid md:grid-cols-2 gap-8">
      
      {/* LEFT SIDE: The Pantry List */}
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">🍎 My Digital Pantry</h2>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
          {loading ? (
            <p className="p-6 text-gray-500 text-center">Loading your pantry...</p>
          ) : ingredients.length === 0 ? (
            <p className="p-6 text-gray-500 italic text-center">Your pantry is empty. Go scan some groceries!</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {ingredients.map((item) => (
                <li key={item.id} className="flex justify-between items-center p-5 hover:bg-gray-50 transition">
                  <div>
                    <span className="font-semibold text-lg capitalize text-gray-800">{item.name}</span>
                    <span className="ml-3 text-gray-500 text-sm bg-gray-200 px-2 py-1 rounded-full">
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="text-red-500 hover:text-white hover:bg-red-500 font-bold px-4 py-2 rounded transition border border-red-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: AI Recipe Generator */}
      <div>
        <h2 className="text-3xl font-bold mb-6 text-blue-800">✨ AI Chef</h2>
        
        <div className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 mb-6">
          <p className="text-gray-700 mb-4">
            Click the button below to ask Gemini AI what you can cook using the {ingredients.length} items currently in your pantry.
          </p>
          <button 
            onClick={generatePantryRecipes}
            disabled={loadingRecipes || ingredients.length === 0}
            className={`w-full py-3 rounded-lg text-white font-bold text-lg transition ${
              loadingRecipes || ingredients.length === 0 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-md'
            }`}
          >
            {loadingRecipes ? 'Chef Gemini is thinking...' : 'Generate Recipes'}
          </button>
        </div>

<div className="mb-4">
  <label className="block text-sm font-bold text-blue-700 mb-2">Select AI Chef:</label>
  <select 
    value={selectedModel}
    onChange={(e) => setSelectedModel(e.target.value)}
    className="w-full p-2 rounded border border-blue-300 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
  >
    <option value="models/gemini-3-flash-preview">⚡ Gemini 3 Flash (Newest & Fastest)</option>
    <option value="models/gemini-2.5-flash">🧠 Gemini 2.5 Flash (Reliable)</option>
    <option value="models/gemini-2.0-flash">🚀 Gemini 2.0 Flash (Instant)</option>
    <option value="models/gemma-3-12b-it">🤖 Gemma 3 (Open Source)</option>
  </select>
</div>
        {/* Display the Generated Recipes */}
        {recipes.length > 0 && (
          <div className="space-y-4">
            {recipes.map((recipe, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl shadow-md p-5">
                <h4 className="font-bold text-xl mb-3 text-gray-800">{recipe.title}</h4>
                <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">
                  {recipe.instructions}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default PantryList;