import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET: 모든 의견 조회
export async function GET() {
  try {
    const { data: opinions, error } = await supabase
      .from('opinions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(opinions)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// POST: 새로운 의견 추가
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { topic, content, author, is_auto_classified } = body

    if (!topic || !content) {
      return NextResponse.json(
        { error: 'topic과 content는 필수입니다.' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('opinions')
      .insert([
        {
          topic,
          content,
          author: author || '익명',
          is_auto_classified: is_auto_classified || false,
          timestamp: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json(
        { error: 'ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('opinions')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: '삭제되었습니다.' }, { status: 200 })
  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
