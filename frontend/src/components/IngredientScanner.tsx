import { useState, useRef, useEffect } from 'react';
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
  
  // New State for Camera
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Turn on the webcam
  const startCamera = async () => {
    setPreview(null); // Clear any old pictures
    setImage(null);
    try {
      // Ask the browser for camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefers back camera on mobile
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access the camera. Please allow camera permissions in your browser.");
    }
  };

  // Turn off the webcam
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop()); // Stop the hardware camera
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Turn off camera if the user leaves the page
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Take a picture from the live video feed
  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      // Set canvas size to match video
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      // Draw the current video frame onto the canvas
      context?.drawImage(videoRef.current, 0, 0);

      // Convert the canvas image into a File object we can send to Django
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          setImage(file);
          setPreview(URL.createObjectURL(file));
          stopCamera(); // Turn off the live feed once we have the picture
        }
      }, 'image/jpeg');
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('image', image);

    try {
      const res = await api.post<ScanResults>('ingredients/scan/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(res.data);
    } catch (err) {
      console.error("Scan error", err);
      alert("Failed to scan image. Make sure you are logged in!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">📸 AI Kitchen Scanner</h2>
      
      <div className="flex flex-col items-center gap-6">
        
        {/* Camera Controls */}
        <div className="flex gap-4">
          {!isCameraActive && !preview && (
            <button 
              onClick={startCamera}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold transition"
            >
              📷 Start Camera
            </button>
          )}
        </div>

        {/* Live Video Feed */}
        <div className={`relative ${isCameraActive ? 'block' : 'hidden'}`}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full max-w-md rounded-lg shadow-sm border border-gray-300"
          ></video>
          <button 
            onClick={takePicture}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-blue-600 px-6 py-2 rounded-full font-bold shadow-lg hover:bg-gray-100 border-2 border-blue-500"
          >
            Take Photo
          </button>
        </div>

        {/* Hidden Canvas used to process the image */}
        <canvas ref={canvasRef} className="hidden"></canvas>

        {/* Display the captured photo */}
        {preview && (
          <div className="flex flex-col items-center gap-4">
            <img src={preview} alt="Captured" className="w-full max-w-md rounded-lg shadow-sm border border-gray-300" />
            <button 
              onClick={() => { setPreview(null); startCamera(); }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Retake Photo
            </button>
          </div>
        )}

        {/* The Final Scan Button */}
        <button 
          onClick={handleScan} 
          disabled={loading || !image}
          className={`px-8 py-3 rounded-full text-white font-bold transition w-full max-w-md mt-4 ${
            loading || !image ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 shadow-md'
          }`}
        >
          {loading ? 'Analyzing with AI...' : 'Scan & Get Recipes'}
        </button>
      </div>

      {/* Results Section */}
      {results && (
        <div className="mt-12 border-t pt-8">
          <h3 className="text-xl font-bold mb-2">✅ Detected Ingredients:</h3>
          <p className="text-green-600 text-lg mb-8 bg-green-50 p-4 rounded border border-green-200">
            {results.detected_ingredients?.join(', ') || "None"}
          </p>
          
          <h3 className="text-2xl font-bold mb-6">🍽️ Suggested Recipes</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.suggested_recipes?.map((recipe, idx) => (
              <div key={idx} className="bg-gray-50 border rounded-xl shadow-sm p-5 hover:shadow-md transition">
                <h4 className="font-bold text-lg mb-3 text-gray-800">{recipe.title}</h4>
                <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">
                  {recipe.instructions.substring(0, 150)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientScanner;