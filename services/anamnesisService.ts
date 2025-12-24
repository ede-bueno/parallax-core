import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AnamnesisRecord {
    id: string;
    templateName: string;
    createdAt: string;
    professionalName: string;
    appointmentId: string | null;
}

export interface AnamnesisAnswer {
    questionId: string;
    questionText: string;
    fieldType: string;
    answer: string | number | boolean;
}

/**
 * Fetch anamnesis records for a specific client
 * 
 * Contract:
 * - Reads ONLY from view_anamnesis_records
 * - Requires companyId and clientId
 * - RLS enforces company isolation
 */
export async function fetchClientAnamnesisRecords(
    companyId: string,
    clientId: string
): Promise<{
    data: AnamnesisRecord[] | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return {
            data: null,
            error: 'Supabase not configured',
        };
    }

    try {
        const { data, error } = await supabase!
            .from('view_anamnesis_records')
            .select('*')
            .eq('company_id', companyId)
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching anamnesis records:', error);
            return { data: null, error: error.message };
        }

        const normalized: AnamnesisRecord[] = (data || []).map(item => ({
            id: item.id,
            templateName: item.template_name || 'N/A',
            createdAt: item.created_at,
            professionalName: item.professional_name || 'N/A',
            appointmentId: item.appointment_id || null,
        }));

        return { data: normalized, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching anamnesis records:', err);
        return { data: null, error: errorMessage };
    }
}

/**
 * Fetch answers for a specific anamnesis record
 * 
 * Contract:
 * - Reads ONLY from view_anamnesis_answers
 * - Requires companyId and recordId
 * - RLS enforces company isolation
 */
export async function fetchAnamnesisAnswers(
    companyId: string,
    recordId: string
): Promise<{
    data: AnamnesisAnswer[] | null;
    error: string | null;
}> {
    if (!isSupabaseConfigured()) {
        return {
            data: null,
            error: 'Supabase not configured',
        };
    }

    try {
        const { data, error } = await supabase!
            .from('view_anamnesis_answers')
            .select('*')
            .eq('company_id', companyId)
            .eq('record_id', recordId)
            .order('question_order', { ascending: true });

        if (error) {
            console.error('Error fetching anamnesis answers:', error);
            return { data: null, error: error.message };
        }

        const normalized: AnamnesisAnswer[] = (data || []).map(item => ({
            questionId: item.question_id,
            questionText: item.question_text || '',
            fieldType: item.field_type || 'text',
            answer: item.answer,
        }));

        return { data: normalized, error: null };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Unexpected error fetching anamnesis answers:', err);
        return { data: null, error: errorMessage };
    }
}
