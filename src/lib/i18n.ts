export type Lang = "en" | "es";

export const translations = {
  // Common
  appName: { en: "Cura AI", es: "Cura AI" },
  tagline: {
    en: "Care that follows you, not the clinic",
    es: "Atención que te sigue a ti, no a la clínica",
  },
  signIn: { en: "Sign In", es: "Iniciar Sesión" },
  signUp: { en: "Sign Up", es: "Registrarse" },
  signOut: { en: "Sign out", es: "Cerrar sesión" },
  email: { en: "Email", es: "Correo electrónico" },
  password: { en: "Password", es: "Contraseña" },
  loading: { en: "Loading...", es: "Cargando..." },
  cancel: { en: "Cancel", es: "Cancelar" },
  close: { en: "Close", es: "Cerrar" },
  submit: { en: "Submit", es: "Enviar" },
  needAccount: { en: "Need an account?", es: "¿Necesitas una cuenta?" },
  haveAccount: { en: "Have an account?", es: "¿Ya tienes una cuenta?" },
  fullName: { en: "Full name", es: "Nombre completo" },
  selectRole: { en: "I am a", es: "Soy un" },
  rolePatient: { en: "Patient", es: "Paciente" },
  roleDoctor: { en: "Doctor", es: "Doctor" },
  roleDriver: { en: "Volunteer Driver", es: "Conductor Voluntario" },
  loadDemo: { en: "Load demo accounts", es: "Cargar cuentas demo" },
  demoCreated: {
    en: "Demo accounts ready! Sign in with any below.",
    es: "¡Cuentas demo listas! Inicia sesión con cualquiera.",
  },

  // Patient dashboard
  goodMorning: { en: "Good morning", es: "Buenos días" },
  patientDashboard: { en: "Patient Dashboard", es: "Panel del Paciente" },
  doctorDashboard: { en: "Doctor Dashboard", es: "Panel del Doctor" },
  driverDashboard: { en: "Driver Dashboard", es: "Panel del Conductor" },
  nextAppointment: { en: "Next appointment", es: "Próxima cita" },
  medications: { en: "Medications", es: "Medicamentos" },
  openRides: { en: "Open ride requests", es: "Solicitudes de viaje abiertas" },
  none: { en: "None", es: "Ninguna" },

  // AI companion
  aiCompanion: { en: "AI Health Companion", es: "Compañero de Salud IA" },
  howAreYou: { en: "How are you feeling today?", es: "¿Cómo te sientes hoy?" },
  describeSymptoms: { en: "Describe your symptoms...", es: "Describe tus síntomas..." },
  sendToCura: { en: "Send to Cura AI", es: "Enviar a Cura AI" },
  flagForDoctor: { en: "Flag for Doctor", es: "Avisar al Doctor" },
  flagged: { en: "Flagged for doctor review", es: "Marcado para revisión del doctor" },

  // Timeline
  timelineTitle: { en: "Your health history", es: "Tu historial de salud" },
  evt_sms_checkin: { en: "SMS check-in", es: "Mensaje de seguimiento" },
  evt_ai_advice: { en: "AI advice", es: "Consejo de IA" },
  evt_doctor_note: { en: "Doctor note", es: "Nota del doctor" },
  evt_appointment: { en: "Appointment", es: "Cita médica" },
  evt_ride_request: { en: "Ride request", es: "Solicitud de viaje" },
  evt_medication: { en: "Medication", es: "Medicamento" },
  noTimeline: { en: "No activity yet.", es: "Sin actividad todavía." },

  // Appointments
  upcomingAppointments: { en: "Upcoming Appointments", es: "Próximas citas" },
  joinCall: { en: "Join Call", es: "Unirse a Videollamada" },
  telehealth: { en: "Telehealth", es: "Telesalud" },
  inPerson: { en: "In person", es: "En persona" },
  noAppointments: { en: "No upcoming appointments.", es: "No tienes citas próximas." },
  status_scheduled: { en: "Scheduled", es: "Agendada" },
  status_confirmed: { en: "Confirmed", es: "Confirmada" },
  status_completed: { en: "Completed", es: "Completada" },
  status_cancelled: { en: "Cancelled", es: "Cancelada" },

  // Ride
  requestRide: { en: "Request a Ride", es: "Solicitar transporte" },
  pickupAddress: { en: "Pickup address", es: "Dirección de recogida" },
  destination: { en: "Destination", es: "Destino" },
  rideDate: { en: "Date", es: "Fecha" },
  submitRide: { en: "Request Ride", es: "Solicitar viaje" },
  rideSuccess: {
    en: "Your request was sent! A volunteer will contact you soon.",
    es: "¡Tu solicitud fue enviada! Un voluntario te contactará pronto.",
  },
  yourRides: { en: "Your ride requests", es: "Tus solicitudes de viaje" },
  ride_open: { en: "Open", es: "Abierta" },
  ride_matched: { en: "Driver matched", es: "Conductor asignado" },
  ride_completed: { en: "Completed", es: "Completada" },

  // SMS simulator
  smsTitle: { en: "SMS Mode Preview", es: "Vista previa modo SMS" },
  smsSubtitle: {
    en: "This is how Cura AI works for patients without internet",
    es: "Así funciona Cura AI para pacientes sin internet",
  },
  poweredBy: { en: "Powered by Twilio + Claude AI", es: "Con tecnología de Twilio + Claude AI" },

  // Doctor dashboard
  welcomeDr: { en: "Welcome, Dr.", es: "Bienvenido, Dr." },
  clinicSubtitle: { en: "Banner – University Family Care", es: "Banner – University Family Care" },
  totalPatients: { en: "Total Patients", es: "Pacientes Totales" },
  appointmentsToday: { en: "Appointments Today", es: "Citas de Hoy" },
  flaggedEvents: { en: "Flagged Events (7d)", es: "Eventos Marcados (7d)" },
  yourPatients: { en: "Your Patients", es: "Tus Pacientes" },
  viewSummary: { en: "View Summary", es: "Ver Resumen" },
  scheduleAppt: { en: "Schedule Appointment", es: "Agendar Cita" },
  patientSummary: { en: "Patient Summary", es: "Resumen del Paciente" },
  conditions: { en: "Conditions", es: "Condiciones" },
  allergies: { en: "Allergies", es: "Alergias" },
  recentActivity: { en: "Recent activity", es: "Actividad reciente" },
  aiBrief: { en: "AI Brief", es: "Resumen IA" },
  viewAiBrief: { en: "View AI Brief", es: "Ver Resumen IA" },
  flaggedActivity: { en: "Flagged Patient Activity", es: "Actividad Marcada" },
  review: { en: "Review", es: "Revisar" },
  bannerIntegration: {
    en: "Designed for integration with Banner HealthTrioConnect — export ready",
    es: "Diseñado para integración con Banner HealthTrioConnect — listo para exportar",
  },
  noFlagged: { en: "No flagged events in the last 7 days.", es: "Sin eventos marcados en los últimos 7 días." },
  age: { en: "yrs", es: "años" },
  lastActivity: { en: "Last activity", es: "Última actividad" },

  // Driver dashboard
  welcomeDriver: { en: "Welcome", es: "Bienvenido" },
  driverSubtitle: { en: "Cura AI Volunteer Driver", es: "Conductor Voluntario Cura AI" },
  communityCredits: { en: "Community Credits", es: "Créditos Comunitarios" },
  availableRides: { en: "Available Rides", es: "Viajes Disponibles" },
  acceptRide: { en: "Accept Ride", es: "Aceptar Viaje" },
  rideAccepted: { en: "Ride accepted! The patient has been notified.", es: "¡Viaje aceptado! El paciente ha sido notificado." },
  noOpenRides: { en: "No open ride requests right now. Check back soon!", es: "No hay solicitudes abiertas. ¡Vuelve pronto!" },
  acceptedRides: { en: "Your Accepted Rides", es: "Tus Viajes Aceptados" },
  markComplete: { en: "Mark Complete", es: "Marcar como Completado" },
  rideCompleted: { en: "Ride completed! +15 credits", es: "¡Viaje completado! +15 créditos" },
  leaderboard: { en: "Community Leaderboard", es: "Tabla Comunitaria" },
  rank: { en: "Rank", es: "Posición" },
  driver: { en: "Driver", es: "Conductor" },
  credits: { en: "Credits", es: "Créditos" },
  ridesCompleted: { en: "Rides", es: "Viajes" },
  badge: { en: "Badge", es: "Insignia" },
  nextBadge: { en: "Next badge in", es: "Siguiente insignia en" },
  rides: { en: "rides", es: "viajes" },
  badge_seedling: { en: "Newcomer", es: "Nuevo" },
  badge_helper: { en: "Community Helper", es: "Ayudante Comunitario" },
  badge_champion: { en: "Care Champion", es: "Campeón del Cuidado" },
  badge_hero: { en: "Rural Hero", es: "Héroe Rural" },

  // Errors
  errInvalid: { en: "Please fill in all fields.", es: "Por favor completa todos los campos." },
  errAuth: { en: "Authentication failed.", es: "Error de autenticación." },

  // Landing — nav
  nav_signIn: { en: "Sign In", es: "Iniciar Sesión" },

  // Landing — hero
  hero_badge: {
    en: "Hack Arizona 2026 — Southern Arizona Social Innovation Track",
    es: "Hack Arizona 2026 — Innovación Social del Sur de Arizona",
  },
  hero_headline: {
    en: "Chronic Care for Rural Arizona, Reimagined",
    es: "Atención Crónica para la Arizona Rural, Reimaginada",
  },
  hero_subheadline: {
    en: "Cura AI connects patients managing diabetes, heart disease, and respiratory illness with AI-powered guidance, volunteer support, and their Banner physician — all via smartphone or SMS.",
    es: "Cura AI conecta a pacientes con diabetes, enfermedad cardíaca o respiratoria con orientación impulsada por IA, apoyo voluntario y su médico de Banner — todo por smartphone o SMS.",
  },
  hero_cta_primary: { en: "See How It Works", es: "Ver Cómo Funciona" },
  hero_cta_secondary: { en: "Sign In to Platform", es: "Iniciar Sesión" },
  hero_trust1: { en: "Banner Health Partner", es: "Aliado de Banner Health" },
  hero_trust2: { en: "Powered by Claude AI", es: "Impulsado por Claude AI" },
  hero_trust3: { en: "Works via SMS", es: "Funciona por SMS" },

  // Landing — problem
  prob_title: { en: "The Rural Healthcare Gap", es: "La Brecha de Salud Rural" },
  prob_stat1_num: { en: "82 miles", es: "82 millas" },
  prob_stat1_desc: {
    en: "Average distance rural Arizona patients travel for specialist care",
    es: "Distancia promedio que los pacientes rurales de Arizona recorren para atención especializada",
  },
  prob_stat2_num: { en: "1 in 3", es: "1 de cada 3" },
  prob_stat2_desc: {
    en: "Rural patients skip recommended follow-ups due to distance and cost",
    es: "Pacientes rurales omiten controles recomendados por distancia y costo",
  },
  prob_stat3_num: { en: "$8,400", es: "$8,400" },
  prob_stat3_desc: {
    en: "Average cost of a preventable ER visit that Cura aims to eliminate",
    es: "Costo promedio de una visita a urgencias prevenible que Cura busca eliminar",
  },
  prob_paragraph: {
    en: "In Southern Arizona, patients managing chronic conditions like Type 2 diabetes and hypertension face an impossible choice: drive hours for routine care, or skip it and risk their health. Cura AI changes this equation.",
    es: "En el sur de Arizona, los pacientes con condiciones crónicas como diabetes tipo 2 e hipertensión enfrentan una decisión imposible: manejar horas para una consulta rutinaria u omitirla y arriesgar su salud. Cura AI cambia esta ecuación.",
  },

  // Landing — features
  feat_title: { en: "Four Ways Cura AI Helps", es: "Cuatro Formas en que Cura AI Ayuda" },
  feat_subtitle: { en: "Built for real patients in rural communities", es: "Construido para pacientes reales en comunidades rurales" },
  feat1_title: { en: "AI Health Navigator", es: "Navegador de Salud IA" },
  feat1_desc: {
    en: "Patients describe their symptoms and receive personalized, history-aware guidance in English or Spanish. Before every appointment, their doctor receives a Claude AI-generated brief — no chart-scrolling required.",
    es: "Los pacientes describen sus síntomas y reciben orientación personalizada basada en su historial, en inglés o español. Antes de cada cita, su doctor recibe un resumen generado por Claude AI — sin tener que leer el expediente.",
  },
  feat2_title: { en: "Community Ride Network", es: "Red Comunitaria de Transporte" },
  feat2_desc: {
    en: "Patients request rides via the app or a simple text message. Volunteer drivers in their area are notified and matched automatically. Drivers earn community credits and recognition on a public leaderboard.",
    es: "Los pacientes solicitan transporte por la app o un simple mensaje de texto. Los conductores voluntarios cercanos son notificados y emparejados automáticamente. Ganan créditos comunitarios y reconocimiento en una tabla pública.",
  },
  feat3_title: { en: "Works Without Internet", es: "Funciona Sin Internet" },
  feat3_desc: {
    en: "Every feature in Cura AI is accessible via plain text message from any phone on any carrier. Rural patients text symptoms, request rides, confirm medications, and get AI responses — no smartphone or data plan required.",
    es: "Cada función de Cura AI está disponible por mensaje de texto desde cualquier teléfono y operador. Los pacientes rurales envían síntomas, piden transporte, confirman medicamentos y reciben respuestas de IA — sin smartphone ni datos.",
  },
  feat4_title: { en: "English & Spanish", es: "Inglés y Español" },
  feat4_desc: {
    en: "Cura AI detects the patient's language automatically and responds in kind. Every part of the platform — notifications, AI advice, appointment reminders, ride confirmations — is fully bilingual.",
    es: "Cura AI detecta automáticamente el idioma del paciente y responde en el mismo. Toda la plataforma — notificaciones, consejos de IA, recordatorios y confirmaciones de viaje — es totalmente bilingüe.",
  },

  // Landing — journey
  journey_title: { en: "Meet Maria", es: "Conoce a María" },
  journey_subtitle: {
    en: "Maria is 58, lives in Ajo, Arizona — 82 miles from the nearest Banner clinic. She has Type 2 diabetes and hypertension.",
    es: "María tiene 58 años, vive en Ajo, Arizona — a 82 millas de la clínica Banner más cercana. Tiene diabetes tipo 2 e hipertensión.",
  },
  step1: { en: "Maria texts \"Me duelen los pies\"", es: "María escribe \"Me duelen los pies\"" },
  step2: { en: "Cura AI analyzes her history and replies in Spanish with personalized advice", es: "Cura AI analiza su historial y responde en español con consejo personalizado" },
  step3: { en: "Dr. Chen receives an AI brief before their telehealth call", es: "El Dr. Chen recibe un resumen IA antes de la videollamada" },
  step4: { en: "Maria requests a ride to her in-person appointment via SMS", es: "María pide transporte a su cita presencial por SMS" },
  step5: { en: "Carlos the volunteer driver accepts, earns community credits", es: "Carlos, conductor voluntario, acepta y gana créditos comunitarios" },

  // Landing — integration
  integ_title: { en: "Built for Banner Health", es: "Hecho para Banner Health" },
  integ_desc: {
    en: "Cura AI is designed to integrate seamlessly with Banner – University Family Care's existing systems. Patient data is structured for HL7/FHIR export, and the platform is designed to complement Banner's HealthTrioConnect portal.",
    es: "Cura AI está diseñado para integrarse sin fricciones con los sistemas existentes de Banner – University Family Care. Los datos están estructurados para exportación HL7/FHIR y complementan el portal HealthTrioConnect de Banner.",
  },
  integ_ready: { en: "Integration Ready", es: "Listo para Integrarse" },
  integ_pt1: { en: "AHCCCS / Medicaid compatible", es: "Compatible con AHCCCS / Medicaid" },
  integ_pt2: { en: "FHIR-ready data structure", es: "Estructura de datos lista para FHIR" },
  integ_pt3: { en: "Designed for Banner HealthTrioConnect", es: "Diseñado para Banner HealthTrioConnect" },

  // Footer
  footer_team: { en: "Built by Team Cura for Banner – University Family Care", es: "Hecho por el Equipo Cura para Banner – University Family Care" },
  footer_track: { en: "Hack Arizona 2026 — Southern Arizona Social Innovation Track", es: "Hack Arizona 2026 — Innovación Social del Sur de Arizona" },
  footer_powered: { en: "Powered by Claude AI + Supabase + Twilio", es: "Impulsado por Claude AI + Supabase + Twilio" },
  footer_franke: { en: "Presented to the W.A. Franke Honors College, University of Arizona", es: "Presentado a W.A. Franke Honors College, Universidad de Arizona" },

  // Login extras
  welcomeBack: { en: "Welcome back", es: "Bienvenido" },
  signInSubtitle: { en: "Sign in to your Cura AI account", es: "Inicia sesión en tu cuenta de Cura AI" },
  demoAccounts: { en: "Demo Accounts", es: "Cuentas Demo" },
  demoPatient: { en: "Patient (Maria)", es: "Paciente (María)" },
  demoDoctor: { en: "Doctor (Dr. Chen)", es: "Doctor (Dr. Chen)" },
  demoDriver: { en: "Driver (Carlos)", es: "Conductor (Carlos)" },
  back: { en: "Back", es: "Atrás" },
  showPassword: { en: "Show password", es: "Mostrar contraseña" },
  hidePassword: { en: "Hide password", es: "Ocultar contraseña" },

  // Patient extras
  navigatorTitle: { en: "Cura AI Navigator", es: "Navegador Cura AI" },
  navigatorSubtitle: {
    en: "Describe how you're feeling and I'll give you personalized guidance based on your health history",
    es: "Describe cómo te sientes y te daré orientación personalizada basada en tu historial",
  },
  navigatorPlaceholder: {
    en: "Tell me how you're feeling today...",
    es: "Cuéntame cómo te sientes hoy...",
  },
  respondingIn: { en: "Responding in", es: "Respondiendo en" },
  langEnglish: { en: "English", es: "Inglés" },
  langSpanish: { en: "Spanish", es: "Español" },
  saveToTimeline: { en: "Save to Timeline", es: "Guardar en historial" },
  savedToTimeline: { en: "Saved to your timeline", es: "Guardado en tu historial" },
  filter_all: { en: "All", es: "Todos" },
  filter_checkins: { en: "Check-ins", es: "Chequeos" },
  filter_ai: { en: "AI Advice", es: "Consejos IA" },
  filter_appts: { en: "Appointments", es: "Citas" },
  filter_rides: { en: "Rides", es: "Viajes" },
  yourMedications: { en: "Your Medications", es: "Tus Medicamentos" },
  markTaken: { en: "Mark as taken today", es: "Marcar como tomado hoy" },
  needRide: { en: "Need a Ride?", es: "¿Necesitas Transporte?" },
  smsModeTitle: { en: "SMS Mode", es: "Modo SMS" },
  smsModeSubtitle: { en: "How Cura AI works without internet", es: "Cómo funciona Cura AI sin internet" },
  notifications: { en: "Notifications", es: "Notificaciones" },

  // Doctor extras
  searchPatients: { en: "Search patients...", es: "Buscar pacientes..." },
  bannerReady: { en: "Banner HealthTrioConnect — Integration Ready", es: "Banner HealthTrioConnect — Listo" },
  messagePatient: { en: "Message Patient", es: "Mensaje al Paciente" },
  send: { en: "Send", es: "Enviar" },
  messageSent: { en: "Message sent", es: "Mensaje enviado" },
  upcomingApptsCount: { en: "Upcoming Appointments", es: "Próximas Citas" },
  flaggedToday: { en: "Flagged Today", es: "Marcadas Hoy" },
  apptType: { en: "Type", es: "Tipo" },
  apptDate: { en: "Date & Time", es: "Fecha y Hora" },
  apptStatus: { en: "Status", es: "Estado" },
  apptActions: { en: "Actions", es: "Acciones" },
  patientCol: { en: "Patient", es: "Paciente" },
  fhirNote: { en: "Designed for Banner HealthTrioConnect integration — FHIR export ready", es: "Diseñado para integración con Banner HealthTrioConnect — exportación FHIR lista" },
  generatingSummary: { en: "Generating AI summary...", es: "Generando resumen de IA..." },

  // Driver extras
  driverWelcome: { en: "Welcome", es: "Bienvenido" },
  yourActiveRides: { en: "Your Active Rides", es: "Tus Viajes Activos" },
  liveLabel: { en: "Live", es: "En vivo" },
  driver_currentBadge: { en: "Current badge", es: "Insignia actual" },
  driver_moreRidesTo: { en: "more rides to", es: "viajes más para" },
  driver_topBadgeUnlocked: { en: "Top badge unlocked!", es: "¡Insignia máxima alcanzada!" },
  driver_pickup: { en: "Pickup", es: "Recoger" },
  driver_openInMaps: { en: "Open in Maps", es: "Ver ruta" },
  driver_you: { en: "you", es: "tú" },
  noRidesEmpty: {
    en: "No rides available right now. We'll notify you when a patient needs help!",
    es: "No hay viajes disponibles ahora. Te avisaremos cuando un paciente necesite ayuda.",
  },
  topDrivers: { en: "Top volunteer drivers in Southern Arizona", es: "Mejores conductores voluntarios del Sur de Arizona" },
  howCredits: { en: "How Credits Work", es: "Cómo funcionan los créditos" },
  howCreditsBody: {
    en: "Earn 15 credits per completed ride. Credits are redeemable at local partner businesses across Southern Arizona — coffee shops, grocery stores, and pharmacies. Credits are Cura AI's way of saying thank you for keeping rural communities connected to care.",
    es: "Gana 15 créditos por cada viaje completado. Los créditos se canjean en negocios aliados del sur de Arizona — cafeterías, tiendas y farmacias. Los créditos son la forma de Cura AI de agradecerte por mantener conectadas a las comunidades rurales con su atención.",
  },

  // Time
  ago_minute: { en: "minute ago", es: "minuto" },
  ago_minutes: { en: "minutes ago", es: "minutos" },
  ago_hour: { en: "hour ago", es: "hora" },
  ago_hours: { en: "hours ago", es: "horas" },
  ago_day: { en: "day ago", es: "día" },
  ago_days: { en: "days ago", es: "días" },
  justNow: { en: "just now", es: "ahora mismo" },
  ago_prefix: { en: "", es: "hace " },
  ago_suffix: { en: " ago", es: "" },

  // Signup
  signup_title: { en: "Create your Cura AI account", es: "Crea tu cuenta Cura AI" },
  signup_subtitle: { en: "Join the community keeping rural Arizona healthy", es: "Únete a la comunidad que mantiene saludable a la Arizona rural" },
  signup_iAm: { en: "I am a...", es: "Soy..." },
  signup_role_patient_desc: { en: "I want to manage my health and connect with my doctor", es: "Quiero gestionar mi salud y conectarme con mi doctor" },
  signup_role_doctor_desc: { en: "I want to monitor my patients and review AI health briefs", es: "Quiero monitorear a mis pacientes y revisar resúmenes IA" },
  signup_role_driver_desc: { en: "I want to help patients get to their appointments", es: "Quiero ayudar a pacientes a llegar a sus citas" },
  signup_personal: { en: "Personal Information", es: "Información Personal" },
  signup_first: { en: "First Name", es: "Nombre" },
  signup_last: { en: "Last Name", es: "Apellido" },
  signup_phone: { en: "Phone Number", es: "Teléfono" },
  signup_phoneHint: { en: "Format: +1XXXXXXXXXX", es: "Formato: +1XXXXXXXXXX" },
  signup_lang: { en: "Preferred Language", es: "Idioma Preferido" },
  signup_confirmPw: { en: "Confirm Password", es: "Confirmar Contraseña" },
  signup_pwMin: { en: "At least 8 characters", es: "Al menos 8 caracteres" },
  signup_pwMismatch: { en: "Passwords do not match", es: "Las contraseñas no coinciden" },
  signup_pwWeak: { en: "Weak", es: "Débil" },
  signup_pwMedium: { en: "Medium", es: "Media" },
  signup_pwStrong: { en: "Strong", es: "Fuerte" },
  signup_dob: { en: "Date of Birth", es: "Fecha de Nacimiento" },
  signup_conditions: { en: "Your Health Conditions", es: "Tus Condiciones de Salud" },
  signup_conditionsSearch: { en: "Search conditions...", es: "Buscar condiciones..." },
  signup_otherConditions: { en: "Any other conditions not listed?", es: "¿Otras condiciones no listadas?" },
  signup_meds: { en: "Current Medications", es: "Medicamentos Actuales" },
  signup_medName: { en: "Medication Name", es: "Nombre del Medicamento" },
  signup_medDose: { en: "Dose", es: "Dosis" },
  signup_medFreq: { en: "Frequency", es: "Frecuencia" },
  signup_addMed: { en: "Add Medication", es: "Agregar Medicamento" },
  signup_freq_once: { en: "Once daily", es: "Una vez al día" },
  signup_freq_twice: { en: "Twice daily", es: "Dos veces al día" },
  signup_freq_three: { en: "Three times daily", es: "Tres veces al día" },
  signup_freq_asneeded: { en: "As needed", es: "Según necesidad" },
  signup_freq_weekly: { en: "Weekly", es: "Semanal" },
  signup_allergiesHint: { en: "Type and press Enter or comma to add", es: "Escribe y presiona Enter o coma para agregar" },
  signup_emergencyName: { en: "Emergency Contact Name", es: "Nombre de Contacto de Emergencia" },
  signup_emergencyPhone: { en: "Emergency Contact Phone", es: "Teléfono de Contacto de Emergencia" },
  signup_assignedDoc: { en: "Assigned Doctor", es: "Doctor Asignado" },
  signup_assignedDocHint: { en: "Select your Banner physician (optional — can be assigned later)", es: "Selecciona tu médico de Banner (opcional — se puede asignar después)" },
  signup_license: { en: "Medical License Number", es: "Número de Licencia Médica" },
  signup_specialty: { en: "Specialty", es: "Especialidad" },
  signup_clinic: { en: "Affiliated Clinic / Hospital", es: "Clínica / Hospital Afiliado" },
  signup_yearsExp: { en: "Years of Experience", es: "Años de Experiencia" },
  signup_bio: { en: "Brief Bio (optional, max 300 chars)", es: "Biografía (opcional, máx 300 car)" },
  signup_vehicleType: { en: "Vehicle Type", es: "Tipo de Vehículo" },
  signup_wheelchair: { en: "Can accommodate wheelchair?", es: "¿Puede acomodar silla de ruedas?" },
  signup_serviceArea: { en: "Service Area", es: "Área de Servicio" },
  signup_availability: { en: "Availability", es: "Disponibilidad" },
  signup_create: { en: "Create Account", es: "Crear cuenta" },
  signup_haveAccount: { en: "Already have an account?", es: "¿Ya tienes una cuenta?" },
  signup_select: { en: "Select", es: "Seleccionar" },
  signup_yes: { en: "Yes", es: "Sí" },
  signup_no: { en: "No", es: "No" },

  // Add patient (doctor)
  addPatient: { en: "Add Patient", es: "Agregar Paciente" },
  addPatient_title: { en: "Add New Patient", es: "Agregar Nuevo Paciente" },
  addPatient_search: { en: "Search by email or phone number", es: "Buscar por correo o teléfono" },
  addPatient_searchBtn: { en: "Search", es: "Buscar" },
  addPatient_link: { en: "Link to my roster", es: "Vincular a mi lista" },
  addPatient_notFound: { en: "Patient not found — fill in their details below to create their record", es: "Paciente no encontrado — completa los detalles abajo para crear su registro" },
  addPatient_info: { en: "Patient Information", es: "Información del Paciente" },
  addPatient_medProfile: { en: "Medical Conditions", es: "Condiciones Médicas" },
  addPatient_selectAll: { en: "Select all that apply", es: "Selecciona todas las que apliquen" },
  addPatient_describeOther: { en: "Describe condition", es: "Describir condición" },
  addPatient_quickAdd: { en: "Quick add common medications", es: "Agregar medicamentos comunes" },
  addPatient_clinicalNotes: { en: "Clinical Notes", es: "Notas Clínicas" },
  addPatient_clinicalNotesHint: { en: "Initial assessment, referral reason, special considerations...", es: "Evaluación inicial, motivo de referencia, consideraciones especiales..." },
  addPatient_submit: { en: "Add Patient to Roster", es: "Agregar Paciente a la Lista" },
  addPatient_success: { en: "Patient added successfully", es: "Paciente agregado exitosamente" },
  addPatient_linked: { en: "Patient linked to your roster", es: "Paciente vinculado a tu lista" },

  // AI Navigator structured
  nav_step_feeling: { en: "How are you feeling overall?", es: "¿Cómo te sientes en general?" },
  nav_step_symptoms: { en: "What are you experiencing?", es: "¿Qué estás experimentando?" },
  nav_step_severity: { en: "How severe?", es: "¿Qué tan severo?" },
  nav_step_meds: { en: "Medication check", es: "Chequeo de medicamentos" },
  nav_step_reactions: { en: "Any reactions to your medications?", es: "¿Alguna reacción a tus medicamentos?" },
  nav_step_notes: { en: "Anything else you want to tell Cura AI?", es: "¿Algo más que quieras contarle a Cura AI?" },
  nav_feeling_great: { en: "Great", es: "Excelente" },
  nav_feeling_ok: { en: "OK", es: "Bien" },
  nav_feeling_notgreat: { en: "Not great", es: "No bien" },
  nav_feeling_poor: { en: "Poor", es: "Mal" },
  nav_feeling_verybad: { en: "Very bad", es: "Muy mal" },
  nav_sev_mild: { en: "Mild", es: "Leve" },
  nav_sev_mod: { en: "Moderate", es: "Moderado" },
  nav_sev_severe: { en: "Severe", es: "Severo" },
  nav_med_taken: { en: "Did you take your", es: "¿Tomaste tu" },
  nav_med_today: { en: "today?", es: "hoy?" },
} as const;

export type TKey = keyof typeof translations;

export function t(key: TKey, lang: Lang): string {
  return translations[key][lang];
}

export function timeAgo(dateStr: string, lang: Lang): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("justNow", lang);
  const fmt = (n: number, unit: string) => {
    if (lang === "es") return `hace ${n} ${unit}`;
    return `${n} ${unit} ago`;
  };
  if (mins < 60) return fmt(mins, lang === "es" ? (mins === 1 ? "minuto" : "minutos") : (mins === 1 ? "minute" : "minutes"));
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return fmt(hrs, lang === "es" ? (hrs === 1 ? "hora" : "horas") : (hrs === 1 ? "hour" : "hours"));
  const days = Math.floor(hrs / 24);
  return fmt(days, lang === "es" ? (days === 1 ? "día" : "días") : (days === 1 ? "day" : "days"));
}

export function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const ageDifMs = Date.now() - birth.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
