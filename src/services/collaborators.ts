import { supabase } from "@/lib/supabase"
import type { Collaborator } from "@/types/collaborator"

export const collaboratorsService = {
    /**
     * Get all collaborators for a scape
     */
    async getCollaborators(scapeId: string): Promise<Collaborator[]> {
        const { data, error } = await supabase
            .from("scape_collaborators")
            .select("*")
            .eq("scape_id", scapeId)
            .order("created_at", { ascending: false })

        if (error) throw error
        return data as Collaborator[]
    },

    /**
     * Add a collaborator by email
     * Returns the collaborator if successful, or throws an error
     */
    async addCollaboratorByEmail(
        scapeId: string,
        email: string,
        role: "viewer" | "editor" = "viewer"
    ): Promise<Collaborator> {
        // First, find the user by email
        // Note: This requires a profiles table or function to lookup users by email
        // For now, we'll use a workaround with auth.users via RPC
        const { data: userData, error: userError } = await supabase.rpc("get_user_id_by_email", {
            email_input: email.toLowerCase().trim(),
        })

        if (userError || !userData) {
            throw new Error(`User with email "${email}" not found. They need to sign up first.`)
        }

        const userId = userData

        // Check if already a collaborator
        const { data: existing } = await supabase
            .from("scape_collaborators")
            .select("id")
            .eq("scape_id", scapeId)
            .eq("user_id", userId)
            .single()

        if (existing) {
            throw new Error("This user is already a collaborator")
        }

        // Add the collaborator
        const { data, error } = await supabase
            .from("scape_collaborators")
            .insert({ scape_id: scapeId, user_id: userId, role })
            .select()
            .single()

        if (error) throw error
        return { ...data, email } as Collaborator
    },

    /**
     * Remove a collaborator
     */
    async removeCollaborator(collaboratorId: string): Promise<void> {
        const { error } = await supabase
            .from("scape_collaborators")
            .delete()
            .eq("id", collaboratorId)

        if (error) throw error
    },

    /**
     * Check if current user has access to a scape (owner or collaborator)
     */
    async hasAccess(scapeId: string): Promise<boolean> {
        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) return false

        // Check if owner
        const { data: scape } = await supabase
            .from("scapes")
            .select("author_id")
            .eq("id", scapeId)
            .single()

        if (scape?.author_id === user.id) return true

        // Check if collaborator
        const { data: collab } = await supabase
            .from("scape_collaborators")
            .select("id")
            .eq("scape_id", scapeId)
            .eq("user_id", user.id)
            .single()

        return !!collab
    },
}
