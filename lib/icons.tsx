const P: Record<string, React.ReactNode> = {
  semana: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4M7 14h2M11 14h2M15 14h2M7 17h2" /></>,
  transcribir: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="m8 7 5 3-5 3M7 17h10" /></>,
  imagen: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m3 17 5-5 4 4 4-5 5 6M16 2v5M14 4h5" /></>,
  guion: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h6M9 15h4" /></>,
  foto: <><rect x="3" y="5" width="18" height="15" rx="2" /><circle cx="12" cy="12" r="4" /><path d="M7 5l2-2h6l2 2" /></>,
  video: <><rect x="3" y="5" width="13" height="14" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
  hooks: <><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9h8M8 12h5" /></>,
  creativo: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-8 8" /></>,
  whatsapp: <><path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.2-4.5A9 9 0 1 1 21 12z" /><path d="M9 10h6M9 13h4" /></>,
  copy: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13 7l4 4" /></>,
  prompt: <><path d="M4 6h16M4 12h10M4 18h7" /><path d="m17 14 1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5z" /></>,
  landing: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 8h18M7 12h6M7 16h4M15 12h2v4h-2z" /></>,
  landingpro: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 8h18M7 12h5M7 16h3" /><path d="m17 12 1 2 2 1-2 1-1 2-1-2-2-1 2-1z" /></>,
  producto: <><path d="M3 8l9-5 9 5v8l-9 5-9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></>,
  retrato: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  ficha: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  imagen3d: <><path d="M3 8l9-5 9 5v8l-9 5-9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></>,
  video3d: <><path d="M3 8l9-5 9 5v8l-9 5-9-5z" /><path d="m10 10 4 2.5-4 2.5z" /></>,
  buscar: <><circle cx="11" cy="11" r="7" /><path d="m21 21-5-5" /></>,
  anuncio: <><path d="M3 10v4h4l7 5V5L7 10z" /><path d="M18 8a5 5 0 0 1 0 8" /></>,
  profit: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0" /></>,
}
export const Icon = ({ name }: { name: keyof typeof P | string }) => (
  <span className="ico" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{P[name]}</svg>
  </span>
)
