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
