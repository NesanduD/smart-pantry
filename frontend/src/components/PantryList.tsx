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

interface Notice {
  title: string;
  message: string;
}

const PantryList = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // New state for handling AI Recipes
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState<boolean>(false);
  const [notice, setNotice] = useState<Notice | null>(null);

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
    const res = await api.post('recipes/suggest/', { 
      ingredients: ingredientNames,
    });
    setRecipes(res.data.recipes);
  } catch (err) {
    setNotice({
      title: 'The chef is taking a moment',
      message: 'We could not generate recipes right now. Try again in a moment.',
    });
  } finally {
    setLoadingRecipes(false);
  }
};

  return (
    <div className="fade-up grid gap-8 py-3 md:py-7 lg:grid-cols-[1.05fr_.95fr]">
      
      {/* LEFT SIDE: The Pantry List */}
      <div>
        <div className="mb-7">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#66832b]">Your ingredients</p>
          <h2 className="display-font text-5xl leading-none text-[#18231f]">The pantry shelf</h2>
          <p className="mt-3 text-slate-600">A little inventory makes dinner feel much easier.</p>
        </div>
        
        <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(24,35,31,0.08)]">
          {loading ? (
            <p className="p-8 text-center text-slate-500">Loading your pantry...</p>
          ) : ingredients.length === 0 ? (
            <p className="p-8 text-center italic text-slate-500">Your pantry is empty. Go scan some groceries!</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {ingredients.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 border-slate-100 p-5 transition hover:bg-[#f7f8f3]">
                  <div>
                    <span className="font-semibold capitalize text-[#18231f]">{item.name}</span>
                    <span className="ml-3 rounded-full bg-[#edf5df] px-2 py-1 text-xs font-bold text-[#66832b]">
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="rounded-full border border-[#ffb1a9] px-3 py-1.5 text-xs font-bold text-[#d1483d] transition hover:bg-[#ff594d] hover:text-white"
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
        <div className="mb-7">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#d1483d]">Make it delicious</p>
          <h2 className="display-font text-5xl leading-none text-[#18231f]">Tonight’s AI chef</h2>
        </div>
        
        <div className="mb-6 rounded-[26px] border border-[#f0c2a7] bg-[#fff1e8] p-6 shadow-sm">
          <p className="mb-4 leading-6 text-slate-700">
            Click the button below to ask Gemini AI what you can cook using the {ingredients.length} items currently in your pantry.
          </p>
          <button 
            onClick={generatePantryRecipes}
            disabled={loadingRecipes || ingredients.length === 0}
            className={`w-full rounded-xl py-3 text-lg font-bold text-white transition ${
              loadingRecipes || ingredients.length === 0 
                ? 'cursor-not-allowed bg-slate-300' 
                : 'bg-[#e25345] shadow-[4px_4px_0_#b92e2a] hover:-translate-y-0.5'
            }`}
          >
            {loadingRecipes ? 'Chef Gemini is thinking...' : 'Generate Recipes'}
          </button>
        </div>

        {notice && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-[#ffc4bd] bg-[#fff1ee] p-4 text-sm text-[#a83d35]">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white font-bold shadow-sm">!</span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{notice.title}</p>
              <p className="mt-1 leading-5">{notice.message}</p>
            </div>
            <button type="button" aria-label="Dismiss message" onClick={() => setNotice(null)} className="text-lg leading-none opacity-60 hover:opacity-100">×</button>
          </div>
        )}

        {/* Display the Generated Recipes */}
        {recipes.length > 0 && (
          <div className="space-y-4">
            {recipes.map((recipe, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-[#fffdf8] p-5 shadow-sm">
                <h4 className="mb-3 text-xl font-bold text-[#18231f]">{recipe.title}</h4>
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
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