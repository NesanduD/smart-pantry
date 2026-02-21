import React, { useState } from 'react';
import api from '../../api';

// 1. Interfaces matching your backend response
interface Recipe {
  title: string;
  instructions: string;
}

interface ScanResults {
  detected_ingredients: string[];
  suggested_recipes: Recipe[];
}

const IngredientScanner = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ScanResults | null>(null);

  // 2. Handles both taking a live photo AND uploading from the gallery
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResults(null); // Clear old results when a new photo is taken
    }
  };

  // 3. Sends the image to your Django backend
  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('image', image);

    try {
      // Hitting the path('ingredients/scan/', ...) you set up in urls.py
      const res = await api.post<ScanResults>('ingredients/scan/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(res.data);
    } catch (err: any) {
      console.error("Scan error", err);
      const errorMsg = err.response?.data?.error || "Failed to scan image. Make sure you are logged in.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">📸 AI Kitchen Scanner</h2>
      
      <div className="flex flex-col items-center gap-6">
        
        {/* The Native Camera / Upload Button */}
        {!preview ? (
          <label className="flex flex-col items-center justify-center w-full max-w-md h-64 border-4 border-blue-200 border-dashed rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition shadow-sm">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <span className="text-6xl mb-4">📱</span>
              <p className="mb-2 text-lg text-blue-800 font-bold">Tap to Open Camera</p>
              <p className="text-sm text-blue-600 font-semibold">or choose from gallery</p>
            </div>
            {/* The magic line that handles mobile cameras flawlessly */}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleImageCapture} 
            />
          </label>
        ) : (
          /* Image Preview State */
          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <img src={preview} alt="Captured" className="w-full rounded-xl shadow-md border-2 border-gray-200 object-cover" />
            <label className="text-sm text-blue-500 hover:text-blue-700 underline cursor-pointer font-semibold">
              Retake Photo
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageCapture} />
            </label>
          </div>
        )}

        {/* The Final Scan Button */}
        <button 
          onClick={handleScan} 
          disabled={loading || !image}
          className={`px-8 py-4 rounded-xl text-white font-extrabold text-lg transition w-full max-w-md mt-2 ${
            loading || !image ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
          }`}
        >
          {loading ? '🧠 Gemini is Analyzing...' : '✨ Scan & Get Recipes ✨'}
        </button>
      </div>

      

      {/* Results Section */}
      {results && (
        <div className="mt-12 border-t pt-8 animate-fade-in-up">
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            ✅ Detected Ingredients
          </h3>
          <div className="flex flex-wrap gap-2 mb-8 bg-green-50 p-5 rounded-lg border border-green-200 shadow-inner">
            {results.detected_ingredients?.length > 0 ? (
              results.detected_ingredients.map((item, idx) => (
                <span key={idx} className="bg-green-200 text-green-900 px-4 py-2 rounded-full text-sm font-bold capitalize shadow-sm">
                  {item}
                </span>
              ))
            ) : (
              <p className="text-gray-600">No ingredients clearly detected. Try a better angle!</p>
            )}
          </div>
          
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🍽️ Suggested Recipes
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.suggested_recipes?.length > 0 ? (
              results.suggested_recipes.map((recipe, idx) => (
                <div key={idx} className="bg-white border-2 border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition duration-300 p-6 flex flex-col h-full">
                  <h4 className="font-bold text-xl mb-4 text-gray-800 border-b pb-2">{recipe.title}</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed flex-grow">
                    {recipe.instructions}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic col-span-full text-center py-8">No recipes found for these ingredients.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientScanner;