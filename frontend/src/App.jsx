import { useState, useRef } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noMatches, setNoMatches] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setImagePreview(URL.createObjectURL(selected));
      setResults([]);
      setNoMatches(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const selected = e.dataTransfer.files[0];
    if (selected && selected.type.startsWith("image/")) {
      setFile(selected);
      setImagePreview(URL.createObjectURL(selected));
      setResults([]);
      setNoMatches(false);
    }
  };

  const handleSearch = async () => {
    if (!file) {
      alert("Please upload an image first!");
      return;
    }

    setLoading(true);
    setResults([]);
    setNoMatches(false);

    const formData = new FormData();
    formData.append("image", file);

    // Get API URL from environment variable
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8080";

    try {
      const res = await axios.post(`${API_URL}/search`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(res.data);
      setNoMatches(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setResults([]);
        setNoMatches(true);
      } else {
        console.error(err);
        alert("Something went wrong. Check backend logs.");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setFile(null);
    setImagePreview(null);
    setResults([]);
    setNoMatches(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite'
    }}>
      {/* Animated Background */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Header */}
      <header className="backdrop-blur-xl bg-white/10 shadow-2xl sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-lg" style={{ animation: 'float 3s ease-in-out infinite' }}>
              <span className="text-5xl">🔍</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-2xl">
              Visual Product Matcher
            </h1>
          </div>
          <p className="text-center text-white/90 text-base sm:text-lg font-medium drop-shadow-lg">
            ✨ AI-Powered Image Recognition • Find Similar Products Instantly
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Upload Section */}
        <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-8 sm:p-10 mb-10 border-2 border-white/50">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            {/* Upload Area */}
            <div className="flex-1 w-full">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all duration-500 cursor-pointer relative overflow-hidden ${
                  isDragging
                    ? "border-purple-500 bg-purple-50 scale-105 shadow-2xl"
                    : "border-gray-300 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-2xl shadow-lg" style={{ animation: 'float 3s ease-in-out infinite' }}>
                      <svg
                        className="w-20 h-20 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800 mb-2">
                      Drop your image here
                    </p>
                    <p className="text-base text-gray-600 font-medium">
                      or click to browse files
                    </p>
                  </div>
                  <div className="inline-block bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full">
                    <p className="text-sm text-gray-700 font-semibold">
                      📁 JPG • PNG • GIF • WEBP
                    </p>
                  </div>
                </div>
                {isDragging && (
                  <div className="absolute inset-0 bg-purple-500/10" style={{ animation: 'pulse 1s infinite' }}></div>
                )}
              </div>
            </div>

            {/* Preview Area */}
            {imagePreview && (
              <div className="flex-1 w-full animate-fadeIn">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-80 object-cover rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full p-3 shadow-2xl transition-all duration-300 hover:scale-125 hover:rotate-90"
                      title="Remove image"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 rounded-b-2xl">
                      <p className="text-white text-base font-semibold truncate">
                        📄 {file?.name}
                      </p>
                      <p className="text-white/80 text-sm mt-1">
                        Ready to search
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          {imagePreview && (
            <div className="mt-10 flex justify-center animate-fadeIn">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="relative group bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold text-lg px-12 py-5 rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 transform hover:scale-110 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-4 overflow-hidden"
                style={{ backgroundSize: '200% auto' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-7 w-7 text-white relative z-10"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="relative z-10"> Searching...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-7 h-7 relative z-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <span className="relative z-10"> Find Similar Products</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        {noMatches && (
          <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-12 text-center animate-fadeIn border-2 border-white/50">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 shadow-xl" style={{ animation: 'float 3s ease-in-out infinite' }}>
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3">
              No Matches Found
            </h3>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
               No products found with similarity above 70%. Try uploading a different image!
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-2xl flex items-center gap-3">
                <span className="text-5xl" style={{ animation: 'float 2s ease-in-out infinite' }}>✨</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-200 to-white">
                  Similar Products Found
                </span>
              </h2>
              <div className="backdrop-blur-xl bg-white/20 border-2 border-white/40 text-white px-6 py-3 rounded-full text-base font-bold shadow-2xl">
                 {results.length} {results.length === 1 ? "Match" : "Matches"}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {results.map((item, idx) => (
                <div
                  key={idx}
                  className="backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 overflow-hidden group transform hover:-translate-y-4 hover:scale-105 animate-slideUp border-2 border-white/50"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-125 group-hover:rotate-2"
                    />
                    <div className="absolute top-4 right-4 z-20">
                      <div className="bg-gradient-to-br from-purple-600 to-blue-600 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-2xl transform group-hover:scale-125 transition-transform duration-300">
                        <p className="text-base font-extrabold text-white flex items-center gap-1">
                          <span className="text-xl">🎯</span>
                          {(item.similarity * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 flex items-center gap-2 font-medium">
                      <svg
                        className="w-5 h-5 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      {item.product.category}
                    </p>
                    <div className="pt-4 border-t-2 border-gray-200 space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 font-semibold">
                          Match Score
                        </span>
                        <span className="text-sm font-bold text-gray-800">
                          {(item.similarity * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-full transition-all duration-1000 shadow-lg"
                          style={{
                            width: `${item.similarity * 100}%`,
                            backgroundSize: '200% auto',
                            animation: 'gradient 3s ease infinite'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="backdrop-blur-xl bg-white/10 border-t-2 border-white/20 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4">
           
            <div className="flex items-center gap-6 text-white/80 text-sm">
              <span className="flex items-center gap-2">
                <span className="text-lg">⚛️</span> React
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <span className="text-lg">🐍</span> Flask
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <span className="text-lg">🎨</span> Tailwind CSS
              </span>
            </div>
            <p className="text-white/60 text-xs">
              © 2025 Visual Product Matcher • AI-Powered Image Recognition
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
