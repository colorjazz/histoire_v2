import React, { useState, useEffect } from 'react';
import { OPERATIONS } from './operations';
import './index.css';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxeipfd2MOSAwUms8yX_Gh9eCbODKDzVGLqDhxi7lk0Ni3lBrBOHaVHV6M0UYb5W8X3gw/exec";

// --- Constantes PFEQ ---
const PERIODES_HISTORIQUES = [
  { id: 1, titre: "Des origines à 1608 : L'expérience des Autochtones et le projet de colonie" },
  { id: 2, titre: "1608-1760 : L'évolution de la société coloniale" },
  { id: 3, titre: "1760-1791 : La Conquête et le changement d'empire" },
  { id: 4, titre: "1791-1840 : Les revendications et les luttes nationales" },
  { id: 5, titre: "1840-1896 : La formation du régime fédéral canadien" },
  { id: 6, titre: "1896-1945 : Les nationalismes et l'autonomie du Canada" },
  { id: 7, titre: "1945-1980 : La modernisation du Québec et la Révolution tranquille" },
  { id: 8, titre: "De 1980 à nos jours : Les choix de société dans le Québec contemporain" }
];

// ==========================================
// COMPOSANTS D'AIDE ET D'AFFICHAGE
// ==========================================

function SituerDansLeTemps({
  questionB, placementOrdre, setPlacementOrdre, placementAvantApres,
  setPlacementAvantApres, selectedDocIndex, setSelectedDocIndex
}: any) {
  const documents: any[] = questionB.documents || [];

  const toggleSelect = (i: number) => setSelectedDocIndex((prev: number | null) => (prev === i ? null : i));

  const pickUpFromSlot = (slotIndex: number) => {
    const occupant = placementOrdre[slotIndex];
    if (occupant === null || occupant === undefined) return;
    setPlacementOrdre((prev: (number | null)[]) => {
      const next = [...prev]; next[slotIndex] = null; return next;
    });
    setSelectedDocIndex(occupant);
  };

  const placeInSlot = (slotIndex: number) => {
    if (selectedDocIndex === null) return;
    setPlacementOrdre((prev: (number | null)[]) => {
      const next = [...prev];
      for (let i = 0; i < next.length; i++) if (next[i] === selectedDocIndex) next[i] = null;
      next[slotIndex] = selectedDocIndex;
      return next;
    });
    setSelectedDocIndex(null);
  };

  const pickFromZone = (i: number) => {
    setPlacementAvantApres((prev: Record<number, 'avant' | 'apres'>) => {
      const next = { ...prev }; delete next[i]; return next;
    });
    setSelectedDocIndex(i);
  };

  const placeInZone = (zone: 'avant' | 'apres') => {
    if (selectedDocIndex === null) return;
    setPlacementAvantApres((prev: Record<number, 'avant' | 'apres'>) => ({ ...prev, [selectedDocIndex]: zone }));
    setSelectedDocIndex(null);
  };

  const Chip = ({ i, onPick }: { i: number; onPick?: () => void }) => (
    <button type="button" className={`doc-chip ${selectedDocIndex === i ? 'selected' : ''}`}
      onClick={(e) => { if (onPick) { e.stopPropagation(); onPick(); } else { toggleSelect(i); } }}
      title={documents[i]?.titre}
    >
      {i + 1}
    </button>
  );

  return (
    <div className="situer-temps-wrap">
      {selectedDocIndex !== null && (
        <div className="selection-hint">Document {selectedDocIndex + 1} sélectionné – touche une case ci-dessous pour le déposer.</div>
      )}

      {questionB.sousType === 'ordre' ? (
        <>
          <div className="frise-slot-row">
            {placementOrdre.map((docIdx: number | null, slotIndex: number) => (
              <div key={slotIndex} className={`frise-slot ${selectedDocIndex !== null && docIdx === null ? 'droppable' : ''}`} onClick={() => placeInSlot(slotIndex)}>
                <span className="frise-slot-rank">{slotIndex + 1}{slotIndex === 0 ? 'er' : 'e'}</span>
                {docIdx !== null ? <Chip i={docIdx} onPick={() => pickUpFromSlot(slotIndex)} /> : <span className="frise-slot-empty">{selectedDocIndex !== null ? 'Déposer ici' : ' '}</span>}
              </div>
            ))}
          </div>
          <div className="doc-pool">
            {documents.map((_, i) => !placementOrdre.includes(i) && <Chip key={i} i={i} />)}
            {documents.every((_, i) => placementOrdre.includes(i)) && <span className="doc-pool-empty">Tous les documents sont placés.</span>}
          </div>
        </>
      ) : (
        <>
          <div className="reference-evenement"><span className="tag">Événement de référence</span><p>{questionB.referenceEvenement}</p></div>
          <div className="avant-apres-zones">
            <div className={`zone ${selectedDocIndex !== null ? 'droppable' : ''}`} onClick={() => placeInZone('avant')}>
              <div className="zone-label">Avant</div>
              <div className="zone-chips">{documents.map((_, i) => placementAvantApres[i] === 'avant' && <Chip key={i} i={i} onPick={() => pickFromZone(i)} />)}</div>
            </div>
            <div className={`zone ${selectedDocIndex !== null ? 'droppable' : ''}`} onClick={() => placeInZone('apres')}>
              <div className="zone-label">Après</div>
              <div className="zone-chips">{documents.map((_, i) => placementAvantApres[i] === 'apres' && <Chip key={i} i={i} onPick={() => pickFromZone(i)} />)}</div>
            </div>
          </div>
          <div className="doc-pool">
            {documents.map((_, i) => placementAvantApres[i] === undefined && <Chip key={i} i={i} />)}
            {documents.every((_, i) => placementAvantApres[i] !== undefined) && <span className="doc-pool-empty">Tous les documents sont placés.</span>}
          </div>
        </>
      )}

      <div className="temps-docs-list">
        {documents.map((d, i) => (
          <div key={i} className="piece">
            <span className="tag">Document {i + 1} — {d.titre}</span>
            <p>{d.texte}</p>
            <BoutonLecture texte={d.texte} />
          </div>
        ))}
      </div>
    </div>
  );
}

const ERAS_HISTORIQUES: Record<string, { label: string; image: string; regions: { nom: string; x: number; y: number }[] }> = {
  "1867": { label: "Canada le 1er juillet 1867 (Confédération)", image: "/maps/carte-1867.jpg", regions: [{ nom: "Ontario", x: 68, y: 86 }, { nom: "Québec", x: 78, y: 62 }, { nom: "Nouveau-Brunswick", x: 83.1, y: 74.8 }, { nom: "Nouvelle-Écosse", x: 87.0, y: 76.2 }] },
  "1870-71": { label: "Canada en 1870-1871", image: "/maps/carte-1870-71.jpg", regions: [{ nom: "Colombie-Britannique", x: 29, y: 56 }, { nom: "Manitoba", x: 51.3, y: 80.7 }, { nom: "Ontario", x: 65, y: 88.5 }, { nom: "Québec", x: 76, y: 62 }, { nom: "Nouveau-Brunswick", x: 83.2, y: 77.7 }, { nom: "Nouvelle-Écosse", x: 86.9, y: 78.7 }] },
  "1999": { label: "Canada aujourd'hui", image: "/maps/carte-moderne.jpg", regions: [{ nom: "Yukon", x: 20, y: 24 }, { nom: "Territoires du Nord-Ouest", x: 33, y: 32 }, { nom: "Nunavut", x: 53, y: 24 }, { nom: "Colombie-Britannique", x: 19, y: 57 }, { nom: "Alberta", x: 29, y: 61 }, { nom: "Saskatchewan", x: 38, y: 65 }, { nom: "Manitoba", x: 45.5, y: 68 }, { nom: "Ontario", x: 58, y: 79 }, { nom: "Québec", x: 73.5, y: 63 }, { nom: "Terre-Neuve", x: 85.5, y: 55 }, { nom: "Nouveau-Brunswick", x: 82.3, y: 78.7 }, { nom: "Île-du-Prince-Édouard", x: 85.5, y: 68.5 }, { nom: "Nouvelle-Écosse", x: 86.8, y: 80.0 }] }
};

function CarteHistorique({ era, lieuSelectionne, setLieuSelectionne }: any) {
  const carte = ERAS_HISTORIQUES[era] || ERAS_HISTORIQUES["1999"];
  return (
    <div className="carte-wrap">
      <div className="carte-era-label">{carte.label}</div>
      <div className="carte-image-container">
        <img src={carte.image} alt={carte.label} className="carte-image" />
        {carte.regions.map((region) => {
          const selected = lieuSelectionne === region.nom;
          return <button key={region.nom} type="button" className={`carte-pin ${selected ? 'selected' : ''}`} style={{ left: `${region.x}%`, top: `${region.y}%` }} onClick={() => setLieuSelectionne(region.nom)} title={region.nom} aria-label={region.nom} />;
        })}
      </div>
      <div className="carte-legende">
        {carte.regions.map((region) => (
          <span key={region.nom} className={`carte-legende-item ${lieuSelectionne === region.nom ? 'selected' : ''}`} onClick={() => setLieuSelectionne(region.nom)}>{region.nom}</span>
        ))}
      </div>
    </div>
  );
}

const CARTES_PROVINCE_QUEBEC: Record<string, { label: string; image: string }> = {
  "1763": { label: "1763 (Proclamation royale)", image: "/maps/carte-1763.jpg" },
  "1774": { label: "1774 (Acte de Québec)", image: "/maps/carte-1774.jpg" },
  "1783": { label: "1783 (Traité de Paris)", image: "/maps/carte-1783.jpg" }
};

