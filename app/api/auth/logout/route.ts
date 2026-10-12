import { endSession, go } from '@/lib/auth'

export async function POST() {
  await endSession()
  return go('/')
}
