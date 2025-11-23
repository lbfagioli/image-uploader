import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Upload, CheckCircle, Moon, Sun, Copy, Download } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setError('');
    
    if (rejectedFiles.length > 0) {
      setError('File must be JPG, PNG, GIF and under 2MB.');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImage(res.data);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/gif': [] },
    maxSize: 2 * 1024 * 1024,
    multiple: false
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(image.url);
    alert('Link copied!');
  };

  const downloadImage = () => {
    window.location.href = `${API_URL}/download/${image.filename}`;
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      
      <button onClick={toggleTheme} className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <div className={`w-full max-w-md p-8 rounded-xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        
        <h1 className="text-2xl font-bold text-center mb-2">Upload your image</h1>
        <p className="text-center text-sm text-gray-500 mb-8">File should be Jpeg, Png, Gif (Max 2MB)</p>

        {loading && (
          <div className="flex flex-col items-center py-10">
             <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4 dark:bg-gray-700 overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full animate-progress"></div>
             </div>
             <p className="text-blue-500 font-medium">Uploading...</p>
          </div>
        )}

        {!loading && image && (
          <div className="flex flex-col items-center animate-fade-in">
            <CheckCircle className="text-green-500 w-10 h-10 mb-4" />
            <h3 className="text-lg font-medium mb-4">Uploaded Successfully!</h3>
            
            <img src={image.url} alt="Uploaded" className="w-full h-48 object-cover rounded-lg mb-6 shadow-sm" />
            
            <div className="flex gap-2 w-full">
              <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 overflow-hidden">
                <span className="text-xs truncate w-full select-all">{image.url}</span>
              </div>
              <button onClick={copyToClipboard} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg">
                <Copy size={18} />
              </button>
            </div>

            <button onClick={downloadImage} className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 py-2 rounded-lg transition">
              <Download size={18} /> Download
            </button>

             <button onClick={() => setImage(null)} className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline">
              Upload another
            </button>
          </div>
        )}

        {!loading && !image && (
          <div {...getRootProps()} 
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-gray-700' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}
            `}>
            <input {...getInputProps()} />
            <div className="mb-4">
                
               <Upload size={48} className="text-blue-400 mx-auto" />
            </div>
            <p className="text-sm text-gray-500">Drag & Drop your image here</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

      </div>
      
      <style>{`
        .animate-progress {
          animation: progress 2s infinite ease-in-out;
          width: 30%;
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}

export default App;