"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Activity, Users, FileText, Settings, LogOut, Plus, Search, ChevronRight, Save, Play, CheckCircle, BarChart2, ArrowLeft, Download, Trash2, Edit, Printer, FileOutput, Link as LinkIcon, Copy, Mail, Send, Menu, X } from 'lucide-react';

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

// --- DADES INICIALS (TESTS CLÍNICS OFICIALS MASSIVA) ---
const SEED_TESTS = [
  {
    title: "Headache Impact Test (HIT-6)",
    category: "Cap i Coll",
    description: "Avalua l'impacte del mal de cap en la vida diària. Cada resposta té un valor: Mai (6), Gairebé mai (8), A vegades (10), Molt sovint (11), Sempre (13).",
    questions: [
      { id: "h1", text: "1. Quan té mal de cap, ¿amb quina freqüència el dolor és fort?", type: "choice", options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] },
      { id: "h2", text: "2. ¿Amb quina freqüència el mal de cap li limita la capacitat per fer les seves activitats diàries habituals, incloent-hi la feina, els estudis i la vida social?", type: "choice", options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] },
      { id: "h3", text: "3. Quan té mal de cap, ¿amb quina freqüència desitja estirar-se?", type: "choice", options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] },
      { id: "h4", text: "4. En les últimes 4 setmanes, ¿amb quina freqüència s'ha sentit massa cansat per fer la feina o les activitats diàries per culpa del mal de cap?", type: "choice", options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] },
      { id: "h5", text: "5. En les últimes 4 setmanes, ¿amb quina freqüència s'ha sentit fart i irritat pel mal de cap?", type: "choice", options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] },
      { id: "h6", text: "6. En les últimes 4 setmanes, ¿amb quina freqüència el mal de cap li ha limitat la capacitat per concentrar-se a la feina o en les activitats diàries?", type: "choice", options: [ { text: "Mai", points: 6 }, { text: "Gairebé mai", points: 8 }, { text: "A vegades", points: 10 }, { text: "Molt sovint", points: 11 }, { text: "Sempre", points: 13 } ] }
    ],
    interpretations: [
      { min: 36, max: 49, label: "Impacte Lleu", color: "text-green-700 bg-green-100" },
      { min: 50, max: 55, label: "Impacte Moderat", color: "text-yellow-700 bg-yellow-100" },
      { min: 56, max: 59, label: "Impacte Substancial", color: "text-orange-700 bg-orange-100" },
      { min: 60, max: 78, label: "Impacte Sever", color: "text-red-700 bg-red-100" }
    ]
  },
  {
    title: "Índex de Discapacitat Cervical (NDI)",
    category: "Cap i Coll",
    description: "Qüestionari validat de 10 ítems per avaluar la discapacitat associada al dolor cervical.",
    questions: [
      { id: "q1", text: "1. Intensitat del dolor", type: "choice", options: [ { text: "No tinc dolor en aquest moment", points: 0 }, { text: "El dolor és molt suau en aquest moment", points: 1 }, { text: "El dolor és moderat en aquest moment", points: 2 }, { text: "El dolor és bastant sever en aquest moment", points: 3 }, { text: "El dolor és molt sever en aquest moment", points: 4 }, { text: "El dolor és el pitjor imaginable", points: 5 } ]},
      { id: "q2", text: "2. Cures personals (rentar-se, vestir-se, etc.)", type: "choice", options: [ { text: "Puc cuidar de mi mateix normalment sense dolor", points: 0 }, { text: "Puc cuidar de mi mateix normalment però em causa dolor", points: 1 }, { text: "És dolorós cuidar de mi mateix i sóc lent", points: 2 }, { text: "Necessito una mica d'ajuda", points: 3 }, { text: "Necessito ajuda cada dia", points: 4 }, { text: "No puc vestir-me ni rentar-me", points: 5 } ]},
      { id: "q3", text: "3. Aixecar pesos", type: "choice", options: [ { text: "Puc aixecar pesos grans sense dolor", points: 0 }, { text: "Puc aixecar pesos grans però amb dolor", points: 1 }, { text: "El dolor m'impedeix aixecar pesos grans de terra", points: 2 }, { text: "El dolor m'impedeix aixecar pesos grans, només mitjans", points: 3 }, { text: "Només puc aixecar pesos molt lleugers", points: 4 }, { text: "No puc aixecar ni portar res", points: 5 } ]},
      { id: "q4", text: "4. Llegir", type: "choice", options: [ { text: "Puc llegir tant com vull sense dolor", points: 0 }, { text: "Puc llegir tant com vull amb lleuger dolor", points: 1 }, { text: "Puc llegir tant com vull amb dolor moderat", points: 2 }, { text: "No puc llegir tant com vull pel dolor", points: 3 }, { text: "Puc llegir molt poc pel dolor", points: 4 }, { text: "No puc llegir gens", points: 5 } ]},
      { id: "q5", text: "5. Mal de cap", type: "choice", options: [ { text: "No tinc mal de cap", points: 0 }, { text: "Tinc mal de cap lleuger i infreqüent", points: 1 }, { text: "Tinc mal de cap moderat i infreqüent", points: 2 }, { text: "Tinc mal de cap moderat i freqüent", points: 3 }, { text: "Tinc mal de cap sever i freqüent", points: 4 }, { text: "Tinc mal de cap gairebé tot el temps", points: 5 } ]},
      { id: "q6", text: "6. Concentració", type: "choice", options: [ { text: "Puc concentrar-me plenament", points: 0 }, { text: "Puc concentrar-me amb una lleugera dificultat", points: 1 }, { text: "Tinc força dificultat per concentrar-me", points: 2 }, { text: "Tinc molta dificultat per concentrar-me", points: 3 }, { text: "Tinc una grandíssima dificultat per concentrar-me", points: 4 }, { text: "No em puc concentrar gens", points: 5 } ]},
      { id: "q7", text: "7. Treball", type: "choice", options: [ { text: "Puc fer tanta feina com abans", points: 0 }, { text: "Puc fer la meva feina habitual però no més", points: 1 }, { text: "Puc fer la major part de la meva feina", points: 2 }, { text: "No puc fer la meva feina habitual", points: 3 }, { text: "Puc fer molt poca feina", points: 4 }, { text: "No puc treballar gens", points: 5 } ]},
      { id: "q8", text: "8. Conduir", type: "choice", options: [ { text: "Puc conduir sense dolor", points: 0 }, { text: "Puc conduir tant com vull amb dolor lleuger", points: 1 }, { text: "Puc conduir tant com vull amb dolor moderat", points: 2 }, { text: "No puc conduir tant com vull pel dolor", points: 3 }, { text: "Puc conduir molt poc pel dolor", points: 4 }, { text: "No puc conduir gens", points: 5 } ]},
      { id: "q9", text: "9. Dormir", type: "choice", options: [ { text: "El son no s'altera pel dolor", points: 0 }, { text: "El meu son s'altera lleugerament", points: 1 }, { text: "Dormo menys de 6 hores pel dolor", points: 2 }, { text: "Dormo menys de 4 hores pel dolor", points: 3 }, { text: "Dormo menys de 2 hores pel dolor", points: 4 }, { text: "El dolor m'impedeix dormir", points: 5 } ]},
      { id: "q10", text: "10. Lleure i oci", type: "choice", options: [ { text: "Puc fer totes les meves activitats de lleure", points: 0 }, { text: "Puc fer-les però em causa algun dolor", points: 1 }, { text: "Puc fer la majoria però amb dolor", points: 2 }, { text: "Només puc fer algunes activitats de lleure", points: 3 }, { text: "No puc fer pràcticament cap activitat", points: 4 }, { text: "No puc fer cap activitat de lleure", points: 5 } ]}
    ],
    interpretations: [
      { min: 0, max: 4, label: "Sense discapacitat (0-8%)", color: "text-green-700 bg-green-100" },
      { min: 5, max: 14, label: "Discapacitat lleu (10-28%)", color: "text-blue-700 bg-blue-100" },
      { min: 15, max: 24, label: "Discapacitat moderada (30-48%)", color: "text-yellow-700 bg-yellow-100" },
      { min: 25, max: 34, label: "Discapacitat severa (50-68%)", color: "text-orange-700 bg-orange-100" },
      { min: 35, max: 50, label: "Discapacitat completa (70-100%)", color: "text-red-700 bg-red-100" }
    ]
  },
  {
    title: "Oswestry Disability Index (ODI)",
    category: "Esquena i Lumbàlgia",
    description: "Avalua el grau de discapacitat física per culpa del dolor lumbar en 10 àrees de la vida diària.",
    questions: [
      { id: "o1", text: "1. Intensitat del dolor", type: "choice", options: [ { text: "Puc suportar el dolor sense analgèsics", points: 0 }, { text: "El dolor és dolent però el suporto sense analgèsics", points: 1 }, { text: "Els analgèsics m'alleugen completament el dolor", points: 2 }, { text: "Els analgèsics m'alleugen el dolor moderadament", points: 3 }, { text: "Els analgèsics m'alleugen molt poc", points: 4 }, { text: "Els analgèsics no m'alleugen gens el dolor", points: 5 } ]},
      { id: "o2", text: "2. Cures personals", type: "choice", options: [ { text: "Puc rentar-me i vestir-me normalment", points: 0 }, { text: "Puc rentar-me i vestir-me però em fa mal", points: 1 }, { text: "Em fa mal rentar-me i ho faig lentament", points: 2 }, { text: "Necessito ajuda per a algunes cures", points: 3 }, { text: "Necessito ajuda cada dia per la majoria", points: 4 }, { text: "No em puc rentar ni vestir", points: 5 } ]},
      { id: "o3", text: "3. Aixecar pesos", type: "choice", options: [ { text: "Puc aixecar pesos grans sense dolor", points: 0 }, { text: "Puc aixecar pesos grans però amb dolor", points: 1 }, { text: "El dolor m'impedeix aixecar pesos grans de terra", points: 2 }, { text: "Només puc aixecar pesos mitjans situats en una taula", points: 3 }, { text: "Només puc aixecar pesos molt lleugers", points: 4 }, { text: "No puc aixecar res", points: 5 } ]},
      { id: "o4", text: "4. Caminar", type: "choice", options: [ { text: "El dolor no m'impedeix caminar qualsevol distància", points: 0 }, { text: "El dolor m'impedeix caminar més d'1 kilòmetre", points: 1 }, { text: "El dolor m'impedeix caminar més de 500 metres", points: 2 }, { text: "El dolor m'impedeix caminar més de 100 metres", points: 3 }, { text: "Només puc caminar amb un bastó o crosses", points: 4 }, { text: "No puc caminar pel dolor", points: 5 } ]},
      { id: "o5", text: "5. Seure", type: "choice", options: [ { text: "Puc seure a qualsevol cadira tant com vull", points: 0 }, { text: "Puc seure a la meva cadira favorita tant com vull", points: 1 }, { text: "El dolor m'impedeix estar assegut més d'1 hora", points: 2 }, { text: "El dolor m'impedeix estar assegut més de 30 min", points: 3 }, { text: "El dolor m'impedeix estar assegut més de 10 min", points: 4 }, { text: "El dolor m'impedeix seure", points: 5 } ]},
      { id: "o6", text: "6. Estar dret", type: "choice", options: [ { text: "Puc estar dret tant com vull sense dolor", points: 0 }, { text: "Puc estar dret tant com vull amb dolor", points: 1 }, { text: "No puc estar dret més d'1 hora", points: 2 }, { text: "No puc estar dret més de 30 min", points: 3 }, { text: "No puc estar dret més de 10 min", points: 4 }, { text: "El dolor m'impedeix estar dret", points: 5 } ]},
      { id: "o7", text: "7. Dormir", type: "choice", options: [ { text: "El dolor no m'impedeix dormir bé", points: 0 }, { text: "Només puc dormir si prenc pastilles", points: 1 }, { text: "Fins i tot amb pastilles, dormo menys de 6 hores", points: 2 }, { text: "Fins i tot amb pastilles, dormo menys de 4 hores", points: 3 }, { text: "Fins i tot amb pastilles, dormo menys de 2 hores", points: 4 }, { text: "El dolor m'impedeix dormir gens", points: 5 } ]},
      { id: "o8", text: "8. Activitat sexual", type: "choice", options: [ { text: "La meva activitat sexual és normal sense dolor", points: 0 }, { text: "La meva activitat sexual és normal però amb dolor", points: 1 }, { text: "La meva activitat sexual és gairebé normal", points: 2 }, { text: "La meva activitat sexual està molt restringida", points: 3 }, { text: "Pràcticament no tinc activitat sexual", points: 4 }, { text: "L'activitat sexual m'és impossible pel dolor", points: 5 } ]},
      { id: "o9", text: "9. Vida social", type: "choice", options: [ { text: "La meva vida social és normal", points: 0 }, { text: "La meva vida social és normal però m'augmenta el dolor", points: 1 }, { text: "La meva vida social està restringida", points: 2 }, { text: "El dolor ha restringit molt les meves sortides", points: 3 }, { text: "La meva vida social es redueix a casa", points: 4 }, { text: "No tinc vida social", points: 5 } ]},
      { id: "o10", text: "10. Viatjar", type: "choice", options: [ { text: "Puc viatjar a qualsevol lloc", points: 0 }, { text: "Puc viatjar a qualsevol lloc però em fa mal", points: 1 }, { text: "El dolor m'obliga a fer parades", points: 2 }, { text: "El dolor m'impedeix viatjar més de 2 hores", points: 3 }, { text: "El dolor m'impedeix viatjar més de 1 hora", points: 4 }, { text: "El dolor m'impedeix viatjar excepte al metge", points: 5 } ]}
    ],
    interpretations: [
      { min: 0, max: 10, label: "Discapacitat mínima (0-20%)", color: "text-green-700 bg-green-100" },
      { min: 11, max: 20, label: "Discapacitat moderada (21-40%)", color: "text-yellow-700 bg-yellow-100" },
      { min: 21, max: 30, label: "Discapacitat severa (41-60%)", color: "text-orange-700 bg-orange-100" },
      { min: 31, max: 40, label: "Invàlid / Incapacitat (61-80%)", color: "text-red-700 bg-red-100" },
      { min: 41, max: 50, label: "Llit / Exageració de símptomes (>80%)", color: "text-red-900 bg-red-200" }
    ]
  },
  {
    title: "Escala Tampa de Kinesiofòbia (TSK-11SV)",
    category: "Funció Global i Factors Psicosocials",
    description: "Avalua la por al moviment. Puntuació d'1 (Totalment en desacord) a 4 (Totalment d'acord).",
    questions: [
      { id: "t1", text: "1. Em fa por que em pugui fer mal si faig exercici.", type: "choice", options: [ { text: "Totalment en desacord", points: 1 }, { text: "En desacord", points: 2 }, { text: "D'acord", points: 3 }, { text: "Totalment d'acord", points: 4 } ]},
      { id: "t2", text: "2. Si intentés superar el dolor, em faria més mal.", type: "choice", options: [ { text: "Totalment en desacord", points: 1 }, { text: "En desacord", points: 2 }, { text: "D'acord", points: 3 }, { text: "Totalment d'acord", points: 4 } ]},
      { id: "t3", text: "3. El meu cos em diu que tinc alguna cosa greu.", type: "choice", options: [ { text: "Totalment en desacord", points: 1 }, { text: "En desacord", points: 2 }, { text: "D'acord", points: 3 }, { text: "Totalment d'acord", points: 4 } ]},
      { id: "t4", text: "4. El dolor que sento és una senyal que em diu quan he de parar de fer el que estic fent.", type: "choice", options: [ { text: "Totalment en desacord", points: 1 }, { text: "En desacord", points: 2 }, { text: "D'acord", points: 3 }, { text: "Totalment d'acord", points: 4 } ]},
      { id: "t5", text: "5. La gent no m'hauria de demanar que faci coses que em causin dolor.", type: "choice", options: [ { text: "Totalment en desacord", points: 1 }, { text: "En desacord", points: 2 }, { text: "D'acord", points: 3 }, { text: "Totalment d'acord", points: 4 } ]},
      { id: "t6", text: "6. Tinc por de fer-me mal accidentalment.", type: "choice", options: [ { text: "Totalment en desacord", points: 1 }, { text: "En desacord", points: 2 }, { text: "D'acord", points: 3 }, { text: "Totalment d'acord", points: 4 } ]},
      { id: "t7", text: "7. El fet d'estar quiet em farà més bé per al meu cos.", type: "choice", options: [ { text: "Totalment en desacord", points: 1 }, { text: "En desacord", points: 2 }, { text: "D'acord", points: 3 }, { text: "Totalment d'acord", points: 4 } ]},
      { id: "t8", text: "8. Crec que el meu cos em diu que tinc una malaltia greu.", type: "choice", options: [ { text: "Totalment en desacord", points: 1 }, { text: "En desacord", points: 2 }, { text: "D'acord", points: 3 }, { text: "Totalment d'acord", points: 4 } ]},
      { id: "t9", text: "9. No és segur per mi estar actiu físicament.", type: "choice", options: [ { text: "Totalment en desacord", points: 1 }, { text: "En desacord", points: 2 }, { text: "D'acord", points: 3 }, { text: "Totalment d'acord", points: 4 } ]},
      { id: "t10", text: "10. No crec que el meu cos estigui fora de perill a menys que descansi.", type: "choice", options: [ { text: "Totalment en desacord", points: 1 }, { text: "En desacord", points: 2 }, { text: "D'acord", points: 3 }, { text: "Totalment d'acord", points: 4 } ]},
      { id: "t11", text: "11. Ningú em creu quan dic quant em fa mal.", type: "choice", options: [ { text: "Totalment en desacord", points: 1 }, { text: "En desacord", points: 2 }, { text: "D'acord", points: 3 }, { text: "Totalment d'acord", points: 4 } ]}
    ],
    interpretations: [
      { min: 11, max: 22, label: "Kinesiofòbia Baixa", color: "text-green-700 bg-green-100" },
      { min: 23, max: 33, label: "Kinesiofòbia Moderada", color: "text-yellow-700 bg-yellow-100" },
      { min: 34, max: 44, label: "Kinesiofòbia Alta", color: "text-red-700 bg-red-100" }
    ]
  },
  {
    title: "Pittsburgh Sleep Quality Index (PSQI - Simplificat)",
    category: "Funció Global i Factors Psicosocials",
    description: "Avalua la qualitat del son de l'últim mes. (Versió simplificada per app)",
    questions: [
      { id: "ps1", text: "1. En general, com qualificaries la teva qualitat del son?", type: "choice", options: [ { text: "Molt bona", points: 0 }, { text: "Bastant bona", points: 1 }, { text: "Bastant dolenta", points: 2 }, { text: "Molt dolenta", points: 3 } ]},
      { id: "ps2", text: "2. Quant triguess a adormir-te normalment?", type: "choice", options: [ { text: "< 15 minuts", points: 0 }, { text: "16-30 minuts", points: 1 }, { text: "31-60 minuts", points: 2 }, { text: "> 60 minuts", points: 3 } ]},
      { id: "ps3", text: "3. Quantes hores dorms de mitjana per nit?", type: "choice", options: [ { text: "> 7 hores", points: 0 }, { text: "6-7 hores", points: 1 }, { text: "5-6 hores", points: 2 }, { text: "< 5 hores", points: 3 } ]},
      { id: "ps4", text: "4. Amb quina freqüència et despertes a la nit o de matinada?", type: "choice", options: [ { text: "Cap vegada", points: 0 }, { text: "< 1 vegada a la setmana", points: 1 }, { text: "1-2 vegades a la setmana", points: 2 }, { text: "≥ 3 vegades a la setmana", points: 3 } ]},
      { id: "ps5", text: "5. Amb quina freqüència has pres medicaments per dormir?", type: "choice", options: [ { text: "Cap vegada", points: 0 }, { text: "< 1 vegada a la setmana", points: 1 }, { text: "1-2 vegades a la setmana", points: 2 }, { text: "≥ 3 vegades a la setmana", points: 3 } ]}
    ],
    interpretations: [
      { min: 0, max: 4, label: "Bona qualitat del son", color: "text-green-700 bg-green-100" },
      { min: 5, max: 15, label: "Mala qualitat del son", color: "text-red-700 bg-red-100" }
    ]
  },
  {
    title: "Diagnostic Criteria for TMD (DC/TMD) Screener",
    category: "Cap i Coll",
    description: "Cribratge de trastorns temporomandibulars.",
    questions: [
      { id: "tmd1", text: "1. En els darrers 30 dies, ha tingut dolor a la mandíbula, les temples, dins de l'orella o davant de l'orella?", type: "boolean", points: 1 },
      { id: "tmd2", text: "2. Aquest dolor s'ha modificat amb els moviments de la mandíbula o la masticació?", type: "boolean", points: 1 },
      { id: "tmd3", text: "3. En els darrers 30 dies, ha notat que la mandíbula se li queda travada, enganxada o que no pot obrir la boca del tot?", type: "boolean", points: 1 }
    ],
    interpretations: [
      { min: 0, max: 0, label: "Cribratge Negatiu (No TMD aparent)", color: "text-green-700 bg-green-100" },
      { min: 1, max: 3, label: "Cribratge Positiu (Sospita de TMD)", color: "text-red-700 bg-red-100" }
    ]
  },
  {
    title: "International Knee Documentation Committee (IKDC) Subjectiu",
    category: "Maluc i Genoll",
    description: "Avalua els símptomes, la funció i l'activitat esportiva de pacients amb problemes de genoll.",
    questions: [
      { id: "ik1", text: "1. Quin és el nivell més alt d'activitat que pot realitzar sense dolor significatiu al genoll?", type: "choice", options: [ { text: "No puc fer cap activitat", points: 0 }, { text: "Activitats lleugeres (caminar, feines de casa)", points: 1 }, { text: "Activitats moderades (córrer suau, treball físic)", points: 2 }, { text: "Activitats intenses (esports amb salts, pivotatges)", points: 3 }, { text: "Activitats molt intenses", points: 4 } ]},
      { id: "ik2", text: "2. Durant l'últim mes, amb quina freqüència ha tingut dolor al genoll?", type: "choice", options: [ { text: "Constantment", points: 0 }, { text: "Sovint", points: 2 }, { text: "A vegades", points: 4 }, { text: "Gairebé mai", points: 7 }, { text: "Mai", points: 10 } ]},
      { id: "ik3", text: "3. Quina és la severitat del dolor de genoll a l'últim mes?", type: "choice", options: [ { text: "Pijor dolor imaginable", points: 0 }, { text: "Sever", points: 2 }, { text: "Moderat", points: 5 }, { text: "Lleu", points: 8 }, { text: "Cap dolor", points: 10 } ]},
      { id: "ik4", text: "4. Amb quina freqüència nota rigidesa o inflamació?", type: "choice", options: [ { text: "Sempre", points: 0 }, { text: "Sovint", points: 2 }, { text: "A vegades", points: 5 }, { text: "Gairebé mai", points: 8 }, { text: "Mai", points: 10 } ]},
      { id: "ik5", text: "5. Li falla el genoll?", type: "choice", options: [ { text: "Sempre", points: 0 }, { text: "Sovint", points: 2 }, { text: "A vegades", points: 5 }, { text: "Gairebé mai", points: 8 }, { text: "Mai", points: 10 } ]}
    ],
    interpretations: [
      { min: 0, max: 20, label: "Funció Molt Baixa", color: "text-red-700 bg-red-100" },
      { min: 21, max: 35, label: "Funció Moderada", color: "text-yellow-700 bg-yellow-100" },
      { min: 36, max: 44, label: "Bona Funció", color: "text-green-700 bg-green-100" }
    ]
  },
  {
    title: "International Physical Activity Questionnaire (IPAQ) Curt",
    category: "Funció Global i Factors Psicosocials",
    description: "Avalua l'activitat física setmanal.",
    questions: [
      { id: "ip1", text: "1. Quants dies a la setmana fa activitat física INTENSA (aixecar pesos, aeròbic)?", type: "number", points: 7 },
      { id: "ip2", text: "2. Quants dies a la setmana fa activitat física MODERADA (bicicleta a ritme suau, dobles de tenis)?", type: "number", points: 7 },
      { id: "ip3", text: "3. Quants dies a la setmana CAMINA un mínim de 10 minuts seguits?", type: "number", points: 7 }
    ],
    interpretations: [
      { min: 0, max: 4, label: "Baix nivell d'activitat", color: "text-red-700 bg-red-100" },
      { min: 5, max: 10, label: "Moderat nivell d'activitat", color: "text-yellow-700 bg-yellow-100" },
      { min: 11, max: 21, label: "Alt nivell d'activitat", color: "text-green-700 bg-green-100" }
    ]
  },
  {
    title: "Knee Outcome Survey - Activities of Daily Living Scale (KOS-ADL)",
    category: "Maluc i Genoll",
    description: "Avalua símptomes i limitacions funcionals del genoll en les activitats de la vida diària.",
    questions: [
      { id: "kos1", text: "1. Fins a quin punt el dolor al genoll li limita les activitats diàries?", type: "choice", options: [ { text: "Moltíssim", points: 0 }, { text: "Molt", points: 1 }, { text: "Moderadament", points: 2 }, { text: "Una mica", points: 3 }, { text: "Gens", points: 4 } ]},
      { id: "kos2", text: "2. Fins a quin punt la inflamació del genoll li limita?", type: "choice", options: [ { text: "Moltíssim", points: 0 }, { text: "Molt", points: 1 }, { text: "Moderadament", points: 2 }, { text: "Una mica", points: 3 }, { text: "Gens", points: 4 } ]},
      { id: "kos3", text: "3. Dificultat per caminar sobre superfície plana", type: "choice", options: [ { text: "Incapaç de fer-ho", points: 0 }, { text: "Amb molta dificultat", points: 1 }, { text: "Amb dificultat moderada", points: 2 }, { text: "Amb poca dificultat", points: 3 }, { text: "Sense dificultat", points: 4 } ]},
      { id: "kos4", text: "4. Dificultat per pujar o baixar escales", type: "choice", options: [ { text: "Incapaç de fer-ho", points: 0 }, { text: "Amb molta dificultat", points: 1 }, { text: "Amb dificultat moderada", points: 2 }, { text: "Amb poca dificultat", points: 3 }, { text: "Sense dificultat", points: 4 } ]},
      { id: "kos5", text: "5. Dificultat per posar-se a la gatzoneta", type: "choice", options: [ { text: "Incapaç de fer-ho", points: 0 }, { text: "Amb molta dificultat", points: 1 }, { text: "Amb dificultat moderada", points: 2 }, { text: "Amb poca dificultat", points: 3 }, { text: "Sense dificultat", points: 4 } ]}
    ],
    interpretations: [
      { min: 0, max: 8, label: "Funció molt afectada", color: "text-red-700 bg-red-100" },
      { min: 9, max: 15, label: "Funció moderada", color: "text-yellow-700 bg-yellow-100" },
      { min: 16, max: 20, label: "Funció normal o gairebé normal", color: "text-green-700 bg-green-100" }
    ]
  },
  {
    title: "Total Tenderness Score (Punts Gatell)",
    category: "Cap i Coll",
    description: "Palpació de punts dolorosos. Puntuació: 0 (No dolor), 1 (Dolor lleu sense reflex motor), 2 (Dolor moderat amb reflex motor o ganyota), 3 (Dolor sever amb retirada del pacient). Avaluar dreta i esquerra.",
    questions: [
      { id: "tts1", text: "Trapeci Superior", type: "bilateral_number", max: 3 },
      { id: "tts2", text: "Regió Craniocervical (Suboccipitals)", type: "bilateral_number", max: 3 },
      { id: "tts3", text: "Temporal", type: "bilateral_number", max: 3 },
      { id: "tts4", text: "Frontal", type: "bilateral_number", max: 3 },
      { id: "tts5", text: "Procés Coronoide", type: "bilateral_number", max: 3 },
      { id: "tts6", text: "Masseter", type: "bilateral_number", max: 3 },
      { id: "tts7", text: "ECOM (Esternoclidomastoïdal)", type: "bilateral_number", max: 3 }
    ],
    interpretations: [
      { min: 0, max: 10, label: "Sensibilització Baixa", color: "text-green-700 bg-green-100" },
      { min: 11, max: 25, label: "Sensibilització Moderada", color: "text-yellow-700 bg-yellow-100" },
      { min: 26, max: 42, label: "Sensibilització Severa", color: "text-red-700 bg-red-100" }
    ]
  }
];

// --- COMPONENTS UI COMPARTITS ---
const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = { primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm", secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200", danger: "bg-red-50 text-red-600 hover:bg-red-100", outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white" };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

const Card = ({ children, className = '' }) => (<div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>{children}</div>);

// --- COMPONENT GRÀFICA SVG ---
const SimpleLineChart = ({ data, xKey, yKey, title }) => {
  if (!data || data.length === 0) return <div className="text-gray-400 text-sm h-48 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed">No hi ha dades suficients d'aquest test.</div>;
  const padding = 25; const width = 400; const height = 180;
  const maxScore = Math.max(...data.map(d => d[yKey] || 0), 10);
  const points = data.map((d, i) => { const x = padding + (i * ((width - padding * 2) / (Math.max(data.length - 1, 1)))); const y = height - padding - (((d[yKey] || 0) / maxScore) * (height - padding * 2)); return `${x},${y}`; }).join(' ');
  return (
    <div className="w-full flex flex-col items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
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

  // URL STATE PER MODE PACIENT
  const [isPatientMode, setIsPatientMode] = useState(false);
  const [patientUrlData, setPatientUrlData] = useState(null);

  useEffect(() => {
    // Check if we are in Patient Mode (via URL parameters)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('p') && params.get('pat') && params.get('t')) {
        setIsPatientMode(true);
        setPatientUrlData({
          physioId: params.get('p'),
          patientId: params.get('pat'),
          testId: params.get('t'),
          episodeName: params.get('ep') || 'General'
        });
      }
    }

    const initAuth = async () => { try { await signInAnonymously(auth); } catch (e) { console.error(e); } };
    initAuth();
    return onAuthStateChanged(auth, (currentUser) => { setUser(currentUser); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Si estem en mode pacient, no necessitem carregar els pacients ni les respostes de tot el fisio.
    if (!isPatientMode) {
      const patientsRef = collection(db, `users_${user.uid}_patients`);
      const unsubPatients = onSnapshot(patientsRef, (snapshot) => setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

      const responsesRef = collection(db, `users_${user.uid}_responses`);
      const unsubResponses = onSnapshot(responsesRef, (snapshot) => setResponses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => b.date - a.date)));

      return () => { unsubPatients(); unsubResponses(); };
    }
  }, [user, isPatientMode]);

  // Els tests es carreguen sempre
  useEffect(() => {
    if (!user) return;
    const testsRef = collection(db, 'biblioteca_tests_clinics_v3'); 
    const unsubTests = onSnapshot(testsRef, (snapshot) => {
      const loadedTests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTests(loadedTests);
      if (loadedTests.length === 0 && !isPatientMode) {
        SEED_TESTS.forEach(async (t) => await addDoc(testsRef, t));
      }
    });
    return () => unsubTests();
  }, [user, isPatientMode]);

  const navigate = (newView, data = {}) => { setContextData(data); setView(newView); window.scrollTo(0,0); setIsMobileMenuOpen(false); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Activity className="animate-spin text-blue-600 w-8 h-8" /></div>;

  // --- RENDERITZAT DEL MODE PACIENT ---
  if (isPatientMode) {
    if (tests.length === 0) return <div className="min-h-screen flex items-center justify-center"><Activity className="animate-spin text-blue-600 w-8 h-8" /></div>;
    return (
       <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
         <header className="bg-blue-600 p-4 shadow-md text-white text-center">
            <h1 className="text-xl font-bold flex items-center justify-center gap-2"><Activity className="w-6 h-6"/> FisioPro - Portal del Pacient</h1>
         </header>
         <div className="p-4 md:p-8">
           <TestRunner 
              testId={patientUrlData.testId} 
              patientId={patientUrlData.patientId} 
              episodeName={patientUrlData.episodeName} 
              tests={tests} 
              user={{uid: patientUrlData.physioId}} 
              isPatientMode={true} 
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
      </aside>

      <main className="flex-1 flex flex-col h-full md:h-screen overflow-hidden print-container">
        <header className="bg-white border-b border-gray-200 px-8 py-4 justify-between items-center hidden md:flex no-print">
          <h1 className="text-xl font-semibold capitalize">{view.replace('-', ' ')}</h1>
          <div className="flex items-center gap-4">
             <span className="text-sm text-gray-500">{new Date().toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {view === 'dashboard' && <Dashboard patients={patients} responses={responses} tests={tests} onNavigate={navigate} />}
          {view === 'patients' && <PatientList patients={patients} onNavigate={navigate} user={user} />}
          {view === 'patient-detail' && <PatientDetail patientId={contextData.id} patients={patients} responses={responses} tests={tests} onNavigate={navigate} user={user} />}
          {view === 'tests' && <TestLibrary tests={tests} onNavigate={navigate} />}
          {view === 'test-builder' && <TestBuilder testId={contextData.id} tests={tests} onNavigate={navigate} user={user} />}
          {view === 'test-runner' && <TestRunner patientId={contextData.patientId} testId={contextData.testId} episodeName={contextData.episodeName} tests={tests} onNavigate={navigate} user={user} />}
          {view === 'print-response' && <PrintResponseView responseId={contextData.responseId} responses={responses} tests={tests} patients={patients} onNavigate={navigate} />}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; height: auto; overflow: visible !important; }
          .no-print { display: none !important; }
          .print-break-inside-avoid { page-break-inside: avoid; }
          .print-page-break { page-break-before: always; }
          .shadow-sm, .shadow-xl { box-shadow: none !important; border: 1px solid #e5e7eb; }
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
            {recentResponses.map(res => {
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
  const [testSelectorMode, setTestSelectorMode] = useState(''); // 'run' (fer aquí) o 'send' (enviar a casa)
  const [targetEpisode, setTargetEpisode] = useState('');
  
  const [copiedTestId, setCopiedTestId] = useState(null); 
  
  // Estat pel modal de confirmació d'esborrar
  const [deleteModal, setDeleteModal] = useState(null);

  // Estats per editar el pacient
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [editPatientData, setEditPatientData] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  if (!patient) return <div>Pacient no trobat</div>;

  const handleCreateEpisode = async (e) => {
    e.preventDefault();
    if (!newEpisodeName.trim()) return;
    const currentEpisodes = patient.episodes || [];
    if (!currentEpisodes.includes(newEpisodeName)) {
      await updateDoc(doc(db, `users_${user.uid}_patients`, patient.id), { 
        episodes: [...currentEpisodes, newEpisodeName] 
      });
    }
    setNewEpisodeName('');
    setShowNewEpisodeModal(false);
  };

  const handleEditPatient = async (e) => {
    e.preventDefault();
    if (!editPatientData.firstName) return;
    try {
      await updateDoc(doc(db, `users_${user.uid}_patients`, patient.id), {
        firstName: editPatientData.firstName,
        lastName: editPatientData.lastName,
        email: editPatientData.email,
        phone: editPatientData.phone
      });
      setShowEditPatientModal(false);
    } catch (err) {
      console.error(err);
      alert("Error actualitzant dades del pacient.");
    }
  };

  const generateTestLink = (testId, episodeName) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?p=${user.uid}&pat=${patient.id}&t=${testId}&ep=${encodeURIComponent(episodeName)}`;
  };

  const copyToClipboard = (text, testId) => {
    navigator.clipboard.writeText(text);
    setCopiedTestId(testId);
    setTimeout(() => setCopiedTestId(null), 2000);
  };

  // Lògica d'esborrat de dades
  const confirmDelete = async () => {
    if (!deleteModal) return;
    try {
      if (deleteModal.type === 'patient') {
        // Esborrar pacient i tots els seus tests
        await deleteDoc(doc(db, `users_${user.uid}_patients`, deleteModal.id));
        for (const r of patientResponses) {
          await deleteDoc(doc(db, `users_${user.uid}_responses`, r.id));
        }
        setDeleteModal(null);
        onNavigate('patients');
      } else if (deleteModal.type === 'episode') {
        // Esborrar només una patologia i els tests d'aquesta
        const newEpisodes = (patient.episodes || []).filter(e => e !== deleteModal.id);
        await updateDoc(doc(db, `users_${user.uid}_patients`, patient.id), { episodes: newEpisodes });
        const responsesToDelete = patientResponses.filter(r => (r.episodeName || 'General') === deleteModal.id);
        for (const r of responsesToDelete) {
          await deleteDoc(doc(db, `users_${user.uid}_responses`, r.id));
        }
        setDeleteModal(null);
      } else if (deleteModal.type === 'response') {
        // Esborrar només un test individual
        await deleteDoc(doc(db, `users_${user.uid}_responses`, deleteModal.id));
        setDeleteModal(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const savedEpisodes = patient.episodes || [];
  const responseEpisodes = patientResponses.map(r => r.episodeName || 'General');
  const allEpisodes = [...new Set([...savedEpisodes, ...responseEpisodes])].sort();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 no-print">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('patients')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-2xl font-bold">Fitxa del Pacient</h2>
        </div>
        <div className="sm:ml-auto flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4" /> Imprimir</Button>
          <Button onClick={() => setShowNewEpisodeModal(true)}><Plus className="w-4 h-4" /> Nou Episodi</Button>
          <Button variant="danger" onClick={() => setDeleteModal({ type: 'patient', id: patient.id, name: `el pacient ${patient.firstName} ${patient.lastName}` })}><Trash2 className="w-4 h-4" /> Esborrar Pacient</Button>
        </div>
      </div>

      <Card className="p-6 border-t-4 border-blue-600 print-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-2xl font-bold shrink-0 mx-auto sm:mx-0">{patient.firstName[0]}{patient.lastName?.[0]}</div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {patient.firstName} {patient.lastName}
              <button onClick={() => {setEditPatientData(patient); setShowEditPatientModal(true);}} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-600 transition-colors no-print" title="Editar Dades">
                <Edit className="w-4 h-4"/>
              </button>
            </h2>
            <p className="text-gray-600 mt-1">Telèfon: {patient.phone || '-'} | Email: {patient.email || '-'} | Alta: {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : '-'}</p>
          </div>
        </div>
      </Card>

      {allEpisodes.length === 0 ? (
         <div className="p-8 md:p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed flex flex-col items-center mx-2">
            <p className="mb-4">Aquest pacient no té cap episodi clínic obert.</p>
            <Button onClick={() => setShowNewEpisodeModal(true)}>Obrir Primer Episodi</Button>
         </div>
      ) : (
        allEpisodes.map((episode) => {
          const episodeResponses = patientResponses.filter(r => (r.episodeName || 'General') === episode);
          const uniqueTestsIds = [...new Set(episodeResponses.map(r => r.testId))];

          return (
            <div key={episode} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print-page-break">
              <div className="bg-slate-50 border-b border-gray-200 p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2 py-1 rounded">Patologia / Episodi Clínic</span>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="text-xl font-bold text-gray-900">{episode}</h3>
                    <button onClick={() => setDeleteModal({ type: 'episode', id: episode, name: `la patologia "${episode}"` })} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors no-print" title="Esborrar Patologia"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 no-print w-full xl:w-auto">
                  <Button variant="outline" className="flex-1 xl:flex-none text-sm" onClick={() => { setTargetEpisode(episode); setTestSelectorMode('send'); setShowTestSelector(true); }}><Send className="w-4 h-4 text-blue-600" /> Enviar a Casa</Button>
                  <Button className="flex-1 xl:flex-none text-sm" onClick={() => { setTargetEpisode(episode); setTestSelectorMode('run'); setShowTestSelector(true); }}><Play className="w-4 h-4" /> Fer Test Aquí</Button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {episodeResponses.length === 0 ? (
                  <p className="text-center text-gray-400 py-6">Encara no hi ha tests realitzats per a aquesta patologia.</p>
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
                    <div className="divide-y divide-gray-100 border rounded-xl overflow-hidden print-break-inside-avoid">
                      {episodeResponses.sort((a,b) => b.date - a.date).map(res => {
                        const test = tests.find(t => t.id === res.testId);
                        return (
                          <div key={res.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-gray-50">
                            <div>
                              <h4 className="font-bold text-gray-900 leading-tight">{test?.title || 'Test Desconegut'}</h4>
                              <p className="text-sm text-gray-500 mt-1">{new Date(res.date).toLocaleString('ca-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                            </div>
                            <div className="flex items-center gap-4 justify-between sm:justify-end">
                              <div className="text-left sm:text-right mr-2">
                                <p className="font-black text-xl text-blue-600">{res.score} <span className="text-sm font-normal text-gray-400">/ {res.maxScore}</span></p>
                                <div className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold inline-block mt-1 ${res.interpretation?.color || 'bg-gray-100'}`}>{res.interpretation?.label || 'Completat'}</div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button variant="outline" className="no-print p-2" onClick={() => onNavigate('print-response', { responseId: res.id })} title="Veure / Imprimir Detall"><FileOutput className="w-4 h-4 text-gray-600" /></Button>
                                <button onClick={() => setDeleteModal({ type: 'response', id: res.id, name: `el test de ${new Date(res.date).toLocaleDateString()}` })} className="no-print p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* MODAL NOU EPISODI */}
      {showNewEpisodeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nou Episodi / Patologia</h2>
            <form onSubmit={handleCreateEpisode}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Escriu el motiu de consulta</label>
              <input required autoFocus className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-6" value={newEpisodeName} onChange={e => setNewEpisodeName(e.target.value)} />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowNewEpisodeModal(false)}>Cancel·lar</Button>
                <Button type="submit"><Save className="w-4 h-4"/> Crear</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PACIENT */}
      {showEditPatientModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Pacient</h2>
            <form onSubmit={handleEditPatient} className="space-y-4">
              <input required className="w-full p-2 border rounded" placeholder="Nom" value={editPatientData.firstName} onChange={e => setEditPatientData({...editPatientData, firstName: e.target.value})} />
              <input required className="w-full p-2 border rounded" placeholder="Cognoms" value={editPatientData.lastName} onChange={e => setEditPatientData({...editPatientData, lastName: e.target.value})} />
              <input type="email" className="w-full p-2 border rounded" placeholder="Email" value={editPatientData.email} onChange={e => setEditPatientData({...editPatientData, email: e.target.value})} />
              <input type="tel" className="w-full p-2 border rounded" placeholder="Telèfon" value={editPatientData.phone} onChange={e => setEditPatientData({...editPatientData, phone: e.target.value})} />
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowEditPatientModal(false)}>Cancel·lar</Button>
                <Button type="submit"><Save className="w-4 h-4"/> Guardar Canvis</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE SELECCIÓ DE TEST (Per Fer o Enviar) */}
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
            
            <div className="overflow-y-auto flex-1 pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                {tests.map(t => {
                  if (testSelectorMode === 'run') {
                    // Vista per FER el test aquí
                    return (
                      <div key={t.id} onClick={() => onNavigate('test-runner', { patientId: patient.id, testId: t.id, episodeName: targetEpisode })} className="border border-gray-200 p-5 rounded-xl hover:border-blue-500 hover:shadow-md cursor-pointer transition-all bg-white group flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-gray-400 group-hover:text-blue-500 mb-1 block">{t.category}</span>
                        <h3 className="font-bold text-gray-900 mb-2 leading-tight">{t.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-auto">{t.description}</p>
                      </div>
                    );
                  } else {
                    // Vista per ENVIAR el test a casa
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
                            {isCopied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />} 
                            {isCopied ? 'Enllaç copiat!' : 'Copiar enllaç WhatsApp'}
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

      {/* MODAL CONFIRMAR ESBORRAR */}
      {deleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md text-center border-t-8 border-red-500">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-3">Segur que vols esborrar-ho?</h2>
            <p className="text-sm md:text-base text-gray-600 mb-8">Estàs a punt d'esborrar permanentment <strong>{deleteModal.name}</strong>. Aquesta acció no es pot desfer i eliminarà totes les dades associades.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button variant="outline" className="px-6 py-2" onClick={() => setDeleteModal(null)}>Cancel·lar</Button>
              <Button variant="danger" className="px-6 py-2 shadow-md hover:shadow-lg" onClick={confirmDelete}>Sí, Esborrar-ho</Button>
            </div>
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
    <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 md:p-12 shadow-sm border border-gray-200 rounded-lg printable-area">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 no-print border-b pb-4">
        <Button variant="outline" onClick={() => onNavigate('patient-detail', { id: patient?.id })}><ArrowLeft className="w-4 h-4"/> Tornar</Button>
        <Button onClick={() => window.print()}><Printer className="w-4 h-4"/> Imprimir Informe A4</Button>
      </div>

      <div className="border-b-4 border-slate-900 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">INFORME CLÍNIC</h1>
          <h2 className="text-lg sm:text-xl text-slate-600 font-medium">{test?.title}</h2>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-bold text-slate-800">{patient?.firstName} {patient?.lastName}</p>
          <p className="text-sm text-slate-500">Data: {new Date(response.date).toLocaleDateString('ca-ES')}</p>
          <p className="text-sm text-slate-500">Patologia: {response.episodeName || 'General'}</p>
        </div>
      </div>

      <div className="bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-200 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 print-break-inside-avoid">
        <div className="text-center sm:text-left">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Resultat Final</p>
          <p className="text-4xl sm:text-5xl font-black text-blue-600">{response.score} <span className="text-xl sm:text-2xl text-slate-400 font-medium">/ {response.maxScore}</span></p>
        </div>
        {response.interpretation && (
          <div className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg border font-bold text-base sm:text-lg text-center ${response.interpretation.color} border-current`}>
            {response.interpretation.label}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-4">Detall de Respostes</h3>
        {test?.questions.map((q, idx) => {
          let ansText = "-";
          const ansVal = response.answers[q.id];
          if (q.type === 'choice' && ansVal !== undefined) ansText = `${q.options[ansVal].text} (${q.options[ansVal].points} pts)`;
          else if (q.type === 'boolean' && ansVal !== undefined) ansText = ansVal ? `SÍ (${q.points||1} pts)` : `NO (0 pts)`;
          else if (q.type === 'number' && ansVal !== undefined) ansText = `${ansVal} / ${q.max||10}`;
          else if (q.type === 'bilateral_number' && ansVal) ansText = `Dreta: ${ansVal.R||0} | Esquerra: ${ansVal.L||0}`;

          return (
            <div key={q.id} className="flex flex-col sm:flex-row justify-between py-3 border-b border-slate-100 print-break-inside-avoid gap-2">
              <p className="text-slate-700 font-medium flex-1 pr-4 text-sm sm:text-base">{q.text}</p>
              <p className="text-slate-900 font-bold sm:text-right text-sm sm:text-base">{ansText}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
};

const TestLibrary = ({ tests, onNavigate }) => (
  <div className="space-y-6 max-w-6xl mx-auto">
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div><h2 className="text-2xl font-bold">Biblioteca de Tests</h2></div>
      <Button onClick={() => onNavigate('test-builder', { id: 'new' })}><Plus className="w-4 h-4"/> Nou Test Personalitzat</Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tests.map(test => (
        <Card key={test.id} className="flex flex-col"><div className="p-5 flex-1"><span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded mb-3 inline-block">{test.category || 'General'}</span><h3 className="font-bold text-lg mb-2">{test.title}</h3><p className="text-sm text-gray-600 line-clamp-3 mb-4">{test.description}</p></div><div className="p-4 bg-gray-50 border-t flex gap-2"><Button variant="outline" className="flex-1 text-sm py-1.5" onClick={() => onNavigate('test-builder', { id: test.id })}><Edit className="w-4 h-4" /> Editar</Button></div></Card>
      ))}
    </div>
  </div>
);

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
            {/* Opcions de configuració en funció del tipus */}
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