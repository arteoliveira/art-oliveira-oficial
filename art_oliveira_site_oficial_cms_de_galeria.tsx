import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import {
  Menu,
  X,
  ArrowUpRight,
  ArrowLeft,
  Maximize2,
  Check,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  ShoppingBag,
  MessageSquare,
  Send,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
  Sparkles,
  Layers,
  User,
  Sliders,
  Info,
  ExternalLink,
  Upload,
  CheckCircle2,
  Clock,
  CreditCard,
  Search
} from 'lucide-react';

// ============================================================================
// 1. CONFIGURAÇÃO FIREBASE (NUVEM REAL + FALLBACK SEGURO)
// ============================================================================
let db = null;
let auth = null;
let firebaseEnabled = false;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'art-oliveira-official';

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    firebaseEnabled = true;
  }
} catch (error) {
  console.warn('Firebase em modo de pré-configuração:', error);
  firebaseEnabled = false;
}

// ============================================================================
// 2. DADOS INICIAIS AUTÊNTICOS (SEM INVENÇÕES BIOGRÁFICAS)
// ============================================================================
const INITIAL_CATEGORIES = [
  'Desenho realista a lápis',
  'Retratos',
  'Pintura em tela',
  'Arte mural',
  'Projetos especiais',
  'Outros trabalhos artísticos'
];

const INITIAL_ARTWORKS = [
  {
    id: 'obra-demo-1',
    title: 'Estudo de Expressão I (Obra de Demonstração)',
    year: '2024',
    technique: 'Grafite e carvão sobre papel de algodão 300g',
    dimensions: '50 × 70 cm',
    category: 'Desenho realista a lápis',
    description:
      'Exploração minuciosa da luz, textura da pele e profundidade emocional através do grafite realista. Obra demonstrativa substituível pelo artista no painel administrativo.',
    imageUrl:
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1400&q=85',
    availability: 'available', // 'available' | 'sold' | 'private' | 'inquiry'
    inShop: true,
    priceCVE: 45000,
    featuredHome: true,
    createdAt: 1730000004
  },
  {
    id: 'obra-demo-2',
    title: 'Olhar de São Nicolau (Obra de Demonstração)',
    year: '2024',
    technique: 'Lápis de grafite Staedtler Mars Lumograph sobre papel Fabriano',
    dimensions: '42 × 59,4 cm (A2)',
    category: 'Retratos',
    description:
      'Retrato realista centrado na força silenciosa do olhar humano e na identidade insular cabo-verdiana. Exemplo de portfólio editável no CMS.',
    imageUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=85',
    availability: 'available',
    inShop: true,
    priceCVE: 38000,
    featuredHome: true,
    createdAt: 1730000003
  },
  {
    id: 'obra-demo-3',
    title: 'Matéria e Horizonte (Obra de Demonstração)',
    year: '2023',
    technique: 'Acrílico e pigmentos naturais sobre tela de linho',
    dimensions: '100 × 120 cm',
    category: 'Pintura em tela',
    description:
      'Composição pictórica contemporânea que dialoga com a textura vulcânica das ilhas e o contraste atmosférico entre luz e sombra.',
    imageUrl:
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1200&q=85',
    availability: 'available',
    inShop: true,
    priceCVE: 75000,
    featuredHome: true,
    createdAt: 1730000002
  },
  {
    id: 'obra-demo-4',
    title: 'Intervenção Urbana — Memória Viva (Obra de Demonstração)',
    year: '2023',
    technique: 'Pintura mural em fachada exterior',
    dimensions: '450 × 320 cm',
    category: 'Arte mural',
    description:
      'Registo de intervenção mural em espaço público, aproximando o realismo expressivo da comunidade e da arquitetura local.',
    imageUrl:
      'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1200&q=85',
    availability: 'private',
    inShop: false,
    priceCVE: 0,
    featuredHome: true,
    createdAt: 1730000001
  },
  {
    id: 'obra-demo-5',
    title: 'Luz Contida (Obra de Demonstração)',
    year: '2024',
    technique: 'Grafite e esfuminho sobre papel',
    dimensions: '35 × 50 cm',
    category: 'Desenho realista a lápis',
    description:
      'Estudo tonal focado em contrastes suaves e precisão anatómica. Obra demonstrativa pronta a ser substituída no painel privado.',
    imageUrl:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=85',
    availability: 'sold',
    inShop: true,
    priceCVE: 32000,
    featuredHome: false,
    createdAt: 1730000000
  },
  {
    id: 'obra-demo-6',
    title: 'Diálogo Cromático (Obra de Demonstração)',
    year: '2023',
    technique: 'Técnica mista sobre tela',
    dimensions: '80 × 80 cm',
    category: 'Projetos especiais',
    description:
      'Experiência visual desenvolvida no âmbito de intercâmbio artístico internacional.',
    imageUrl:
      'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1200&q=85',
    availability: 'inquiry',
    inShop: false,
    priceCVE: 60000,
    featuredHome: false,
    createdAt: 1729999999
  }
];

const INITIAL_SITE_CONFIG = {
  artistName: 'ART OLIVEIRA',
  subtitle: 'Artista visual cabo-verdiano',
  heroQuote: '“Explorando a arte através do realismo, da expressão e da criatividade.”',
  heroImageUrl:
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1600&q=85',
  heroCaption: 'Obra em destaque — Substituível no Painel Administrativo',
  manifestoTitle: 'O rigor do traço como linguagem universal.',
  manifestoBody:
    'Desde a ilha de São Nicolau para diálogos artísticos internacionais, cada obra nasce da observação atenta da condição humana, do domínio técnico do grafite realista e da liberdade expressiva da pintura contemporânea.',
  artistPhotoUrl:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=85',
  bioLead:
    'Art Oliveira é um artista visual cabo-verdiano, natural de São Nicolau, cuja prática artística explora diferentes linguagens e formas de expressão visual.',
  bioParagraph1:
    'O seu trabalho destaca-se especialmente pelo desenho realista a lápis, com particular atenção aos retratos, aos detalhes, à expressão e à representação da realidade. Cada traço procura captar não apenas a semelhança física, mas a presença, o silêncio e a profundidade humana do sujeito retratado.',
  bioParagraph2:
    'A sua produção artística estende-se também à pintura em tela, intervenções murais e outras experiências visuais, mantendo um diálogo constante entre a precisão técnica do realismo e a liberdade plástica contemporânea.',
  bioParagraph3:
    'A sua trajetória inclui participação em iniciativas e exposições internacionais, incluindo a Bienal de Jovens Criadores da CPLP, em Portugal, e experiências de exposição no Luxemburgo.',
  exhibitions: [
    {
      id: 'exp-1',
      year: 'Participação Internacional',
      title: 'Bienal de Jovens Criadores da CPLP',
      location: 'Portugal',
      description:
        'Representação artística cabo-verdiana no encontro de jovens criadores da Comunidade dos Países de Língua Portuguesa.'
    },
    {
      id: 'exp-2',
      year: 'Exposição Internacional',
      title: 'Experiências de Exposição no Luxemburgo',
      location: 'Luxemburgo',
      description:
        'Apresentação de obras visuais e intercâmbio cultural junto da comunidade e espaços expositivos no Luxemburgo.'
    }
  ],
  contacts: {
    instagramHandle: '@artoliveira_oficial',
    instagramUrl: 'https://instagram.com/artoliveira_oficial',
    whatsappNumber: '2389000000', // Editável no painel admin
    email: 'contacto@artoliveira.cv', // Editável no painel admin
    location: 'São Nicolau, Cabo Verde'
  },
  adminCredentials: {
    email: 'admin@artoliveira.cv',
    passcode: 'artoliveira2026'
  }
};

// ============================================================================
// 3. UTILITÁRIOS DE FORMATAÇÃO & WHATSAPP
// ============================================================================
const formatCVE = (value) => {
  if (!value || Number(value) <= 0) return 'Sob Consulta';
  return `${Number(value).toLocaleString('pt-PT')} CVE`;
};

const AVAILABILITY_META = {
  available: {
    label: 'Disponível',
    badgeClass: 'bg-emerald-950/90 text-emerald-100 border-emerald-800/60',
    dotClass: 'bg-emerald-400'
  },
  sold: {
    label: 'Vendido',
    badgeClass: 'bg-neutral-900 text-neutral-300 border-neutral-700',
    dotClass: 'bg-neutral-500'
  },
  private: {
    label: 'Coleção Privada',
    badgeClass: 'bg-stone-200 text-stone-800 border-stone-300',
    dotClass: 'bg-stone-600'
  },
  inquiry: {
    label: 'Sob Consulta',
    badgeClass: 'bg-amber-950/90 text-amber-100 border-amber-800/60',
    dotClass: 'bg-amber-400'
  }
};

