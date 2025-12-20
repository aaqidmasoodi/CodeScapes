import { supabase } from "@/lib/supabase"
import type { Secret } from "@/types/secret"

export const secretsService = {
  async getSecrets(scapeId: string) {
    const { data, error } = await supabase
      .from("secrets")
      .select("*")
      .eq("scape_id", scapeId)
      .order("key")

    if (error) throw error
    return data as Secret[]
  },

  async upsertSecret(scapeId: string, key: string, value: string) {
    // Unique constraint is on (scape_id, key), so this works as upsert
    const { data, error } = await supabase
      .from("secrets")
      .upsert({ scape_id: scapeId, key, value }, { onConflict: "scape_id,key" })
      .select()
      .single()

    if (error) throw error
    return data as Secret
  },

  async deleteSecret(id: string) {
    const { error } = await supabase.from("secrets").delete().eq("id", id)
    if (error) throw error
  },
}
