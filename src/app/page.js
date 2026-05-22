"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Activity, Users, FileText, Settings, LogOut, Plus, Search, ChevronRight, ChevronDown, Save, Play, CheckCircle, BarChart2, ArrowLeft, Download, Trash2, Edit, Printer, FileOutput, Link as LinkIcon, Copy, Mail, Send, Menu, X, AlertCircle } from 'lucide-react';

// ==========================================
// 1. >>> ENGANXA AQUÍ EL TEU FIREBASE CONFIG <<<
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyDy1aqVLfLPvJ-MDdRnt0CR_HvrUyxyj6E",
  authDomain: "fisioproapp.firebaseapp.com",
  projectId: "fisioproapp",
  storageBucket: "fisioproapp.firebasestorage.app",
  messagingSenderId: "6948266690",
  appId: "1:6948266690:web:345cda634f974a310d915b"
};
 
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- DADES INICIALS (TESTS CLÍNICS OFICIALS) ---
const SEED_TESTS = [
  {
    title: "Headache Impact Test (HIT-6)", category: "Cap i Coll", description: "Avalua l'impacte del mal de cap en la vida diària. Cada resposta té un valor: Mai (6), Gairebé mai (8), A vegades (10), Molt sovint (11), Sempre (13).",
    questions: [
      { id: "h1", text: "1. Quan té mal de cap, ¿amb quina freqüència el dolor és fort?", type: "choice", required: true, options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] },
      { id: "h2", text: "2. ¿Amb quina freqüència el mal de cap li limita la capacitat per fer les activitats diàries habituals?", type: "choice", required: true, options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] },
      { id: "h3", text: "3. Quan té mal de cap, ¿amb quina freqüència desitja estirar-se?", type: "choice", required: true, options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] },
      { id: "h4", text: "4. En les últimes 4 setmanes, ¿amb quina freqüència s'ha sentit massa cansat per fer la feina o les activitats diàries per culpa del mal de cap?", type: "choice", required: true, options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] },
      { id: "h5", text: "5. En les últimes 4 setmanes, ¿amb quina freqüència s'ha sentit fart i irritat pel mal de cap?", type: "choice", required: true, options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] },
      { id: "h6", text: "6. En les últimes 4 setmanes, ¿amb quina freqüència el mal de cap li ha limitat la capacitat per concentrar-se?", type: "choice", required: true, options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] }
    ],
    interpretations: [ { min: 36, max: 49, label: "Impacte Lleu", color: "text-green-700 bg-green-100" }, { min: 50, max: 55, label: "Impacte Moderat", color: "text-yellow-700 bg-yellow-100" }, { min: 56, max: 59, label: "Impacte Substancial", color: "text-orange-700 bg-orange-100" }, { min: 60, max: 78, label: "Impacte Sever", color: "text-red-700 bg-red-100" } ]
  }
];

