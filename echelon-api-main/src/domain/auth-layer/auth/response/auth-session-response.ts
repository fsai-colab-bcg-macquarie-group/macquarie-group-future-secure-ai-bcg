import { Session, User } from '@supabase/supabase-js'

export type AuthSessionResponse = {
    user: User
    session: Session
}
