export interface Collaborator {
  id: string
  scape_id: string
  user_id: string
  role: "viewer" | "editor"
  created_at: string
  // Joined from auth.users
  email?: string
}
