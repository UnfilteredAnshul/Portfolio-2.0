import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { requireAdmin } from '../../../lib/api-auth'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('pinned', { ascending: false })
      .order('date', { ascending: false })

    if (error) {
      console.error('Supabase GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err: any) {
    console.error('Projects GET error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError.error

  try {
    const body = await request.json()
    const { id, title, description, preview, pinned, category, screenshots, video, date, projectFolderId } = body

    if (!id || !title) {
      return NextResponse.json({ error: 'id and title are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('projects')
      .upsert({
        id,
        title,
        description: description || '',
        preview: preview || '',
        pinned: pinned || false,
        category: category || '',
        screenshots: screenshots || [],
        video: video || null,
        date: date || '',
        projectFolderId: projectFolderId || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase POST error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Projects POST error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError.error

  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { error } = await supabase.from('projects').delete().eq('id', id)

    if (error) {
      console.error('Supabase DELETE error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Projects DELETE error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
