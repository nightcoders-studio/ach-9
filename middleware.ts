import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua jalur permintaan kecuali yang dimulai dengan:
     * - _next/static (file statis)
     * - _next/image (gambar yang dioptimalkan Next.js)
     * - favicon.ico (file ikon)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}