// --- COMPONENTS UI COMPARTITS ---
const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = { primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm", secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200", danger: "bg-red-50 text-red-600 hover:bg-red-100", outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white" };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

const Card = ({ children, className = '' }) => (<div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>{children}</div>);

// --- COMPONENT LOGO INTEL·LIGENT ---
const ModumLogo = ({ className, isPrint = false }) => {
  const [srcIndex, setSrcIndex] = useState(0);
  const sources = [ "/logo.jpg", "/logo.png", "/logo.jpg.jpg", "/logo.jpeg", "/MODUM-Logo-04 (16).jpg", "/MODUM-Logo-04%20(16).jpg" ];

  const handleError = () => { if (srcIndex < sources.length) setSrcIndex(srcIndex + 1); };

  if (srcIndex >= sources.length) {
    if (isPrint) {
      return (
        <div className={`flex flex-col items-center justify-center border-2 border-slate-300 rounded-lg bg-slate-50 ${className}`}>
          <span className="text-[12px] font-black text-slate-400 tracking-widest leading-tight mt-1">MODUM</span>
          <span className="text-[9px] font-bold text-slate-400 leading-tight">FISIO</span>
        </div>
      );
    }
    return (
      <div className={`flex flex-col items-center justify-center bg-[#5E3236] text-white rounded-lg shadow-md ${className}`}>
        <span className="font-bold text-sm">MODUM</span>
      </div>
    );
  }

  return <img src={sources[srcIndex]} alt="MODUM" className={`object-contain ${className}`} onError={handleError} />;
};

// --- COMPONENT GRÀFICA SVG ---
const SimpleLineChart = ({ data, xKey, yKey, title }) => {
  if (!data || data.length === 0) return <div className="text-gray-400 text-sm h-48 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">No hi ha dades suficients.</div>;
  const padding = 25; const width = 400; const height = 180;
  const maxScore = Math.max(...data.map(d => d[yKey] || 0), 10);
  const points = data.map((d, i) => { const x = padding + (i * ((width - padding * 2) / (Math.max(data.length - 1, 1)))); const y = height - padding - (((d[yKey] || 0) / maxScore) * (height - padding * 2)); return `${x},${y}`; }).join(' ');
  return (
    <div className="w-full flex flex-col items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm print-break-inside-avoid">
      <h4 className="font-bold text-gray-700 mb-2 text-center text-sm">{title}</h4>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-w-full">
        <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke="#f3f4f6" />
        <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="#f3f4f6" />
        <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#e5e7eb" />
        {data.length > 1 && <polyline fill="none" stroke="#2563eb" strokeWidth="3" points={points} />}
        {data.map((d, i) => {
          const x = padding + (i * ((width - padding * 2) / (Math.max(data.length - 1, 1)))); const y = height - padding - (((d[yKey] || 0) / maxScore) * (height - padding * 2));
          return (<g key={i}><circle cx={x} cy={y} r="5" fill="#2563eb" /><text x={x} y={y - 12} fontSize="12" fontWeight="bold" fill="#2563eb" textAnchor="middle">{d[yKey]}</text><text x={x} y={height - 5} fontSize="10" fill="#6b7280" textAnchor="middle">{d[xKey]}</text></g>);
        })}
      </svg>
    </div>
  );
};

// --- APLICACIÓ PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [view, setView] = useState('dashboard'); 
  const [contextData, setContextData] = useState({});
  const [patients, setPatients] = useState([]); 
  const [tests, setTests] = useState([]); 
  const [responses, setResponses] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // LOGIN STATE
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // URL STATE PER MODE PACIENT
  const [isPatientMode, setIsPatientMode] = useState(false);
  const [patientUrlData, setPatientUrlData] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('p') && params.get('pat') && params.get('t')) {
        setIsPatientMode(true);
        setPatientUrlData({ physioId: params.get('p'), patientId: params.get('pat'), testId: params.get('t'), episodeName: params.get('ep') || 'General' });
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => { 
      setUser(currentUser); 
      setLoading(false); 
      if (isPatientMode && !currentUser) {
         signInAnonymously(auth).catch(console.error);
      }
    });
    return () => unsubscribe();
  }, [isPatientMode]);

  useEffect(() => {
    if (!user || isPatientMode || user.isAnonymous) return;
    const patientsRef = collection(db, `users_${user.uid}_patients`);
    const unsubPatients = onSnapshot(patientsRef, (snapshot) => setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    const responsesRef = collection(db, `users_${user.uid}_responses`);
    const unsubResponses = onSnapshot(responsesRef, (snapshot) => setResponses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => b.date - a.date)));
    return () => { unsubPatients(); unsubResponses(); };
  }, [user, isPatientMode]);

  useEffect(() => {
    const testsRef = collection(db, 'biblioteca_tests_clinics_v3'); 
    const unsubTests = onSnapshot(testsRef, (snapshot) => {
      const loadedTests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTests(loadedTests);
      if (loadedTests.length === 0 && !isPatientMode && user && !user.isAnonymous) {
        SEED_TESTS.forEach(async (t) => await addDoc(testsRef, t));
      }
    });
    return () => unsubTests();
  }, [user, isPatientMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        } catch (createErr) {
          setAuthError("No s'ha pogut crear l'usuari ni iniciar sessió. Verifica credencials.");
        }
      } else {
        setAuthError(err.message);
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => { await signOut(auth); setView('dashboard'); };
  const navigate = (newView, data = {}) => { setContextData(data); setView(newView); window.scrollTo(0,0); setIsMobileMenuOpen(false); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Activity className="animate-spin text-blue-600 w-8 h-8" /></div>;

  // --- RENDERITZAT LOGIN SCREEN ---
  if (!isPatientMode && (!user || user.isAnonymous)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <Card className="max-w-md w-full p-8 shadow-2xl border-t-8 border-[#5E3236]">
          <div className="text-center mb-8">
            <ModumLogo className="w-32 h-32 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Accés a FisioPro</h1>
            <p className="text-gray-500 mt-2">Introdueix el teu correu i contrasenya per accedir a la clínica.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Correu electrònic</label>
              <input type="email" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5E3236] outline-none transition-all" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="hola@modum.cat" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Contrasenya</label>
              <input type="password" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5E3236] outline-none transition-all" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {authError && <p className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded">{authError}</p>}
            <button type="submit" className="w-full py-3 text-lg mt-4 bg-[#5E3236] hover:bg-[#4a272a] text-white rounded-lg font-bold shadow-lg transition-colors">Iniciar Sessió Segura</button>
          </form>
        </Card>
      </div>
    );
  }

  // --- RENDERITZAT DEL MODE PACIENT ---
  if (isPatientMode) {
    if (tests.length === 0) return <div className="min-h-screen flex items-center justify-center"><Activity className="animate-spin text-blue-600 w-8 h-8" /></div>;
    return (
       <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
         <header className="bg-[#5E3236] p-4 shadow-md text-white text-center flex items-center justify-center gap-3">
            <ModumLogo className="h-8 bg-white rounded p-1" />
            <h1 className="text-xl font-bold">Portal del Pacient</h1>
         </header>
         <div className="p-4 md:p-8">
           <TestRunner 
              testId={patientUrlData.testId} patientId={patientUrlData.patientId} episodeName={patientUrlData.episodeName} 
              tests={tests} user={{uid: patientUrlData.physioId}} isPatientMode={true} 
           />
         </div>
       </div>
    );