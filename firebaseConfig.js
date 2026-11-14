// =========================================================================
// CONFIGURAÇÃO DO FIREBASE (BASE DE DADOS NA NUVEM PARA ART OLIVEIRA)
// Substitui os valores abaixo pelas chaves do teu projeto em:
// https://console.firebase.google.com/
// =========================================================================

export const firebaseConfig = {
  apiKey: "COLE_AQUI_A_SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.firebasestorage.app",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000"
};

export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("COLE_AQUI");
};
