import React, { useState, useEffect } from 'react';
import {
  Menu, X, ArrowUpRight, Instagram, Mail, Phone, MapPin,
  Lock, LogOut, Plus, Trash2, Edit3, Check, Upload, Eye,
  ShoppingBag, Send, Download, Shield, Image as ImageIcon,
  Layers, User, Award, FileText, Settings, MessageSquare, Sparkles
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig';

// Inicializa Firebase apenas se o artista já tiver colado as chaves reais
let db = null;
if (isFirebaseConfigured()) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
  } catch (e) {
    console.warn("Firebase em modo local:", e);
  }
}

const DEFAULT_DATA = {
  hero: {
    artistName: "ART OLIVEIRA",
    subtitle: "Artista visual cabo-verdiano",
    quote: "“Explorando a arte através do realismo, da expressão e da criatividade.”",
    manifesto: "Cada traço procura revelar a essência humana, a memória cultural e a profundidade silenciosa do olhar.",
    heroImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1400&q=85"
  },
  about: {
    portraitImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=85",
    bioParagraph1: "Art Oliveira é um artista visual cabo-verdiano, natural de São Nicolau, cuja prática artística explora diferentes linguagens e formas de expressão visual.",
    bioParagraph2: "O seu trabalho destaca-se especialmente pelo desenho realista a lápis, com particular atenção aos retratos, aos detalhes, à expressão e à representação da realidade.",
    bioParagraph3: "A sua produção artística estende-se também à pintura em tela, intervenções murais e outras experiências visuais.",
    bioParagraph4: "A sua trajetória inclui participação em iniciativas e exposições internacionais, incluindo a Bienal de Jovens Criadores da CPLP, em Portugal, e experiências de exposição no Luxemburgo.",
    exhibitions: [
      { id: "ex-1", year: "Internacional", title: "Bienal de Jovens Criadores da CPLP", location: "Portugal", type: "Participação Oficial" },
      { id: "ex-2", year: "Internacional", title: "Exposições e Mostras de Artes Visuais", location: "Luxemburgo", type: "Exposição" },
      { id: "ex-3", year: "Nacional", title: "Mostras Culturais & Arte Mural", location: "Cabo Verde", type: "Exposições e Intervenções" }
    ]
  },
  categories: [
    "Desenho realista a lápis",
    "Retratos",
    "Pintura em tela",
    "Arte mural",
    "Projetos especiais",
    "Outros trabalhos artísticos"
  ],
  artworks: [
    {
      id: "art-1",
      title: "Olhar de São Nicolau (Obra de Demonstração)",
      year: "2025",
      category: "Desenho realista a lápis",
      technique: "Grafite sobre papel de algodão 300g",
      dimensions: "50 × 70 cm",
      description: "Estudo realista focado na expressividade do olhar, textura da pele e contraste de luz e sombra. Substitua esta obra de demonstração pela sua fotografia real no painel administrativo.",
      image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1000&q=85",
      forSale: true,
      priceCVE: 35000,
      status: "Disponível",
      featured: true
    },
    {
      id: "art-2",
      title: "Memória Atlântica (Obra de Demonstração)",
      year: "2025",
      category: "Pintura em tela",
      technique: "Acrílico e técnica mista sobre tela",
      dimensions: "80 × 100 cm",
      description: "Composição pictórica contemporânea inspirada nas paisagens e na força humana do arquipélago cabo-verdiano.",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1000&q=85",
      forSale: true,
      priceCVE: 65000,
      status: "Disponível",
      featured: true
    },
    {
      id: "art-3",
      title: "Expressão em Grafite (Obra de Demonstração)",
      year: "2024",
      category: "Retratos",
      technique: "Lápis de grafite e carvão sobre papel",
      dimensions: "42 × 59,4 cm",
      description: "Retrato realista executado manualmente com foco nos micro-detalhes e na profundidade emocional.",
      image: "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?auto=format&fit=crop&w=1000&q=85",
      forSale: false,
      priceCVE: 0,
      status: "Coleção Privada",
      featured: true
    }
  ],
  contact: {
    instagramHandle: "@artoliveira_oficial",
    instagramUrl: "https://instagram.com/artoliveira_oficial",
    whatsappNumber: "+238 900 00 00",
    email: "contacto@artoliveira.cv",
    location: "São Nicolau / Cabo Verde"
  },
  adminCredentials: {
    email: "admin@artoliveira.cv",
    password: "artoliveira2026"
  },
  inquiries: [],
  commissions: []
};

const STORAGE_KEY = "art_oliveira_official_cms_v1";

function formatCVE(amount) {
  if (!amount || Number(amount) <= 0) return "Sob consulta";
  return new Intl.NumberFormat("pt-PT").format(Number(amount)) + " CVE";
}

function cleanPhoneForWhatsApp(phone) {
  return String(phone || "").replace(/[^0-9]/g, "");
}

