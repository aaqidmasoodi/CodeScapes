import { supabase } from "@/lib/supabase"
import type { Secret } from "@/types/secret"

export const secretsService = {
  async getSecrets(scapeId: string) {
    // Values are encrypted at rest; get_secrets decrypts server-side after an
    // ownership check (see 20260615_secrets_encryption.sql).
    const { data, error } = await supabase.rpc("get_secrets", { p_scape_id: scapeId })

    if (error) throw error
    return (data ?? []) as Secret[]
  },

  async upsertSecret(scapeId: string, key: string, value: string) {
    // set_secret encrypts server-side and upserts on (scape_id, key).
    const { data, error } = await supabase.rpc("set_secret", {
      p_scape_id: scapeId,
      p_key: key,
      p_value: value,
    })

    if (error) throw error
    // RPC returns a set of rows; take the single affected row.
    const row = Array.isArray(data) ? data[0] : data
    return row as Secret
  },

  async deleteSecret(id: string) {
    const { error } = await supabase.from("secrets").delete().eq("id", id)
    if (error) throw error
  },
}