function CarteComparaisonProvinceQuebec({ mode, annees, lieuCorrect, lieuSelectionne, setLieuSelectionne }: any) {
  const anneesValides: string[] = (annees || []).filter((a: string) => CARTES_PROVINCE_QUEBEC[a]);
  if (anneesValides.length < 2) return null;

  if (mode === 'identifier') {
    const carte = CARTES_PROVINCE_QUEBEC[lieuCorrect] || CARTES_PROVINCE_QUEBEC[anneesValides[0]];
    return (
      <div className="carte-wrap">
        <div className="carte-era-label">Territoire de la Province de Québec</div>
        <div className="carte-image-container"><img src={carte.image} alt="Territoire de la Province de Québec" className="carte-image" /></div>
        <div className="carte-choix-annees">
          {anneesValides.map((annee) => (
            <button key={annee} type="button" className={`niveau-btn ${lieuSelectionne === annee ? 'active' : ''}`} onClick={() => setLieuSelectionne(annee)}>{CARTES_PROVINCE_QUEBEC[annee].label}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="carte-wrap">
      <div className="carte-era-label">Quel territoire correspond au fait décrit ?</div>
      <div className="carte-comparaison-grid">
        {anneesValides.map((annee) => (
          <button key={annee} type="button" className={`carte-comparaison-item ${lieuSelectionne === annee ? 'selected' : ''}`} onClick={() => setLieuSelectionne(annee)} aria-label={`Territoire ${annee}`}>
            <img src={CARTES_PROVINCE_QUEBEC[annee].image} alt="" className="carte-image" />
          </button>
        ))}
      </div>
    </div>
  );
}

const PAIRES_CARTES_REFERENCE: Record<string, { label: string; image: string }[]> = {
  "1763-1774": [ { label: "1763 (Proclamation royale)", image: "/maps/carte-1763.jpg" }, { label: "1774 (Acte de Québec)", image: "/maps/carte-1774.jpg" } ],
  "1774-1783": [ { label: "1774 (Acte de Québec)", image: "/maps/carte-1774.jpg" }, { label: "1783 (Traité de Paris)", image: "/maps/carte-1783.jpg" } ],
  "1763-1783": [ { label: "1763 (Proclamation royale)", image: "/maps/carte-1763.jpg" }, { label: "1783 (Traité de Paris)", image: "/maps/carte-1783.jpg" } ],
  "1763-1774-1783": [ { label: "1763 (Proclamation royale)", image: "/maps/carte-1763.jpg" }, { label: "1774 (Acte de Québec)", image: "/maps/carte-1774.jpg" }, { label: "1783 (Traité de Paris)", image: "/maps/carte-1783.jpg" } ],
  "1867-1999": [ { label: "Canada en 1867", image: "/maps/carte-1867.jpg" }, { label: "Canada aujourd'hui", image: "/maps/carte-moderne.jpg" } ]
};

function CarteReferenceStatique({ type }: { type: string }) {
  const paire = PAIRES_CARTES_REFERENCE[type];
  if (!paire) return null;
  return (
    <div className="carte-reference-grid">
      {paire.map((c) => (
        <div key={c.label} className="carte-reference-item"><img src={c.image} alt={c.label} className="carte-image" /><div className="carte-reference-label">{c.label}</div></div>
      ))}
    </div>
  );
}

function BoutonLecture({ texte }: { texte: string }) {
  const [enCours, setEnCours] = useState(false);

  const toggleLecture = () => {
    if (!('speechSynthesis' in window)) return;
    if (enCours) { window.speechSynthesis.cancel(); setEnCours(false); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texte);
    utterance.lang = 'fr-CA'; utterance.rate = 0.95;
    utterance.onend = () => setEnCours(false);
    utterance.onerror = () => setEnCours(false);
    setEnCours(true); window.speechSynthesis.speak(utterance);
  };

  return (
    <button type="button" className={`bouton-lecture ${enCours ? 'active' : ''}`} onClick={toggleLecture} aria-label={enCours ? 'Arrêter la lecture' : 'Écouter ce texte'} title={enCours ? 'Arrêter la lecture' : 'Écouter ce texte'}>
      {enCours ? '  Arrêter' : ' Écouter'}
    </button>
  );
}


export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timerFade = setTimeout(() => setIsFading(true), 2000);
    const timerRemove = setTimeout(() => setShowSplash(false), 3000);
    return () => { clearTimeout(timerFade); clearTimeout(timerRemove); };
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => { window.location.replace('https://corrige.moi'); }, 1800000); 
    };
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    resetTimer();
    return () => { clearTimeout(timeoutId); events.forEach(event => document.removeEventListener(event, resetTimer)); };
  }, []);

  const [currentView, setCurrentView] = useState("menu"); 
  const [studentName, setStudentName] = useState("");
  const [codeUtilise, setCodeUtilise] = useState(""); 
  const [accesRefuse, setAccesRefuse] = useState(false);
  const [menuProfilOuvert, setMenuProfilOuvert] = useState(false);

  const [periodesPermises, setPeriodesPermises] = useState<number[]>([]);
  const [periodesSelectionnees, setPeriodesSelectionnees] = useState<number[]>([]);
  const [difficulteGroupe, setDifficulteGroupe] = useState<number>(3); // NIVEAU DE DIFFICULTÉ

  // GESTION DES ERREURS
  const [erreurGlobal, setErreurGlobal] = useState<string | null>(null);

  const deconnecterEleve = () => { window.location.replace('https://corrige.moi/?action=logout'); };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nom = params.get('nom'); const code = params.get('code');
    if (nom && code) {
      setStudentName(nom); setCodeUtilise(code);
      const fetchGroupeInfo = async () => {
        try {
          const codeNettoye = code.trim().toUpperCase();
          const q = query(collection(db, 'groupes'), where('codes', 'array-contains', codeNettoye));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const data = snap.docs[0].data();
            const liste = data.periodesDebloquees || [1,2,3,4,5,6,7,8];
            setPeriodesPermises(liste); setPeriodesSelectionnees(liste);
            setDifficulteGroupe(data.difficulte || 3); // LECTURE DE LA DIFFICULTÉ DU PROF
          }
        } catch (e) { console.error("Erreur récupération groupe", e); }
      };
      fetchGroupeInfo();
    } else { setAccesRefuse(true); window.location.replace('https://corrige.moi'); }
  }, []);

  const togglePeriodeEleve = (id: number) => {
    setPeriodesSelectionnees(prev => {
      if (prev.includes(id) && prev.length === 1) return prev;
      const newState = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
      return newState.sort((a, b) => a - b);
    });
    setErreurGlobal(null);
    if (currentView === 'sectionA') setBanqueQuestionsA([]);
    if (currentView === 'sectionB') { setQuestionB(null); setFeedbackB(null); setReponseB(""); }
    if (currentView === 'sectionC') { setQuestionC(null); setFeedbackC(null); setReponseC(""); }
  };

  // --- TRADUCTION DE LA DIFFICULTÉ EN PROMPT IA ---
  function genererConsigneDifficulte() {
    switch(difficulteGroupe) {
      case 1: return "\nNIVEAU DE LECTURE (1/5) : Utilise un vocabulaire très simple, des phrases courtes et des concepts très explicites. Adapté pour des élèves en difficulté d'apprentissage.";
      case 2: return "\nNIVEAU DE LECTURE (2/5) : Utilise un vocabulaire accessible et des structures de phrases simples.";
      case 3: return "\nNIVEAU DE LECTURE (3/5) : Utilise un vocabulaire standard adapté à des élèves réguliers de 4e secondaire.";
      case 4: return "\nNIVEAU DE LECTURE (4/5) : Utilise un vocabulaire riche, soutenu et des textes plus denses.";
      case 5: return "\nNIVEAU DE LECTURE (5/5) : Utilise un vocabulaire académique complexe, des textes denses avec des concepts implicites. Exige une analyse approfondie.";
      default: return "\nNIVEAU DE LECTURE : Utilise un vocabulaire standard.";
    }
  }

  function genererContexteTemporel() {
    if (periodesSelectionnees.length === 0) return "";
    const periodesChoisies = PERIODES_HISTORIQUES.filter(p => periodesSelectionnees.includes(p.id));
    const maxId = Math.max(...periodesSelectionnees);
    let consigne = `\nCONTRAINTE DE TEMPS ABSOLUE : Tu dois puiser le sujet central de ta question aléatoirement parmi l'une de ces périodes : ${periodesChoisies.map(p => `[Période ${p.id}: ${p.titre}]`).join(', ')}.`;
    if (maxId > 1) { consigne += ` Pour évaluer les changements et continuités, tu peux faire référence aux connaissances des périodes antérieures (Périodes 1 à ${maxId}).`; }
    consigne += ` Tu as l'interdiction absolue d'utiliser des faits, concepts ou événements postérieurs à la Période ${maxId}.`;
    return consigne;
  }

  const [currentOp, setCurrentOp] = useState<any>(null);
  const [questionB, setQuestionB] = useState<any>(null);
  const [loadingQuestionB, setLoadingQuestionB] = useState(false);
  const [reponseB, setReponseB] = useState("");
  const [loadingCorrectionB, setLoadingCorrectionB] = useState(false);
  const [feedbackB, setFeedbackB] = useState<any>(null);

  const [placementOrdre, setPlacementOrdre] = useState<(number | null)[]>([]);
  const [placementAvantApres, setPlacementAvantApres] = useState<Record<number, 'avant' | 'apres'>>({});
  const [selectedDocIndex, setSelectedDocIndex] = useState<number | null>(null);
  const [resultatSituerTemps, setResultatSituerTemps] = useState<any>(null);
  const [lieuSelectionne, setLieuSelectionne] = useState<string | null>(null);
  const [resultatSituerEspace, setResultatSituerEspace] = useState<any>(null);
  const [modeCarteComparaison, setModeCarteComparaison] = useState<'identifier' | 'comparer'>('identifier');

  const [banqueQuestionsA, setBanqueQuestionsA] = useState<any[]>([]); 
  const [currentIndexA, setCurrentIndexA] = useState(0); 
  const [loadingQuestionA, setLoadingQuestionA] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isAnswerValidated, setIsAnswerValidated] = useState(false);
  const [scoreA, setScoreA] = useState({ correct: 0, total: 0 });

  const [questionC, setQuestionC] = useState<any>(null);
  const [loadingQuestionC, setLoadingQuestionC] = useState(false);
  const [reponseC, setReponseC] = useState("");
  const [loadingCorrectionC, setLoadingCorrectionC] = useState(false);
  const [feedbackC, setFeedbackC] = useState<any>(null);
  const [activeDocIndex, setActiveDocIndex] = useState(0);

  async function callAppsScript(action: string, payload: any) {
    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST", redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action, ...payload })
      });
      if (!response.ok) throw new Error(`Erreur réseau: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (error) { console.error("Fetch error:", error); throw error; }
  }

  async function sauvegarderDansFirestore(donnees: any) {
    try {
      await addDoc(collection(db, "resultats_eleves"), { ...donnees, codeUtilise: codeUtilise, horodatage: serverTimestamp() });
    } catch (erreur) { console.error("Erreur ajout document : ", erreur); }
  }

  // --- LOGIQUE GÉNÉRATION ---

  async function genererLotQuestionsA() {
    setLoadingQuestionA(true); setBanqueQuestionsA([]); setSelectedChoice(null); setIsAnswerValidated(false); setErreurGlobal(null);
    const maxId = Math.max(...periodesSelectionnees);
    const nivCalcul = maxId <= 4 ? 3 : 4;
    const systemPrompt = `Tu es un concepteur d'examen pour le cours d'Histoire du Québec et du Canada, secondaire ${nivCalcul} (programme du Québec). Génère une liste de 20 questions à choix multiples (QCM) indépendantes de type "Section A" de l'épreuve unique. 
    ${genererContexteTemporel()}
    ${genererConsigneDifficulte()}
    Règle importante : Pour chaque question à choix multiples, répartis la bonne réponse de façon aléatoire entre les choix A, B, C et D. Ne la place jamais de façon répétitive au même endroit. Réponds UNIQUEMENT en format JSON valide sous forme de tableau, sans balises markdown:
    [ { "question": "Texte de la question", "choix": ["Choix 1", "Choix 2", "Choix 3", "Choix 4"], "indexReponseCorrecte": 0, "explication": "Courte explication pédagogique." } ]`;
    try {
      const response = await callAppsScript('generer', { prompt: systemPrompt });
      let cleanText = response.text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const firstBracket = cleanText.indexOf('['); const lastBracket = cleanText.lastIndexOf(']');
      if(firstBracket !== -1 && lastBracket !== -1) cleanText = cleanText.substring(firstBracket, lastBracket + 1);
      setBanqueQuestionsA(JSON.parse(cleanText)); setCurrentIndexA(0);
    } catch(err) { 
      console.error(err); 
      setErreurGlobal("Les archives sont momentanément inaccessibles. Veuillez réessayer.");
    } finally { setLoadingQuestionA(false); }
  }

  const questionA = banqueQuestionsA.length > 0 ? banqueQuestionsA[currentIndexA] : null;
  const passerQuestionSuivanteA = () => {
    setSelectedChoice(null); setIsAnswerValidated(false);
    if (currentIndexA + 1 < banqueQuestionsA.length) { setCurrentIndexA(currentIndexA + 1); } else { genererLotQuestionsA(); }
  };

  async function genererQuestionB() {
    setLoadingQuestionB(true); setQuestionB(null); setReponseB(""); setFeedbackB(null); setErreurGlobal(null);
    setPlacementOrdre([]); setPlacementAvantApres({}); setResultatSituerTemps(null); setLieuSelectionne(null); setResultatSituerEspace(null);
    
    // GESTION DU NOMBRE DE DOCUMENTS EN FONCTION DE LA DIFFICULTÉ
    let nbDocuments = "1 à 2 courts documents";
    if (currentOp.id === "mise-en-relation" || currentOp.id === "liens-causalite") {
      nbDocuments = "TROIS documents distincts";
    } else if (currentOp.id === "continuite-changement" || currentOp.id === "comparaisons") {
      nbDocuments = difficulteGroupe >= 4 ? "TROIS documents distincts" : "DEUX documents distincts";
    }

    let systemPrompt: string;
    if (currentOp.id === "espace-temps") {
      systemPrompt = `Tu es un concepteur de matériel pédagogique pour le cours d'Histoire du Québec et du Canada. Tu dois créer un exercice pour pratiquer l'opération intellectuelle suivante: "${currentOp.nom}". Définition: ${currentOp.def}
${genererContexteTemporel()}
${genererConsigneDifficulte()}
Choisis aléatoirement et équitablement le champ "type" entre "temps" et "espace".
SI type = "espace":
- Choisis d'abord une "carteEra" parmi les 4 valeurs suivantes, EN RESPECTANT STRICTEMENT LA CONTRAINTE DE TEMPS IMPOSÉE :
  - "province-quebec" (Uniquement autorisée si la période imposée est >= 3)
  - "1867" (Uniquement autorisée si la période imposée est >= 5)
  - "1870-71" (Uniquement autorisée si la période imposée est >= 5)
  - "1999" (Uniquement autorisée si la période imposée est 8)
- SI AUCUNE de ces cartes n'est compatible avec la période imposée (ex: Période 1 ou 2), tu DOIS obligatoirement forcer type="temps" et ignorer le type espace.
- Si la carte est compatible, choisis un territoire parmi la liste de son époque :
  - "1867": Ontario, Québec, Nouveau-Brunswick, Nouvelle-Écosse
  - "1870-71": les 4 précédents + Manitoba + Colombie-Britannique
  - "1999": Yukon, Territoires du Nord-Ouest, Nunavut, Colombie-Britannique, Alberta, Saskatchewan, Manitoba, Ontario, Québec, Terre-Neuve, Nouveau-Brunswick, Île-du-Prince-Édouard, Nouvelle-Écosse
  - "province-quebec" (compare l'étendue territoriale à 2 moments) : choisis 2 années parmi "1763", "1774", "1783" dans "comparaisonAnnees".
- Rédige ${nbDocuments} fictifs SANS nommer le territoire. "lieuCorrect" est le nom exact. Laisse "sousType", "referenceEvenement", "ordreCorrect", "classificationCorrecte" vides.
SI type = "temps":
Choisis aléatoirement un "sousType" entre "ordre" et "avant-apres".
RÈGLE ABSOLUE : AUCUN document généré ne doit mentionner une année, une date précise ou une période chiffrée.
  SI sousType = "ordre": Génère 4 courts documents. "ordreCorrect" est un tableau des indices (0 à 3) du plus ancien au plus récent.
  SI sousType = "avant-apres": "referenceEvenement" contient l'événement repère. Génère 2 documents avant, 2 documents après. "classificationCorrecte" est un tableau ("avant" ou "apres").
Réponds UNIQUEMENT en format JSON valide:
{"periode":"nom de la période","type":"temps ou espace","sousType":"ordre, avant-apres, ou vide si type=espace","referenceEvenement":"vide sauf si sousType=avant-apres","carteEra":"vide sauf si type=espace","comparaisonAnnees":"vide sauf si carteEra=province-quebec","lieuCorrect":"vide sauf si type=espace","documents":[{"titre":"titre du document","texte":"contenu sans date explicite"}],"ordreCorrect":[],"classificationCorrecte":[],"explication":"","consigne":"la question posée"}`;
    } else if (currentOp.id === "continuite-changement" || currentOp.id === "comparaisons") {
      systemPrompt = `Tu es un concepteur de matériel pédagogique pour le cours d'Histoire du Québec et du Canada. Tu dois créer un dossier documentaire pour pratiquer l'opération intellectuelle suivante: "${currentOp.nom}". Définition: ${currentOp.def} La tâche doit demander à l'élève de: ${currentOp.consigneType}.
${genererContexteTemporel()}
${genererConsigneDifficulte()}
Environ une fois sur trois, base ta question sur l'une de ces paires de cartes (si elles sont compatibles avec la période imposée) – remplis "utiliserCarteHistorique": true et "carteHistoriqueType" (choisis parmi: "1763-1774", "1774-1783", "1763-1783", "1763-1774-1783", "1867-1999"). Laisse "documents" vide [].
Les deux tiers du temps, ignore les cartes: mets "utiliserCarteHistorique": false, et rédige ${nbDocuments} fictifs mais historiquement exacts.
Réponds UNIQUEMENT en format JSON valide: {"periode":"nom de la période","utiliserCarteHistorique":true ou false,"carteHistoriqueType":"...","documents":[{"titre":"","texte":""}],"consigne":""}`;
    } else {
      systemPrompt = `Tu es un concepteur de matériel pédagogique pour le cours d'Histoire du Québec et du Canada. Tu dois créer un dossier documentaire pour pratiquer l'opération intellectuelle suivante: "${currentOp.nom}". Définition: ${currentOp.def} La tâche doit demander à l'élève de: ${currentOp.consigneType}.
${genererContexteTemporel()}
${genererConsigneDifficulte()}
Rédige ${nbDocuments} documents fictifs mais historiquement exacts. Réponds UNIQUEMENT en format JSON valide: {"periode":"nom de la période","documents":[{"titre":"","texte":""}],"consigne":""}`;
    }
    try {
      const response = await callAppsScript('generer', { prompt: systemPrompt });
      let cleanText = response.text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const firstBrace = cleanText.indexOf('{'); const lastBrace = cleanText.lastIndexOf('}');
      if(firstBrace !== -1 && lastBrace !== -1) cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(cleanText);
      if (parsed.type === 'temps' && parsed.sousType === 'ordre') { setPlacementOrdre(new Array((parsed.documents || []).length).fill(null)); }
      if (parsed.type === 'espace' && parsed.carteEra === 'province-quebec') { setModeCarteComparaison(Math.random() < 0.5 ? 'identifier' : 'comparer'); }
      setQuestionB(parsed);
    } catch(err) { 
      console.error(err); 
      setErreurGlobal("Les archives sont momentanément inaccessibles. Veuillez réessayer.");
    } finally { setLoadingQuestionB(false); }
  }

  async function corrigerReponseB() {
    if (!reponseB.trim()) return; 
    setLoadingCorrectionB(true); setFeedbackB(null); setErreurGlobal(null);
    const infosSources = `Documents fournis: ${(questionB.documents||[]).map((d: any, i: number)=>`Doc ${String.fromCharCode(65+i)}: ${d.texte}`).join(" | ")}`;
    const correctionPrompt = `Tu es un enseignant d'histoire au secondaire. Corrige la réponse d'un élève. Opération évaluée: "${currentOp.nom}" - Format exigé: ${currentOp.formatAttendu} ${infosSources} Consigne posée: ${questionB.consigne} Réponse de l'élève: "${reponseB}" Réponds UNIQUEMENT en JSON valide: {"niveau":"Réussi / Réussi partiellement / À revoir","note":"x/10","commentaire":"2-4 phrases de feedback bienveillant à l'élève","pisteAmelioration":"conseil court","exempleReponse":"court exemple parfait"}`;
    try {
      const response = await callAppsScript('corriger', { prompt: correctionPrompt });
      let cleanText = response.text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const firstBrace = cleanText.indexOf('{'); const lastBrace = cleanText.lastIndexOf('}');
      if(firstBrace !== -1 && lastBrace !== -1) cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(cleanText);
      setFeedbackB(parsed);
      const maxId = Math.max(...periodesSelectionnees);
      const nivCalcul = maxId <= 4 ? 3 : 4;
      await sauvegarderDansFirestore({
        eleve: studentName || "Anonyme", niveau: `Sec ${nivCalcul}`, section: "Section B", operation: currentOp.nom, consigne: questionB.consigne, reponse: reponseB, resultat: parsed.niveau || 'Erreur', note: parsed.note || '-', commentaire: parsed.commentaire || '-'
      });
    } catch(err) { 
      console.error(err); 
      setErreurGlobal("CorrigeMoi rencontre un problème technique. Veuillez réessayer.");
    } finally { setLoadingCorrectionB(false); }
  }

  async function genererQuestionC() {
    setLoadingQuestionC(true); setQuestionC(null); setReponseC(""); setFeedbackC(null); setActiveDocIndex(0); setErreurGlobal(null);
    const systemPrompt = `Tu es un concepteur d'examen ministériel pour le cours d'Histoire du Québec et du Canada. Génère un dossier documentaire complet pour une question à réponse élaborée (Section C de l'épreuve unique). Le dossier doit contenir **entre 6 et 10 documents**. RÈGLES HISTORIQUES ET TECHNIQUES :
 - Sois d'une rigueur absolue avec les titres politiques. Ne confonds jamais un "ministre" (ex: ministre de l'Éducation) avec le "Premier ministre" (chef du gouvernement).
 - Le dossier documentaire ne doit contenir QUE du texte. N'inclus AUCUNE image.
 - Pour chaque document, indique un "typeDoc" précis ("Texte" ou "Statistique").
 ${genererContexteTemporel()}
 ${genererConsigneDifficulte()}
Réponds UNIQUEMENT en format JSON valide:
{
  "typeTache": "description" ou "explication", "periode": "Nom de la période historique", "contexte": "Mise en contexte globale du dossier", "consigne": "La question exacte posée à l'élève",
  "documents": [ { "titre": "Titre explicite du document", "typeDoc": "Texte ou Statistique", "texte": "Contenu ou description détaillée" } ],
  "criteresCorrectionAttendus": [ "Détail du 1er élément attendu", "Détail du 2e élément attendu" ]
}`;
    try {
      const response = await callAppsScript('generer', { prompt: systemPrompt });
      let cleanText = response.text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const firstBrace = cleanText.indexOf('{'); const lastBrace = cleanText.lastIndexOf('}');
      if(firstBrace !== -1 && lastBrace !== -1) cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      setQuestionC(JSON.parse(cleanText));
    } catch(err: any) { 
      setErreurGlobal("Les archives sont momentanément inaccessibles. Veuillez réessayer.");
    } finally { setLoadingQuestionC(false); }
  }

  async function corrigerReponseC() {
    if (!reponseC.trim()) return;
    setLoadingCorrectionC(true); setFeedbackC(null); setErreurGlobal(null);
    const isDescription = questionC.typeTache === "description";
    const correctionPrompt = `Tu es un enseignant correcteur pour l'épreuve unique d'histoire du Québec. Corrige la réponse d'un élève. Type de tâche : ${questionC.typeTache} Consigne posée : ${questionC.consigne} Documents mis à disposition : ${(questionC.documents||[]).map((d: any, i: number)=>`Doc ${String.fromCharCode(65+i)} [${d.typeDoc}] (${d.titre}): ${d.texte}`).join(" | ")} Réponse rédigée par l'élève : "${reponseC}" Grille officielle à appliquer sur 8 points : ${isDescription ? ` - Indiquer l'objet de la description (/2 points) - Première mise en relation (/3 points) - Deuxième mise en relation (/3 points) ` : ` - Premier élément de réponse (/4 points au total : indication /2 + faits appropriés /2) - Deuxième élément de réponse (/4 points au total : indication /2 + faits appropriés /2) `} Réponds UNIQUEMENT en format JSON valide:
{
  "noteGlobale": "X/8", "typeTache": "${questionC.typeTache}",
  "detailPartie1": { "titre": "${isDescription ? "Objet de la description" : "Premier élément de réponse"}", "note": "${isDescription ? "X/2" : "X/4"}", "evaluation": "Commentaire détaillé" },
  "detailPartie2": { "titre": "${isDescription ? "Première mise en relation" : "Deuxième élément de réponse"}", "note": "${isDescription ? "X/3" : "X/4"}", "evaluation": "Commentaire détaillé" },
  ${isDescription ? `"detailPartie3": { "titre": "Deuxième mise en relation", "note": "X/3", "evaluation": "Commentaire détaillé" },` : ""}
  "commentaireGlobal": "2-3 phrases de rétroaction constructive", "pisteAmelioration": "Un conseil précis pour s'améliorer"
}`;
    try {
      const response = await callAppsScript('corriger', { prompt: correctionPrompt });
      let cleanText = response.text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const firstBrace = cleanText.indexOf('{'); const lastBrace = cleanText.lastIndexOf('}');
      if(firstBrace !== -1 && lastBrace !== -1) cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(cleanText);
      setFeedbackC(parsed);
      const maxId = Math.max(...periodesSelectionnees);
      const nivCalcul = maxId <= 4 ? 3 : 4;
      await sauvegarderDansFirestore({
        eleve: studentName || "Anonyme", niveau: `Sec ${nivCalcul}`, section: "Section C", operation: `Section C (${questionC.typeTache})`, consigne: questionC.consigne, reponse: reponseC, resultat: parsed.noteGlobale || 'Non évalué', note: parsed.noteGlobale || '-', commentaire: parsed.commentaireGlobal || '-'
      });
    } catch(err: any) { 
      setErreurGlobal("CorrigeMoi rencontre un problème technique. Veuillez réessayer.");
    } finally { setLoadingCorrectionC(false); }
  }

  function validerSituerTemps() {
    if (!questionB) return;
    let correct = 0; let total = 0;
    if (questionB.sousType === 'ordre') {
      total = (questionB.ordreCorrect || []).length;
      placementOrdre.forEach((docIdx, slotIndex) => { if (docIdx !== null && questionB.ordreCorrect[slotIndex] === docIdx) correct++; });
    } else if (questionB.sousType === 'avant-apres') {
      total = (questionB.classificationCorrecte || []).length;
      (questionB.classificationCorrecte || []).forEach((bonne: string, i: number) => { if (placementAvantApres[i] === bonne) correct++; });
    }
    const points = correct === total ? 2 : (correct >= total - 1 ? 1 : 0);
    const resultat = { correct, total, points };
    setResultatSituerTemps(resultat);
    const maxId = Math.max(...periodesSelectionnees);
    const nivCalcul = maxId <= 4 ? 3 : 4;
    sauvegarderDansFirestore({
      eleve: studentName || "Anonyme", niveau: `Sec ${nivCalcul}`, section: "Section B", operation: currentOp.nom, consigne: questionB.consigne,
      reponse: questionB.sousType === 'ordre' ? `Ordre soumis: ${placementOrdre.map(d => (d === null ? '?' : d + 1)).join(', ')}` : `Classement soumis: ${Object.entries(placementAvantApres).map(([i, z]) => `Doc ${Number(i) + 1}=${z}`).join(', ')}`,
      resultat: `${points}/2 points (${correct}/${total} corrects)`, note: `${points}/2`, commentaire: '-'
    });
  }

  const estPlacementComplet = (): boolean => {
    if (!questionB) return false;
    if (questionB.sousType === 'ordre') return placementOrdre.length > 0 && placementOrdre.every(v => v !== null);
    if (questionB.sousType === 'avant-apres') return (questionB.documents || []).every((_: any, i: number) => placementAvantApres[i] !== undefined);
    return false;
  };

  function validerSituerEspace() {
    if (!questionB || !lieuSelectionne) return;
    const correct = lieuSelectionne === questionB.lieuCorrect;
    setResultatSituerEspace({ correct });
    const maxId = Math.max(...periodesSelectionnees);
    const nivCalcul = maxId <= 4 ? 3 : 4;
    sauvegarderDansFirestore({
      eleve: studentName || "Anonyme", niveau: `Sec ${nivCalcul}`, section: "Section B", operation: currentOp.nom, consigne: questionB.consigne,
      reponse: `Lieu choisi: ${lieuSelectionne} (bonne réponse: ${questionB.lieuCorrect})`, resultat: correct ? 'Réussi' : 'À revoir', note: correct ? '1/1' : '0/1', commentaire: '-'
    });
  }

  const handleTabClick = (op: any) => { setCurrentOp(op); setQuestionB(null); setFeedbackB(null); setReponseB(""); setErreurGlobal(null); };

  function formatConsigneAvecListe(texte: string) {
    if (!texte) return null;
    const lignes = texte.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const aDesTiretsEnDebutDeLigne = lignes.some(l => /^[- ]\s*/.test(l));
    let intro: string[] = []; let items: string[] = [];
    if (lignes.length > 1 && aDesTiretsEnDebutDeLigne) {
      lignes.forEach(l => { if (/^[- ]\s*/.test(l)) items.push(l.replace(/^[- ]\s*/, '')); else intro.push(l); });
    } else {
      const segments = texte.split(/\s-\s+/).map(s => s.trim()).filter(Boolean);
      if (segments.length > 1) { intro = [segments[0]]; items = segments.slice(1); } else { intro = [texte]; }
    }
    return (
      <>
        {intro.map((p, i) => <p key={`intro-${i}`}>{p}</p>)}
        {items.length > 0 && ( <ul className="consigne-list">{items.map((it, i) => <li key={`item-${i}`}>{it}</li>)}</ul> )}
      </>
    );
  }

  function formatRappelMarqueurs(op: any) {
    if (!op?.marqueursRecommandes || op.marqueursRecommandes.length === 0) return null;
    return (
      <p className="marqueurs-note">
        ( {op.marqueursRecommandes.map((m: any, i: number) => (
          <span key={i}>{op.marqueursRecommandes.length > 1 && <>Pour <strong>{m.typeLien}</strong>, </>} pensez à utiliser des marqueurs comme : <em>{m.marqueurs}</em> {i < op.marqueursRecommandes.length - 1 ? '. ' : '.'}</span>
        ))} )
      </p>
    );
  }

  // --- RENDU SÉLECTEUR DE PÉRIODES ANIMÉ ---
  const renderSélecteurPériodes = () => {
    return (
      <div style={{ marginBottom: '30px' }}>
        <div className="periodes-grid">
          {PERIODES_HISTORIQUES.map(p => {
            const isLocked = !periodesPermises.includes(p.id);
            const isSelected = periodesSelectionnees.includes(p.id);

            const parts = p.titre.split(' : ');
            const dates = parts[0];
            const nom = parts[1] || p.titre;

            if (isLocked) {
              return (
                <div key={p.id} className="periode-card verrouillee">
                  <div className="p-badge">Période {p.id}</div>
                  <i className="ti ti-lock periode-icon-right" style={{color: '#94a3b8', fontSize: '18px'}}></i>
                  <div className="p-titre">{nom}</div>
                  <div className="p-dates">{dates}</div>
                </div>
              );
            }

            return (
              <button key={p.id} onClick={() => togglePeriodeEleve(p.id)} className="periode-card completee">
                <div className="p-badge">Période {p.id}</div>
                {isSelected ? (
                  <i className="ti ti-check periode-icon-right" style={{color: '#10b981', fontSize: '18px'}}></i>
                ) : (
                  <div className="periode-icon-right" style={{width:'14px', height:'14px', borderRadius:'50%', border:'2px solid #cbd5e1'}}></div>
                )}
                <div className="p-titre">{nom}</div>
                <div className="p-dates">{dates}</div>
              </button>
            );
          })}
        </div>

        <div className="periodes-legende">
          <div className="legende-item"><div className="legende-dot dot-vert"></div> Cliquée — Période active pour les questions</div>
          <div className="legende-item"><div className="legende-dot" style={{backgroundColor: 'white', border: '2px solid #cbd5e1', boxSizing: 'border-box'}}></div> Disponible — Débloquée par l'enseignant</div>
          <div className="legende-item"><div className="legende-dot dot-gris"></div> Verrouillée — Grisée, non cliquable</div>
        </div>
      </div>
    );
  };

  return (
    <>
      {showSplash && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: isFading ? 0 : 1, transition: 'opacity 1s ease-in-out', pointerEvents: 'none' }}>
          <img src="/corrige.moi.jpg" alt="Logo Corrige.moi" style={{ width: '100%', maxWidth: '350px', objectFit: 'contain' }} />
        </div>
      )}
      {!accesRefuse && (
        <div className="wrap">
          <div className="app-header">
            <div className="app-header-left">
              <div className="app-logo-badge"><i className="ti ti-books" aria-hidden="true"></i></div>
              <div><p className="title">Histoire du Québec et du Canada</p><p className="subtitle">Corrige.moi - Code actif: {codeUtilise}</p></div>
            </div>
            <div style={{ position: 'relative' }}>
              <button className="student-pill" onClick={() => setMenuProfilOuvert(!menuProfilOuvert)} style={{ cursor: 'pointer', border: 'none', background: 'var(--bg-surface-soft)' }}>
                <div className="avatar">{studentName ? studentName.charAt(0).toUpperCase() : '?'}</div><span>{studentName}</span>
              </button>
              {menuProfilOuvert && (
                <div style={{ position: 'absolute', top: '110%', right: '0', backgroundColor: 'white', border: '1px solid var(--ligne)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '8px', zIndex: 50, minWidth: '150px' }}>
                  <button onClick={deconnecterEleve} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', color: 'var(--danger)', background: 'none', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--danger-soft)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>Déconnexion</button>
                </div>
              )}
            </div>
          </div>

          {currentView === 'menu' && (
            <div>
              <div className="progress-card">
                <div className="progress-card-top"><span>Progression globale</span><span>{Math.round((scoreA.total ? scoreA.correct / scoreA.total : 0) * 100)}%</span></div>
                <div className="progress-track"><div className="progress-fill" style={{width: `${Math.round((scoreA.total ? scoreA.correct / scoreA.total : 0) * 100)}%`}}></div></div>
              </div>
              <div className="module-grid">
                <button className="module-card module-card--a" onClick={() => setCurrentView('sectionA')}><div className="module-card-icon"><span className="module-card-letter">A</span></div><p className="module-card-title">Choix multiples et réponses courtes</p></button>
                <button className="module-card module-card--b" onClick={() => setCurrentView('sectionB')}><div className="module-card-icon"><span className="module-card-letter">B</span></div><p className="module-card-title">Opérations intellectuelles</p></button>
                <button className="module-card module-card--c" onClick={() => setCurrentView('sectionC')}><div className="module-card-icon"><span className="module-card-letter">C</span></div><p className="module-card-title">Questions longues et schémas</p></button>
              </div>
            </div>
          )}

          {currentView === 'sectionA' && (
            <>
              <button className="link-btn" onClick={() => setCurrentView('menu')} style={{marginBottom: '20px'}}>← Retour au menu principal</button>
              <div className="dossier">
                <div className="catalog-num">SECTION A — Histoire du Québec et du Canada {banqueQuestionsA.length > 0 && ` – Question ${currentIndexA + 1} / ${banqueQuestionsA.length}`}</div>
                <div className="op-title">Section A : Choix multiples ou réponses courtes</div>
                <p className="op-def">Répondez à la question à choix multiples. Chaque lot contient 20 questions générées pour réviser.</p>
                {renderSélecteurPériodes()}
                
                {erreurGlobal && <div style={{backgroundColor: '#fee2e2', color: '#b91c1c', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', gap: '10px'}}><strong>Oups!</strong> {erreurGlobal}</div>}

                {loadingQuestionA ? (
                  <div className="loading"><div className="spinner"></div>Génération du lot de 20 questions en cours...</div>
                ) : banqueQuestionsA.length === 0 ? (
                  <button className="btn-generer" onClick={genererLotQuestionsA} style={{backgroundColor: 'var(--card-blue)'}}><i className="ti ti-rotate-clockwise"></i> Charger un nouveau lot de 20 questions</button>
                ) : questionA && (
                  <div>
                    <div className="consigne-box" style={{borderColor: 'var(--card-blue)', backgroundColor: 'var(--sec-a-soft)'}}><span className="tag" style={{color: 'var(--card-blue)'}}>Question {currentIndexA + 1} sur {banqueQuestionsA.length}</span><p>{questionA.question}</p><BoutonLecture texte={questionA.question} /></div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0'}}>
                      {questionA.choix.map((choixText: string, index: number) => {
                        let bgColor = selectedChoice === index ? '#ffffff' : 'var(--bg-surface-soft)';
                        let borderColor = 'var(--ligne)';
                        if (isAnswerValidated) {
                          if (index === questionA.indexReponseCorrecte) { bgColor = '#d4edda'; borderColor = '#28a745'; } 
                          else if (index === selectedChoice) { bgColor = '#f8d7da'; borderColor = '#dc3545'; }
                        }
                        return (
                          <button key={index} style={{ padding: '14px', textAlign: 'left', borderRadius: '4px', border: `1px solid ${borderColor}`, backgroundColor: bgColor, cursor: isAnswerValidated ? 'default' : 'pointer', fontFamily: "'Source Serif 4', serif", fontSize: '15px', transition: 'all 0.2s' }} disabled={isAnswerValidated} onClick={() => setSelectedChoice(index)}>
                            <strong>{String.fromCharCode(65 + index)}.</strong> {choixText}
                          </button>
                        );
                      })}
                    </div>
                    {!isAnswerValidated ? (
                      <button className="btn-generer" onClick={() => {
                        if (selectedChoice === null) return;
                        const estCorrect = selectedChoice === questionA.indexReponseCorrecte;
                        setIsAnswerValidated(true); setScoreA(prev => ({ correct: prev.correct + (estCorrect ? 1 : 0), total: prev.total + 1 }));
                        const maxId = Math.max(...periodesSelectionnees); const nivCalcul = maxId <= 4 ? 3 : 4;
                        sauvegarderDansFirestore({ eleve: studentName || "Anonyme", niveau: `Sec ${nivCalcul}`, section: "Section A", operation: "Choix multiples", consigne: questionA.question, reponse: questionA.choix[selectedChoice], resultat: estCorrect ? 'Réussi' : 'À revoir', note: estCorrect ? '1/1' : '0/1', commentaire: '-' });
                      }} disabled={selectedChoice === null} style={{backgroundColor: 'var(--card-blue)'}}>Valider ma réponse</button>
                    ) : (
                      <div className="verdict" style={{borderTopColor: 'var(--card-blue)'}}>
                        <div className={`stamp ${selectedChoice === questionA.indexReponseCorrecte ? 'reussi' : ''}`} style={selectedChoice === questionA.indexReponseCorrecte ? {borderColor: 'var(--card-blue)', color: 'var(--card-blue)'} : {}}>{selectedChoice === questionA.indexReponseCorrecte ? 'Bonne réponse !' : 'Oups... À revoir !'}</div>
                        <div className="feedback-section"><span className="label">Explication de CorrigeMoi</span><p style={{margin: 0, fontSize: '14.5px', lineHeight: 1.6}}>{questionA.explication}</p></div>
                        <button className="link-btn" onClick={passerQuestionSuivanteA} style={{marginTop: '20px', color: 'var(--card-blue)'}}>{currentIndexA + 1 < banqueQuestionsA.length ? 'Question suivante →' : 'Générer un nouveau lot de 20'}</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {currentView === 'sectionB' && (
            <>
              <button className="link-btn" onClick={() => setCurrentView('menu')} style={{marginBottom: '20px'}}>← Retour au menu principal</button>
              <div className="tabs">
                {OPERATIONS.map((op) => ( <button key={op.id} className={`tab ${currentOp?.id === op.id ? 'active' : ''}`} onClick={() => handleTabClick(op)}><span className="num">{op.num}</span> {op.nom}</button> ))}
              </div>
              <div className="dossier">
                <div className="catalog-num">SECTION B — Histoire du Québec et du Canada</div>
                {!currentOp ? (
                  <div className="empty-state">Choisis une opération intellectuelle ci-dessus pour ouvrir son dossier.</div>
                ) : (
                  <div>
                    <div className="op-title">{currentOp.nom}</div><p className="op-def">{currentOp.def}</p>
                    {renderSélecteurPériodes()}

                    {erreurGlobal && <div style={{backgroundColor: '#fee2e2', color: '#b91c1c', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', gap: '10px'}}><strong>Oups!</strong> {erreurGlobal}</div>}

                    {loadingQuestionB ? (
                      <div className="loading"><div className="spinner"></div>Recherche dans les archives...</div>
                    ) : !questionB ? (
                      <button className="btn-generer" onClick={genererQuestionB} style={{backgroundColor: 'var(--card-teal)'}}><i className="ti ti-folder-open"></i> Ouvrir un nouveau dossier documentaire</button>
                    ) : (
                      <div>
                        <div className="catalog-num" style={{marginTop: '16px'}}>{questionB.periode}</div>
                        {questionB.type === 'temps' ? (
                          <div>
                            <div className="consigne-box"><span className="tag">Tâche à réaliser</span>{formatConsigneAvecListe(questionB.consigne)}<div className="format-note">Touche un document pour le sélectionner, puis touche la case où le déposer.</div></div>
                            <SituerDansLeTemps questionB={questionB} placementOrdre={placementOrdre} setPlacementOrdre={setPlacementOrdre} placementAvantApres={placementAvantApres} setPlacementAvantApres={setPlacementAvantApres} selectedDocIndex={selectedDocIndex} setSelectedDocIndex={setSelectedDocIndex} />
                            <div className="actions">
                              <button className="btn-generer" onClick={validerSituerTemps} disabled={!estPlacementComplet()} style={{backgroundColor: 'var(--card-teal)'}}><i className="ti ti-check"></i> Valider mon classement</button>
                              <button className="link-btn" onClick={() => { setQuestionB(null); setResultatSituerTemps(null); }}>Nouveau dossier ↺</button>
                            </div>
                            {resultatSituerTemps && (
                              <div className="verdict" style={{borderTopColor: 'var(--card-teal)'}}>
                                <div className={`stamp ${resultatSituerTemps.points === 2 ? 'reussi' : ''}`} style={resultatSituerTemps.points === 2 ? {borderColor: 'var(--card-teal)', color: 'var(--card-teal)'} : {}}>{resultatSituerTemps.points}/2 points — {resultatSituerTemps.correct}/{resultatSituerTemps.total} corrects</div>
                                {questionB.explication && <div className="feedback-section"><span className="label">Explication</span><p style={{margin: 0, fontSize: '14.5px', lineHeight: 1.6}}>{questionB.explication}</p></div>}
                              </div>
                            )}
                          </div>
                        ) : questionB.type === 'espace' ? (
                          <div>
                            <div className="consigne-box"><span className="tag">Tâche à réaliser</span>{formatConsigneAvecListe(questionB.consigne)}<div className="format-note">Touche le lieu sur la carte qui correspond au fait décrit dans le(s) document(s).</div></div>
                            {questionB.documents?.map((d: any, i: number) => <div key={i} className="piece"><span className="tag">Document {String.fromCharCode(65+i)} — {d.titre}</span><p>{d.texte}</p><BoutonLecture texte={d.texte} /></div>)}
                            {questionB.carteEra === 'province-quebec' ? <CarteComparaisonProvinceQuebec mode={modeCarteComparaison} annees={questionB.comparaisonAnnees} lieuCorrect={questionB.lieuCorrect} lieuSelectionne={lieuSelectionne} setLieuSelectionne={setLieuSelectionne} /> : <CarteHistorique era={questionB.carteEra} lieuSelectionne={lieuSelectionne} setLieuSelectionne={setLieuSelectionne} />}
                            <div className="actions">
                              <button className="btn-generer" onClick={validerSituerEspace} disabled={!lieuSelectionne} style={{backgroundColor: 'var(--card-teal)'}}><i className="ti ti-check"></i> Valider mon choix</button>
                              <button className="link-btn" onClick={() => { setQuestionB(null); setResultatSituerEspace(null); setLieuSelectionne(null); }}>Nouveau dossier ↺</button>
                            </div>
                            {resultatSituerEspace && (
                              <div className="verdict" style={{borderTopColor: 'var(--card-teal)'}}>
                                <div className={`stamp ${resultatSituerEspace.correct ? 'reussi' : ''}`} style={resultatSituerEspace.correct ? {borderColor: 'var(--card-teal)', color: 'var(--card-teal)'} : {}}>{resultatSituerEspace.correct ? 'Bonne réponse !' : `À revoir – la bonne réponse était ${questionB.lieuCorrect}`}</div>
                                {questionB.explication && <div className="feedback-section"><span className="label">Explication</span><p style={{margin: 0, fontSize: '14.5px', lineHeight: 1.6}}>{questionB.explication}</p></div>}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            {questionB.utiliserCarteHistorique && <CarteReferenceStatique type={questionB.carteHistoriqueType} />}
                            {questionB.documents?.map((d: any, i: number) => <div key={i} className="piece"><span className="tag">Document {String.fromCharCode(65+i)} — {d.titre}</span><p>{d.texte}</p><BoutonLecture texte={d.texte} /></div>)}
                            <div className="consigne-box"><span className="tag">Tâche à réaliser</span>{formatConsigneAvecListe(questionB.consigne)}<BoutonLecture texte={questionB.consigne} />{formatRappelMarqueurs(currentOp)}<div className="format-note">Format attendu : {currentOp.formatAttendu}</div></div>
                            <textarea placeholder="Écris ta réponse ici, en phrases complètes..." value={reponseB} onChange={(e) => setReponseB(e.target.value)} />
                            <div className="actions">
                              <button className="btn-generer" onClick={corrigerReponseB} disabled={loadingCorrectionB || reponseB.trim() === ""} style={{backgroundColor: 'var(--card-teal)'}}>{loadingCorrectionB ? 'Correction en cours...' : '✍️ Soumettre ma réponse'}</button>
                              <button className="link-btn" onClick={() => { setQuestionB(null); setFeedbackB(null); setReponseB(""); }}>Nouveau dossier ↺</button>
                            </div>
                            {loadingCorrectionB && <div className="loading"><div className="spinner"></div>CorrigeMoi examine ta réponse...</div>}
                            {feedbackB && (
                              <div className="verdict" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>
                                <div><div style={{ textTransform: 'uppercase', fontSize: '13px', fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>1. Résultat</div><div className={`stamp ${feedbackB.niveau?.toLowerCase().includes('réussi') ? 'reussi' : ''}`} style={{ display: 'inline-block', margin: 0 }}>{feedbackB.niveau || 'Évalué'} • {feedbackB.note || ''}</div></div>
                                <div style={{ borderTop: '1px dashed var(--ligne)', paddingTop: '20px' }}>
                                  <div style={{ textTransform: 'uppercase', fontSize: '13px', fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>2. Explication de l'archiviste</div>
                                  <div className="feedback-body" style={{ fontSize: '15px', lineHeight: '1.6', margin: 0 }}><p style={{ marginTop: 0 }}>{feedbackB.commentaire}</p>{feedbackB.pisteAmelioration && <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px', borderLeft: '3px solid #666' }}><strong>Conseil :</strong> {feedbackB.pisteAmelioration}</div>}</div>
                                </div>
                                {feedbackB.exempleReponse && (
                                  <div style={{ borderTop: '1px dashed var(--ligne)', paddingTop: '20px' }}>
                                    <div style={{ textTransform: 'uppercase', fontSize: '13px', fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>3. Démonstration d'une réponse parfaite</div>
                                    <div style={{ padding: '16px', backgroundColor: 'var(--sec-a-soft)', borderLeft: '4px solid var(--card-blue)', borderRadius: '4px', fontStyle: 'italic', fontSize: '15px', color: 'var(--text-main)' }}>{feedbackB.exempleReponse}</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {currentView === 'sectionC' && (
            <>
              <button className="link-btn" onClick={() => setCurrentView('menu')} style={{marginBottom: '20px'}}>← Retour au menu principal</button>
              <div className="dossier" style={{maxWidth: '900px'}}>
                <div className="catalog-num">SECTION C — Histoire du Québec et du Canada</div>
                <div className="op-title" style={{color: 'var(--card-coral)'}}>Section C : Question longue et schéma</div>
                <p className="op-def">Consultez l'ensemble des textes et statistiques ci-dessous pour croiser les sources avant de rédiger.</p>
                {renderSélecteurPériodes()}
                
                {erreurGlobal && <div style={{backgroundColor: '#fee2e2', color: '#b91c1c', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', gap: '10px'}}><strong>Oups!</strong> {erreurGlobal}</div>}

                {loadingQuestionC ? (
                  <div className="loading"><div className="spinner"></div>Compilation du dossier ministériel (textes et statistiques)...</div>
                ) : !questionC ? (
                  <button className="btn-generer" onClick={genererQuestionC} style={{backgroundColor: 'var(--card-coral)'}}><i className="ti ti-folder-open"></i> Ouvrir le dossier documentaire de l'épreuve</button>
                ) : (
                  <div>
                    <div className="consigne-box" style={{borderColor: 'var(--card-coral)', backgroundColor: 'var(--sec-c-soft)', marginBottom: '20px'}}>
                      <span className="tag" style={{color: 'var(--card-coral)'}}>Consigne officielle ({questionC.typeTache === 'description' ? 'Tâche de description /8' : "Tâche d'explication /8"})</span>
                      <p style={{marginBottom: '10px', fontStyle: 'italic'}}>{questionC.contexte}</p><p style={{fontWeight: '600', fontSize: '16px'}}>{questionC.consigne}</p><BoutonLecture texte={questionC.consigne} />
                    </div>
                    <div style={{marginBottom: '20px', border: '1px solid var(--ligne)', borderRadius: '6px', background: '#fff', padding: '16px'}}>
                      <div style={{fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', color: 'var(--card-coral)', marginBottom: '10px'}}>Banque de documents ({questionC.documents?.length || 0} documents disponibles) :</div>
                      <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px'}}>
                        {questionC.documents?.map((doc: any, index: number) => (
                          <button key={index} onClick={() => setActiveDocIndex(index)} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '4px', border: activeDocIndex === index ? '2px solid var(--card-coral)' : '1px solid var(--ligne)', backgroundColor: activeDocIndex === index ? 'var(--card-coral)' : 'var(--bg-surface-soft)', color: activeDocIndex === index ? '#fff' : '#333', cursor: 'pointer', fontWeight: 'bold' }}>Doc {String.fromCharCode(65 + index)} ({doc.typeDoc || 'Texte'})</button>
                        ))}
                      </div>
                      {questionC.documents && questionC.documents[activeDocIndex] && (
                        <div className="piece" style={{margin: 0, backgroundColor: 'var(--bg-surface-soft)', borderLeft: '4px solid var(--card-coral)'}}>
                          <span className="tag" style={{backgroundColor: 'var(--card-coral)', color: '#fff'}}>Document {String.fromCharCode(65 + activeDocIndex)} — [{questionC.documents[activeDocIndex].typeDoc}] {questionC.documents[activeDocIndex].titre}</span>
                          {questionC.documents[activeDocIndex].typeDoc?.toLowerCase().includes('statistique') ? (
                            <div style={{marginTop: '12px', padding: '20px', backgroundColor: '#ebf5fb', border: '2px solid #2980b9', borderRadius: '6px'}}><div style={{fontWeight: 'bold', color: '#1b4f72', marginBottom: '10px', textAlign: 'center'}}>📊 DONNÉES STATISTIQUES OFFICIELLES</div><div style={{padding: '15px', background: '#fff', borderRadius: '4px', color: '#2c3e50', fontSize: '15px', lineHeight: '1.7', border: '1px solid #aed6f1'}}>{questionC.documents[activeDocIndex].texte}</div></div>
                          ) : ( <p style={{fontSize: '15px', lineHeight: '1.7', marginTop: '10px', whiteSpace: 'pre-wrap'}}>{questionC.documents[activeDocIndex].texte}</p> )}
                          <BoutonLecture texte={questionC.documents[activeDocIndex].texte} />
                        </div>
                      )}
                    </div>
                    <div style={{marginBottom: '10px', fontWeight: 'bold', color: '#333'}}>Rédigez votre réponse élaborée :</div>
                    <textarea placeholder="Intégrez des faits et citez les documents pertinents dans votre rédaction (Introduction, Développement, Conclusion)..." value={reponseC} onChange={(e) => setReponseC(e.target.value)} style={{minHeight: '260px'}} />
                    <div className="actions">
                      <button className="btn-generer" onClick={corrigerReponseC} disabled={loadingCorrectionC || reponseC.trim() === ""} style={{backgroundColor: 'var(--card-coral)'}}>{loadingCorrectionC ? 'Évaluation selon la grille ministérielle...' : '✍️ Soumettre ma réponse officielle'}</button>
                      <button className="link-btn" onClick={() => { setQuestionC(null); setFeedbackC(null); setReponseC(""); }} style={{color: 'var(--card-coral)'}}>Changer de dossier ↺</button>
                    </div>
                    {loadingCorrectionC && <div className="loading"><div className="spinner"></div>CorrigeMoi évalue votre utilisation des documents et applique la grille sur 8 points...</div>}
                    
                    {feedbackC && (
                      <div className="verdict" style={{borderTopColor: 'var(--card-coral)'}}>
                        <div className="stamp" style={{borderColor: 'var(--card-coral)', color: 'var(--card-coral)'}}>✅ Évaluation officielle — Note globale : {feedbackC.noteGlobale}</div>
                        <div className="feedback-body" style={{marginBottom: '16px'}}>{feedbackC.commentaireGlobal}</div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px'}}>
                          <div style={{background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '4px'}}><span className="label" style={{color: 'var(--card-coral)'}}>{feedbackC.detailPartie1?.titre} ({feedbackC.detailPartie1?.note})</span><p style={{fontSize: '13.5px', margin: '4px 0'}}>{feedbackC.detailPartie1?.evaluation}</p></div>
                          <div style={{background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '4px'}}><span className="label" style={{color: 'var(--card-coral)'}}>{feedbackC.detailPartie2?.titre} ({feedbackC.detailPartie2?.note})</span><p style={{fontSize: '13.5px', margin: '4px 0'}}>{feedbackC.detailPartie2?.evaluation}</p></div>
                          {feedbackC.detailPartie3 && ( <div style={{background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '4px'}}><span className="label" style={{color: 'var(--card-coral)'}}>{feedbackC.detailPartie3?.titre} ({feedbackC.detailPartie3?.note})</span><p style={{fontSize: '13.5px', margin: '4px 0'}}>{feedbackC.detailPartie3?.evaluation}</p></div> )}
                        </div>
                        {feedbackC.pisteAmelioration && <div className="feedback-section"><span className="label">Conseil de l'archiviste</span>{feedbackC.pisteAmelioration}</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
} 