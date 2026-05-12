export const categories = ['Todos', 'Música', 'Tecnología', 'Gastronomía', 'Arte', 'Bienestar'];

export const dateFilters = [
  { label: 'Todas las fechas', value: 'all' },
  { label: 'Esta semana', value: 'week' },
  { label: 'Este mes', value: 'month' },
  { label: 'Próximos 90 días', value: 'quarter' },
];

export const events = [
  {
    id: 'neon-sessions',
    title: 'Hugel Sessions Live',
    category: 'Música',
    date: '2026-05-16T20:30:00',
    location: 'Centro de eventos, Acopi',
    price: '60000',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80',
    description:
      'Una noche inmersiva con el artista electrónico emergente mas influyente del momento, visuales unicas y zonas vip para conectar antes y después del show.',
    tickets: [
      { name: 'General', price: 60000, perks: 'Acceso al concierto y zonas comunes' },
      { name: 'Fast Pass', price: 90000, perks: 'Ingreso preferente y bebida de bienvenida' },
      { name: 'VIP', price: 120000, perks: 'Mesa separada, backstage tour y ubicacion exclusiva' },
    ],
  },
  {
    id: 'founders-summit',
    title: 'IA enterprise',
    category: 'Tecnología',
    date: '2026-05-21T09:00:00',
    location: 'Universidad ICESI, Cali',
    price: 40000,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    description:
      'Charlas accionables, mentorías express y networking social para equipos que quieren escalar productos digitales con foco en crecimiento sostenible.',
    tickets: [
      { name: 'Startup', price: 40000, perks: 'Acceso a talks y coffee breaks' },
      { name: 'Pro', price: 90000, perks: 'Incluye workshops y network de contactos' },
      { name: 'Investor', price: 150000, perks: 'Acceso a sala privada y sesiones 1:1' },
    ],
  },
  {
    id: 'terra-tasting',
    title: 'Lunch Vibes',
    category: 'Gastronomía',
    date: '2026-06-06T08:00:00',
    location: 'Granada Rooftop, Cali',
    price: 20000,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80',
    description:
      'Experiencia exclusiva con chefs locales, cocina de temporada, música acústica y experiencias de maridaje diseñadas para descubrir nuevos sabores.',
    tickets: [
      { name: 'Ingreso experiencia', price: 20000, perks: 'Acceso al lugar y música en vivo' },
      { name: 'Degustación', price: 50000, perks: 'Incluye 6 tastings y copa reutilizable' },
      { name: 'Chef Table', price: 100000, perks: 'Menú guiado de 5 tiempos' },
    ],
  },
  {
    id: 'after-dark-gallery',
    title: 'Art Gallery',
    category: 'Arte',
    date: '2026-06-11T19:00:00',
    location: 'Callao, Cali',
    price: 30000,
    image: 'https://images.unsplash.com/photo-1545987796-200677ee1011?auto=format&fit=crop&w=1200&q=80',
    description:
      'Recorrido nocturno por arte contemporáne0 con performances, artistas invitados y espacios fotográficos de estética cinematográfica.',
    tickets: [
      { name: 'Walk', price: 30000, perks: 'Recorrido libre por galerías participantes' },
      { name: 'Guided', price: 50000, perks: 'Tour con especialista invitado' },
      { name: 'Collector', price: 100000, perks: 'Preview privado y catálogo impreso' },
    ],
  },
  {
    id: 'reset-retreat',
    title: 'Reset Morning',
    category: 'Bienestar',
    date: '2026-06-20T07:30:00',
    location: 'Plazoleta Jairo Varela, Cali',
    price: 30000,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    description:
      'Sesión en lugar conmemorativo de la ciudad con yoga, respiración guiada, brunch nutritivo y micro charlas sobre hábitos de energía para liberar vibras.',
    tickets: [
      { name: 'Mat spot', price: 30000, perks: 'Clase, té frío y acceso al espacio' },
      { name: 'Brunch', price: 50000, perks: 'Incluye brunch funcional' },
      { name: 'Reset Pack', price: 90000, perks: 'Brunch, guia impresa y kit de aromaterapia' },
    ],
  },
  {
    id: 'code-and-coffee',
    title: 'Code & Coffee Labs',
    category: 'Tecnología',
    date: '2026-07-09T10:00:00',
    location: 'Zona America, Cali - Via Panamericana',
    price: 20000,
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    description:
      'Laboratorio práctico para construir prototipos con IA, recibir feedback de mentores y cerrar la mañana con demos rápidas de la comunidad.',
    tickets: [
      { name: 'Lab seat', price: 20000, perks: 'Mesa de trabajo y café ilimitado' },
      { name: 'Mentor', price: 45000, perks: 'Revisión 1:1 de producto' },
      { name: 'Team table', price: 90000, perks: 'Mesa para 4 personas y demo desarrollado' },
    ],
  },
];
