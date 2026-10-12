const P: Record<string, React.ReactNode> = {
  transcribir: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="m8 7 5 3-5 3M7 17h10" /></>,
  imagen: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m3 17 5-5 4 4 4-5 5 6M16 2v5M14 4h5" /></>,
  guion: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h6M9 15h4" /></>,
  foto: <><rect x="3" y="5" width="18" height="15" rx="2" /><circle cx="12" cy="12" r="4" /><path d="M7 5l2-2h6l2 2" /></>,
  video: <><rect x="3" y="5" width="13" height="14" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
  hooks: <><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9h8M8 12h5" /></>,
  creativo: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-8 8" /></>,
  whatsapp: <><path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.2-4.5A9 9 0 1 1 21 12z" /><path d="M9 10h6M9 13h4" /></>,
  copy: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13 7l4 4" /></>,
  producto: <><path d="M3 8l9-5 9 5v8l-9 5-9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></>,
  buscar: <><circle cx="11" cy="11" r="7" /><path d="m21 21-5-5" /></>,
  anuncio: <><path d="M3 10v4h4l7 5V5L7 10z" /><path d="M18 8a5 5 0 0 1 0 8" /></>,
  profit: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0" /></>,
}
export const Icon = ({ name }: { name: keyof typeof P | string }) => (
  <span className="ico" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{P[name]}</svg>
  </span>
)
