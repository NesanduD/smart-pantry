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
    <div className="fade-up py-3 md:py-7">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-[#66832b]">Ingredient intelligence</p>
          <h2 className="display-font text-5xl leading-none text-[#18231f]">What’s on the counter?</h2>
          <p className="mt-3 max-w-xl text-slate-600">Take a photo and turn what you already have into your next three meals.</p>
        </div>
        <div className="rounded-full border border-[#cbdba7] bg-[#edf5df] px-4 py-2 text-sm font-semibold text-[#66832b]">● AI kitchen scanner</div>
      </div>
      
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(24,35,31,0.08)] md:p-8">
      <div className="mb-7 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <label className="text-sm font-bold text-slate-700">Recipe brain</label>
        <select 
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="rounded-xl border border-slate-200 bg-[#f7f8f3] px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-[#8aaa3d] focus:ring-4 focus:ring-[#d9f36a]/40 md:min-w-64"
        >
          <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fastest)</option>
          <option value="gemma-2b-it">Gemma 2B (Local/Open Source)</option>
        </select>
      </div>

      <div className="flex flex-col items-center gap-6">
        
        {/* Input Options: Camera or File */}
        {!isCameraActive && !preview && (
          <div className="grid w-full max-w-2xl gap-4 md:grid-cols-2">
            <button 
              onClick={startCamera}
              className="rounded-2xl bg-[#18231f] px-6 py-5 text-left font-bold text-white shadow-[5px_5px_0_#d9f36a] transition hover:-translate-y-1"
            >
              📷 Open Desktop/Phone Camera
            </button>
            
            <label className="cursor-pointer rounded-2xl border-2 border-dashed border-[#b7c887] bg-[#f5f8ed] px-6 py-5 text-center font-bold text-[#50651f] transition hover:border-[#8aaa3d] hover:bg-[#edf5df]">
              Upload a photo
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
            className="w-full rounded-2xl border-2 border-[#18231f] bg-black shadow-lg"
          ></video>
          <button 
            onClick={takePicture}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border-4 border-[#d9f36a] bg-white px-8 py-3 font-bold text-[#18231f] shadow-xl transition hover:scale-105"
          >
            📸 Capture
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden"></canvas>

        {/* Image Preview */}
        {preview && (
          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <img src={preview} alt="Captured" className="w-full rounded-2xl border-2 border-slate-200 object-cover shadow-md" />
            <div className="flex gap-4">
              <button 
                onClick={() => { setPreview(null); startCamera(); }}
                className="text-sm font-bold text-[#66832b] hover:text-[#18231f]"
              >
                Retake Photo
              </button>
              <label className="cursor-pointer text-sm font-bold text-slate-500 hover:text-[#18231f]">
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
          className={`mt-2 w-full max-w-md rounded-xl px-8 py-4 text-lg font-extrabold text-white transition ${
            loading || !image ? 'cursor-not-allowed bg-slate-300' : 'bg-[#e25345] shadow-[4px_4px_0_#b92e2a] hover:-translate-y-0.5'
          }`}
        >
          {loading ? '🧠 AI is Thinking...' : 'Get Recipes'}
        </button>
      </div>

      {/* Results Section */}
      {results && (
        <div className="mt-12 border-t border-slate-200 pt-8">
          <h3 className="display-font mb-3 text-3xl text-[#18231f]">Found in your photo</h3>
          <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-[#cbdba7] bg-[#f2f8e7] p-4">
            {results.detected_ingredients?.map((item, idx) => (
              <span key={idx} className="rounded-full bg-[#d9f36a] px-3 py-1 text-sm font-bold capitalize text-[#354512]">
                {item}
              </span>
            ))}
          </div>
          
          <h3 className="display-font mb-6 text-3xl text-[#18231f]">Your next meals</h3>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {results.suggested_recipes?.map((recipe, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-[#fffdf8] p-6 shadow-sm">
                <h4 className="mb-4 border-b border-slate-200 pb-3 text-lg font-bold text-[#18231f]">{recipe.title}</h4>
                <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{recipe.instructions}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default IngredientScanner;