import { supabase, supabaseConfigured } from './supabase';
import type { School, UserRole } from '../types';

export interface StaffSession {
  role: UserRole;
  school: School | null;
}

const ALLOWED_SCHOOL_ROLES: UserRole[] = ['DIRECTEUR', 'ADMIN', 'COMPTABLE', 'ENSEIGNANT'];

// Transforme une ligne de la table "schools" en objet École utilisé par l'interface.
// Les champs absents de la base prennent une valeur neutre.
export function mapSchoolRow(row: Record<string, any>): School {
  return {
    id: row.id,
    name: row.name ?? '',
    shortCode: row.short_code ?? '',
    motto: row.motto ?? '',
    type: row.type ?? 'COLLEGE_LYCEE',
    drena: row.drena ?? undefined,
    iep: row.iep ?? undefined,
    statut: row.statut ?? undefined,
    city: row.city ?? '',
    district: row.district ?? '',
    address: row.address ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    directorName: row.director_name ?? '',
    currentAcademicYear: row.current_academic_year ?? '',
    logoUrl: row.logo_url ?? undefined,
    stampUrl: row.stamp_url ?? undefined,
    smsSenderId: row.sms_sender_id ?? '',
    smsBalance: row.sms_balance ?? 0,
    smsProvider: row.sms_provider ?? 'SIMULATOR',
    smsAutoSendAbsence: !!row.sms_auto_send_absence,
    smsAutoSendPayment: !!row.sms_auto_send_payment,
    smsAutoSendEnrollment: !!row.sms_auto_send_enrollment,
    smsAutoSendReportCard: !!row.sms_auto_send_report_card,
    smsAutoSendUnpaidReminder: !!row.sms_auto_send_unpaid_reminder,
    subscriptionPlan: row.subscription_plan ?? 'STARTER',
    subscriptionStatus: row.subscription_status ?? 'ESSAI',
    maxStudents: row.max_students ?? 200,
  } as School;
}

// Connexion par e-mail et mot de passe. Le rôle est lu depuis la base, jamais depuis le navigateur.
export async function signInStaff(email: string, password: string): Promise<StaffSession> {
  if (!supabase || !supabaseConfigured) {
    throw new Error("Le service de connexion n'est pas configuré. Contactez l'administrateur.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error || !data.user) {
    const raw = (error?.message ?? '').toLowerCase();
    if (raw.includes('invalid login credentials')) {
      throw new Error('E-mail ou mot de passe incorrect. Vérifiez les deux champs (majuscules, espaces).');
    }
    if (raw.includes('email not confirmed')) {
      throw new Error("Cette adresse e-mail n'est pas encore confirmée. Ouvrez le lien reçu par e-mail.");
    }
    if (raw.includes('too many requests') || raw.includes('rate limit')) {
      throw new Error('Trop de tentatives. Patientez quelques minutes avant de réessayer.');
    }
    throw new Error(`Connexion impossible : ${error?.message ?? 'erreur inconnue'}`);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, school_id, active')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile || !profile.active) {
    await supabase.auth.signOut();
    throw new Error("Ce compte n'est pas autorisé. Contactez la direction de l'établissement.");
  }

  const role = profile.role as UserRole;

  if (role === 'SUPER_ADMIN') {
    return { role, school: null };
  }

  if (!ALLOWED_SCHOOL_ROLES.includes(role) || !profile.school_id) {
    await supabase.auth.signOut();
    throw new Error("Ce compte n'est pas autorisé à accéder à un établissement.");
  }

  const { data: schoolRow, error: schoolError } = await supabase
    .from('schools')
    .select('*')
    .eq('id', profile.school_id)
    .single();

  if (schoolError || !schoolRow) {
    await supabase.auth.signOut();
    throw new Error("L'établissement de ce compte est introuvable.");
  }

  return { role, school: mapSchoolRow(schoolRow) };
}

export async function signOutStaff(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function hasActiveSession(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}