export default function App() {
  const [siteData, setSiteData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_DATA, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_DATA;
  });

  const [currentPage, setCurrentPage] = useState("INÍCIO");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Todas");

  // Auth & Admin States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [adminTab, setAdminTab] = useState("obras");
  const [toastMessage, setToastMessage] = useState("");

  // Sincronização em tempo real com Firebase Firestore (quando configurado)
  useEffect(() => {
    if (!db) return;
    const docRef = doc(db, "website", "art_oliveira_main");
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data();
        setSiteData((prev) => ({ ...prev, ...cloudData }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData));
      }
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const persistData = async (updatedData) => {
    setSiteData(updatedData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (e) {
      showToast("Aviso: Imagem muito pesada para memória local. Recomenda-se comprimir.");
    }
    if (db) {
      try {
        await setDoc(doc(db, "website", "art_oliveira_main"), updatedData);
      } catch (err) {
        console.error("Erro ao guardar na nuvem:", err);
      }
    }
  };

  const handleImageUpload = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1400;
        let width = img.width;
        let height = img.height;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        callback(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (
      loginEmail.trim().toLowerCase() === siteData.adminCredentials.email.toLowerCase() &&
      loginPassword === siteData.adminCredentials.password
    ) {
      setIsAdminAuthenticated(true);
      setShowLoginModal(false);
      setLoginError("");
      setCurrentPage("ADMIN");
      showToast("Sessão iniciada no Painel Privado.");
    } else {
      setLoginError("Credenciais inválidas. Verifique o email e a palavra-passe.");
    }
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setSelectedArtwork(null);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openWhatsApp = (messageText) => {
    const num = cleanPhoneForWhatsApp(siteData.contact.whatsappNumber);
    const url = `https://wa.me/${num}?text=${encodeURIComponent(messageText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Commission Form State
  const [commForm, setCommForm] = useState({
    name: "",
    contact: "",
    type: "Retrato realista a lápis",
    dimensions: "50 × 70 cm",
    budget: "",
    description: "",
    referenceImage: ""
  });

  const handleCommissionSubmit = async (e) => {
    e.preventDefault();
    const newComm = {
      id: "comm-" + Date.now(),
      date: new Date().toLocaleDateString("pt-PT"),
      ...commForm,
      status: "Novo pedido"
    };
    await persistData({
      ...siteData,
      commissions: [newComm, ...(siteData.commissions || [])]
    });
    const msg = `Olá Art Oliveira! Gostaria de solicitar uma encomenda personalizada:

• Nome: ${commForm.name}
• Tipo de trabalho: ${commForm.type}
• Dimensões pretendidas: ${commForm.dimensions}
• Orçamento aproximado: ${commForm.budget || "A combinar"}
• Descrição: ${commForm.description}`;
    openWhatsApp(msg);
    showToast("Pedido registado e encaminhado para o WhatsApp!");
  };

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const newMsg = {
      id: "msg-" + Date.now(),
      date: new Date().toLocaleDateString("pt-PT"),
      ...contactForm
    };
    await persistData({
      ...siteData,
      inquiries: [newMsg, ...(siteData.inquiries || [])]
    });
    setContactForm({ name: "", email: "", subject: "", message: "" });
    showToast("Mensagem enviada com sucesso para Art Oliveira.");
  };

  // Admin Artwork Form State
  const [editingArt, setEditingArt] = useState(null);
  const [newArt, setNewArt] = useState({
    title: "",
    year: new Date().getFullYear().toString(),
    category: "Desenho realista a lápis",
    technique: "",
    dimensions: "",
    description: "",
    image: "",
    forSale: true,
    priceCVE: "",
    status: "Disponível",
    featured: true
  });

  const handleSaveArtwork = async (e) => {
    e.preventDefault();
    if (!newArt.title || !newArt.image) {
      showToast("Por favor adicione um título e uma fotografia da obra.");
      return;
    }
    if (editingArt) {
      const updated = siteData.artworks.map((a) =>
        a.id === editingArt.id ? { ...newArt, id: editingArt.id, priceCVE: Number(newArt.priceCVE) || 0 } : a
      );
      await persistData({ ...siteData, artworks: updated });
      setEditingArt(null);
      showToast("Obra atualizada com sucesso!");
    } else {
      const created = {
        ...newArt,
        id: "art-" + Date.now(),
        priceCVE: Number(newArt.priceCVE) || 0
      };
      await persistData({ ...siteData, artworks: [created, ...siteData.artworks] });
      showToast("Nova obra publicada na galeria!");
    }
    setNewArt({
      title: "",
      year: new Date().getFullYear().toString(),
      category: siteData.categories[0] || "Desenho realista a lápis",
      technique: "",
      dimensions: "",
      description: "",
      image: "",
      forSale: true,
      priceCVE: "",
      status: "Disponível",
      featured: true
    });
  };

  const handleDeleteArtwork = async (id) => {
    if (!window.confirm("Tem a certeza que pretende eliminar esta obra permanentemente?")) return;
    const filtered = siteData.artworks.filter((a) => a.id !== id);
    await persistData({ ...siteData, artworks: filtered });
    showToast("Obra eliminada.");
  };

  const navItems = ["INÍCIO", "SOBRE", "OBRAS", "LOJA", "ENCOMENDAS", "CONTACTO"];

  const filteredArtworks =
    activeCategory === "Todas"
      ? siteData.artworks
      : siteData.artworks.filter((art) => art.category === activeCategory);

  const shopArtworks = siteData.artworks.filter((art) => art.forSale);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#0A0A0A]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A0A0A] text-white px-5 py-3 text-sm tracking-wide shadow-2xl border border-neutral-800 flex items-center gap-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Lightbox Modal para ampliar fotografias */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-10"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 border border-white/20"
            onClick={() => setLightboxImage(null)}
            aria-label="Fechar visualização"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage.image}
            alt={lightboxImage.title}
            className="max-h-[88vh] max-w-[92vw] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-white/90 bg-black/60 px-6 py-2 backdrop-blur-sm">
            <p className="font-editorial text-xl">{lightboxImage.title}</p>
            <p className="text-xs text-neutral-400 uppercase tracking-widest">
              {lightboxImage.technique} • {lightboxImage.dimensions}
            </p>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 max-w-md w-full p-8 shadow-2xl relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-neutral-500 mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Área Privada</span>
            </div>
            <h2 className="font-editorial text-3xl mb-6">Administração ART OLIVEIRA</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                  Email de Administrador
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@artoliveira.cv"
                  className="w-full border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                  Palavra-passe
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-neutral-300 px-3.5 py-2.5 text-sm focus:outline-none focus:border-black"
                />
              </div>
              {loginError && <p className="text-xs text-red-600">{loginError}</p>}
              <button
                type="submit"
                className="w-full bg-[#0A0A0A] text-white py-3 text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition"
              >
                Entrar no Painel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER / NAVEGAÇÃO PRINCIPAL */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <button
            onClick={() => navigateTo("INÍCIO")}
            className="text-left group"
          >
            <span className="font-editorial text-2xl md:text-3xl tracking-[0.18em] font-semibold block">
              {siteData.hero.artistName}
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => navigateTo(item)}
                className={`text-xs tracking-[0.2em] transition-colors py-1 border-b ${
                  currentPage === item
                    ? "border-black text-black font-semibold"
                    : "border-transparent text-neutral-600 hover:text-black"
                }`}
              >
                {item}
              </button>
            ))}

            {/* Botão discreto de administração, visível apenas depois de iniciar sessão */}
            {isAdminAuthenticated && (
              <button
                onClick={() => navigateTo("ADMIN")}
                className={`text-xs tracking-[0.18em] px-3 py-1.5 border flex items-center gap-1.5 transition ${
                  currentPage === "ADMIN"
                    ? "bg-black text-white border-black"
                    : "border-neutral-400 text-black hover:bg-black hover:text-white"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                PAINEL ADMIN
              </button>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-black"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF9F6] border-b border-neutral-200 px-6 py-6 space-y-4">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => navigateTo(item)}
                className={`block w-full text-left text-sm tracking-[0.2em] py-2 ${
                  currentPage === item ? "font-semibold text-black" : "text-neutral-600"
                }`}
              >
                {item}
              </button>
            ))}
            {isAdminAuthenticated && (
              <button
                onClick={() => navigateTo("ADMIN")}
                className="w-full text-left text-sm tracking-[0.2em] py-2 font-semibold text-black border-t border-neutral-200 pt-4 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" /> PAINEL ADMINISTRATIVO
              </button>
            )}
          </div>
        )}
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1">
        {/* ================= PÁGINA 1: INÍCIO ================= */}
        {currentPage === "INÍCIO" && (
          <div>
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                    {siteData.hero.subtitle}
                  </p>
                  <h1 className="font-editorial text-5xl md:text-7xl tracking-[0.08em] leading-[1.05] font-medium">
                    {siteData.hero.artistName}
                  </h1>
                  <p className="font-editorial italic text-2xl md:text-3xl text-neutral-800 leading-relaxed">
                    {siteData.hero.quote}
                  </p>
                  <p className="text-sm md:text-base text-neutral-600 leading-relaxed max-w-xl">
                    {siteData.hero.manifesto}
                  </p>
                  <div className="pt-4 flex flex-wrap gap-4">
                    <button
                      onClick={() => navigateTo("OBRAS")}
                      className="bg-[#0A0A0A] text-white px-7 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition flex items-center gap-2"
                    >
                      Explorar Obras <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigateTo("SOBRE")}
                      className="border border-[#0A0A0A] text-[#0A0A0A] px-7 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-[#0A0A0A] hover:text-white transition"
                    >
                      Conhecer o Artista
                    </button>
                    <button
                      onClick={() => navigateTo("CONTACTO")}
                      className="px-5 py-3.5 text-xs uppercase tracking-[0.2em] text-neutral-600 hover:text-black underline underline-offset-4"
                    >
                      Entrar em Contacto
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div
                    className="relative bg-neutral-100 overflow-hidden shadow-xl cursor-zoom-in group"
                    onClick={() =>
                      setLightboxImage({
                        image: siteData.hero.heroImage,
                        title: siteData.hero.artistName,
                        technique: siteData.hero.subtitle,
                        dimensions: "Obra em Destaque"
                      })
                    }
                  >
                    <img
                      src={siteData.hero.heroImage}
                      alt="Obra em destaque de Art Oliveira"
                      className="w-full h-[460px] md:h-[600px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Seleção de Obras Recentes */}
            <section className="bg-white border-t border-neutral-200/70 py-20">
              <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-neutral-400 mb-2">
                      Portfólio Selecionado
                    </p>
                    <h2 className="font-editorial text-4xl md:text-5xl">Obras Recentes</h2>
                  </div>
                  <button
                    onClick={() => navigateTo("OBRAS")}
                    className="text-xs uppercase tracking-[0.2em] border-b border-black pb-1 self-start md:self-auto hover:text-neutral-600 transition"
                  >
                    Ver Galeria Completa →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {siteData.artworks.slice(0, 3).map((art) => (
                    <div
                      key={art.id}
                      onClick={() => {
                        setSelectedArtwork(art);
                        setCurrentPage("OBRAS");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="group cursor-pointer"
                    >
                      <div className="aspect-[4/5] bg-neutral-100 overflow-hidden mb-4">
                        <img
                          src={art.image}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">
                        {art.category} • {art.year}
                      </p>
                      <h3 className="font-editorial text-2xl mt-1 group-hover:underline">
                        {art.title}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">{art.technique}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================= PÁGINA 2: SOBRE O ARTISTA ================= */}
        {currentPage === "SOBRE" && (
          <section className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-3">
              Biografia & Trajetória
            </p>
            <h1 className="font-editorial text-4xl md:text-6xl mb-12">Sobre o Artista</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5">
                <div className="bg-neutral-100 overflow-hidden shadow-md">
                  <img
                    src={siteData.about.portraitImage}
                    alt="Art Oliveira"
                    className="w-full aspect-[4/5] object-cover"
                  />
                </div>
                <div className="mt-4 border-l-2 border-black pl-4 py-1">
                  <p className="font-editorial text-xl">Art Oliveira</p>
                  <p className="text-xs uppercase tracking-widest text-neutral-500">
                    Natural de São Nicolau, Cabo Verde
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6 text-neutral-700 leading-relaxed text-base">
                <p className="text-lg text-black font-medium leading-relaxed">
                  {siteData.about.bioParagraph1}
                </p>
                <p>{siteData.about.bioParagraph2}</p>
                <p>{siteData.about.bioParagraph3}</p>
                <p>{siteData.about.bioParagraph4}</p>

                {/* Exposições e Participações */}
                <div className="pt-8 border-t border-neutral-200">
                  <h2 className="font-editorial text-3xl text-black mb-6">
                    Exposições & Participações
                  </h2>
                  <div className="space-y-4">
                    {siteData.about.exhibitions.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-neutral-200/70 gap-1"
                      >
                        <div>
                          <p className="font-medium text-black">{ex.title}</p>
                          <p className="text-xs text-neutral-500">{ex.type}</p>
                        </div>
                        <div className="text-xs uppercase tracking-widest text-neutral-600">
                          {ex.location} • {ex.year}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= PÁGINA 3: GALERIA DE OBRAS ================= */}
        {currentPage === "OBRAS" && (
          <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
            {selectedArtwork ? (
              /* Página Individual da Obra */
              <div>
                <button
                  onClick={() => setSelectedArtwork(null)}
                  className="text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-black mb-8 inline-flex items-center gap-2"
                >
                  ← Voltar à Galeria
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  <div className="lg:col-span-7 bg-neutral-100 relative group">
                    <img
                      src={selectedArtwork.image}
                      alt={selectedArtwork.title}
                      className="w-full max-h-[78vh] object-contain mx-auto cursor-zoom-in"
                      onClick={() => setLightboxImage(selectedArtwork)}
                    />
                    <button
                      onClick={() => setLightboxImage(selectedArtwork)}
                      className="mt-3 text-xs uppercase tracking-widest text-neutral-500 hover:text-black flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" /> Ampliar fotografia em ecrã inteiro
                    </button>
                  </div>

                  <div className="lg:col-span-5 space-y-6">
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
                      {selectedArtwork.category}
                    </p>
                    <h1 className="font-editorial text-4xl md:text-5xl leading-tight">
                      {selectedArtwork.title}
                    </h1>

                    <div className="border-y border-neutral-200 py-5 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Ano de criação</span>
                        <span className="font-medium">{selectedArtwork.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Técnica utilizada</span>
                        <span className="font-medium text-right">{selectedArtwork.technique}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Dimensões</span>
                        <span className="font-medium">{selectedArtwork.dimensions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Disponibilidade</span>
                        <span className="font-semibold">
                          {selectedArtwork.forSale ? selectedArtwork.status : "Não disponível para venda"}
                        </span>
                      </div>
                      {selectedArtwork.forSale && selectedArtwork.priceCVE > 0 && (
                        <div className="flex justify-between pt-2 border-t border-neutral-100">
                          <span className="text-neutral-500">Valor</span>
                          <span className="font-editorial text-2xl">
                            {formatCVE(selectedArtwork.priceCVE)}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-neutral-700 leading-relaxed text-sm md:text-base">
                      {selectedArtwork.description}
                    </p>

                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                      {selectedArtwork.forSale && selectedArtwork.status === "Disponível" && (
                        <button
                          onClick={() =>
                            openWhatsApp(
                              `Olá Art Oliveira! Tenho interesse em adquirir a obra "${selectedArtwork.title}" (${formatCVE(selectedArtwork.priceCVE)}).`
                            )
                          }
                          className="bg-[#0A0A0A] text-white px-6 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition text-center"
                        >
                          Adquirir via WhatsApp
                        </button>
                      )}
                      <button
                        onClick={() =>
                          openWhatsApp(
                            `Olá Art Oliveira! Gostaria de obter mais informações sobre a obra "${selectedArtwork.title}".`
                          )
                        }
                        className="border border-black px-6 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white transition text-center"
                      >
                        Consultar sobre esta obra
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Grelha da Galeria */
              <div>
                <div className="max-w-2xl mb-10">
                  <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-2">
                    Arquivo & Acervo
                  </p>
                  <h1 className="font-editorial text-4xl md:text-6xl">Galeria de Obras</h1>
                </div>

                {/* Filtro de Categorias */}
                <div className="flex flex-wrap gap-2 pb-8 mb-10 border-b border-neutral-200">
                  {["Todas", ...siteData.categories].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 text-xs uppercase tracking-[0.15em] transition ${
                        activeCategory === cat
                          ? "bg-[#0A0A0A] text-white"
                          : "bg-white border border-neutral-200 text-neutral-600 hover:border-black"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {filteredArtworks.length === 0 ? (
                  <p className="text-neutral-500 py-12">
                    Nenhuma obra publicada nesta categoria de momento.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredArtworks.map((art) => (
                      <div
                        key={art.id}
                        onClick={() => setSelectedArtwork(art)}
                        className="group cursor-pointer bg-white border border-neutral-200/60 p-4 hover:shadow-lg transition"
                      >
                        <div className="aspect-[4/5] bg-neutral-100 overflow-hidden mb-4 relative">
                          <img
                            src={art.image}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          {art.forSale && (
                            <span className="absolute top-3 right-3 bg-white/95 text-black px-3 py-1 text-[10px] uppercase tracking-widest font-medium">
                              {art.status}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                          {art.category} • {art.year}
                        </p>
                        <h3 className="font-editorial text-2xl mt-1 group-hover:underline">
                          {art.title}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1">
                          {art.technique} — {art.dimensions}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ================= PÁGINA 4: LOJA ONLINE ================= */}
        {currentPage === "LOJA" && (
          <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
            <div className="max-w-3xl mb-12">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-2">
                Colecionadores & Aquisições
              </p>
              <h1 className="font-editorial text-4xl md:text-6xl mb-4">Loja Oficial</h1>
              <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
                Obras originais certificadas pelo artista, com valores em Escudos Cabo-Verdianos (CVE).
                A reserva e conclusão da aquisição são realizadas diretamente com o atelier via WhatsApp
                (estrutura preparada para futura integração com pagamentos eletrónicos em Cabo Verde).
              </p>
            </div>

            {/* Banner Encomendas Personalizadas */}
            <div className="bg-[#0A0A0A] text-white p-8 md:p-10 mb-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-1">
                  Obras por Medida
                </p>
                <h2 className="font-editorial text-3xl">Encomendas Personalizadas</h2>
                <p className="text-sm text-neutral-300 mt-1 max-w-xl">
                  Solicite retratos realistas a lápis, pinturas em tela ou projetos artísticos exclusivos.
                </p>
              </div>
              <button
                onClick={() => navigateTo("ENCOMENDAS")}
                className="bg-white text-black px-6 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-neutral-200 transition shrink-0"
              >
                Solicitar Encomenda
              </button>
            </div>

            {/* Lista de Obras à Venda */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {shopArtworks.map((art) => (
                <div
                  key={art.id}
                  className="bg-white border border-neutral-200 flex flex-col justify-between"
                >
                  <div>
                    <div
                      className="aspect-[4/5] bg-neutral-100 overflow-hidden relative cursor-zoom-in"
                      onClick={() => setLightboxImage(art)}
                    >
                      <img
                        src={art.image}
                        alt={art.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <span
                        className={`absolute top-3 left-3 px-3 py-1 text-[10px] uppercase tracking-widest font-semibold ${
                          art.status === "Disponível"
                            ? "bg-black text-white"
                            : "bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {art.status}
                      </span>
                    </div>
                    <div className="p-6">
                      <p className="text-[11px] uppercase tracking-widest text-neutral-400">
                        {art.technique} • {art.dimensions}
                      </p>
                      <h3 className="font-editorial text-2xl mt-1">{art.title}</h3>
                      <p className="text-xs text-neutral-600 mt-2 line-clamp-3 leading-relaxed">
                        {art.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-3 border-t border-neutral-100">
                    <p className="font-editorial text-2xl mb-4">{formatCVE(art.priceCVE)}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        disabled={art.status !== "Disponível"}
                        onClick={() =>
                          openWhatsApp(
                            `Olá Art Oliveira! Quero comprar a obra "${art.title}" (${formatCVE(art.priceCVE)}). Como podemos proceder?`
                          )
                        }
                        className={`py-3 text-[11px] uppercase tracking-[0.18em] transition ${
                          art.status === "Disponível"
                            ? "bg-[#0A0A0A] text-white hover:bg-neutral-800"
                            : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                        }`}
                      >
                        Comprar
                      </button>
                      <button
                        onClick={() =>
                          openWhatsApp(
                            `Olá Art Oliveira! Gostaria de consultar detalhes sobre a obra "${art.title}".`
                          )
                        }
                        className="border border-black py-3 text-[11px] uppercase tracking-[0.18em] hover:bg-black hover:text-white transition"
                      >
                        Consultar esta obra
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= PÁGINA 5: ENCOMENDAS ================= */}
        {currentPage === "ENCOMENDAS" && (
          <section className="max-w-5xl mx-auto px-6 md:px-12 py-16">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-2">
              Arte Exclusiva por Medida
            </p>
            <h1 className="font-editorial text-4xl md:text-6xl mb-6">Encomendas</h1>
            <p className="text-neutral-600 leading-relaxed mb-10 max-w-2xl">
              Pode encomendar obras originais criadas especialmente para si ou para oferecer.
              Trabalhamos sob medida nas seguintes modalidades:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                "Retratos realistas a lápis",
                "Pinturas personalizadas",
                "Obras em tela",
                "Projetos artísticos especiais"
              ].map((item) => (
                <div key={item} className="bg-white border border-neutral-200 p-5">
                  <p className="font-editorial text-xl">{item}</p>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleCommissionSubmit}
              className="bg-white border border-neutral-200 p-8 md:p-10 space-y-6"
            >
              <h2 className="font-editorial text-3xl">Formulário de Pedido</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-2">
                    O Seu Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={commForm.name}
                    onChange={(e) => setCommForm({ ...commForm, name: e.target.value })}
                    className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-2">
                    WhatsApp ou Email *
                  </label>
                  <input
                    type="text"
                    required
                    value={commForm.contact}
                    onChange={(e) => setCommForm({ ...commForm, contact: e.target.value })}
                    className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-2">
                    Tipo de Trabalho
                  </label>
                  <select
                    value={commForm.type}
                    onChange={(e) => setCommForm({ ...commForm, type: e.target.value })}
                    className="w-full border border-neutral-300 px-4 py-3 text-sm bg-white focus:outline-none focus:border-black"
                  >
                    <option>Retrato realista a lápis</option>
                    <option>Pintura personalizada</option>
                    <option>Obra em tela</option>
                    <option>Projeto artístico especial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-2">
                    Dimensões Pretendidas
                  </label>
                  <input
                    type="text"
                    value={commForm.dimensions}
                    onChange={(e) => setCommForm({ ...commForm, dimensions: e.target.value })}
                    placeholder="Ex: A3, 50x70 cm, 100x120 cm"
                    className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-2">
                    Orçamento Aproximado (CVE)
                  </label>
                  <input
                    type="text"
                    value={commForm.budget}
                    onChange={(e) => setCommForm({ ...commForm, budget: e.target.value })}
                    placeholder="Ex: 25.000 CVE"
                    className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-2">
                  Descrição da Ideia / Detalhes *
                </label>
                <textarea
                  rows="4"
                  required
                  value={commForm.description}
                  onChange={(e) => setCommForm({ ...commForm, description: e.target.value })}
                  placeholder="Descreva o retrato, composição, prazo desejado ou detalhes importantes..."
                  className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-2">
                  Anexar Fotografia de Referência (Opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageUpload(e.target.files[0], (base64) =>
                      setCommForm({ ...commForm, referenceImage: base64 })
                    )
                  }
                  className="text-xs text-neutral-600"
                />
                {commForm.referenceImage && (
                  <img
                    src={commForm.referenceImage}
                    alt="Referência"
                    className="mt-3 h-28 object-cover border border-neutral-200"
                  />
                )}
              </div>

              <button
                type="submit"
                className="bg-[#0A0A0A] text-white px-8 py-4 text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition inline-flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Enviar Pedido pelo WhatsApp
              </button>
            </form>
          </section>
        )}

        {/* ================= PÁGINA 6: CONTACTO ================= */}
        {currentPage === "CONTACTO" && (
          <section className="max-w-6xl mx-auto px-6 md:px-12 py-16">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-2">
              Atelier & Representação
            </p>
            <h1 className="font-editorial text-4xl md:text-6xl mb-12">Contacto</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5 space-y-8">
                <p className="text-neutral-600 leading-relaxed">
                  Para exposições, galerias, instituições culturais, aquisição de obras ou imprensa,
                  entre em contacto diretamente através dos canais oficiais.
                </p>

                <div className="space-y-5 text-sm">
                  <a
                    href={siteData.contact.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 bg-white border border-neutral-200 hover:border-black transition"
                  >
                    <Instagram className="w-5 h-5" />
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-neutral-400">Instagram</p>
                      <p className="font-medium">{siteData.contact.instagramHandle}</p>
                    </div>
                  </a>

                  <button
                    onClick={() => openWhatsApp("Olá Art Oliveira! Gostaria de entrar em contacto.")}
                    className="w-full text-left flex items-center gap-4 p-4 bg-white border border-neutral-200 hover:border-black transition"
                  >
                    <Phone className="w-5 h-5" />
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-neutral-400">WhatsApp</p>
                      <p className="font-medium">{siteData.contact.whatsappNumber}</p>
                    </div>
                  </button>

                  <a
                    href={`mailto:${siteData.contact.email}`}
                    className="flex items-center gap-4 p-4 bg-white border border-neutral-200 hover:border-black transition"
                  >
                    <Mail className="w-5 h-5" />
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-neutral-400">Email</p>
                      <p className="font-medium">{siteData.contact.email}</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 p-4 bg-white border border-neutral-200">
                    <MapPin className="w-5 h-5" />
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-neutral-400">Localização</p>
                      <p className="font-medium">{siteData.contact.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <form
                  onSubmit={handleContactSubmit}
                  className="bg-white border border-neutral-200 p-8 space-y-5"
                >
                  <h2 className="font-editorial text-3xl">Enviar Mensagem</h2>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                      Assunto
                    </label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                      Mensagem *
                    </label>
                    <textarea
                      rows="5"
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#0A0A0A] text-white px-8 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-neutral-800 transition"
                  >
                    Enviar Mensagem
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* ================= ÁREA PRIVADA DE ADMINISTRAÇÃO ================= */}
        {currentPage === "ADMIN" && isAdminAuthenticated && (
          <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-200 pb-6 mb-8 gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-700 font-semibold">
                  ● Modo Administrador Ativo ({db ? "Ligado à Nuvem Firebase" : "Armazenamento Local"})
                </p>
                <h1 className="font-editorial text-4xl mt-1">Painel de Gestão — ART OLIVEIRA</h1>
              </div>
              <button
                onClick={() => {
                  setIsAdminAuthenticated(false);
                  navigateTo("INÍCIO");
                }}
                className="border border-neutral-300 px-4 py-2 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition inline-flex items-center gap-2 self-start"
              >
                <LogOut className="w-4 h-4" /> Terminar Sessão
              </button>
            </div>

            {/* Separadores do CMS */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { id: "obras", label: "Obras & Loja" },
                { id: "inicio", label: "Página Inicial" },
                { id: "sobre", label: "Biografia & Exposições" },
                { id: "contactos", label: "Contactos & Redes" },
                { id: "pedidos", label: `Encomendas & Mensagens (${(siteData.commissions?.length || 0) + (siteData.inquiries?.length || 0)})` },
                { id: "seguranca", label: "Segurança & Backup" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`px-4 py-2.5 text-xs uppercase tracking-wider transition ${
                    adminTab === tab.id
                      ? "bg-black text-white"
                      : "bg-white border border-neutral-200 text-neutral-700 hover:border-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: OBRAS & LOJA */}
            {adminTab === "obras" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <form
                  onSubmit={handleSaveArtwork}
                  className="lg:col-span-5 bg-white border border-neutral-200 p-6 space-y-4 h-fit"
                >
                  <h2 className="font-editorial text-2xl">
                    {editingArt ? "Editar Obra" : "Publicar Nova Obra"}
                  </h2>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                      Fotografia da Obra *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(e.target.files[0], (base64) =>
                          setNewArt({ ...newArt, image: base64 })
                        )
                      }
                      className="text-xs"
                    />
                    {newArt.image && (
                      <img src={newArt.image} alt="Preview" className="mt-2 h-36 object-cover border" />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                      Título da Obra *
                    </label>
                    <input
                      type="text"
                      required
                      value={newArt.title}
                      onChange={(e) => setNewArt({ ...newArt, title: e.target.value })}
                      className="w-full border border-neutral-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                        Categoria
                      </label>
                      <select
                        value={newArt.category}
                        onChange={(e) => setNewArt({ ...newArt, category: e.target.value })}
                        className="w-full border border-neutral-300 px-3 py-2 text-sm bg-white"
                      >
                        {siteData.categories.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                        Ano
                      </label>
                      <input
                        type="text"
                        value={newArt.year}
                        onChange={(e) => setNewArt({ ...newArt, year: e.target.value })}
                        className="w-full border border-neutral-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                        Técnica
                      </label>
                      <input
                        type="text"
                        value={newArt.technique}
                        onChange={(e) => setNewArt({ ...newArt, technique: e.target.value })}
                        placeholder="Ex: Lápis sobre papel"
                        className="w-full border border-neutral-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                        Dimensões
                      </label>
                      <input
                        type="text"
                        value={newArt.dimensions}
                        onChange={(e) => setNewArt({ ...newArt, dimensions: e.target.value })}
                        placeholder="Ex: 50 × 70 cm"
                        className="w-full border border-neutral-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                      Descrição
                    </label>
                    <textarea
                      rows="3"
                      value={newArt.description}
                      onChange={(e) => setNewArt({ ...newArt, description: e.target.value })}
                      className="w-full border border-neutral-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="border-t border-neutral-200 pt-3 space-y-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newArt.forSale}
                        onChange={(e) => setNewArt({ ...newArt, forSale: e.target.checked })}
                      />
                      Disponibilizar na Loja Online
                    </label>

                    {newArt.forSale && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                            Preço (CVE)
                          </label>
                          <input
                            type="number"
                            value={newArt.priceCVE}
                            onChange={(e) => setNewArt({ ...newArt, priceCVE: e.target.value })}
                            placeholder="35000"
                            className="w-full border border-neutral-300 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                            Estado
                          </label>
                          <select
                            value={newArt.status}
                            onChange={(e) => setNewArt({ ...newArt, status: e.target.value })}
                            className="w-full border border-neutral-300 px-3 py-2 text-sm bg-white"
                          >
                            <option>Disponível</option>
                            <option>Vendido</option>
                            <option>Reservado</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-black text-white py-3 text-xs uppercase tracking-widest hover:bg-neutral-800"
                    >
                      {editingArt ? "Guardar Alterações" : "Publicar Obra"}
                    </button>
                    {editingArt && (
                      <button
                        type="button"
                        onClick={() => setEditingArt(null)}
                        className="border border-neutral-300 px-4 py-3 text-xs uppercase"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>

                {/* Lista de Obras Existentes */}
                <div className="lg:col-span-7 space-y-4">
                  <h2 className="font-editorial text-2xl">
                    Obras Publicadas ({siteData.artworks.length})
                  </h2>
                  {siteData.artworks.map((art) => (
                    <div
                      key={art.id}
                      className="bg-white border border-neutral-200 p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={art.image}
                          alt={art.title}
                          className="w-16 h-20 object-cover bg-neutral-100"
                        />
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-neutral-400">
                            {art.category} • {art.year}
                          </p>
                          <h3 className="font-editorial text-xl">{art.title}</h3>
                          <p className="text-xs text-neutral-600">
                            {art.forSale ? `${formatCVE(art.priceCVE)} (${art.status})` : "Apenas Galeria"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingArt(art);
                            setNewArt(art);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="p-2 border border-neutral-200 hover:border-black"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArtwork(art.id)}
                          className="p-2 border border-neutral-200 hover:border-red-600 hover:text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: PÁGINA INICIAL */}
            {adminTab === "inicio" && (
              <div className="max-w-2xl bg-white border border-neutral-200 p-8 space-y-5">
                <h2 className="font-editorial text-2xl">Editar Página Inicial</h2>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Imagem Principal de Destaque
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e.target.files[0], (base64) => {
                        persistData({ ...siteData, hero: { ...siteData.hero, heroImage: base64 } });
                        showToast("Imagem principal atualizada!");
                      })
                    }
                    className="text-xs"
                  />
                  <img src={siteData.hero.heroImage} alt="Hero" className="mt-3 h-48 object-cover border" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={siteData.hero.subtitle}
                    onChange={(e) =>
                      persistData({ ...siteData, hero: { ...siteData.hero, subtitle: e.target.value } })
                    }
                    className="w-full border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Frase de Apresentação
                  </label>
                  <input
                    type="text"
                    value={siteData.hero.quote}
                    onChange={(e) =>
                      persistData({ ...siteData, hero: { ...siteData.hero, quote: e.target.value } })
                    }
                    className="w-full border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Texto Introdutório
                  </label>
                  <textarea
                    rows="3"
                    value={siteData.hero.manifesto}
                    onChange={(e) =>
                      persistData({ ...siteData, hero: { ...siteData.hero, manifesto: e.target.value } })
                    }
                    className="w-full border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: SOBRE & EXPOSIÇÕES */}
            {adminTab === "sobre" && (
              <div className="max-w-3xl bg-white border border-neutral-200 p-8 space-y-6">
                <h2 className="font-editorial text-2xl">Biografia & Fotografia do Artista</h2>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Fotografia do Artista
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e.target.files[0], (base64) => {
                        persistData({
                          ...siteData,
                          about: { ...siteData.about, portraitImage: base64 }
                        });
                        showToast("Fotografia do artista atualizada!");
                      })
                    }
                    className="text-xs"
                  />
                </div>
                {["bioParagraph1", "bioParagraph2", "bioParagraph3", "bioParagraph4"].map((key, idx) => (
                  <div key={key}>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                      Parágrafo {idx + 1}
                    </label>
                    <textarea
                      rows="3"
                      value={siteData.about[key]}
                      onChange={(e) =>
                        persistData({
                          ...siteData,
                          about: { ...siteData.about, [key]: e.target.value }
                        })
                      }
                      className="w-full border border-neutral-300 px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: CONTACTOS */}
            {adminTab === "contactos" && (
              <div className="max-w-2xl bg-white border border-neutral-200 p-8 space-y-4">
                <h2 className="font-editorial text-2xl">Contactos & Redes Sociais</h2>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    WhatsApp (com indicativo +238)
                  </label>
                  <input
                    type="text"
                    value={siteData.contact.whatsappNumber}
                    onChange={(e) =>
                      persistData({
                        ...siteData,
                        contact: { ...siteData.contact, whatsappNumber: e.target.value }
                      })
                    }
                    className="w-full border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Email Oficial
                  </label>
                  <input
                    type="email"
                    value={siteData.contact.email}
                    onChange={(e) =>
                      persistData({
                        ...siteData,
                        contact: { ...siteData.contact, email: e.target.value }
                      })
                    }
                    className="w-full border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={siteData.contact.instagramHandle}
                    onChange={(e) =>
                      persistData({
                        ...siteData,
                        contact: { ...siteData.contact, instagramHandle: e.target.value }
                      })
                    }
                    className="w-full border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={siteData.contact.location}
                    onChange={(e) =>
                      persistData({
                        ...siteData,
                        contact: { ...siteData.contact, location: e.target.value }
                      })
                    }
                    className="w-full border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: PEDIDOS & MENSAGENS */}
            {adminTab === "pedidos" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-neutral-200 p-6">
                  <h2 className="font-editorial text-2xl mb-4">Pedidos de Encomendas</h2>
                  {(siteData.commissions || []).length === 0 ? (
                    <p className="text-sm text-neutral-500">Ainda sem pedidos registados.</p>
                  ) : (
                    siteData.commissions.map((c) => (
                      <div key={c.id} className="border-b border-neutral-200 py-4 text-sm space-y-1">
                        <p className="font-semibold">{c.name} ({c.date})</p>
                        <p className="text-xs text-neutral-500">{c.type} • {c.dimensions}</p>
                        <p>{c.description}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="bg-white border border-neutral-200 p-6">
                  <h2 className="font-editorial text-2xl mb-4">Mensagens de Contacto</h2>
                  {(siteData.inquiries || []).length === 0 ? (
                    <p className="text-sm text-neutral-500">Ainda sem mensagens recebidas.</p>
                  ) : (
                    siteData.inquiries.map((m) => (
                      <div key={m.id} className="border-b border-neutral-200 py-4 text-sm space-y-1">
                        <p className="font-semibold">{m.name} — {m.email}</p>
                        <p className="text-xs text-neutral-500">{m.subject} ({m.date})</p>
                        <p>{m.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: SEGURANÇA & BACKUP */}
            {adminTab === "seguranca" && (
              <div className="max-w-2xl bg-white border border-neutral-200 p-8 space-y-6">
                <h2 className="font-editorial text-2xl">Credenciais de Acesso & Cópia de Segurança</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                      Email de Login
                    </label>
                    <input
                      type="email"
                      value={siteData.adminCredentials.email}
                      onChange={(e) =>
                        persistData({
                          ...siteData,
                          adminCredentials: { ...siteData.adminCredentials, email: e.target.value }
                        })
                      }
                      className="w-full border border-neutral-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1">
                      Nova Palavra-Passe
                    </label>
                    <input
                      type="text"
                      value={siteData.adminCredentials.password}
                      onChange={(e) =>
                        persistData({
                          ...siteData,
                          adminCredentials: { ...siteData.adminCredentials, password: e.target.value }
                        })
                      }
                      className="w-full border border-neutral-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(siteData, null, 2)], {
                        type: "application/json"
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "backup-art-oliveira.json";
                      a.click();
                    }}
                    className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Descarregar Cópia de Segurança (JSON)
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* RODAPÉ */}
      <footer className="bg-[#0A0A0A] text-white mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="font-editorial text-2xl tracking-[0.2em]">{siteData.hero.artistName}</p>
            <p className="text-xs text-neutral-400 mt-1">
              {siteData.hero.subtitle} • {siteData.contact.location}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-widest text-neutral-400">
            <a
              href={siteData.contact.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition"
            >
              Instagram
            </a>
            <button
              onClick={() => openWhatsApp("Olá Art Oliveira!")}
              className="hover:text-white transition"
            >
              WhatsApp
            </button>
            <button onClick={() => navigateTo("CONTACTO")} className="hover:text-white transition">
              Contacto
            </button>
            {!isAdminAuthenticated && (
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-neutral-600 hover:text-neutral-300 transition text-[11px]"
              >
                Área Reservada
              </button>
            )}
          </div>
        </div>
        <div className="border-t border-neutral-900 py-5 px-6 md:px-12 text-center text-[11px] text-neutral-500">
          © {new Date().getFullYear()} {siteData.hero.artistName}. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
