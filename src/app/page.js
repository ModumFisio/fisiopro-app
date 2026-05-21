"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Activity, Users, FileText, Settings, LogOut, Plus, Search, ChevronRight, ChevronDown, Save, Play, CheckCircle, BarChart2, ArrowLeft, Download, Trash2, Edit, Printer, FileOutput, Link as LinkIcon, Copy, Mail, Send, Menu, X } from 'lucide-react';

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
      { id: "h1", text: "1. Quan té mal de cap, ¿amb quina freqüència el dolor és fort?", type: "choice", options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] },
      { id: "h2", text: "2. ¿Amb quina freqüència el mal de cap li limita la capacitat per fer les activitats diàries habituals?", type: "choice", options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] },
      { id: "h3", text: "3. Quan té mal de cap, ¿amb quina freqüència desitja estirar-se?", type: "choice", options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] },
      { id: "h4", text: "4. En les últimes 4 setmanes, ¿amb quina freqüència s'ha sentit massa cansat per fer la feina o les activitats diàries per culpa del mal de cap?", type: "choice", options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] },
      { id: "h5", text: "5. En les últimes 4 setmanes, ¿amb quina freqüència s'ha sentit fart i irritat pel mal de cap?", type: "choice", options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] },
      { id: "h6", text: "6. En les últimes 4 setmanes, ¿amb quina freqüència el mal de cap li ha limitat la capacitat per concentrar-se?", type: "choice", options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] }
    ],
    interpretations: [ { min: 36, max: 49, label: "Impacte Lleu", color: "text-green-700 bg-green-100" }, { min: 50, max: 55, label: "Impacte Moderat", color: "text-yellow-700 bg-yellow-100" }, { min: 56, max: 59, label: "Impacte Substancial", color: "text-orange-700 bg-orange-100" }, { min: 60, max: 78, label: "Impacte Sever", color: "text-red-700 bg-red-100" } ]
  },
  {
    title: "Índex de Discapacitat Cervical (NDI)", category: "Cap i Coll", description: "Qüestionari validat de 10 ítems per avaluar la discapacitat associada al dolor cervical.",
    questions: [
      { id: "q1", text: "1. Intensitat del dolor", type: "choice", options: [ { text: "No tinc dolor en aquest moment", points: 0 }, { text: "Dolor molt suau", points: 1 }, { text: "Dolor moderat", points: 2 }, { text: "Dolor bastant sever", points: 3 }, { text: "Dolor molt sever", points: 4 }, { text: "El pitjor imaginable", points: 5 } ]},
      { id: "q2", text: "2. Cures personals", type: "choice", options: [ { text: "Puc cuidar de mi mateix sense dolor", points: 0 }, { text: "Puc però em causa dolor", points: 1 }, { text: "És dolorós i sóc lent", points: 2 }, { text: "Necessito ajuda", points: 3 }, { text: "Necessito ajuda cada dia", points: 4 }, { text: "No puc vestir-me ni rentar-me", points: 5 } ]},
      { id: "q3", text: "3. Aixecar pesos", type: "choice", options: [ { text: "Sense dolor", points: 0 }, { text: "Amb dolor", points: 1 }, { text: "El dolor m'impedeix pesos grans", points: 2 }, { text: "Només pesos mitjans", points: 3 }, { text: "Només molt lleugers", points: 4 }, { text: "No puc", points: 5 } ]}
    ],
    interpretations: [ { min: 0, max: 4, label: "Sense discapacitat (0-8%)", color: "text-green-700 bg-green-100" }, { min: 5, max: 14, label: "Discapacitat lleu (10-28%)", color: "text-blue-700 bg-blue-100" }, { min: 15, max: 24, label: "Discapacitat moderada (30-48%)", color: "text-yellow-700 bg-yellow-100" }, { min: 25, max: 34, label: "Discapacitat severa (50-68%)", color: "text-orange-700 bg-orange-100" }, { min: 35, max: 50, label: "Discapacitat completa (70-100%)", color: "text-red-700 bg-red-100" } ]
  },
  {
    title: "Escala Tampa de Kinesiofòbia (TSK-11SV)", category: "Funció Global", description: "Avalua la por al moviment.",
    questions: [
      { id: "t1", text: "1. Em fa por que em pugui fer mal si faig exercici.", type: "choice", options: [ { text: "Totalment en desacord", points: 1 }, { text: "En desacord", points: 2 }, { text: "D'acord", points: 3 }, { text: "Totalment d'acord", points: 4 } ]},
      { id: "t2", text: "2. Si intentés superar el dolor, em faria més mal.", type: "choice", options: [ { text: "Totalment en desacord", points: 1 }, { text: "En desacord", points: 2 }, { text: "D'acord", points: 3 }, { text: "Totalment d'acord", points: 4 } ]}
    ],
    interpretations: [ { min: 11, max: 22, label: "Kinesiofòbia Baixa", color: "text-green-700 bg-green-100" }, { min: 23, max: 33, label: "Kinesiofòbia Moderada", color: "text-yellow-700 bg-yellow-100" }, { min: 34, max: 44, label: "Kinesiofòbia Alta", color: "text-red-700 bg-red-100" } ]
  },
  {
    title: "Total Tenderness Score (Punts Gatell)", category: "Cap i Coll", description: "Palpació de punts dolorosos. 0 (No dolor), 1 (Lleu), 2 (Moderat), 3 (Sever).",
    questions: [
      { id: "tts1", text: "Trapeci Superior", type: "bilateral_number", max: 3 },
      { id: "tts2", text: "Regió Craniocervical (Suboccipitals)", type: "bilateral_number", max: 3 },
      { id: "tts3", text: "Temporal", type: "bilateral_number", max: 3 },
      { id: "tts4", text: "Frontal", type: "bilateral_number", max: 3 },
      { id: "tts5", text: "Masseter", type: "bilateral_number", max: 3 },
      { id: "tts6", text: "ECOM", type: "bilateral_number", max: 3 }
    ],
    interpretations: [ { min: 0, max: 10, label: "Sensibilització Baixa", color: "text-green-700 bg-green-100" }, { min: 11, max: 25, label: "Sensibilització Moderada", color: "text-yellow-700 bg-yellow-100" }, { min: 26, max: 42, label: "Sensibilització Severa", color: "text-red-700 bg-red-100" } ]
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
  const sources = [
    "/logo.jpg",
    "/logo.png",
    "/logo.jpg.jpg",
    "/logo.jpeg",
    "/MODUM-Logo-04 (16).jpg",
    "/MODUM-Logo-04%20(16).jpg"
  ];

  const handleError = () => {
    if (srcIndex < sources.length) {
      setSrcIndex(srcIndex + 1);
    }
  };

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

  return (
    <img src={sources[srcIndex]} alt="MODUM" className={`object-contain ${className}`} onError={handleError} />
  );
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
  }

  // --- RENDERITZAT NORMAL DEL FISIOTERAPEUTA ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800 relative">
      
      {/* HEADER MÒBIL */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center no-print sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2 font-bold text-lg"><Activity className="w-5 h-5"/> FisioPro</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-slate-800 rounded"><Menu className="w-6 h-6" /></button>
      </div>

      {/* OVERLAY FOSC PER A MENÚ MÒBIL */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden no-print" onClick={() => setIsMobileMenuOpen(false)}></div>}

      {/* SIDEBAR RESPONSIVE */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col no-print transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg"><Activity className="w-6 h-6 text-white" /></div>
            <span className="text-xl font-bold text-white tracking-tight">FisioPro</span>
          </div>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6"/></button>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <NavItem icon={<BarChart2 />} label="Dashboard" active={view === 'dashboard'} onClick={() => navigate('dashboard')} />
          <NavItem icon={<Users />} label="Pacients" active={view.includes('patient')} onClick={() => navigate('patients')} />
          <NavItem icon={<FileText />} label="Motor de Tests" active={view.includes('test')} onClick={() => navigate('tests')} />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-gray-400 truncate mb-4">Usuari actiu:<br/><span className="text-white text-sm">{user?.email}</span></div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-bold">
            <LogOut className="w-4 h-4" /> Tancar Sessió
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full md:h-screen overflow-hidden print-container print:h-auto print:overflow-visible print:block">
        <header className="bg-white border-b border-gray-200 px-8 py-4 justify-between items-center hidden md:flex no-print">
          <h1 className="text-xl font-semibold capitalize">{view.replace('-', ' ')}</h1>
          <div className="flex items-center gap-4">
             <span className="text-sm text-gray-500">{new Date().toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0 print:overflow-visible print:block">
          {view === 'dashboard' && <Dashboard patients={patients} responses={responses} tests={tests} onNavigate={navigate} />}
          {view === 'patients' && <PatientList patients={patients} onNavigate={navigate} user={user} />}
          {view === 'patient-detail' && <PatientDetail patientId={contextData.id} patients={patients} responses={responses} tests={tests} onNavigate={navigate} user={user} />}
          {view === 'tests' && <TestLibrary tests={tests} onNavigate={navigate} />}
          {view === 'test-builder' && <TestBuilder testId={contextData.id} tests={tests} onNavigate={navigate} user={user} />}
          {view === 'test-runner' && <TestRunner patientId={contextData.patientId} testId={contextData.testId} episodeName={contextData.episodeName} tests={tests} onNavigate={navigate} user={user} />}
          {view === 'print-response' && <PrintResponseView responseId={contextData.responseId} responses={responses} tests={tests} patients={patients} onNavigate={navigate} />}
        </div>
      </main>

      {/* LÒGICA D'IMPRESSIÓ NETA SENSE VISIBILITY: HIDDEN */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Eliminem tot allò que tingui classe no-print perquè no ocupi espai i eviti salts de pàgina */
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          
          .no-print { display: none !important; }
          .print-break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
          .print-page-break { page-break-before: always; break-before: page; }
          
          /* Netegem estils que puguin molestar */
          .shadow-sm, .shadow-md, .shadow-xl { box-shadow: none !important; border: none !important; }
          
          /* OPTIMITZACIÓ DE PÀGINA PER CABRE MÉS */
          @page { margin: 1cm; size: auto; }
          
          h1 { font-size: 1.5rem !important; margin-bottom: 0.2rem !important; }
          h2 { font-size: 1.1rem !important; margin-bottom: 0.5rem !important; }
          h3 { font-size: 1rem !important; margin-bottom: 0.2rem !important; }
          
          /* Compactació per cabre en 1 pàgina */
          .print-compact-result { padding: 0.5rem !important; margin-bottom: 1rem !important; border: 1px solid #e5e7eb !important; }
          .print-compact-result p.text-4xl { font-size: 2rem !important; }
          .print-compact-row { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; border-bottom: 1px solid #f3f4f6 !important; }
          .print-compact-row p { font-size: 0.8rem !important; }
        }
      `}} />
    </div>
  );
}

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
    {React.cloneElement(icon, { className: "w-5 h-5" })}<span className="font-medium">{label}</span>
  </button>
);

const Dashboard = ({ patients, responses, tests, onNavigate }) => {
  const recentResponses = responses.slice(0, 5);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6"><div className="flex justify-between items-start"><div><p className="text-sm text-gray-500 font-medium">Total Pacients</p><h3 className="text-3xl font-bold mt-2">{patients.length}</h3></div><div className="bg-blue-50 p-3 rounded-lg text-blue-600"><Users /></div></div></Card>
        <Card className="p-6"><div className="flex justify-between items-start"><div><p className="text-sm text-gray-500 font-medium">Tests Realitzats</p><h3 className="text-3xl font-bold mt-2">{responses.length}</h3></div><div className="bg-green-50 p-3 rounded-lg text-green-600"><CheckCircle /></div></div></Card>
        <Card className="p-6"><div className="flex justify-between items-start"><div><p className="text-sm text-gray-500 font-medium">Tests a la Biblioteca</p><h3 className="text-3xl font-bold mt-2">{tests.length}</h3></div><div className="bg-purple-50 p-3 rounded-lg text-purple-600"><FileText /></div></div></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-gray-100 flex justify-between items-center"><h3 className="font-semibold text-lg">Últims Resultats</h3><Button variant="outline" onClick={() => onNavigate('patients')}>Veure tots</Button></div>
          <div className="divide-y divide-gray-100">
            {recentResponses.length === 0 ? <p className="text-gray-400 text-center py-6">Cap resultat registrat encara.</p> : recentResponses.map(res => {
              const pat = patients.find(p => p.id === res.patientId); const test = tests.find(t => t.id === res.testId);
              return (
                <div key={res.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 cursor-pointer gap-2" onClick={() => onNavigate('patient-detail', { id: res.patientId })}>
                  <div><p className="font-medium">{pat ? `${pat.firstName} ${pat.lastName}` : 'Desconegut'}</p><p className="text-sm text-gray-500">{test?.title || 'Test Eliminat'} ({res.episodeName || 'General'})</p></div>
                  <div className="sm:text-right"><p className="font-bold text-blue-600">{res.score} pts</p></div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

const PatientList = ({ patients, onNavigate, user }) => {
  const [searchTerm, setSearchTerm] = useState(''); const [showModal, setShowModal] = useState(false); const [newPatient, setNewPatient] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const filtered = patients.filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleSave = async (e) => { 
    e.preventDefault(); 
    if (!user || !newPatient.firstName) return; 
    await addDoc(collection(db, `users_${user.uid}_patients`), { ...newPatient, episodes: [], createdAt: Date.now() }); 
    setShowModal(false); 
    setNewPatient({ firstName: '', lastName: '', email: '', phone: '' }); 
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Cercar pacients..." className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Nou Pacient</Button>
      </div>
      <Card className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead className="bg-gray-50 border-b"><tr><th className="p-4">Nom</th><th className="p-4">Telèfon</th><th className="p-4 text-right">Accions</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(p => (<tr key={p.id} className="hover:bg-blue-50 cursor-pointer" onClick={() => onNavigate('patient-detail', { id: p.id })}><td className="p-4 font-medium">{p.firstName} {p.lastName}</td><td className="p-4 text-gray-500">{p.phone || '-'}</td><td className="p-4 text-right"><Button variant="outline" className="ml-auto p-2"><ChevronRight className="w-4 h-4" /></Button></td></tr>))}
            {filtered.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-gray-400">Cap pacient trobat.</td></tr>}
          </tbody>
        </table>
      </Card>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nou Pacient</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input required className="w-full p-2 border rounded" placeholder="Nom" value={newPatient.firstName} onChange={e => setNewPatient({...newPatient, firstName: e.target.value})} />
              <input required className="w-full p-2 border rounded" placeholder="Cognoms" value={newPatient.lastName} onChange={e => setNewPatient({...newPatient, lastName: e.target.value})} />
              <input type="email" className="w-full p-2 border rounded" placeholder="Email (Opcional)" value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} />
              <input type="tel" className="w-full p-2 border rounded" placeholder="Telèfon" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} />
              <div className="flex justify-end gap-3 mt-6"><Button variant="outline" onClick={() => setShowModal(false)}>Cancel·lar</Button><Button type="submit"><Save className="w-4 h-4"/> Guardar</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const PatientDetail = ({ patientId, patients, responses, tests, onNavigate, user }) => {
  const patient = patients.find(p => p.id === patientId); 
  const patientResponses = responses.filter(r => r.patientId === patientId); 
  
  const [showNewEpisodeModal, setShowNewEpisodeModal] = useState(false);
  const [newEpisodeName, setNewEpisodeName] = useState('');
  
  const [showTestSelector, setShowTestSelector] = useState(false);
  const [testSelectorMode, setTestSelectorMode] = useState(''); 
  const [targetEpisode, setTargetEpisode] = useState('');
  const [searchTest, setSearchTest] = useState('');
  
  const [copiedTestId, setCopiedTestId] = useState(null); 
  const [deleteModal, setDeleteModal] = useState(null);

  const [expandedEpisodes, setExpandedEpisodes] = useState({});

  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [editPatientData, setEditPatientData] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  
  const [printFilter, setPrintFilter] = useState('all');

  useEffect(() => {
    const ep = patient?.episodes || [];
    if (ep.length > 0 && Object.keys(expandedEpisodes).length === 0) {
      setExpandedEpisodes({ [ep[0]]: true });
    }
  }, [patient]);

  if (!patient) return <div>Pacient no trobat</div>;

  const toggleEpisode = (ep) => { setExpandedEpisodes(prev => ({ ...prev, [ep]: !prev[ep] })); };

  const handleCreateEpisode = async (e) => {
    e.preventDefault();
    if (!newEpisodeName.trim()) return;
    const currentEpisodes = patient.episodes || [];
    if (!currentEpisodes.includes(newEpisodeName)) {
      await updateDoc(doc(db, `users_${user.uid}_patients`, patient.id), { episodes: [...currentEpisodes, newEpisodeName] });
      setExpandedEpisodes(prev => ({ ...prev, [newEpisodeName]: true }));
    }
    setNewEpisodeName('');
    setShowNewEpisodeModal(false);
  };

  const handleEditPatient = async (e) => {
    e.preventDefault();
    if (!editPatientData.firstName) return;
    try {
      await updateDoc(doc(db, `users_${user.uid}_patients`, patient.id), {
        firstName: editPatientData.firstName, lastName: editPatientData.lastName, email: editPatientData.email, phone: editPatientData.phone
      });
      setShowEditPatientModal(false);
    } catch (err) { alert("Error actualitzant dades."); }
  };

  const generateTestLink = (testId, episodeName) => `${window.location.origin}/?p=${user.uid}&pat=${patient.id}&t=${testId}&ep=${encodeURIComponent(episodeName)}`;
  const copyToClipboard = (text, testId) => { navigator.clipboard.writeText(text); setCopiedTestId(testId); setTimeout(() => setCopiedTestId(null), 2000); };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    try {
      if (deleteModal.type === 'patient') {
        await deleteDoc(doc(db, `users_${user.uid}_patients`, deleteModal.id));
        for (const r of patientResponses) await deleteDoc(doc(db, `users_${user.uid}_responses`, r.id));
        setDeleteModal(null); onNavigate('patients');
      } else if (deleteModal.type === 'episode') {
        const newEpisodes = (patient.episodes || []).filter(e => e !== deleteModal.id);
        await updateDoc(doc(db, `users_${user.uid}_patients`, patient.id), { episodes: newEpisodes });
        const responsesToDelete = patientResponses.filter(r => (r.episodeName || 'General') === deleteModal.id);
        for (const r of responsesToDelete) await deleteDoc(doc(db, `users_${user.uid}_responses`, r.id));
        setDeleteModal(null);
      } else if (deleteModal.type === 'response') {
        await deleteDoc(doc(db, `users_${user.uid}_responses`, deleteModal.id));
        setDeleteModal(null);
      }
    } catch (e) { console.error(e); }
  };

  const triggerPrint = (episode = 'all') => {
    setPrintFilter(episode);
    if (episode !== 'all') {
        setExpandedEpisodes(prev => ({ ...prev, [episode]: true }));
    } else {
        const allExpanded = {};
        allEpisodes.forEach(ep => allExpanded[ep] = true);
        setExpandedEpisodes(allExpanded);
    }
    setTimeout(() => {
        window.print();
        setPrintFilter('all'); 
    }, 100);
  };

  const savedEpisodes = patient.episodes || [];
  const responseEpisodes = patientResponses.map(r => r.episodeName || 'General');
  const allEpisodes = [...new Set([...savedEpisodes, ...responseEpisodes])].sort();

  const filteredTestsModal = tests.filter(t => t.title.toLowerCase().includes(searchTest.toLowerCase()) || t.category.toLowerCase().includes(searchTest.toLowerCase()));

  return (
    <div className="space-y-8 max-w-6xl mx-auto printable-area">
      {/* CAPÇALERA IMPRESSIÓ GLOBAL / EPISODI (Amagada a pantalla) */}
      <div className="hidden print:flex border-b-2 border-slate-900 pb-4 mb-6 justify-between items-end w-full">
        <div className="flex items-center gap-4">
          <ModumLogo className="w-16 h-16 sm:w-20 sm:h-20" isPrint={true} />
          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-1 leading-none tracking-tight">MODUM FISIO</h1>
            <h2 className="text-base text-slate-600 font-bold">Historial Clínic {printFilter !== 'all' ? `- ${printFilter}` : ''}</h2>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-800">{patient.firstName} {patient.lastName}</p>
          <p className="text-xs text-slate-500">Tel: {patient.phone || '-'}</p>
          <p className="text-xs text-slate-500">Data Impressió: {new Date().toLocaleDateString('ca-ES')}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 no-print">
        <div className="flex items-center gap-4"><button onClick={() => onNavigate('patients')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><ArrowLeft className="w-5 h-5" /></button><h2 className="text-2xl font-bold">Fitxa del Pacient</h2></div>
        <div className="sm:ml-auto flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => triggerPrint('all')}><Printer className="w-4 h-4" /> Imprimir Historial</Button>
          <Button onClick={() => setShowNewEpisodeModal(true)}><Plus className="w-4 h-4" /> Nou Episodi</Button>
          <Button variant="danger" onClick={() => setDeleteModal({ type: 'patient', id: patient.id, name: `el pacient ${patient.firstName} ${patient.lastName}` })}><Trash2 className="w-4 h-4" /> Esborrar Pacient</Button>
        </div>
      </div>

      <Card className="p-6 border-t-4 border-blue-600 print-break-inside-avoid no-print">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-2xl font-bold shrink-0 mx-auto sm:mx-0">{patient.firstName[0]}{patient.lastName?.[0]}</div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold">{patient.firstName} {patient.lastName}</h2>
            <p className="text-gray-600 mt-1">Telèfon: {patient.phone || '-'} | Email: {patient.email || '-'} | Alta: {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : '-'}</p>
            <Button variant="outline" onClick={() => {setEditPatientData(patient); setShowEditPatientModal(true);}} className="mt-4 mx-auto sm:mx-0 text-sm py-1.5 px-4"><Edit className="w-4 h-4"/> Editar Dades</Button>
          </div>
        </div>
      </Card>

      {allEpisodes.length === 0 ? (
         <div className="p-8 md:p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed flex flex-col items-center mx-2 no-print"><p className="mb-4">Aquest pacient no té cap episodi clínic obert.</p><Button onClick={() => setShowNewEpisodeModal(true)}>Obrir Primer Episodi</Button></div>
      ) : (
        <div className="space-y-4">
        {allEpisodes.map((episode, index) => {
          if (printFilter !== 'all' && printFilter !== episode) return null;

          const episodeResponses = patientResponses.filter(r => (r.episodeName || 'General') === episode);
          const uniqueTestsIds = [...new Set(episodeResponses.map(r => r.testId))];
          const isExpanded = expandedEpisodes[episode]; 

          return (
            <div key={episode} className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all print:border-none print:shadow-none print:mb-8 ${index > 0 && printFilter === 'all' ? 'print-page-break' : ''}`}>
              <div 
                className={`bg-slate-50 p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 cursor-pointer hover:bg-slate-100 transition-colors print:bg-white print:p-0 print:mb-4 print:border-b print:pb-2 ${isExpanded ? 'border-b border-gray-200' : ''}`}
                onClick={(e) => { if (e.target.closest('.actions-group')) return; toggleEpisode(episode); }}
              >
                <div className="flex items-center gap-3 w-full xl:w-auto">
                  <div className={`transform transition-transform no-print ${isExpanded ? 'rotate-180' : ''}`}><ChevronDown className="w-5 h-5 text-gray-500" /></div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2 py-1 rounded print:bg-transparent print:px-0 print:text-gray-500">Patologia / Episodi Clínic</span>
                    <div className="flex items-center gap-2 mt-1">
                      <h3 className="text-xl font-bold text-gray-900">{episode}</h3>
                    </div>
                  </div>
                </div>
                <div className="actions-group flex flex-wrap items-center gap-2 no-print w-full xl:w-auto ml-8 xl:ml-0">
                  <Button variant="outline" className="flex-1 xl:flex-none text-sm" onClick={() => triggerPrint(episode)} title="Imprimir només aquest episodi"><Printer className="w-4 h-4 text-gray-600" /> Imprimir</Button>
                  <Button variant="outline" className="flex-1 xl:flex-none text-sm" onClick={() => { setTargetEpisode(episode); setTestSelectorMode('send'); setShowTestSelector(true); }}><Send className="w-4 h-4 text-blue-600" /> Enviar</Button>
                  <Button className="flex-1 xl:flex-none text-sm" onClick={() => { setTargetEpisode(episode); setTestSelectorMode('run'); setShowTestSelector(true); }}><Play className="w-4 h-4" /> Fer Test Aquí</Button>
                  <button onClick={() => setDeleteModal({ type: 'episode', id: episode, name: `la patologia "${episode}"` })} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-auto"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 sm:p-6 print:p-0 animate-in slide-in-from-top-2 duration-200">
                  {episodeResponses.length === 0 ? (
                    <p className="text-center text-gray-400 py-6 print:hidden">Encara no hi ha tests realitzats per a aquesta patologia.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 print-break-inside-avoid">
                        {uniqueTestsIds.map(tId => {
                          const testDef = tests.find(t => t.id === tId);
                          if(!testDef) return null;
                          const chartData = episodeResponses
                            .filter(r => r.testId === tId)
                            .sort((a, b) => a.date - b.date)
                            .map(r => ({ data: new Date(r.date).toLocaleDateString('ca-ES', { month: 'short', day: 'numeric' }), puntuacio: r.score }));
                          return <SimpleLineChart key={tId} data={chartData} xKey="data" yKey="puntuacio" title={testDef.title} />;
                        })}
                      </div>

                      <h4 className="font-semibold text-gray-700 mb-4 border-b pb-2">Registres Individuals</h4>
                      <div className="divide-y divide-gray-100 border rounded-xl overflow-hidden print-break-inside-avoid print:border-none print:divide-y-0">
                        {episodeResponses.sort((a,b) => b.date - a.date).map(res => {
                          const test = tests.find(t => t.id === res.testId);
                          return (
                            <div key={res.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-gray-50 print:p-2 print:border-b print:border-gray-100">
                              <div>
                                <h4 className="font-bold text-gray-900 leading-tight">{test?.title || 'Test Desconegut'}</h4>
                                <p className="text-sm text-gray-500 mt-1">{new Date(res.date).toLocaleString('ca-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                              </div>
                              <div className="flex items-center gap-4 justify-between sm:justify-end">
                                <div className="text-left sm:text-right mr-2">
                                  <p className="font-black text-xl text-blue-600">{res.score} <span className="text-sm font-normal text-gray-400">/ {res.maxScore}</span></p>
                                  <div className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold inline-block mt-1 ${res.interpretation?.color || 'bg-gray-100 print:text-gray-800'}`}>{res.interpretation?.label || 'Completat'}</div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 no-print">
                                  <Button variant="outline" className="p-2" onClick={() => onNavigate('print-response', { responseId: res.id })} title="Veure / Imprimir Detall Test"><FileOutput className="w-4 h-4 text-gray-600" /></Button>
                                  <button onClick={() => setDeleteModal({ type: 'response', id: res.id, name: `el test de ${new Date(res.date).toLocaleDateString()}` })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      {showNewEpisodeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nou Episodi / Patologia</h2>
            <form onSubmit={handleCreateEpisode}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Escriu el motiu de consulta</label>
              <input required autoFocus className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-6" value={newEpisodeName} onChange={e => setNewEpisodeName(e.target.value)} />
              <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setShowNewEpisodeModal(false)}>Cancel·lar</Button><Button type="submit"><Save className="w-4 h-4"/> Crear</Button></div>
            </form>
          </div>
        </div>
      )}

      {showEditPatientModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Pacient</h2>
            <form onSubmit={handleEditPatient} className="space-y-4">
              <input required className="w-full p-2 border rounded" placeholder="Nom" value={editPatientData.firstName} onChange={e => setEditPatientData({...editPatientData, firstName: e.target.value})} />
              <input required className="w-full p-2 border rounded" placeholder="Cognoms" value={editPatientData.lastName} onChange={e => setEditPatientData({...editPatientData, lastName: e.target.value})} />
              <input type="email" className="w-full p-2 border rounded" placeholder="Email" value={editPatientData.email} onChange={e => setEditPatientData({...editPatientData, email: e.target.value})} />
              <input type="tel" className="w-full p-2 border rounded" placeholder="Telèfon" value={editPatientData.phone} onChange={e => setEditPatientData({...editPatientData, phone: e.target.value})} />
              <div className="flex justify-end gap-3 mt-6"><Button variant="outline" onClick={() => setShowEditPatientModal(false)}>Cancel·lar</Button><Button type="submit"><Save className="w-4 h-4"/> Guardar Canvis</Button></div>
            </form>
          </div>
        </div>
      )}

      {showTestSelector && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="pr-4">
                <h2 className="text-xl md:text-2xl font-bold">{testSelectorMode === 'send' ? 'Enviar Test al Pacient' : 'Seleccionar Test a Realitzar'}</h2>
                <p className="text-sm md:text-base text-gray-500 mt-1">Patologia: <span className="font-bold text-gray-700">{targetEpisode}</span></p>
              </div>
              <button onClick={() => setShowTestSelector(false)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full shrink-0"><X className="w-5 h-5"/></button>
            </div>

            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Cercar test..." className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" value={searchTest} onChange={e => setSearchTest(e.target.value)} />
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                {filteredTestsModal.length === 0 && <p className="text-gray-400 col-span-full text-center py-4">Cap test coincideix amb la cerca.</p>}
                {filteredTestsModal.map(t => {
                  if (testSelectorMode === 'run') {
                    return (
                      <div key={t.id} onClick={() => onNavigate('test-runner', { patientId: patient.id, testId: t.id, episodeName: targetEpisode })} className="border border-gray-200 p-5 rounded-xl hover:border-blue-500 hover:shadow-md cursor-pointer transition-all bg-white group flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-gray-400 group-hover:text-blue-500 mb-1 block">{t.category}</span>
                        <h3 className="font-bold text-gray-900 mb-2 leading-tight">{t.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-auto">{t.description}</p>
                      </div>
                    );
                  } else {
                    const testLink = generateTestLink(t.id, targetEpisode);
                    const emailSubject = `Qüestionari Clínic: ${t.title}`;
                    const emailBody = `Hola ${patient.firstName},\n\nSi us plau, emplena aquest qüestionari clínic des del teu mòbil o ordinador abans de la propera visita:\n\n${testLink}\n\nGràcies!`;
                    const isCopied = copiedTestId === t.id;

                    return (
                      <div key={t.id} className="border border-blue-100 p-5 rounded-xl bg-blue-50/30 flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-blue-500 mb-1 block">{t.category}</span>
                        <h3 className="font-bold text-gray-900 mb-2 leading-tight">{t.title}</h3>
                        <div className="mt-auto pt-4 flex flex-col gap-2">
                          <Button variant="outline" className="w-full text-sm py-2" onClick={() => copyToClipboard(testLink, t.id)}>
                            {isCopied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />} {isCopied ? 'Enllaç copiat!' : 'Copiar enllaç WhatsApp'}
                          </Button>
                          <a href={`mailto:${patient.email || ''}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`} className="w-full">
                            <Button className="w-full text-sm py-2"><Mail className="w-4 h-4" /> Enviar per Email</Button>
                          </a>
                        </div>
                      </div>
                    )
                  }
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md text-center border-t-8 border-red-500">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-8 h-8" /></div>
            <h2 className="text-xl md:text-2xl font-bold mb-3">Segur que vols esborrar-ho?</h2>
            <p className="text-sm md:text-base text-gray-600 mb-8">Estàs a punt d'esborrar permanentment <strong>{deleteModal.name}</strong>. Aquesta acció no es pot desfer i eliminarà totes les dades associades.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3"><Button variant="outline" className="px-6 py-2" onClick={() => setDeleteModal(null)}>Cancel·lar</Button><Button variant="danger" className="px-6 py-2 shadow-md hover:shadow-lg" onClick={confirmDelete}>Sí, Esborrar-ho</Button></div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- VISTA: IMPRIMIR INFORME INDIVIDUAL D'UN TEST ---
const PrintResponseView = ({ responseId, responses, tests, patients, onNavigate }) => {
  const response = responses.find(r => r.id === responseId);
  if (!response) return <div>Resposta no trobada</div>;
  const test = tests.find(t => t.id === response.testId);
  const patient = patients.find(p => p.id === response.patientId);

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 md:p-12 shadow-sm border border-gray-200 rounded-lg printable-area print:p-0 print:border-none print:shadow-none print:m-0 print:w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 no-print border-b pb-4">
        <Button variant="outline" onClick={() => onNavigate('patient-detail', { id: patient?.id })}><ArrowLeft className="w-4 h-4"/> Tornar</Button>
        <Button onClick={() => window.print()}><Printer className="w-4 h-4"/> Imprimir Informe A4</Button>
      </div>

      {/* CAPÇALERA OPTIMITZADA PER PDF */}
      <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-end w-full">
        <div className="flex items-center gap-4">
          <ModumLogo className="w-16 h-16 sm:w-20 sm:h-20" isPrint={true} />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-1 leading-none tracking-tight">MODUM FISIO</h1>
            <h2 className="text-sm sm:text-base text-slate-600 font-bold leading-tight">{test?.title}</h2>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-800 text-sm sm:text-base">{patient?.firstName} {patient?.lastName}</p>
          <p className="text-xs text-slate-500 leading-tight mt-1">Tel: {patient?.phone || '-'}</p>
          <p className="text-xs text-slate-500 leading-tight">Data: {new Date(response.date).toLocaleDateString('ca-ES')}</p>
          <p className="text-xs text-slate-500 leading-tight">Patologia: <span className="font-medium text-slate-700">{response.episodeName || 'General'}</span></p>
        </div>
      </div>

      {/* RESULTAT PRINCIPAL COMPACTAT */}
      <div className="bg-slate-50 print-compact-result rounded-xl border border-slate-200 mb-4 flex flex-row items-center justify-between gap-4 print-break-inside-avoid">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Resultat Final</p>
          <p className="text-3xl sm:text-4xl font-black text-blue-600 leading-none">{response.score} <span className="text-lg text-slate-400 font-medium">/ {response.maxScore}</span></p>
        </div>
        {response.interpretation && (
          <div className={`px-4 py-2 rounded-lg border font-bold text-sm text-center ${response.interpretation.color} border-current print:border-gray-300 print:text-gray-800 print:bg-white`}>
            {response.interpretation.label}
          </div>
        )}
      </div>

      {/* PREGUNTES MÉS PETITES PER CABRE A 1 PÀGINA */}
      <div className="space-y-0.5">
        <h3 className="font-bold text-sm text-slate-800 border-b pb-1 mb-2 uppercase tracking-wide">Detall de Respostes</h3>
        <div className="grid grid-cols-1 gap-x-6 gap-y-0">
          {test?.questions.map((q, idx) => {
            let ansText = "-";
            const ansVal = response.answers[q.id];
            if (q.type === 'choice' && ansVal !== undefined) ansText = `${q.options[ansVal].text} (${q.options[ansVal].points} pts)`;
            else if (q.type === 'boolean' && ansVal !== undefined) ansText = ansVal ? `SÍ (${q.points||1} pts)` : `NO (0 pts)`;
            else if (q.type === 'number' && ansVal !== undefined) ansText = `${ansVal} / ${q.max||10}`;
            else if (q.type === 'bilateral_number' && ansVal) ansText = `Dreta: ${ansVal.R||0} | Esquerra: ${ansVal.L||0}`;

            return (
              <div key={q.id} className="print-compact-row flex justify-between py-1.5 border-b border-slate-100 print-break-inside-avoid">
                <p className="text-slate-700 font-medium pr-2 text-xs sm:text-sm max-w-[75%]">{q.text}</p>
                <p className="text-slate-900 font-bold text-right text-xs sm:text-sm">{ansText}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
};

const TestLibrary = ({ tests, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredTests = tests.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div><h2 className="text-2xl font-bold">Biblioteca de Tests</h2></div>
        <Button onClick={() => onNavigate('test-builder', { id: 'new' })}><Plus className="w-4 h-4"/> Nou Test Personalitzat</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input type="text" placeholder="Cercar test per nom o categoria..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.length === 0 && <p className="text-gray-500 col-span-full">Cap test coincideix amb la cerca.</p>}
        {filteredTests.map(test => (
          <Card key={test.id} className="flex flex-col"><div className="p-5 flex-1"><span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded mb-3 inline-block">{test.category || 'General'}</span><h3 className="font-bold text-lg mb-2">{test.title}</h3><p className="text-sm text-gray-600 line-clamp-3 mb-4">{test.description}</p></div><div className="p-4 bg-gray-50 border-t flex gap-2"><Button variant="outline" className="flex-1 text-sm py-1.5" onClick={() => onNavigate('test-builder', { id: test.id })}><Edit className="w-4 h-4" /> Editar</Button></div></Card>
        ))}
      </div>
    </div>
  );
};

const TestBuilder = ({ testId, tests, onNavigate, user }) => {
  const [test, setTest] = useState({ title: '', description: '', category: '', questions: [], interpretations: [] });
  useEffect(() => { if (testId && testId !== 'new') { const existing = tests.find(t => t.id === testId); if (existing) setTest(existing); } }, [testId, tests]);
  const handleSave = async () => {
    if (!user) return;
    try { const testsRef = collection(db, 'biblioteca_tests_clinics_v3'); if (testId === 'new') await addDoc(testsRef, test); else await updateDoc(doc(testsRef, testId), test); onNavigate('tests'); } catch (error) { console.error(error); }
  };
  const addQuestion = () => setTest({ ...test, questions: [...test.questions, { id: Date.now().toString(), text: 'Nova Pregunta', type: 'choice', options: [{text: 'Opció 1', points: 0}] }] });
  const updateQuestion = (index, field, value) => { const newQ = [...test.questions]; newQ[index][field] = value; setTest({...test, questions: newQ}); };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4"><button onClick={() => onNavigate('tests')} className="p-2 bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5" /></button><h2 className="text-2xl font-bold">{testId === 'new' ? 'Crear Nou Test' : 'Editar Test'}</h2></div>
        <Button onClick={handleSave}><Save className="w-4 h-4" /> Guardar</Button>
      </div>
      <Card className="p-6 space-y-4 border-t-4 border-indigo-500">
        <input className="w-full p-3 border rounded-lg text-lg font-bold" placeholder="Títol del Test Clínic" value={test.title} onChange={e => setTest({...test, title: e.target.value})} />
        <textarea className="w-full p-3 border rounded-lg" placeholder="Descripció i ús clínic" rows="3" value={test.description} onChange={e => setTest({...test, description: e.target.value})} />
        <input className="w-full p-3 border rounded-lg" placeholder="Categoria" value={test.category} onChange={e => setTest({...test, category: e.target.value})} />
      </Card>
      <div className="space-y-4">
        {test.questions.map((q, qIndex) => (
          <Card key={q.id} className="p-4 border-l-4 border-blue-500 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <input className="flex-1 w-full sm:w-auto p-2 border rounded font-medium" value={q.text} onChange={e => updateQuestion(qIndex, 'text', e.target.value)} />
              <div className="flex w-full sm:w-auto gap-2">
                <select className="flex-1 sm:flex-none p-2 border rounded bg-gray-50 text-sm" value={q.type} onChange={e => updateQuestion(qIndex, 'type', e.target.value)}>
                  <option value="choice">Selecció Múltiple</option><option value="boolean">Sí/No</option><option value="number">Escala Numèrica Unica</option><option value="bilateral_number">Escala Bilateral (Dreta/Esq)</option>
                </select>
                <button onClick={() => setTest({...test, questions: test.questions.filter((_, i) => i !== qIndex)})} className="p-2 text-red-500 hover:bg-red-50 rounded shrink-0"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
            {q.type === 'choice' && (
              <div className="pl-4 space-y-2 border-l-2 border-gray-100">
                {(q.options || []).map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input className="flex-1 p-1 border-b text-sm" value={opt.text} onChange={e => { const newOpts = [...q.options]; newOpts[oIndex].text = e.target.value; updateQuestion(qIndex, 'options', newOpts); }} />
                    <input type="number" className="w-16 sm:w-20 p-1 border rounded text-center text-sm" placeholder="Punts" value={opt.points} onChange={e => { const newOpts = [...q.options]; newOpts[oIndex].points = Number(e.target.value); updateQuestion(qIndex, 'options', newOpts); }} />
                  </div>
                ))}
                <button onClick={() => updateQuestion(qIndex, 'options', [...(q.options||[]), {text: 'Nova opció', points: 0}])} className="text-sm text-blue-600 mt-2">+ Afegir opció</button>
              </div>
            )}
            {(q.type === 'number' || q.type === 'bilateral_number') && (<div className="text-sm text-gray-500 pl-4 mt-2">Punts màxims d'escala: <input type="number" className="border w-16 p-1 rounded ml-2" value={q.max || 10} onChange={e => updateQuestion(qIndex, 'max', Number(e.target.value))} /></div>)}
          </Card>
        ))}
        <Button variant="outline" onClick={addQuestion} className="w-full py-4 border-dashed border-2 text-gray-500"><Plus className="w-5 h-5" /> Afegir Pregunta</Button>
      </div>
      <Card className="p-6 space-y-4 border-t-4 border-green-500">
        <h3 className="font-bold text-lg border-b pb-2">Regles d'Interpretació</h3>
        {test.interpretations?.map((inter, iIndex) => (
          <div key={iIndex} className="flex flex-wrap items-center gap-2 mb-2 bg-gray-50 p-2 rounded">
            <span className="text-sm">De</span> <input type="number" className="w-16 p-2 border rounded text-sm" value={inter.min} onChange={e => { const newI = [...test.interpretations]; newI[iIndex].min = Number(e.target.value); setTest({...test, interpretations: newI}); }}/> 
            <span className="text-sm">a</span> <input type="number" className="w-16 p-2 border rounded text-sm" value={inter.max} onChange={e => { const newI = [...test.interpretations]; newI[iIndex].max = Number(e.target.value); setTest({...test, interpretations: newI}); }}/>
            <input className="flex-1 w-full sm:w-auto p-2 border rounded mt-2 sm:mt-0 text-sm" placeholder="Etiqueta" value={inter.label} onChange={e => { const newI = [...test.interpretations]; newI[iIndex].label = e.target.value; setTest({...test, interpretations: newI}); }}/>
            <button onClick={() => setTest({...test, interpretations: test.interpretations.filter((_, i) => i !== iIndex)})} className="text-red-500 p-2 mt-2 sm:mt-0"><Trash2 className="w-4 h-4"/></button>
          </div>
        ))}
        <button onClick={() => setTest({...test, interpretations: [...(test.interpretations||[]), {min:0, max:100, label:'Nou', color:'text-gray-800 bg-gray-100'}]})} className="text-sm text-green-600">+ Afegir Regla</button>
      </Card>
    </div>
  );
};

// --- RUNNER DEL TEST ---
const TestRunner = ({ testId, patientId, episodeName, tests, user, onNavigate, isPatientMode = false }) => {
  const test = tests.find(t => t.id === testId);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState(null);

  if (!test) return <div className="text-center p-8">Test no trobat</div>;

  const handleAnswer = (questionId, value, subfield = null) => {
    if (subfield) {
      setAnswers(prev => ({ ...prev, [questionId]: { ...(prev[questionId] || {}), [subfield]: value } }));
    } else {
      setAnswers(prev => ({ ...prev, [questionId]: value }));
    }
  };

  const calculateScore = () => {
    let total = 0; let maxTotal = 0;
    test.questions.forEach(q => {
      const answer = answers[q.id];
      if (q.type === 'choice') {
        maxTotal += Math.max(...q.options.map(o => o.points || 0));
        if (answer !== undefined) total += q.options[answer].points;
      } else if (q.type === 'boolean') {
        maxTotal += (q.points || 1);
        if (answer === true) total += (q.points || 1);
      } else if (q.type === 'number') {
        maxTotal += (q.max || 10);
        if (answer !== undefined) total += Number(answer);
      } else if (q.type === 'bilateral_number') {
        maxTotal += (q.max || 3) * 2; 
        if (answer && answer.R !== undefined) total += Number(answer.R);
        if (answer && answer.L !== undefined) total += Number(answer.L);
      }
    });

    let interpretation = null;
    if (test.interpretations) {
      interpretation = test.interpretations.find(i => total >= i.min && total <= i.max);
    }
    return { total, maxTotal, interpretation };
  };

  const handleSubmit = async () => {
    if (!user) return; 
    const { total, maxTotal, interpretation } = calculateScore();
    const finalResult = { patientId, testId, episodeName, date: Date.now(), answers, score: total, maxScore: maxTotal, interpretation, submittedBy: isPatientMode ? 'patient' : 'physio' };
    try {
      await addDoc(collection(db, `users_${user.uid}_responses`), finalResult);
      setResult(finalResult); setCompleted(true);
    } catch (e) { alert("Error guardant resultats."); }
  };

  if (completed && result) {
    return (
      <div className="max-w-2xl mx-auto mt-10 px-4">
        <Card className="p-6 md:p-8 text-center border-t-8 border-green-500">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Test Completat!</h2>
          <p className="text-gray-500 mb-6 text-sm md:text-base">{isPatientMode ? 'Els resultats s\'han enviat correctament al teu fisioterapeuta. Ja pots tancar aquesta pestanya.' : 'Resultats guardats a l\'historial.'}</p>
          
          <div className="bg-gray-50 p-4 md:p-6 rounded-xl inline-block text-left mb-8 mt-2 border border-gray-100">
            <p className="text-xs md:text-sm text-gray-500 uppercase font-semibold">Puntuació Final</p>
            <p className="text-3xl md:text-4xl font-black text-gray-900 my-2">{result.score} <span className="text-lg md:text-xl text-gray-400 font-normal">/ {result.maxScore}</span></p>
            {result.interpretation && (<div className={`mt-3 inline-block px-4 py-2 rounded-lg font-medium border text-sm md:text-base ${result.interpretation.color} border-current`}>{result.interpretation.label}</div>)}
          </div>
          
          {!isPatientMode && <div><Button onClick={() => onNavigate('patient-detail', { id: patientId })} className="mx-auto">Tornar a la Fitxa</Button></div>}
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 md:pb-20">
      <div className="mb-6 md:mb-8 bg-blue-50 p-4 md:p-6 rounded-xl border border-blue-100">
        {!isPatientMode && <button onClick={() => onNavigate('patient-detail', { id: patientId })} className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4 text-sm font-medium"><ArrowLeft className="w-4 h-4"/> Cancel·lar</button>}
        {isPatientMode && <p className="text-sm text-blue-800 mb-4 font-medium">👉 Emplena aquest formulari i clica Guardar al final de tot.</p>}
        <span className="bg-blue-600 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Patologia: {episodeName}</span>
        <h1 className="text-2xl md:text-3xl font-bold mt-3 text-slate-900 leading-tight">{test.title}</h1>
        <p className="text-sm md:text-base text-slate-700 mt-2">{test.description}</p>
      </div>
      <div className="space-y-4 md:space-y-6">
        {test.questions.map(q => (
          <Card key={q.id} className="p-4 md:p-6 border-l-4 border-slate-300">
            <h3 className="font-bold text-base md:text-lg mb-4 text-gray-800">{q.text}</h3>
            {q.type === 'choice' && (
              <div className="space-y-2">
                {q.options.map((opt, oIdx) => (
                  <label key={oIdx} className={`flex items-start md:items-center gap-3 p-3 md:p-4 rounded-lg border cursor-pointer transition-colors ${answers[q.id] === oIdx ? 'border-blue-500 bg-blue-50 shadow-sm' : 'hover:bg-gray-50 border-gray-200'}`}>
                    <input type="radio" name={q.id} className="w-5 h-5 mt-0.5 md:mt-0 text-blue-600 shrink-0" checked={answers[q.id] === oIdx} onChange={() => handleAnswer(q.id, oIdx)} />
                    <span className="font-medium text-gray-700 text-sm md:text-base">{opt.text}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === 'boolean' && (
              <div className="flex gap-3 md:gap-4">
                <label className={`flex-1 flex justify-center items-center py-3 md:py-4 border rounded-lg cursor-pointer font-bold text-base md:text-lg transition-colors ${answers[q.id] === true ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}><input type="radio" className="hidden" checked={answers[q.id] === true} onChange={() => handleAnswer(q.id, true)} />SÍ</label>
                <label className={`flex-1 flex justify-center items-center py-3 md:py-4 border rounded-lg cursor-pointer font-bold text-base md:text-lg transition-colors ${answers[q.id] === false ? 'bg-slate-700 text-white border-slate-700 shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}><input type="radio" className="hidden" checked={answers[q.id] === false} onChange={() => handleAnswer(q.id, false)} />NO</label>
              </div>
            )}
            {q.type === 'number' && (
              <div className="pt-2 md:pt-4 px-1 md:px-2">
                <input type="range" min="0" max={q.max || 10} className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer" value={answers[q.id] || 0} onChange={(e) => handleAnswer(q.id, e.target.value)} />
                <div className="flex justify-between mt-4 text-xs md:text-sm text-gray-500 font-bold items-center"><span>0 (Gens)</span><span className="text-xl md:text-2xl text-blue-600 bg-blue-50 px-4 py-1 rounded-lg border border-blue-100">{answers[q.id] || 0}</span><span>{q.max || 10} (Màxim)</span></div>
              </div>
            )}
            {q.type === 'bilateral_number' && (
              <div className="flex flex-col sm:flex-row gap-4 md:gap-8 pt-2 md:pt-4">
                <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="font-bold text-gray-600 mb-4 text-center tracking-widest text-xs md:text-sm">ESQUERRA</p>
                  <input type="range" min="0" max={q.max || 3} className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer" value={answers[q.id]?.L || 0} onChange={(e) => handleAnswer(q.id, e.target.value, 'L')} />
                  <div className="text-center mt-4"><span className="text-xl md:text-2xl text-blue-600 font-bold bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">{answers[q.id]?.L || 0}</span></div>
                </div>
                <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="font-bold text-gray-600 mb-4 text-center tracking-widest text-xs md:text-sm">DRETA</p>
                  <input type="range" min="0" max={q.max || 3} className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer" value={answers[q.id]?.R || 0} onChange={(e) => handleAnswer(q.id, e.target.value, 'R')} />
                  <div className="text-center mt-4"><span className="text-xl md:text-2xl text-indigo-600 font-bold bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">{answers[q.id]?.R || 0}</span></div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
      <div className={`mt-8 bg-white p-3 md:p-4 border-t fixed bottom-0 left-0 right-0 ${!isPatientMode ? 'md:left-64' : ''} flex justify-center md:justify-end shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] z-10`}><Button onClick={handleSubmit} className="w-full md:w-auto px-8 py-3 text-base md:text-lg shadow-md hover:shadow-lg">Guardar i Finalitzar</Button></div>
    </div>
  );
};