const buildWhatsAppLink = (rawPhone, message) => {
  const cleanPhone = String(rawPhone || '2389000000').replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

// ============================================================================
// 4. COMPONENTE PRINCIPAL (APP)
// ============================================================================
export default function App() {
  // Navegação e estado público
  const [activePage, setActivePage] = useState('inicio'); // 'inicio' | 'sobre' | 'obras' | 'loja' | 'encomendas' | 'contacto' | 'admin'
  const [selectedArtworkId, setSelectedArtworkId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Filtros Galeria & Loja
  const [galleryCategory, setGalleryCategory] = useState('Todas');
  const [shopFilter, setShopFilter] = useState('all'); // 'all' | 'available' | 'sold'

  // Modais de Compra/Consulta & Login Admin
  const [checkoutArtwork, setCheckoutArtwork] = useState(null);
  const [checkoutMode, setCheckoutMode] = useState('buy'); // 'buy' | 'inquire'
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Autenticação Admin
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Estado Global do Conteúdo (Sincronizado com Firestore + Fallback Local)
  const [siteConfig, setSiteConfig] = useState(INITIAL_SITE_CONFIG);
  const [artworks, setArtworks] = useState(INITIAL_ARTWORKS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [commissions, setCommissions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [syncStatus, setSyncStatus] = useState('initializing'); // 'initializing' | 'cloud' | 'local'

  // Notificação discreta (Toast)
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Injetar fontes Google (Cormorant Garamond + Plus Jakarta Sans)
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // ==========================================================================
  // 5. AUTENTICAÇÃO & SINCRONIZAÇÃO FIRESTORE (REGRAS 1, 2 e 3)
  // ==========================================================================
  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      setSyncStatus('local');
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn('Fallback para modo local:', err);
        setSyncStatus('local');
      }
    };

    initAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!firebaseEnabled || !db || !firebaseUser) return;

    // 1. Configuração Geral do Site (Public Data)
    const configDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'main');
    const unsubConfig = onSnapshot(
      configDocRef,
      (snap) => {
        setSyncStatus('cloud');
        if (snap.exists()) {
          const data = snap.data();
          setSiteConfig((prev) => ({
            ...prev,
            ...data,
            contacts: { ...prev.contacts, ...(data.contacts || {}) },
            adminCredentials: { ...prev.adminCredentials, ...(data.adminCredentials || {}) }
          }));
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }
        } else {
          // Inicializar na nuvem na primeira abertura
          setDoc(configDocRef, {
            ...INITIAL_SITE_CONFIG,
            categories: INITIAL_CATEGORIES
          }).catch(() => {});
        }
      },
      (err) => {
        console.warn('Erro ao ler configurações:', err);
        setSyncStatus('local');
      }
    );

    // 2. Coleção de Obras
    const artworksColRef = collection(db, 'artifacts', appId, 'public', 'data', 'artworks');
    const unsubArtworks = onSnapshot(
      artworksColRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setArtworks(list);
        } else {
          // Popular com obras demonstrativas iniciais
          INITIAL_ARTWORKS.forEach((art) => {
            const ref = doc(db, 'artifacts', appId, 'public', 'data', 'artworks', art.id);
            setDoc(ref, art).catch(() => {});
          });
        }
      },
      (err) => console.warn('Erro ao ler obras:', err)
    );

    // 3. Pedidos de Encomendas & Consultas
    const commissionsColRef = collection(db, 'artifacts', appId, 'public', 'data', 'commissions');
    const unsubCommissions = onSnapshot(
      commissionsColRef,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setCommissions(list);
      },
      (err) => console.warn('Erro ao ler encomendas:', err)
    );

    // 4. Mensagens de Contacto
    const messagesColRef = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
    const unsubMessages = onSnapshot(
      messagesColRef,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setMessages(list);
      },
      (err) => console.warn('Erro ao ler mensagens:', err)
    );

    return () => {
      unsubConfig();
      unsubArtworks();
      unsubCommissions();
      unsubMessages();
    };
  }, [firebaseUser]);

  // ==========================================================================
  // 6. OPERAÇÕES CRUD (NUVEM + ESTADO IMEDIATO)
  // ==========================================================================
  const saveSiteConfig = async (updatedConfig, updatedCategories = categories) => {
    setSiteConfig(updatedConfig);
    setCategories(updatedCategories);
    if (firebaseEnabled && db && firebaseUser) {
      try {
        const configDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_settings', 'main');
        await setDoc(configDocRef, { ...updatedConfig, categories: updatedCategories }, { merge: true });
      } catch (err) {
        console.error('Erro ao guardar configuração:', err);
      }
    }
    showToast('Alterações publicadas com sucesso.');
  };

  const saveArtwork = async (artworkData, isNew = false) => {
    const id = isNew ? `obra-${Date.now()}` : artworkData.id;
    const payload = {
      ...artworkData,
      id,
      priceCVE: Number(artworkData.priceCVE) || 0,
      createdAt: artworkData.createdAt || Date.now()
    };

    if (isNew) {
      setArtworks((prev) => [payload, ...prev]);
    } else {
      setArtworks((prev) => prev.map((a) => (a.id === id ? payload : a)));
    }

    if (firebaseEnabled && db && firebaseUser) {
      try {
        const ref = doc(db, 'artifacts', appId, 'public', 'data', 'artworks', id);
        await setDoc(ref, payload, { merge: true });
      } catch (err) {
        console.error('Erro ao guardar obra:', err);
      }
    }
    showToast(isNew ? 'Nova obra publicada na galeria!' : 'Obra atualizada com sucesso.');
  };

  const removeArtwork = async (artworkId) => {
    setArtworks((prev) => prev.filter((a) => a.id !== artworkId));
    if (selectedArtworkId === artworkId) setSelectedArtworkId(null);

    if (firebaseEnabled && db && firebaseUser) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'artworks', artworkId));
      } catch (err) {
        console.error('Erro ao eliminar obra:', err);
      }
    }
    showToast('Obra removida do catálogo.');
  };

  const submitCommissionRequest = async (commissionPayload) => {
    const newOrder = {
      ...commissionPayload,
      id: `enc-${Date.now()}`,
      status: 'Pendente',
      createdAt: Date.now()
    };
    setCommissions((prev) => [newOrder, ...prev]);

    if (firebaseEnabled && db && firebaseUser) {
      try {
        const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'commissions');
        await addDoc(colRef, newOrder);
      } catch (err) {
        console.error('Erro ao registar encomenda:', err);
      }
    }
    return newOrder;
  };

  const updateCommissionStatus = async (id, status) => {
    setCommissions((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    if (firebaseEnabled && db && firebaseUser) {
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'commissions', id), { status });
      } catch (err) {
        console.warn('Atualização de estado local:', err);
      }
    }
    showToast(`Estado da encomenda atualizado para "${status}".`);
  };

  const submitContactMessage = async (msgPayload) => {
    const newMsg = {
      ...msgPayload,
      id: `msg-${Date.now()}`,
      read: false,
      createdAt: Date.now()
    };
    setMessages((prev) => [newMsg, ...prev]);

    if (firebaseEnabled && db && firebaseUser) {
      try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), newMsg);
      } catch (err) {
        console.error('Erro ao guardar mensagem:', err);
      }
    }
    return newMsg;
  };

  // ==========================================================================
  // 7. HELPERS DE NAVEGAÇÃO
  // ==========================================================================
  const navigateTo = (page, artworkId = null) => {
    setActivePage(page);
    setSelectedArtworkId(artworkId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openArtworkDetail = (artwork) => {
    setSelectedArtworkId(artwork.id);
    setActivePage('obras');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCheckoutModal = (artwork, mode = 'buy') => {
    setCheckoutArtwork(artwork);
    setCheckoutMode(mode);
  };

  const selectedArtwork = useMemo(
    () => artworks.find((a) => a.id === selectedArtworkId) || null,
    [artworks, selectedArtworkId]
  );

  // ==========================================================================
  // 8. RENDERIZAÇÃO PRINCIPAL
  // ==========================================================================
  return (
    <div
      className="min-h-screen bg-[#FAF9F6] text-[#0A0A0A] flex flex-col selection:bg-[#0A0A0A] selection:text-white"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Estilos de Tipografia Editorial */}
      <style>{`
        .font-serif-editorial {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Notificação Flutuante */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A0A0A] text-white px-5 py-3.5 rounded-sm shadow-2xl border border-neutral-800 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs tracking-wide">{toast.msg}</span>
        </div>
      )}

      {/* ====================================================================
          BARRA DE NAVEGAÇÃO SUPERIOR (MINIMALISTA & EDITORIAL)
         ==================================================================== */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          {/* Assinatura / Logótipo */}
          <button
            onClick={() => navigateTo('inicio')}
            className="text-left group focus:outline-none"
          >
            <span className="font-serif-editorial text-2xl sm:text-[26px] font-semibold tracking-[0.18em] text-[#0A0A0A] block leading-none">
              {siteConfig.artistName}
            </span>
            <span className="text-[10px] uppercase tracking-[0.28em] text-neutral-500 mt-1 block">
              Cabo Verde
            </span>
          </button>

          {/* Menu Desktop: INÍCIO | SOBRE | OBRAS | LOJA | ENCOMENDAS | CONTACTO */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { id: 'inicio', label: 'INÍCIO' },
              { id: 'sobre', label: 'SOBRE' },
              { id: 'obras', label: 'OBRAS' },
              { id: 'loja', label: 'LOJA' },
              { id: 'encomendas', label: 'ENCOMENDAS' },
              { id: 'contacto', label: 'CONTACTO' }
            ].map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`text-xs tracking-[0.2em] transition-colors relative py-1 ${
                    isActive
                      ? 'text-[#0A0A0A] font-semibold'
                      : 'text-neutral-500 hover:text-[#0A0A0A]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#0A0A0A]" />
                  )}
                </button>
              );
            })}

            {/* Botão Discreto de Administração (visível apenas após iniciar sessão) */}
            {isAdminAuthenticated && (
              <button
                onClick={() => navigateTo('admin')}
                className={`ml-2 px-3.5 py-1.5 text-[11px] tracking-[0.18em] uppercase border transition-all flex items-center gap-1.5 ${
                  activePage === 'admin'
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                    : 'bg-neutral-100 text-[#0A0A0A] border-neutral-300 hover:bg-[#0A0A0A] hover:text-white'
                }`}
              >
                <Sliders className="w-3 h-3" />
                ADMIN
              </button>
            )}
          </nav>

          {/* Controlo Mobile */}
          <div className="flex items-center gap-3 lg:hidden">
            {isAdminAuthenticated && (
              <button
                onClick={() => navigateTo('admin')}
                className="px-2.5 py-1 text-[10px] tracking-[0.16em] uppercase bg-[#0A0A0A] text-white"
              >
                ADMIN
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#0A0A0A] focus:outline-none"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Gaveta Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0A0A0A] text-white px-6 py-8 border-t border-neutral-800 animate-fade-in">
            <div className="flex flex-col space-y-5">
              {[
                { id: 'inicio', label: 'INÍCIO' },
                { id: 'sobre', label: 'SOBRE' },
                { id: 'obras', label: 'OBRAS' },
                { id: 'loja', label: 'LOJA' },
                { id: 'encomendas', label: 'ENCOMENDAS' },
                { id: 'contacto', label: 'CONTACTO' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`text-left text-sm tracking-[0.22em] py-1 ${
                    activePage === item.id ? 'text-white font-semibold' : 'text-neutral-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ====================================================================
          CONTEÚDO PRINCIPAL (VISTAS PÚBLICAS + PAINEL ADMIN PRIVADO)
         ==================================================================== */}
      <main className="flex-grow">
        {activePage === 'inicio' && (
          <HomePage
            siteConfig={siteConfig}
            artworks={artworks}
            navigateTo={navigateTo}
            openArtworkDetail={openArtworkDetail}
            openCheckoutModal={openCheckoutModal}
          />
        )}

        {activePage === 'sobre' && (
          <AboutPage siteConfig={siteConfig} navigateTo={navigateTo} />
        )}

        {activePage === 'obras' && (
          <GalleryPage
            artworks={artworks}
            categories={categories}
            selectedCategory={galleryCategory}
            setSelectedCategory={setGalleryCategory}
            selectedArtwork={selectedArtwork}
            setSelectedArtworkId={setSelectedArtworkId}
            setLightboxImage={setLightboxImage}
            openCheckoutModal={openCheckoutModal}
            navigateTo={navigateTo}
          />
        )}

        {activePage === 'loja' && (
          <ShopPage
            artworks={artworks}
            shopFilter={shopFilter}
            setShopFilter={setShopFilter}
            openCheckoutModal={openCheckoutModal}
            openArtworkDetail={openArtworkDetail}
            navigateTo={navigateTo}
          />
        )}

        {activePage === 'encomendas' && (
          <CommissionsPage
            siteConfig={siteConfig}
            submitCommissionRequest={submitCommissionRequest}
            showToast={showToast}
          />
        )}

        {activePage === 'contacto' && (
          <ContactPage
            siteConfig={siteConfig}
            submitContactMessage={submitContactMessage}
            showToast={showToast}
          />
        )}

        {activePage === 'admin' && isAdminAuthenticated && (
          <AdminDashboard
            siteConfig={siteConfig}
            saveSiteConfig={saveSiteConfig}
            artworks={artworks}
            saveArtwork={saveArtwork}
            removeArtwork={removeArtwork}
            categories={categories}
            commissions={commissions}
            updateCommissionStatus={updateCommissionStatus}
            messages={messages}
            syncStatus={syncStatus}
            onLogout={() => {
              setIsAdminAuthenticated(false);
              navigateTo('inicio');
              showToast('Sessão administrativa terminada.');
            }}
          />
        )}
      </main>

      {/* ====================================================================
          RODAPÉ EDITORIAL + ACESSO DISCRETO DE ADMINISTRAÇÃO
         ==================================================================== */}
      <footer className="bg-[#0A0A0A] text-white border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-neutral-800/80">
            <div className="md:col-span-5">
              <p className="font-serif-editorial text-2xl tracking-[0.2em] text-white">
                {siteConfig.artistName}
              </p>
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-400 mt-2">
                {siteConfig.subtitle}
              </p>
              <p className="text-sm text-neutral-400 mt-5 max-w-sm leading-relaxed font-light">
                {siteConfig.heroQuote}
              </p>
            </div>

            <div className="md:col-span-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 mb-4">
                Navegação
              </p>
              <div className="grid grid-cols-2 gap-2.5 text-xs tracking-[0.14em] text-neutral-300">
                <button onClick={() => navigateTo('inicio')} className="text-left hover:text-white">
                  INÍCIO
                </button>
                <button onClick={() => navigateTo('sobre')} className="text-left hover:text-white">
                  SOBRE
                </button>
                <button onClick={() => navigateTo('obras')} className="text-left hover:text-white">
                  OBRAS
                </button>
                <button onClick={() => navigateTo('loja')} className="text-left hover:text-white">
                  LOJA
                </button>
                <button
                  onClick={() => navigateTo('encomendas')}
                  className="text-left hover:text-white"
                >
                  ENCOMENDAS
                </button>
                <button
                  onClick={() => navigateTo('contacto')}
                  className="text-left hover:text-white"
                >
                  CONTACTO
                </button>
              </div>
            </div>

            <div className="md:col-span-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 mb-4">
                Contacto Oficial
              </p>
              <div className="space-y-2.5 text-xs text-neutral-300">
                <a
                  href={siteConfig.contacts.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{siteConfig.contacts.instagramHandle}</span>
                </a>
                <a
                  href={`mailto:${siteConfig.contacts.email}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{siteConfig.contacts.email}</span>
                </a>
                <div className="flex items-center gap-2 text-neutral-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{siteConfig.contacts.location}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500 tracking-wider">
            <p>© {new Date().getFullYear()} ART OLIVEIRA. Todos os direitos reservados.</p>

            {/* Ícone discreto de acesso privado do artista */}
            <div className="flex items-center gap-4">
              {isAdminAuthenticated ? (
                <button
                  onClick={() => navigateTo('admin')}
                  className="flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Painel do Artista Ativo</span>
                </button>
              ) : (
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-300 transition-colors"
                  title="Área Reservada ao Artista"
                >
                  <Lock className="w-3 h-3" />
                  <span>Área Reservada</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* ====================================================================
          MODAL LIGHTBOX (ZOOM ECRÃ INTEIRO NAS OBRAS)
         ==================================================================== */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-[#0A0A0A]/96 flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 border border-white/20 rounded-full"
            aria-label="Fechar ampliação"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage.url}
            alt={lightboxImage.title}
            className="max-h-[82vh] max-w-[94vw] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="mt-4 text-center text-white">
            <p className="font-serif-editorial text-xl tracking-wide">{lightboxImage.title}</p>
            <p className="text-xs text-neutral-400 mt-1">{lightboxImage.meta}</p>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL DE RESERVA / COMPRA / CONSULTA DE OBRA (WHATSAPP + SISP/VINTI4 READY)
         ==================================================================== */}
      {checkoutArtwork && (
        <CheckoutWhatsAppModal
          artwork={checkoutArtwork}
          mode={checkoutMode}
          siteConfig={siteConfig}
          onClose={() => setCheckoutArtwork(null)}
          submitCommissionRequest={submitCommissionRequest}
          showToast={showToast}
        />
      )}

      {/* ====================================================================
          MODAL DE AUTENTICAÇÃO PRIVADA DO ARTISTA
         ==================================================================== */}
      {loginModalOpen && (
        <AdminLoginModal
          credentials={siteConfig.adminCredentials}
          onClose={() => setLoginModalOpen(false)}
          onSuccess={() => {
            setIsAdminAuthenticated(true);
            setLoginModalOpen(false);
            navigateTo('admin');
            showToast('Bem-vindo ao Painel Administrativo, Art Oliveira.');
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// PÁGINA 1: INÍCIO (HOME)
// ============================================================================
function HomePage({ siteConfig, artworks, navigateTo, openArtworkDetail, openCheckoutModal }) {
  const featuredWorks = useMemo(() => {
    const flagged = artworks.filter((a) => a.featuredHome);
    return (flagged.length > 0 ? flagged : artworks).slice(0, 4);
  }, [artworks]);

  return (
    <div className="animate-fade-in">
      {/* HERO SECTION MONUMENTAL */}
      <section className="relative bg-[#0A0A0A] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Coluna Editorial */}
          <div className="lg:col-span-6 space-y-7 z-10">
            <div className="inline-flex items-center gap-2.5 border border-neutral-800 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.26em] text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8B0A4]" />
              <span>{siteConfig.subtitle}</span>
            </div>

            <h1 className="font-serif-editorial text-5xl sm:text-6xl lg:text-7xl font-normal tracking-[0.12em] leading-[1.05] text-white">
              {siteConfig.artistName}
            </h1>

            <p className="font-serif-editorial italic text-xl sm:text-2xl text-neutral-300 leading-relaxed max-w-xl">
              {siteConfig.heroQuote}
            </p>

            <div className="pt-3 flex flex-wrap gap-3.5">
              <button
                onClick={() => navigateTo('obras')}
                className="px-7 py-3.5 bg-white text-[#0A0A0A] text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                <span>Explorar Obras</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigateTo('sobre')}
                className="px-7 py-3.5 border border-neutral-700 text-white text-xs uppercase tracking-[0.2em] hover:border-white transition-colors"
              >
                Conhecer o Artista
              </button>

              <button
                onClick={() => navigateTo('contacto')}
                className="px-6 py-3.5 text-neutral-400 hover:text-white text-xs uppercase tracking-[0.2em] transition-colors"
              >
                Entrar em Contacto
              </button>
            </div>
          </div>

          {/* Coluna Obra de Destaque */}
          <div className="lg:col-span-6">
            <div className="relative group">
              <div className="aspect-[4/5] w-full overflow-hidden bg-neutral-900 border border-neutral-800">
                <img
                  src={siteConfig.heroImageUrl}
                  alt={siteConfig.artistName}
                  className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] tracking-[0.14em] text-neutral-500">
                <span>{siteConfig.heroCaption}</span>
                <span>SÃO NICOLAU · CABO VERDE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFESTO ARTÍSTICO */}
      <section className="py-20 sm:py-28 px-5 sm:px-8 lg:px-12 max-w-5xl mx-auto text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#8C857B] mb-4">
          Prática & Expressão Visual
        </p>
        <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-5xl font-normal text-[#0A0A0A] leading-tight">
          {siteConfig.manifestoTitle}
        </h2>
        <p className="mt-6 text-neutral-600 text-base sm:text-lg font-light leading-relaxed max-w-3xl mx-auto">
          {siteConfig.manifestoBody}
        </p>
      </section>

      {/* SELEÇÃO DE OBRAS RECENTES */}
      <section className="pb-24 px-5 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-neutral-200 pb-6 mb-12 gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.26em] text-neutral-500">
              Curadoria Selecionada
            </p>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#0A0A0A] mt-1">
              Obras em Destaque
            </h2>
          </div>
          <button
            onClick={() => navigateTo('obras')}
            className="text-xs uppercase tracking-[0.2em] text-[#0A0A0A] flex items-center gap-1.5 hover:opacity-70 transition-opacity"
          >
            <span>Ver Catálogo Completo ({artworks.length})</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
          {featuredWorks.map((work, idx) => {
            const status = AVAILABILITY_META[work.availability] || AVAILABILITY_META.available;
            return (
              <article
                key={work.id}
                className={`group cursor-pointer ${idx % 2 === 1 ? 'md:mt-12' : ''}`}
                onClick={() => openArtworkDetail(work)}
              >
                <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden border border-neutral-200/80">
                  <img
                    src={work.imageUrl}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  />
                  <span
                    className={`absolute top-4 left-4 px-3 py-1 text-[10px] uppercase tracking-[0.18em] border ${status.badgeClass}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      {work.category} · {work.year}
                    </p>
                    <h3 className="font-serif-editorial text-2xl text-[#0A0A0A] mt-1 group-hover:underline underline-offset-4">
                      {work.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      {work.technique} — {work.dimensions}
                    </p>
                  </div>

                  {work.inShop && work.availability === 'available' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCheckoutModal(work, 'buy');
                      }}
                      className="shrink-0 px-3.5 py-2 border border-neutral-300 text-[11px] uppercase tracking-[0.16em] hover:bg-[#0A0A0A] hover:text-white hover:border-[#0A0A0A] transition-colors"
                    >
                      {formatCVE(work.priceCVE)}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* SECÇÃO DE CONVITE PARA ENCOMENDAS PERSONALIZADAS */}
      <section className="bg-[#F2F0EC] border-t border-neutral-200 py-20 px-5 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8">
            <p className="text-[11px] uppercase tracking-[0.26em] text-[#8C857B]">
              Comissões Artísticas & Retratos
            </p>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#0A0A0A] mt-2">
              Encomende uma obra original ou retrato realista exclusivo.
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base font-light mt-3 max-w-2xl leading-relaxed">
              Disponível para retratos realistas a lápis a partir de fotografia, pinturas em tela
              sob medida e projetos artísticos especiais para colecionadores particulares e
              instituições.
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end">
            <button
              onClick={() => navigateTo('encomendas')}
              className="px-8 py-4 bg-[#0A0A0A] text-white text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors flex items-center gap-2"
            >
              <span>Solicitar Encomenda</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// PÁGINA 2: SOBRE O ARTISTA
// ============================================================================
function AboutPage({ siteConfig, navigateTo }) {
  return (
    <div className="animate-fade-in">
      {/* Cabeçalho Editorial */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-20">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#8C857B]">
          Biografia & Trajetória
        </p>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl text-[#0A0A0A] mt-2">
          {siteConfig.artistName}
        </h1>
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 mt-2">
          {siteConfig.subtitle} · Natural de São Nicolau
        </p>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Retrato Profissional do Artista */}
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] bg-neutral-200 overflow-hidden border border-neutral-300">
              <img
                src={siteConfig.artistPhotoUrl}
                alt="Art Oliveira — Retrato"
                className="w-full h-full object-cover grayscale contrast-105"
              />
            </div>
            <p className="text-[11px] tracking-[0.16em] uppercase text-neutral-500 mt-3">
              Art Oliveira · São Nicolau, Cabo Verde
            </p>
          </div>

          {/* Biografia Oficial */}
          <div className="lg:col-span-7 space-y-6">
            <p className="font-serif-editorial text-2xl sm:text-3xl text-[#0A0A0A] leading-snug">
              {siteConfig.bioLead}
            </p>

            <div className="h-[1px] w-16 bg-neutral-300" />

            <p className="text-neutral-700 text-base leading-relaxed font-light">
              {siteConfig.bioParagraph1}
            </p>

            <p className="text-neutral-700 text-base leading-relaxed font-light">
              {siteConfig.bioParagraph2}
            </p>

            <p className="text-neutral-700 text-base leading-relaxed font-light">
              {siteConfig.bioParagraph3}
            </p>

            {/* Áreas de Prática Artística */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-neutral-200">
              {[
                'Desenho Realista a Lápis',
                'Retratos Expressivos',
                'Pintura em Tela',
                'Intervenções Murais'
              ].map((area) => (
                <div key={area} className="p-3.5 bg-white border border-neutral-200/90">
                  <p className="text-xs font-medium text-[#0A0A0A] leading-snug">{area}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRAJETÓRIA & EXPOSIÇÕES (APENAS FACTOS REAIS + GESTÃO DINÂMICA NO ADMIN) */}
      <section className="bg-[#0A0A0A] text-white py-20 px-5 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#B8B0A4]">
              Percurso & Presença Internacional
            </p>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl text-white mt-2">
              Exposições & Participações
            </h2>
          </div>

          <div className="divide-y divide-neutral-800 border-t border-b border-neutral-800">
            {siteConfig.exhibitions.map((exp) => (
              <div
                key={exp.id}
                className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline"
              >
                <div className="md:col-span-3 text-xs uppercase tracking-[0.2em] text-[#B8B0A4]">
                  {exp.year}
                </div>
                <div className="md:col-span-5">
                  <h3 className="font-serif-editorial text-2xl text-white">{exp.title}</h3>
                  <p className="text-xs uppercase tracking-[0.16em] text-neutral-400 mt-1">
                    {exp.location}
                  </p>
                </div>
                <div className="md:col-span-4 text-sm text-neutral-400 font-light leading-relaxed">
                  {exp.description}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <button
              onClick={() => navigateTo('obras')}
              className="px-7 py-3.5 bg-white text-[#0A0A0A] text-xs uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors"
            >
              Explorar Galeria de Obras
            </button>
            <button
              onClick={() => navigateTo('contacto')}
              className="px-7 py-3.5 border border-neutral-700 text-white text-xs uppercase tracking-[0.2em] hover:border-white transition-colors"
            >
              Contactar para Exposições & Imprensa
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// PÁGINA 3: GALERIA DE OBRAS + VISTA INDIVIDUAL DE OBRA
// ============================================================================
function GalleryPage({
  artworks,
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedArtwork,
  setSelectedArtworkId,
  setLightboxImage,
  openCheckoutModal,
  navigateTo
}) {
  // Se uma obra estiver selecionada, renderiza a Página Individual da Obra
  if (selectedArtwork) {
    const status = AVAILABILITY_META[selectedArtwork.availability] || AVAILABILITY_META.available;

    return (
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16 animate-fade-in">
        <button
          onClick={() => setSelectedArtworkId(null)}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-[#0A0A0A] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar à Galeria</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Fotografia em Alta Resolução + Botão de Zoom */}
          <div className="lg:col-span-7 bg-neutral-100 border border-neutral-200 relative group">
            <img
              src={selectedArtwork.imageUrl}
              alt={selectedArtwork.title}
              className="w-full max-h-[80vh] object-contain mx-auto cursor-zoom-in"
              onClick={() =>
                setLightboxImage({
                  url: selectedArtwork.imageUrl,
                  title: selectedArtwork.title,
                  meta: `${selectedArtwork.technique} · ${selectedArtwork.dimensions} (${selectedArtwork.year})`
                })
              }
            />
            <button
              onClick={() =>
                setLightboxImage({
                  url: selectedArtwork.imageUrl,
                  title: selectedArtwork.title,
                  meta: `${selectedArtwork.technique} · ${selectedArtwork.dimensions} (${selectedArtwork.year})`
                })
              }
              className="absolute bottom-4 right-4 bg-[#0A0A0A]/85 text-white px-4 py-2 text-xs uppercase tracking-[0.16em] flex items-center gap-2 hover:bg-[#0A0A0A] transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Ampliar Obra</span>
            </button>
          </div>

          {/* Ficha Técnica Completa */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 text-[10px] uppercase tracking-[0.18em] border ${status.badgeClass}`}
              >
                {status.label}
              </span>
              <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                {selectedArtwork.category}
              </span>
            </div>

            <h1 className="font-serif-editorial text-3xl sm:text-5xl text-[#0A0A0A] leading-tight">
              {selectedArtwork.title}
            </h1>

            <div className="border-t border-b border-neutral-200 py-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Ano de criação</span>
                <span className="font-medium text-[#0A0A0A]">{selectedArtwork.year}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500 shrink-0">Técnica</span>
                <span className="font-medium text-[#0A0A0A] text-right">
                  {selectedArtwork.technique}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Dimensões</span>
                <span className="font-medium text-[#0A0A0A]">{selectedArtwork.dimensions}</span>
              </div>
              {selectedArtwork.inShop && selectedArtwork.priceCVE > 0 && (
                <div className="flex justify-between pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500">Valor</span>
                  <span className="font-serif-editorial text-xl font-semibold text-[#0A0A0A]">
                    {formatCVE(selectedArtwork.priceCVE)}
                  </span>
                </div>
              )}
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-2">
                Nota sobre a obra
              </p>
              <p className="text-neutral-700 text-sm sm:text-base leading-relaxed font-light">
                {selectedArtwork.description}
              </p>
            </div>

            {/* Ações Comerciais */}
            <div className="pt-4 space-y-3">
              {selectedArtwork.availability === 'available' ? (
                <>
                  <button
                    onClick={() => openCheckoutModal(selectedArtwork, 'buy')}
                    className="w-full py-4 bg-[#0A0A0A] text-white text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Adquirir Obra Original</span>
                  </button>
                  <button
                    onClick={() => openCheckoutModal(selectedArtwork, 'inquire')}
                    className="w-full py-3.5 border border-neutral-300 text-[#0A0A0A] text-xs uppercase tracking-[0.2em] hover:border-[#0A0A0A] transition-colors"
                  >
                    Consultar sobre esta obra
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigateTo('encomendas')}
                  className="w-full py-4 bg-[#0A0A0A] text-white text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors"
                >
                  Encomendar Obra Semelhante
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de Catálogo por Categorias
  const filteredWorks =
    selectedCategory === 'Todas'
      ? artworks
      : artworks.filter((a) => a.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 animate-fade-in">
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#8C857B]">Arquivo & Portfólio</p>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl text-[#0A0A0A] mt-2">
          Galeria de Obras
        </h1>
        <p className="text-neutral-600 text-sm sm:text-base font-light mt-3">
          Explore os desenhos realistas a lápis, retratos, pinturas em tela, intervenções murais e
          projetos especiais de Art Oliveira.
        </p>
      </div>

      {/* Barra de Filtros por Categoria */}
      <div className="mt-10 pb-6 border-b border-neutral-200 flex flex-wrap gap-2">
        {['Todas', ...categories].map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs tracking-[0.14em] transition-all ${
                active
                  ? 'bg-[#0A0A0A] text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grelha de Obras */}
      {filteredWorks.length === 0 ? (
        <div className="py-24 text-center text-neutral-500">
          <p className="font-serif-editorial text-2xl">
            Nenhuma obra publicada nesta categoria de momento.
          </p>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {filteredWorks.map((work) => {
            const status = AVAILABILITY_META[work.availability] || AVAILABILITY_META.available;
            return (
              <article
                key={work.id}
                onClick={() => setSelectedArtworkId(work.id)}
                className="group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden border border-neutral-200">
                  <img
                    src={work.imageUrl}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  />
                  <span
                    className={`absolute top-3.5 left-3.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] border ${status.badgeClass}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="pt-4 flex-grow flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                      {work.category} · {work.year}
                    </p>
                    <h2 className="font-serif-editorial text-2xl text-[#0A0A0A] mt-1 group-hover:underline underline-offset-4">
                      {work.title}
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      {work.technique} · {work.dimensions}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-neutral-200/70 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 group-hover:text-[#0A0A0A] transition-colors">
                      Ver ficha técnica
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#0A0A0A]" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PÁGINA 4: LOJA ONLINE & OBRAS ORIGINAIS (CVE + WHATSAPP CHECKOUT)
// ============================================================================
function ShopPage({
  artworks,
  shopFilter,
  setShopFilter,
  openCheckoutModal,
  openArtworkDetail,
  navigateTo
}) {
  const shopProducts = useMemo(() => {
    const listed = artworks.filter((a) => a.inShop);
    if (shopFilter === 'available') return listed.filter((a) => a.availability === 'available');
    if (shopFilter === 'sold') return listed.filter((a) => a.availability === 'sold');
    return listed;
  }, [artworks, shopFilter]);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-neutral-200">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#8C857B]">
            Colecionismo & Aquisição Direta
          </p>
          <h1 className="font-serif-editorial text-4xl sm:text-6xl text-[#0A0A0A] mt-2">
            Loja de Obras Originais
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base font-light mt-3 max-w-2xl">
            Cada obra original é acompanhada de assinatura do artista. Valores apresentados em
            Escudos Cabo-Verdianos (CVE) com reserva direta via WhatsApp oficial.
          </p>
        </div>

        {/* Filtros de Disponibilidade */}
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Todas na Loja' },
            { id: 'available', label: 'Disponíveis' },
            { id: 'sold', label: 'Vendidas' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setShopFilter(tab.id)}
              className={`px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors ${
                shopFilter === tab.id
                  ? 'bg-[#0A0A0A] text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-[#0A0A0A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grelha de Produtos da Loja */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {shopProducts.map((product) => {
          const isAvailable = product.availability === 'available';
          const status = AVAILABILITY_META[product.availability] || AVAILABILITY_META.available;

          return (
            <div
              key={product.id}
              className="bg-white border border-neutral-200 flex flex-col justify-between group"
            >
              <div>
                <div
                  className="relative aspect-[4/5] bg-neutral-100 overflow-hidden cursor-pointer"
                  onClick={() => openArtworkDetail(product)}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  />
                  <span
                    className={`absolute top-3.5 left-3.5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] border ${status.badgeClass}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="p-6">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                    {product.category} · {product.dimensions}
                  </p>
                  <h2
                    onClick={() => openArtworkDetail(product)}
                    className="font-serif-editorial text-2xl text-[#0A0A0A] mt-1 cursor-pointer hover:underline"
                  >
                    {product.title}
                  </h2>
                  <p className="text-xs text-neutral-600 font-light mt-2 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t border-neutral-100 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-neutral-400">
                    Preço
                  </span>
                  <span className="font-serif-editorial text-2xl font-semibold text-[#0A0A0A]">
                    {formatCVE(product.priceCVE)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    disabled={!isAvailable}
                    onClick={() => openCheckoutModal(product, 'buy')}
                    className={`py-3 text-xs uppercase tracking-[0.16em] transition-colors ${
                      isAvailable
                        ? 'bg-[#0A0A0A] text-white hover:bg-neutral-800'
                        : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {isAvailable ? 'Comprar' : 'Vendido'}
                  </button>
                  <button
                    onClick={() => openCheckoutModal(product, 'inquire')}
                    className="py-3 border border-neutral-300 text-[#0A0A0A] text-xs uppercase tracking-[0.14em] hover:border-[#0A0A0A] transition-colors"
                  >
                    Consultar esta obra
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Cartão Especial de Encomenda Personalizada na Loja */}
        <div className="bg-[#0A0A0A] text-white p-8 flex flex-col justify-between border border-neutral-800">
          <div>
            <span className="inline-block px-3 py-1 border border-neutral-700 text-[10px] uppercase tracking-[0.2em] text-[#B8B0A4]">
              Obra Sob Medida
            </span>
            <h2 className="font-serif-editorial text-3xl text-white mt-5 leading-snug">
              Encomenda Personalizada
            </h2>
            <p className="text-neutral-400 text-sm font-light mt-4 leading-relaxed">
              Deseja um retrato realista a lápis, uma pintura em tela com dimensões específicas ou
              um projeto artístico exclusivo? Solicite um orçamento personalizado.
            </p>
            <ul className="mt-6 space-y-2.5 text-xs text-neutral-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B8B0A4]" />
                <span>Retratos realistas a lápis a partir de foto</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B8B0A4]" />
                <span>Pinturas originais em tela</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#B8B0A4]" />
                <span>Envio nacional (Cabo Verde) e internacional</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => navigateTo('encomendas')}
            className="mt-8 w-full py-3.5 bg-white text-[#0A0A0A] text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
          >
            <span>Solicitar Orçamento</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PÁGINA 5: ENCOMENDAS PERSONALIZADAS
// ============================================================================
function CommissionsPage({ siteConfig, submitCommissionRequest, showToast }) {
  const [form, setForm] = useState({
    clientName: '',
    clientContact: '',
    workType: 'Retrato realista a lápis',
    dimensions: '42 × 59,4 cm (A2)',
    budget: '',
    description: '',
    referenceImage: ''
  });
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 900000) {
      showToast('A imagem deve ter menos de 900 KB para envio rápido.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, referenceImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clientName.trim() || !form.clientContact.trim()) {
      showToast('Por favor preencha o seu nome e contacto.', 'error');
      return;
    }
    setSubmitting(true);
    const saved = await submitCommissionRequest({
      type: 'Encomenda Personalizada',
      ...form
    });
    setSubmitting(false);
    setSubmittedOrder(saved);
    showToast('Pedido registado! Pode também enviá-lo agora via WhatsApp.');
  };

  const whatsappMessage = `Olá Art Oliveira! Gostaria de solicitar uma encomenda personalizada:\n\n• Nome: ${form.clientName}\n• Tipo de trabalho: ${form.workType}\n• Dimensões pretendidas: ${form.dimensions}\n• Orçamento aproximado: ${form.budget || 'A combinar'}\n• Descrição: ${form.description}${
    form.referenceImage ? '\n• (Anexei uma imagem de referência no formulário do site)' : ''
  }`;

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
        {/* Coluna Explicativa */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#8C857B]">
              Comissões Exclusivas
            </p>
            <h1 className="font-serif-editorial text-4xl sm:text-5xl text-[#0A0A0A] mt-2 leading-tight">
              Encomendas Personalizadas
            </h1>
            <p className="text-neutral-600 text-sm sm:text-base font-light mt-4 leading-relaxed">
              Transforme memórias, retratos ou conceitos visuais numa obra de arte única criada
              manualmente por Art Oliveira.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#0A0A0A] font-medium">
              Modalidades Disponíveis
            </p>
            {[
              {
                title: 'Retratos realistas a lápis',
                desc: 'Desenhos detalhados em grafite/carvão sobre papel de arquivo de alta gramagem.'
              },
              {
                title: 'Pinturas personalizadas',
                desc: 'Composições originais desenvolvidas sob medida para coleções ou espaços.'
              },
              {
                title: 'Obras em tela',
                desc: 'Acrílico e técnicas mistas em formatos médios ou de grande escala.'
              },
              {
                title: 'Projetos artísticos especiais',
                desc: 'Intervenções murais, colaborações culturais e encomendas institucionais.'
              }
            ].map((item) => (
              <div key={item.title} className="p-4 bg-white border border-neutral-200">
                <h3 className="font-serif-editorial text-xl text-[#0A0A0A]">{item.title}</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Formulário Interativo */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 p-6 sm:p-10">
          <h2 className="font-serif-editorial text-3xl text-[#0A0A0A]">
            Detalhes do Pedido
          </h2>
          <p className="text-xs text-neutral-500 mt-1 mb-8">
            Preencha os campos abaixo e envie diretamente pelo WhatsApp ou registe no sistema do
            artista.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-neutral-600 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  placeholder="Seu nome"
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-neutral-600 mb-2">
                  WhatsApp ou Email *
                </label>
                <input
                  type="text"
                  required
                  value={form.clientContact}
                  onChange={(e) => setForm({ ...form, clientContact: e.target.value })}
                  placeholder="+238 ... ou email"
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-neutral-600 mb-2">
                  Tipo de Trabalho
                </label>
                <select
                  value={form.workType}
                  onChange={(e) => setForm({ ...form, workType: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
                >
                  <option>Retrato realista a lápis</option>
                  <option>Pintura personalizada</option>
                  <option>Obra em tela</option>
                  <option>Arte mural / Projeto especial</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-neutral-600 mb-2">
                  Dimensões Pretendidas
                </label>
                <input
                  type="text"
                  value={form.dimensions}
                  onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                  placeholder="Ex: 50 × 70 cm ou A3"
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.16em] text-neutral-600 mb-2">
                Orçamento Aproximado (CVE ou EUR)
              </label>
              <input
                type="text"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                placeholder="Ex: 35.000 CVE / 300 EUR (opcional)"
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.16em] text-neutral-600 mb-2">
                Descrição da Ideia / Detalhes
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descreva o retrato, número de pessoas, prazo desejado ou estilo pretendido..."
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
              />
            </div>

            {/* Anexo de Fotografia de Referência */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.16em] text-neutral-600 mb-2">
                Fotografia de Referência (Opcional)
              </label>
              <label className="flex items-center justify-center gap-2.5 w-full py-4 px-4 border border-dashed border-neutral-400 bg-[#FAF9F6] hover:bg-neutral-100 cursor-pointer transition-colors text-xs text-neutral-600">
                <Upload className="w-4 h-4" />
                <span>
                  {form.referenceImage
                    ? 'Fotografia anexada com sucesso (Clique para substituir)'
                    : 'Selecionar fotografia de referência (JPG/PNG)'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {form.referenceImage && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={form.referenceImage}
                    alt="Referência"
                    className="w-16 h-16 object-cover border border-neutral-300"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, referenceImage: '' })}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remover anexo
                  </button>
                </div>
              )}
            </div>

            <div className="pt-3 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-4 bg-[#0A0A0A] text-white text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors"
              >
                {submitting ? 'A registar...' : 'Registar Pedido no Site'}
              </button>

              <a
                href={buildWhatsAppLink(siteConfig.contacts.whatsappNumber, whatsappMessage)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-4 bg-emerald-900 text-white text-xs uppercase tracking-[0.2em] hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enviar pelo WhatsApp</span>
              </a>
            </div>
          </form>

          {submittedOrder && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs leading-relaxed">
              Pedido <strong>#{submittedOrder.id.slice(-5)}</strong> guardado no painel do artista.
              Clique em <strong>“Enviar pelo WhatsApp”</strong> acima para iniciar a conversa
              diretamente com Art Oliveira.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PÁGINA 6: CONTACTOS
// ============================================================================
function ContactPage({ siteConfig, submitContactMessage, showToast }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    await submitContactMessage(form);
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    showToast('Mensagem enviada para Art Oliveira.');
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
        <div className="lg:col-span-5 space-y-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#8C857B]">
              Contacto & Representação
            </p>
            <h1 className="font-serif-editorial text-4xl sm:text-6xl text-[#0A0A0A] mt-2">
              Contacto
            </h1>
            <p className="text-neutral-600 text-sm sm:text-base font-light mt-4 leading-relaxed">
              Para aquisição de obras originais, convites para exposições, parcerias culturais ou
              encomendas personalizadas.
            </p>
          </div>

          <div className="space-y-5 pt-2">
            <a
              href={siteConfig.contacts.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 bg-white border border-neutral-200 hover:border-[#0A0A0A] transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <Instagram className="w-5 h-5 text-[#0A0A0A]" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                    Instagram Oficial
                  </p>
                  <p className="text-sm font-medium text-[#0A0A0A]">
                    {siteConfig.contacts.instagramHandle}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-[#0A0A0A]" />
            </a>

            <a
              href={buildWhatsAppLink(
                siteConfig.contacts.whatsappNumber,
                'Olá Art Oliveira, entro em contacto através do seu website oficial.'
              )}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 bg-white border border-neutral-200 hover:border-[#0A0A0A] transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <Phone className="w-5 h-5 text-[#0A0A0A]" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                    WhatsApp Direto
                  </p>
                  <p className="text-sm font-medium text-[#0A0A0A]">
                    +{siteConfig.contacts.whatsappNumber}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-[#0A0A0A]" />
            </a>

            <a
              href={`mailto:${siteConfig.contacts.email}`}
              className="flex items-center justify-between p-4 bg-white border border-neutral-200 hover:border-[#0A0A0A] transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <Mail className="w-5 h-5 text-[#0A0A0A]" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                    Email Profissional
                  </p>
                  <p className="text-sm font-medium text-[#0A0A0A]">{siteConfig.contacts.email}</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-[#0A0A0A]" />
            </a>

            <div className="flex items-center gap-3.5 p-4 bg-[#F2F0EC] border border-neutral-200">
              <MapPin className="w-5 h-5 text-[#0A0A0A]" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Localização
                </p>
                <p className="text-sm font-medium text-[#0A0A0A]">{siteConfig.contacts.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Mensagem Direta */}
        <div className="lg:col-span-7 bg-white border border-neutral-200 p-6 sm:p-10">
          <h2 className="font-serif-editorial text-3xl text-[#0A0A0A]">Enviar Mensagem</h2>
          <p className="text-xs text-neutral-500 mt-1 mb-8">
            A sua mensagem fica registada diretamente na caixa de entrada privada do artista.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-neutral-600 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.16em] text-neutral-600 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.16em] text-neutral-600 mb-2">
                Assunto
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Ex: Exposição, Aquisição, Imprensa"
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.16em] text-neutral-600 mb-2">
                Mensagem *
              </label>
              <textarea
                rows={5}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#0A0A0A] text-white text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Mensagem</span>
            </button>
          </form>

          {sent && (
            <p className="mt-4 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3">
              Obrigado pelo contacto. A sua mensagem foi entregue com sucesso.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL DE COMPRA / CONSULTA DE OBRA (SEM PAGAMENTOS FALSOS + PRONTO P/ SISP/VINTI4)
// ============================================================================
function CheckoutWhatsAppModal({
  artwork,
  mode,
  siteConfig,
  onClose,
  submitCommissionRequest,
  showToast
}) {
  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [buyerLocation, setBuyerLocation] = useState('Cabo Verde');
  const [notes, setNotes] = useState('');

  const isBuy = mode === 'buy';

  const whatsappText = isBuy
    ? `Olá Art Oliveira! Tenho interesse em adquirir a obra original:\n\n• Obra: ${artwork.title} (${artwork.year})\n• Técnica: ${artwork.technique}\n• Dimensões: ${artwork.dimensions}\n• Valor apresentado: ${formatCVE(artwork.priceCVE)}\n• Nome: ${buyerName || 'Visitante'}\n• Localização de entrega: ${buyerLocation}\n${notes ? `• Observações: ${notes}` : ''}`
    : `Olá Art Oliveira! Gostaria de obter mais informações sobre a obra:\n\n• Obra: ${artwork.title} (${artwork.year})\n• Categoria: ${artwork.category}\n• Nome: ${buyerName || 'Visitante'}\n${notes ? `• Questão: ${notes}` : ''}`;

  const handleConfirmAndWhatsApp = async () => {
    if (buyerName.trim()) {
      await submitCommissionRequest({
        type: isBuy ? `Reserva de Obra: ${artwork.title}` : `Consulta de Obra: ${artwork.title}`,
        clientName: buyerName,
        clientContact: buyerContact || 'Via WhatsApp',
        workType: artwork.category,
        dimensions: artwork.dimensions,
        budget: formatCVE(artwork.priceCVE),
        description: notes || (isBuy ? 'Pedido de reserva via Loja Online' : 'Pedido de consulta')
      });
      showToast('Interesse registado no painel do artista.');
    }
    window.open(
      buildWhatsAppLink(siteConfig.contacts.whatsappNumber, whatsappText),
      '_blank',
      'noopener,noreferrer'
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-lg w-full border border-neutral-300 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0A0A0A] text-white px-6 py-4 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.2em]">
            {isBuy ? 'Adquirir Obra Original' : 'Consultar Obra'}
          </span>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Resumo da Obra */}
          <div className="flex gap-4 pb-4 border-b border-neutral-200">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-20 h-24 object-cover border border-neutral-200 shrink-0"
            />
            <div>
              <h3 className="font-serif-editorial text-xl text-[#0A0A0A]">{artwork.title}</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {artwork.technique} · {artwork.dimensions}
              </p>
              <p className="font-serif-editorial text-lg font-semibold text-[#0A0A0A] mt-2">
                {formatCVE(artwork.priceCVE)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1">
                O seu Nome
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Ex: Carlos Mendes"
                className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1">
                  Telefone / Email
                </label>
                <input
                  type="text"
                  value={buyerContact}
                  onChange={(e) => setBuyerContact(e.target.value)}
                  placeholder="+238 ..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1">
                  Ilha / País de Entrega
                </label>
                <input
                  type="text"
                  value={buyerLocation}
                  onChange={(e) => setBuyerLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1">
                Nota adicional (opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Questões sobre moldura, envio ou certificado..."
                className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm focus:outline-none focus:border-[#0A0A0A]"
              />
            </div>
          </div>

          {/* Nota Técnica de Pagamento (Cabo Verde / SISP Vinti4 Ready) */}
          <div className="p-3.5 bg-[#F4F4F2] border border-neutral-200 text-[11px] text-neutral-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-[#0A0A0A]">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Métodos de Pagamento (Cabo Verde & Internacional)</span>
            </div>
            <p className="leading-relaxed">
              A conclusão da reserva e coordenação de pagamento (Transferência Bancária Nacional /
              Internacional ou futuro gateway <strong>vinti4 / SISP</strong>) é realizada
              diretamente com o artista via WhatsApp oficial.
            </p>
          </div>

          <button
            onClick={handleConfirmAndWhatsApp}
            className="w-full py-3.5 bg-emerald-900 text-white text-xs uppercase tracking-[0.2em] hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Concluir Pedido no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODAL DE LOGIN PRIVADO DO ARTISTA
// ============================================================================
function AdminLoginModal({ credentials, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (
      email.trim().toLowerCase() === credentials.email.toLowerCase() &&
      passcode === credentials.passcode
    ) {
      onSuccess();
    } else {
      setError('Credenciais inválidas. Verifique o email e a palavra-passe do artista.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0A0A0A] text-white max-w-md w-full border border-neutral-800 p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#B8B0A4]" />
            <span className="text-xs uppercase tracking-[0.22em] text-neutral-300">
              Área Privada · Art Oliveira
            </span>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 className="font-serif-editorial text-3xl text-white">Iniciar Sessão</h2>
        <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
          Acesso exclusivo para gestão de obras, preços, encomendas e conteúdos do website oficial.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.18em] text-neutral-400 mb-1.5">
              Email Administrativo
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@artoliveira.cv"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.18em] text-neutral-400 mb-1.5">
              Palavra-passe
            </label>
            <input
              type="password"
              required
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-white"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full py-3.5 bg-white text-[#0A0A0A] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-neutral-200 transition-colors"
          >
            Entrar no Painel
          </button>
        </form>

        {/* Credenciais Iniciais Visíveis para o Artista Testar e Depois Alterar no Painel */}
        <div className="mt-6 pt-5 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1">
          <p className="text-neutral-300 font-medium">Acesso inicial configurado:</p>
          <p>
            Email: <code className="text-white">{credentials.email}</code>
          </p>
          <p>
            Senha: <code className="text-white">{credentials.passcode}</code>
          </p>
          <p className="text-[10px] text-neutral-500 pt-1">
            Pode alterar estas credenciais a qualquer momento dentro do painel em “Contactos &
            Definições”.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PAINEL PRIVADO DE ADMINISTRAÇÃO (CMS COMPLETO DO ARTISTA)
// ============================================================================
function AdminDashboard({
  siteConfig,
  saveSiteConfig,
  artworks,
  saveArtwork,
  removeArtwork,
  categories,
  commissions,
  updateCommissionStatus,
  messages,
  syncStatus,
  onLogout
}) {
  const [tab, setTab] = useState('obras'); // 'obras' | 'loja' | 'encomendas' | 'biografia' | 'inicio' | 'config'
  const [editingArtwork, setEditingArtwork] = useState(null);
  const [isNewArtwork, setIsNewArtwork] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Cópias locais editáveis das configurações
  const [draftConfig, setDraftConfig] = useState(siteConfig);
  const [draftCategories, setDraftCategories] = useState(categories);

  useEffect(() => {
    setDraftConfig(siteConfig);
  }, [siteConfig]);

  useEffect(() => {
    setDraftCategories(categories);
  }, [categories]);

  // Helper de upload de imagem local (Base64 otimizado) para qualquer campo do CMS
  const handleFileToDataUrl = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(file);
  };

  const startNewArtwork = () => {
    setIsNewArtwork(true);
    setEditingArtwork({
      title: '',
      year: String(new Date().getFullYear()),
      technique: 'Grafite sobre papel',
      dimensions: '50 × 70 cm',
      category: draftCategories[0] || 'Desenho realista a lápis',
      description: '',
      imageUrl: '',
      availability: 'available',
      inShop: true,
      priceCVE: 40000,
      featuredHome: true
    });
  };

  const handleSaveArtworkForm = (e) => {
    e.preventDefault();
    if (!editingArtwork.title.trim() || !editingArtwork.imageUrl.trim()) return;
    saveArtwork(editingArtwork, isNewArtwork);
    setEditingArtwork(null);
    setIsNewArtwork(false);
  };

  const addCategory = () => {
    const clean = newCategoryName.trim();
    if (!clean || draftCategories.includes(clean)) return;
    const updated = [...draftCategories, clean];
    setDraftCategories(updated);
    setNewCategoryName('');
    saveSiteConfig(draftConfig, updated);
  };

  const removeCategory = (cat) => {
    const updated = draftCategories.filter((c) => c !== cat);
    setDraftCategories(updated);
    saveSiteConfig(draftConfig, updated);
  };

  const addExhibition = () => {
    const next = [
      ...draftConfig.exhibitions,
      {
        id: `exp-${Date.now()}`,
        year: String(new Date().getFullYear()),
        title: 'Nova Exposição / Participação',
        location: 'Local / País',
        description: 'Descrição da exposição ou iniciativa cultural.'
      }
    ];
    setDraftConfig({ ...draftConfig, exhibitions: next });
  };

  const removeExhibition = (id) => {
    setDraftConfig({
      ...draftConfig,
      exhibitions: draftConfig.exhibitions.filter((ex) => ex.id !== id)
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F4F2] animate-fade-in">
      {/* Cabeçalho do Backoffice */}
      <div className="bg-[#0A0A0A] text-white border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 bg-white text-[#0A0A0A] text-[10px] font-semibold uppercase tracking-[0.2em]">
                CMS PRIVADO
              </span>
              <span className="text-xs text-neutral-400">
                Estado da Base de Dados:{' '}
                <strong className="text-emerald-400">
                  {syncStatus === 'cloud'
                    ? 'Sincronizado na Nuvem (Firebase)'
                    : 'Modo Ativo (Pronto a Publicar)'}
                </strong>
              </span>
            </div>
            <h1 className="font-serif-editorial text-3xl sm:text-4xl text-white mt-2">
              Gestão do Website — ART OLIVEIRA
            </h1>
          </div>

          <button
            onClick={onLogout}
            className="self-start md:self-auto px-5 py-2.5 border border-neutral-700 text-xs uppercase tracking-[0.18em] text-neutral-300 hover:text-white hover:border-white transition-colors"
          >
            Terminar Sessão
          </button>
        </div>

        {/* Abas de Gestão */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex overflow-x-auto gap-1 border-t border-neutral-900">
          {[
            { id: 'obras', label: `Obras & Categorias (${artworks.length})` },
            { id: 'loja', label: 'Loja & Preços (CVE)' },
            {
              id: 'encomendas',
              label: `Encomendas & Mensagens (${commissions.length + messages.length})`
            },
            { id: 'biografia', label: 'Biografia & Exposições' },
            { id: 'inicio', label: 'Página Inicial & Textos' },
            { id: 'config', label: 'Contactos & Arquitetura' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`px-5 py-4 text-xs uppercase tracking-[0.16em] whitespace-nowrap border-b-2 transition-colors ${
                tab === item.id
                  ? 'border-white text-white font-medium'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10">
        {/* ==================================================================
            ABA 1: OBRAS & CATEGORIAS
           ================================================================== */}
        {tab === 'obras' && (
          <div className="space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-editorial text-3xl text-[#0A0A0A]">
                  Catálogo de Obras
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Adicione novas obras, carregue fotografias do seu dispositivo ou elimine obras
                  demonstrativas.
                </p>
              </div>
              <button
                onClick={startNewArtwork}
                className="px-6 py-3.5 bg-[#0A0A0A] text-white text-xs uppercase tracking-[0.18em] flex items-center gap-2 hover:bg-neutral-800"
              >
                <Plus className="w-4 h-4" />
                <span>Publicar Nova Obra</span>
              </button>
            </div>

            {/* Formulário de Criação / Edição de Obra */}
            {editingArtwork && (
              <form
                onSubmit={handleSaveArtworkForm}
                className="bg-white border-2 border-[#0A0A0A] p-6 sm:p-8 space-y-6 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                  <h3 className="font-serif-editorial text-2xl text-[#0A0A0A]">
                    {isNewArtwork ? 'Publicar Nova Obra' : `Editar: ${editingArtwork.title}`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingArtwork(null)}
                    className="text-neutral-500 hover:text-[#0A0A0A]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Upload / Pré-visualização de Fotografia */}
                  <div className="md:col-span-4 space-y-3">
                    <div className="aspect-[4/5] bg-neutral-100 border border-neutral-300 flex items-center justify-center overflow-hidden">
                      {editingArtwork.imageUrl ? (
                        <img
                          src={editingArtwork.imageUrl}
                          alt="Pré-visualização"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4 text-neutral-400">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-xs">Sem imagem selecionada</p>
                        </div>
                      )}
                    </div>

                    <label className="block w-full py-2.5 px-3 bg-[#0A0A0A] text-white text-center text-xs uppercase tracking-[0.15em] cursor-pointer hover:bg-neutral-800">
                      Carregar Foto do Telemóvel / PC
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileToDataUrl(e.target.files?.[0], (url) =>
                            setEditingArtwork({ ...editingArtwork, imageUrl: url })
                          )
                        }
                      />
                    </label>

                    <input
                      type="text"
                      value={editingArtwork.imageUrl}
                      onChange={(e) =>
                        setEditingArtwork({ ...editingArtwork, imageUrl: e.target.value })
                      }
                      placeholder="Ou cole o URL direto da imagem..."
                      className="w-full px-3 py-2 bg-[#FAF9F6] border border-neutral-300 text-xs"
                    />
                  </div>

                  {/* Campos Técnicos */}
                  <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1">
                        Título da Obra *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingArtwork.title}
                        onChange={(e) =>
                          setEditingArtwork({ ...editingArtwork, title: e.target.value })
                        }
                        placeholder="Ex: Retrato de Esperança"
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1">
                        Categoria
                      </label>
                      <select
                        value={editingArtwork.category}
                        onChange={(e) =>
                          setEditingArtwork({ ...editingArtwork, category: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                      >
                        {draftCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1">
                        Ano de Criação
                      </label>
                      <input
                        type="text"
                        value={editingArtwork.year}
                        onChange={(e) =>
                          setEditingArtwork({ ...editingArtwork, year: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1">
                        Técnica Utilizada
                      </label>
                      <input
                        type="text"
                        value={editingArtwork.technique}
                        onChange={(e) =>
                          setEditingArtwork({ ...editingArtwork, technique: e.target.value })
                        }
                        placeholder="Ex: Grafite sobre papel 300g"
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1">
                        Dimensões
                      </label>
                      <input
                        type="text"
                        value={editingArtwork.dimensions}
                        onChange={(e) =>
                          setEditingArtwork({ ...editingArtwork, dimensions: e.target.value })
                        }
                        placeholder="Ex: 50 × 70 cm"
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1">
                        Disponibilidade
                      </label>
                      <select
                        value={editingArtwork.availability}
                        onChange={(e) =>
                          setEditingArtwork({ ...editingArtwork, availability: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                      >
                        <option value="available">Disponível</option>
                        <option value="sold">Vendido</option>
                        <option value="private">Coleção Privada</option>
                        <option value="inquiry">Sob Consulta</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1">
                        Preço na Loja (CVE)
                      </label>
                      <input
                        type="number"
                        value={editingArtwork.priceCVE}
                        onChange={(e) =>
                          setEditingArtwork({ ...editingArtwork, priceCVE: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1">
                        Descrição da Obra
                      </label>
                      <textarea
                        rows={3}
                        value={editingArtwork.description}
                        onChange={(e) =>
                          setEditingArtwork({ ...editingArtwork, description: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-wrap gap-6 pt-1">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingArtwork.inShop}
                          onChange={(e) =>
                            setEditingArtwork({ ...editingArtwork, inShop: e.target.checked })
                          }
                        />
                        <span>Exibir na Loja Online</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingArtwork.featuredHome}
                          onChange={(e) =>
                            setEditingArtwork({ ...editingArtwork, featuredHome: e.target.checked })
                          }
                        />
                        <span>Destacar na Página Inicial</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setEditingArtwork(null)}
                    className="px-5 py-2.5 border border-neutral-300 text-xs uppercase tracking-[0.16em]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-2.5 bg-[#0A0A0A] text-white text-xs uppercase tracking-[0.18em] flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar & Publicar Obra</span>
                  </button>
                </div>
              </form>
            )}

            {/* Lista de Obras Existentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((work) => (
                <div
                  key={work.id}
                  className="bg-white border border-neutral-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] bg-neutral-100 overflow-hidden relative">
                      <img
                        src={work.imageUrl}
                        alt={work.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-[#0A0A0A]/85 text-white text-[10px] uppercase tracking-wider">
                        {AVAILABILITY_META[work.availability]?.label}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                        {work.category} · {work.year}
                      </p>
                      <h4 className="font-serif-editorial text-xl text-[#0A0A0A] mt-0.5">
                        {work.title}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-1">{formatCVE(work.priceCVE)}</p>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-[#FAF9F6] border-t border-neutral-200 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setIsNewArtwork(false);
                        setEditingArtwork(work);
                      }}
                      className="text-xs font-medium text-[#0A0A0A] flex items-center gap-1.5 hover:underline"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => removeArtwork(work.id)}
                      className="text-xs text-red-700 flex items-center gap-1 hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Gestão de Categorias */}
            <div className="bg-white border border-neutral-200 p-6">
              <h3 className="font-serif-editorial text-2xl text-[#0A0A0A]">
                Categorias da Galeria
              </h3>
              <p className="text-xs text-neutral-500 mt-1 mb-4">
                Crie ou remova categorias para organizar o seu portfólio.
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {draftCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FAF9F6] border border-neutral-300 text-xs"
                  >
                    <span>{cat}</span>
                    <button
                      onClick={() => removeCategory(cat)}
                      className="text-neutral-400 hover:text-red-600"
                      title="Remover categoria"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nova categoria (ex: Estudos a Carvão)"
                  className="flex-1 px-3.5 py-2 bg-[#FAF9F6] border border-neutral-300 text-xs"
                />
                <button
                  onClick={addCategory}
                  className="px-4 py-2 bg-[#0A0A0A] text-white text-xs uppercase tracking-wider"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            ABA 2: LOJA & GESTÃO RÁPIDA DE PREÇOS / DISPONIBILIDADE
           ================================================================== */}
        {tab === 'loja' && (
          <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-serif-editorial text-3xl text-[#0A0A0A]">
                Controlo Rápido da Loja Online (CVE)
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Altere preços em Escudos Cabo-Verdianos, marque obras como vendidas ou controle a
                visibilidade na loja com um clique.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                    <th className="py-3 pr-4">Obra</th>
                    <th className="py-3 px-4">Preço (CVE)</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 pl-4 text-right">Na Loja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {artworks.map((work) => (
                    <tr key={work.id}>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={work.imageUrl}
                            alt={work.title}
                            className="w-12 h-14 object-cover border border-neutral-200"
                          />
                          <div>
                            <p className="font-medium text-[#0A0A0A]">{work.title}</p>
                            <p className="text-xs text-neutral-500">{work.category}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <input
                          type="number"
                          value={work.priceCVE}
                          onChange={(e) =>
                            saveArtwork({ ...work, priceCVE: Number(e.target.value) }, false)
                          }
                          className="w-32 px-3 py-1.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                        />
                      </td>

                      <td className="py-4 px-4">
                        <select
                          value={work.availability}
                          onChange={(e) =>
                            saveArtwork({ ...work, availability: e.target.value }, false)
                          }
                          className="px-3 py-1.5 bg-[#FAF9F6] border border-neutral-300 text-xs"
                        >
                          <option value="available">Disponível</option>
                          <option value="sold">Vendido</option>
                          <option value="private">Coleção Privada</option>
                          <option value="inquiry">Sob Consulta</option>
                        </select>
                      </td>

                      <td className="py-4 pl-4 text-right">
                        <button
                          onClick={() => saveArtwork({ ...work, inShop: !work.inShop }, false)}
                          className={`px-3 py-1.5 text-[11px] uppercase tracking-wider border ${
                            work.inShop
                              ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                              : 'bg-white text-neutral-500 border-neutral-300'
                          }`}
                        >
                          {work.inShop ? 'Visível na Loja' : 'Oculto da Loja'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================================
            ABA 3: PEDIDOS DE ENCOMENDAS & MENSAGENS DE CONTACTO
           ================================================================== */}
        {tab === 'encomendas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="font-serif-editorial text-3xl text-[#0A0A0A]">
                Pedidos de Encomendas & Reservas ({commissions.length})
              </h2>

              {commissions.length === 0 ? (
                <div className="bg-white border border-neutral-200 p-8 text-center text-xs text-neutral-500">
                  Ainda não existem pedidos submetidos. Todos os pedidos feitos nas páginas
                  “Encomendas” ou “Loja” aparecerão aqui.
                </div>
              ) : (
                commissions.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-neutral-200 p-5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-neutral-400">
                          {order.type}
                        </span>
                        <h3 className="font-medium text-base text-[#0A0A0A]">
                          {order.clientName} —{' '}
                          <span className="text-neutral-500 font-normal">
                            {order.clientContact}
                          </span>
                        </h3>
                      </div>

                      <select
                        value={order.status || 'Pendente'}
                        onChange={(e) => updateCommissionStatus(order.id, e.target.value)}
                        className="px-2.5 py-1 bg-[#FAF9F6] border border-neutral-300 text-xs"
                      >
                        <option>Pendente</option>
                        <option>Em Análise</option>
                        <option>Em Execução</option>
                        <option>Concluído</option>
                      </select>
                    </div>

                    <p className="text-xs text-neutral-600">
                      <strong>Trabalho:</strong> {order.workType} · <strong>Dimensões:</strong>{' '}
                      {order.dimensions} · <strong>Orçamento:</strong> {order.budget || 'N/A'}
                    </p>
                    <p className="text-xs text-neutral-700 bg-[#FAF9F6] p-3 border border-neutral-100">
                      {order.description}
                    </p>

                    {order.referenceImage && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                          Imagem de Referência Anexada:
                        </p>
                        <img
                          src={order.referenceImage}
                          alt="Referência do cliente"
                          className="w-28 h-28 object-cover border border-neutral-300"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="lg:col-span-5 space-y-4">
              <h2 className="font-serif-editorial text-3xl text-[#0A0A0A]">
                Mensagens ({messages.length})
              </h2>

              {messages.length === 0 ? (
                <div className="bg-white border border-neutral-200 p-8 text-center text-xs text-neutral-500">
                  Caixa de entrada vazia.
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="bg-white border border-neutral-200 p-5 space-y-2">
                    <div className="flex justify-between text-xs">
                      <strong className="text-[#0A0A0A]">{m.name}</strong>
                      <span className="text-neutral-400">{m.email}</span>
                    </div>
                    {m.subject && (
                      <p className="text-xs font-medium text-neutral-700">Assunto: {m.subject}</p>
                    )}
                    <p className="text-xs text-neutral-600 leading-relaxed">{m.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================================================================
            ABA 4: BIOGRAFIA & EXPOSIÇÕES
           ================================================================== */}
        {tab === 'biografia' && (
          <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-editorial text-3xl text-[#0A0A0A]">
                  Biografia & Trajetória
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Edite a fotografia profissional, os parágrafos biográficos e a lista de
                  exposições.
                </p>
              </div>
              <button
                onClick={() => saveSiteConfig(draftConfig)}
                className="px-6 py-3 bg-[#0A0A0A] text-white text-xs uppercase tracking-[0.18em] flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Biografia</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4 space-y-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                  Fotografia do Artista
                </p>
                <img
                  src={draftConfig.artistPhotoUrl}
                  alt="Artista"
                  className="w-full aspect-[4/5] object-cover border border-neutral-300"
                />
                <label className="block w-full py-2.5 bg-[#0A0A0A] text-white text-center text-xs uppercase tracking-wider cursor-pointer">
                  Substituir Fotografia
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileToDataUrl(e.target.files?.[0], (url) =>
                        setDraftConfig({ ...draftConfig, artistPhotoUrl: url })
                      )
                    }
                  />
                </label>
              </div>

              <div className="md:col-span-8 space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Introdução Biográfica
                  </label>
                  <textarea
                    rows={2}
                    value={draftConfig.bioLead}
                    onChange={(e) => setDraftConfig({ ...draftConfig, bioLead: e.target.value })}
                    className="w-full p-3 bg-[#FAF9F6] border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Parágrafo 1 (Desenho Realista & Retratos)
                  </label>
                  <textarea
                    rows={3}
                    value={draftConfig.bioParagraph1}
                    onChange={(e) =>
                      setDraftConfig({ ...draftConfig, bioParagraph1: e.target.value })
                    }
                    className="w-full p-3 bg-[#FAF9F6] border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Parágrafo 2 (Pintura & Murais)
                  </label>
                  <textarea
                    rows={3}
                    value={draftConfig.bioParagraph2}
                    onChange={(e) =>
                      setDraftConfig({ ...draftConfig, bioParagraph2: e.target.value })
                    }
                    className="w-full p-3 bg-[#FAF9F6] border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Parágrafo 3 (Trajetória Internacional)
                  </label>
                  <textarea
                    rows={3}
                    value={draftConfig.bioParagraph3}
                    onChange={(e) =>
                      setDraftConfig({ ...draftConfig, bioParagraph3: e.target.value })
                    }
                    className="w-full p-3 bg-[#FAF9F6] border border-neutral-300 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Gestão de Exposições */}
            <div className="pt-6 border-t border-neutral-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-editorial text-2xl text-[#0A0A0A]">
                  Exposições & Participações
                </h3>
                <button
                  type="button"
                  onClick={addExhibition}
                  className="px-4 py-2 border border-[#0A0A0A] text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Exposição</span>
                </button>
              </div>

              {draftConfig.exhibitions.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="p-4 bg-[#FAF9F6] border border-neutral-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-start"
                >
                  <input
                    type="text"
                    value={exp.year}
                    onChange={(e) => {
                      const copy = [...draftConfig.exhibitions];
                      copy[idx] = { ...exp, year: e.target.value };
                      setDraftConfig({ ...draftConfig, exhibitions: copy });
                    }}
                    placeholder="Ano / Tipo"
                    className="md:col-span-2 px-3 py-2 bg-white border border-neutral-300 text-xs"
                  />
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => {
                      const copy = [...draftConfig.exhibitions];
                      copy[idx] = { ...exp, title: e.target.value };
                      setDraftConfig({ ...draftConfig, exhibitions: copy });
                    }}
                    placeholder="Título da Exposição"
                    className="md:col-span-4 px-3 py-2 bg-white border border-neutral-300 text-xs"
                  />
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => {
                      const copy = [...draftConfig.exhibitions];
                      copy[idx] = { ...exp, location: e.target.value };
                      setDraftConfig({ ...draftConfig, exhibitions: copy });
                    }}
                    placeholder="Local / País"
                    className="md:col-span-2 px-3 py-2 bg-white border border-neutral-300 text-xs"
                  />
                  <input
                    type="text"
                    value={exp.description}
                    onChange={(e) => {
                      const copy = [...draftConfig.exhibitions];
                      copy[idx] = { ...exp, description: e.target.value };
                      setDraftConfig({ ...draftConfig, exhibitions: copy });
                    }}
                    placeholder="Descrição"
                    className="md:col-span-3 px-3 py-2 bg-white border border-neutral-300 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeExhibition(exp.id)}
                    className="md:col-span-1 py-2 text-red-600 flex justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================
            ABA 5: PÁGINA INICIAL & TEXTOS
           ================================================================== */}
        {tab === 'inicio' && (
          <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-editorial text-3xl text-[#0A0A0A]">
                  Personalização da Página Inicial
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Troque a imagem de capa principal, frase de apresentação e manifesto artístico.
                </p>
              </div>
              <button
                onClick={() => saveSiteConfig(draftConfig)}
                className="px-6 py-3 bg-[#0A0A0A] text-white text-xs uppercase tracking-[0.18em] flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Página Inicial</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4 space-y-3">
                <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                  Imagem de Destaque (Hero)
                </p>
                <img
                  src={draftConfig.heroImageUrl}
                  alt="Hero"
                  className="w-full aspect-[4/5] object-cover border border-neutral-300"
                />
                <label className="block w-full py-2.5 bg-[#0A0A0A] text-white text-center text-xs uppercase tracking-wider cursor-pointer">
                  Carregar Nova Imagem Principal
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileToDataUrl(e.target.files?.[0], (url) =>
                        setDraftConfig({ ...draftConfig, heroImageUrl: url })
                      )
                    }
                  />
                </label>
              </div>

              <div className="md:col-span-8 space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Nome em Destaque
                  </label>
                  <input
                    type="text"
                    value={draftConfig.artistName}
                    onChange={(e) =>
                      setDraftConfig({ ...draftConfig, artistName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={draftConfig.subtitle}
                    onChange={(e) => setDraftConfig({ ...draftConfig, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Frase de Apresentação
                  </label>
                  <input
                    type="text"
                    value={draftConfig.heroQuote}
                    onChange={(e) => setDraftConfig({ ...draftConfig, heroQuote: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Legenda da Obra Principal
                  </label>
                  <input
                    type="text"
                    value={draftConfig.heroCaption}
                    onChange={(e) =>
                      setDraftConfig({ ...draftConfig, heroCaption: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Título do Manifesto
                  </label>
                  <input
                    type="text"
                    value={draftConfig.manifestoTitle}
                    onChange={(e) =>
                      setDraftConfig({ ...draftConfig, manifestoTitle: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Texto do Manifesto
                  </label>
                  <textarea
                    rows={3}
                    value={draftConfig.manifestoBody}
                    onChange={(e) =>
                      setDraftConfig({ ...draftConfig, manifestoBody: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            ABA 6: CONTACTOS, CREDENCIAIS & GUIA DE PUBLICAÇÃO NA INTERNET
           ================================================================== */}
        {tab === 'config' && (
          <div className="space-y-8">
            <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif-editorial text-3xl text-[#0A0A0A]">
                    Contactos Oficiais & Segurança
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Configure o seu número real de WhatsApp (usado nos botões da Loja e
                    Encomendas), email e palavra-passe privada.
                  </p>
                </div>
                <button
                  onClick={() => saveSiteConfig(draftConfig)}
                  className="px-6 py-3 bg-[#0A0A0A] text-white text-xs uppercase tracking-[0.18em] flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Definições</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Número de WhatsApp (com indicativo 238, sem +)
                  </label>
                  <input
                    type="text"
                    value={draftConfig.contacts.whatsappNumber}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        contacts: { ...draftConfig.contacts, whatsappNumber: e.target.value }
                      })
                    }
                    placeholder="2389912345"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Email Oficial
                  </label>
                  <input
                    type="email"
                    value={draftConfig.contacts.email}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        contacts: { ...draftConfig.contacts, email: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={draftConfig.contacts.instagramHandle}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        contacts: { ...draftConfig.contacts, instagramHandle: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={draftConfig.contacts.location}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        contacts: { ...draftConfig.contacts, location: e.target.value }
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Email de Acesso ao Painel Admin
                  </label>
                  <input
                    type="email"
                    value={draftConfig.adminCredentials.email}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        adminCredentials: {
                          ...draftConfig.adminCredentials,
                          email: e.target.value
                        }
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                    Nova Palavra-passe do Painel Admin
                  </label>
                  <input
                    type="text"
                    value={draftConfig.adminCredentials.passcode}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        adminCredentials: {
                          ...draftConfig.adminCredentials,
                          passcode: e.target.value
                        }
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-neutral-300 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Documentação Técnica de Publicação & Contas Externas */}
            <div className="bg-[#0A0A0A] text-white p-6 sm:p-8 border border-neutral-800 space-y-4">
              <div className="flex items-center gap-2 text-[#B8B0A4] text-xs uppercase tracking-[0.2em]">
                <Info className="w-4 h-4" />
                <span>Arquitetura Técnica & Publicação em Domínio Próprio</span>
              </div>
              <h3 className="font-serif-editorial text-2xl text-white">
                O que precisa para publicar na internet com domínio próprio (ex: artoliveira.cv)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs text-neutral-300 leading-relaxed">
                <div className="p-4 bg-neutral-900 border border-neutral-800">
                  <p className="text-white font-semibold mb-1.5">
                    1. Base de Dados & Imagens (Firebase)
                  </p>
                  <p>
                    Este site já está estruturado com <strong>Firebase Firestore & Auth</strong>.
                    Para publicar externamente no seu próprio servidor, basta criar uma conta
                    gratuita no Google Firebase (plano Spark) e colar as chaves do projeto.
                  </p>
                </div>
                <div className="p-4 bg-neutral-900 border border-neutral-800">
                  <p className="text-white font-semibold mb-1.5">
                    2. Alojamento & Domínio (.cv / .com)
                  </p>
                  <p>
                    Pode alojar gratuitamente na <strong>Vercel</strong>, <strong>Netlify</strong>{' '}
                    ou <strong>Firebase Hosting</strong> e ligar o seu domínio oficial (ex:
                    artoliveira.cv ou artoliveira.com) com certificado SSL automático.
                  </p>
                </div>
                <div className="p-4 bg-neutral-900 border border-neutral-800">
                  <p className="text-white font-semibold mb-1.5">
                    3. Pagamentos Futuros em Cabo Verde
                  </p>
                  <p>
                    A loja está preparada para concluir reservas via WhatsApp e pronta para
                    integrar futuramente o gateway <strong>SISP / vinti4</strong> assim que
                    obtiver credenciais comerciais bancárias em Cabo Verde.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}