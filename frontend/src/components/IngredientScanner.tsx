import React, { useState, useRef, useEffect } from 'react';
import api from '../../api';

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
  
  // Model Selection State
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.0-flash');

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- CAMERA LOGIC ---
  const startCamera = async () => {
    setPreview(null);
    setImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video metadata to load so we don't get a 0x0 canvas bug
        videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsCameraActive(true);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera. Please allow permissions or use file upload.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera(); // Cleanup when leaving page
  }, []);

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      // Set canvas to actual video dimensions
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);

      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          setImage(file);
          setPreview(URL.createObjectURL(file));
          stopCamera(); 
        }
      }, 'image/jpeg');
    }
  };

  // --- FILE UPLOAD LOGIC ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera(); // Turn off camera if they upload a file instead
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResults(null);
    }
  };

  // --- API LOGIC ---
  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('image', image);
    formData.append('model', selectedModel); // Sending the chosen model

    try {
      const res = await api.post<ScanResults>('ingredients/scan/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(res.data);
    } catch (err: any) {
      console.error("Scan error", err);
      alert(err.response?.data?.error || "Failed to scan. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md mt-6 md:mt-10">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">📸 AI Kitchen Scanner</h2>
      
      {/* Model Selection Dropdown */}
      <div className="mb-6 max-w-md mx-auto">
        <label className="block text-sm font-bold text-gray-700 mb-2">Select AI Model for Recipes:</label>
        <select 
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
        >
          <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fastest)</option>
          <option value="gemma-2b-it">Gemma 2B (Local/Open Source)</option>
        </select>
      </div>

      <div className="flex flex-col items-center gap-6">
        
        {/* Input Options: Camera or File */}
        {!isCameraActive && !preview && (
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-md justify-center">
            <button 
              onClick={startCamera}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold shadow transition flex-1"
            >
              📷 Open Desktop/Phone Camera
            </button>
            
            <label className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold shadow transition cursor-pointer text-center flex-1">
              📁 Upload File
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}

        {/* Live Camera Feed */}
        <div className={`relative w-full max-w-md ${isCameraActive ? 'block' : 'hidden'}`}>
          <video 
            ref={videoRef} 
            playsInline 
            muted
            className="w-full rounded-lg shadow-sm border-2 border-gray-300 bg-black"
          ></video>
          <button 
            onClick={takePicture}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-xl border-4 border-blue-500 hover:scale-105 transition"
          >
            📸 Capture
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden"></canvas>

        {/* Image Preview */}
        {preview && (
          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <img src={preview} alt="Captured" className="w-full rounded-xl shadow-md border-2 border-gray-200 object-cover" />
            <div className="flex gap-4">
              <button 
                onClick={() => { setPreview(null); startCamera(); }}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Retake Photo
              </button>
              <label className="text-sm font-semibold text-gray-600 hover:underline cursor-pointer">
                Choose Different File
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        )}

        {/* Scan Button */}
        <button 
          onClick={handleScan} 
          disabled={loading || !image}
          className={`px-8 py-4 rounded-xl text-white font-extrabold text-lg transition w-full max-w-md mt-2 ${
            loading || !image ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 shadow-lg'
          }`}
        >
          {loading ? '🧠 AI is Thinking...' : '✨ Get Recipes ✨'}
        </button>
      </div>

      {/* Results Section */}
      {results && (
        <div className="mt-12 border-t pt-8">
          <h3 className="text-xl font-bold mb-3">✅ Detected Ingredients:</h3>
          <div className="flex flex-wrap gap-2 mb-8 bg-green-50 p-4 rounded-lg border border-green-200">
            {results.detected_ingredients?.map((item, idx) => (
              <span key={idx} className="bg-green-200 text-green-900 px-3 py-1 rounded-full text-sm font-bold capitalize">
                {item}
              </span>
            ))}
          </div>
          
          <h3 className="text-2xl font-bold mb-6">🍽️ Recipes using {selectedModel}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.suggested_recipes?.map((recipe, idx) => (
              <div key={idx} className="bg-white border rounded-xl shadow-sm p-6">
                <h4 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">{recipe.title}</h4>
                <p className="text-gray-600 text-sm whitespace-pre-line">{recipe.instructions}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientScanner;