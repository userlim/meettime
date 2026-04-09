import { NextResponse } from 'next/server'

const INDEXNOW_KEY = 'a1b2c3d4e5f6g7h8'
const HOST = 'https://meettime-tawny.vercel.app'

export async function GET() {
  const urls = [HOST]

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'meettime-tawny.vercel.app',
        key: INDEXNOW_KEY,
        keyLocation: `${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    })

    return NextResponse.json({ status: 'submitted', urls })
  } catch (error) {
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}
