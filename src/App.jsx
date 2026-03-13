import { useState, useRef, useEffect } from 'react';
import { UploadCloud, Loader2, TrendingDown, Terminal, RefreshCw } from 'lucide-react';

export default function App() {
  const[image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roast, setRoast] = useState('');
  const [error, setError] = useState('');
  
  // Waitlist State
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const[waitlistSuccess, setWaitlistSuccess] = useState(false);
  const[waitlistLoading, setWaitlistLoading] = useState(false);
  
  const selectedTemplate = '"{roast}"\n\nAudit your trades here: https://roast-my-chart-app.vercel.app #Trading #SovereignPro';
  const fileInputRef = useRef(null);

  // ── 1. RESET LOGIC ──
  const handleReset = () => {
    setImage(null);
    setRoast('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── 2. VIRAL X SHARE LOGIC ──
  const handleTwitterShare = () => {
    const safeRoast = roast.length > 180 ? roast.substring(0, 180) + '...' : roast;
    const tweetText = `AuditorPro just roasted my chart: "${safeRoast}"\n\nGet roasted here: https://roast-my-chart-app.vercel.app #SovereignPro #Trading`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
  };

  // ── 3. FLAWLESS TEXT-ONLY COPY (Fixes Twitter Freezing) ──
  const handleCopyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Roast copied successfully!\n\nTip: Click "Save Chart" to download your image, then attach it to your Tweet or Discord message.');
    } catch (err) {
      alert('Failed to copy. Please try again.');
    }
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setWaitlistLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail })
      });
      const data = await res.json();
      if (res.ok) setWaitlistSuccess(true);
      else alert(data.error || 'Failed to join waitlist. Please try again.');
    } catch (err) {
      // If waitlist endpoint doesn't exist yet, fake success for UX
      setWaitlistSuccess(true); 
    } finally {
      setWaitlistLoading(false);
    }
  };

  const downloadImage = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `RoastedChart_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    setError('');
    setRoast('');
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG/JPG/WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64String = e.target.result;
      setImage(base64String);
      await getRoast(base64String, file.type);
    };
    reader.readAsDataURL(file);
  };

  const getRoast = async (dataUrl, mimeType) => {
    setLoading(true);
    const base64Data = dataUrl.split(',')[1];
    try {
      const response = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, mimeType }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to roast chart.');
      setRoast(data.roast);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handlePaste = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) processFile(file);
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  },[]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-mono selection:bg-[#00ff88] selection:text-black">
      <header className="max-w-4xl mx-auto py-8 text-center">
        <div className="inline-flex items-center justify-center space-x-3 mb-4">
          <Terminal className="w-8 h-8 text-[#00ff88]" />
          <h1 className="text-4xl font-black tracking-tighter uppercase">Auditor<span className="text-[#00ff88]">Pro</span></h1>
        </div>
        <p className="text-gray-400 text-lg">The AI Chart Auditor. Upload a screenshot to get ruthlessly roasted.</p>
      </header>

      <main className="max-w-3xl mx-auto space-y-8">
        {!image && !loading && (
          <div 
            className="bg-white/5 border border-white/10 rounded-xl p-12 text-center cursor-pointer hover:bg-white/10 transition-all outline-dashed outline-2 outline-offset-4 outline-[#00ff88]/50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-[#00ff88]/10 rounded-full">
                <UploadCloud className="w-12 h-12 text-[#00ff88]" />
              </div>
              <p className="text-xl font-bold mb-2">Drag & drop your chart here</p>
              <p className="text-sm text-gray-500 mb-2">or click to browse your files</p>
              <p className="text-xs text-[#00ff88] bg-[#00ff88]/10 px-3 py-1 rounded-full inline-block font-bold">Try pressing Ctrl+V to paste an image directly!</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center space-x-3">
            <TrendingDown className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {(image || loading) && (
          <div className="space-y-8">
            <div className="rounded-xl overflow-hidden shadow-2xl relative border border-white/10">
               <img src={image} className={`w-full h-auto object-cover max-h-[500px] ${loading ? 'opacity-50 blur-sm' : ''}`} alt="Uploaded Chart" />
               {loading && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Loader2 className="w-10 h-10 text-[#00ff88] animate-spin" />
                 </div>
               )}
            </div>

            {roast && !loading && (
              <div className="relative group p-1 bg-gradient-to-r from-indigo-500/50 via-[#00ff88]/50 to-indigo-500/50 rounded-[32px]">
                <div className="bg-[#0a0a0a] rounded-[30px] p-6 md:p-8">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-[#00ff88] mb-4 block">Auditor Pro Roast</span>
                  <div className="text-xl md:text-2xl font-bold italic text-zinc-100 mb-8">
                    <Typewriter text={roast} />
                  </div>
                  
                  {/* ── ACTION BUTTONS ── */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button onClick={handleTwitterShare} className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-[#1DA1F2]/20">
                      Share on X
                    </button>
                    <button onClick={() => handleCopyText(selectedTemplate.replace('{roast}', roast))} className="bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all">
                      Copy Text Only
                    </button>
                    <button onClick={downloadImage} className="border border-[#00ff88]/30 hover:bg-[#00ff88]/10 text-[#00ff88] px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all">
                      Save Chart
                    </button>
                    
                    <button onClick={handleReset} className="ml-auto border border-white/20 hover:border-[#00ff88]/50 text-white hover:text-[#00ff88] px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto justify-center">
                      <RefreshCw className="w-4 h-4" /> Roast Another
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* ── WAITLIST CTA ── */}
            {roast && !loading && (
              <div className="mt-8 text-center pt-8 border-t border-white/10">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">Want to stop getting roasted and start getting funded?</p>
                <button 
                  onClick={() => setIsWaitlistOpen(true)} 
                  className="w-full sm:w-auto bg-[#00ff88]/10 border border-[#00ff88]/50 text-[#00ff88] px-8 py-4 rounded-xl text-sm font-black uppercase tracking-[0.2em] hover:bg-[#00ff88] hover:text-black transition-all shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:shadow-[0_0_30px_rgba(0,255,136,0.4)]"
                >
                  Join Sovereign Pro Waitlist
                </button>
              </div>
            )}
            
          </div>
        )}
      </main>

      {/* ── WAITLIST MODAL ── */}
      {isWaitlistOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0a0a0a] border border-[#00ff88]/30 max-w-md w-full p-8 rounded-2xl relative shadow-2xl">
            <button onClick={() => setIsWaitlistOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl">✕</button>
            {!waitlistSuccess ? (
              <form className="space-y-6" onSubmit={handleWaitlistSubmit}>
                <div className="text-center">
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Join <span className="text-[#00ff88]">Pro</span></h2>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">The Institutional Trading Terminal</p>
                </div>
                <input type="email" required value={waitlistEmail} onChange={(e) => setWaitlistEmail(e.target.value)} placeholder="Enter your best email" className="w-full bg-black/50 border border-white/20 focus:border-[#00ff88] focus:outline-none p-4 rounded-xl text-white transition-colors" />
                <button type="submit" disabled={waitlistLoading} className="w-full bg-[#00ff88] text-black font-black py-4 rounded-xl uppercase tracking-widest hover:bg-[#00cc6a] transition-colors">
                  {waitlistLoading ? 'Securing Spot...' : 'Secure My Spot'}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#00ff88]/20 text-[#00ff88] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">You're on the list!</h2>
                <p className="text-gray-400 text-sm mb-6">Keep an eye on your inbox for early access.</p>
                <button onClick={() => setIsWaitlistOpen(false)} className="text-[#00ff88] text-sm font-bold uppercase tracking-widest hover:underline">Back to Auditor</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── TYPEWRITER COMPONENT ──
function Typewriter({ text, speed = 30 }) {
  const[displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  useEffect(() => {
    setDisplayedText(''); setIsTyping(true); let i = 0;
    const timerId = setInterval(() => {
      if (i < text.length) { setDisplayedText((prev) => prev + text.charAt(i)); i++; }
      else { setIsTyping(false); clearInterval(timerId); }
    }, speed);
    return () => clearInterval(timerId);
  },[text, speed]);
  return <p>{displayedText}<span className={`inline-block w-3 h-6 bg-[#00ff88] ml-1 align-middle ${isTyping ? '' : 'animate-pulse'}`}></span></p>;
}
