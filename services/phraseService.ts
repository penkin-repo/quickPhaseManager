
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Group, Phrase } from '../types';
import type { Database } from '../types/supabase';

// --- Supabase Client Setup ---
// TODO: Replace with your Supabase project URL and anon key

export const SUPABASE_URL : string = 'https://edkeahjwmtdiswhwzjuy.supabase.co';
export const SUPABASE_ANON_KEY : string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVka2VhaGp3bXRkaXN3aHd6anV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NDU4MjksImV4cCI6MjA3MDUyMTgyOX0.rUadEAZzCcYKPLPG52RTurHbHhqDIjKH6wBknVyFoHg';

// Check if credentials are placeholders or invalid before initializing
const isSupabaseConfigured = SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
let supabase: SupabaseClient<Database> | null = null;

if (isSupabaseConfigured) {
    try {
        supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
        // This will catch the 'Invalid URL' error at initialization time and log it,
        // preventing a crash. supabase will remain null.
        console.error("Error initializing Supabase client. Make sure your URL is valid.", e);
    }
}

// Helper to handle Supabase errors
const handleSupabaseError = ({ error, customMessage }: { error: any; customMessage: string }) => {
  if (error) {
    console.error(customMessage, error);
    throw new Error(`${customMessage}: ${error.message}`);
  }
};

// Helper to ensure client is available for operations that modify data
const checkSupabaseClient = () => {
    if (!supabase) {
        // This provides a clear action for the developer.
        throw new Error('Supabase is not configured. Please update credentials in services/phraseService.ts.');
    }
    return supabase;
}

export const getInitialData = async (): Promise<Group[]> => {
    // If not configured, don't try to fetch. Return an empty state.
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('groups')
        .select('*, phrases(*)')
        .order('created_at', { ascending: true })
        .order('created_at', { foreignTable: 'phrases', ascending: true });

    handleSupabaseError({ error, customMessage: 'Failed to fetch groups and phrases' });
    return data || [];
};

export const addGroup = async (name: string): Promise<Group> => {
    const client = checkSupabaseClient();
    const { data, error } = await client
        .from('groups')
        .insert([{ name }])
        .select('*, phrases(*)')
        .single();
    
    handleSupabaseError({ error, customMessage: 'Failed to add group' });
    if (!data) {
        throw new Error('Failed to add group: no data returned.');
    }
    return { ...data, phrases: (data as any).phrases || [] };
};

export const updateGroup = async (groupId: string, name: string): Promise<Group> => {
    const client = checkSupabaseClient();
    const { data, error } = await client
        .from('groups')
        .update({ name })
        .eq('id', groupId)
        .select('*, phrases(*)')
        .single();

    handleSupabaseError({ error, customMessage: 'Failed to update group' });
    if (!data) {
        throw new Error('Failed to update group: no data returned.');
    }
    return { ...data, phrases: (data as any).phrases || [] };
};

export const deleteGroup = async (groupId: string): Promise<{ success: boolean }> => {
    const client = checkSupabaseClient();
    const { error } = await client
        .from('groups')
        .delete()
        .eq('id', groupId);
    
    handleSupabaseError({ error, customMessage: 'Failed to delete group' });
    return { success: true };
};

export const addPhrase = async (groupId: string, title: string, text: string): Promise<Phrase> => {
    const client = checkSupabaseClient();
    const { data, error } = await client
        .from('phrases')
        .insert([{ group_id: groupId, title, text }])
        .select()
        .single();
    
    handleSupabaseError({ error, customMessage: 'Failed to add phrase' });
    if (!data) {
        throw new Error('Failed to add phrase: no data returned.');
    }
    return data;
};

export const updatePhrase = async (phraseId: string, title: string, text: string): Promise<Phrase> => {
    const client = checkSupabaseClient();
    const { data, error } = await client
        .from('phrases')
        .update({ title, text })
        .eq('id', phraseId)
        .select()
        .single();

    handleSupabaseError({ error, customMessage: 'Failed to update phrase' });
    if (!data) {
        throw new Error('Failed to update phrase: no data returned.');
    }
    return data;
};

export const deletePhrase = async (phraseId: string): Promise<{ success: boolean }> => {
    const client = checkSupabaseClient();
    const { error } = await client
        .from('phrases')
        .delete()
        .eq('id', phraseId);

    handleSupabaseError({ error, customMessage: 'Failed to delete phrase' });
    return { success: true };
};