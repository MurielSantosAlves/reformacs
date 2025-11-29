import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const DEFAULT_REFORMA_ID = "550e8400-e29b-41d4-a716-446655440000"

export async function GET() {
  try {
    const supabase = await createClient()

    // Buscar dados da reforma
    const { data: reforma, error: reformaError } = await supabase
      .from("reforma")
      .select("*")
      .eq("id", DEFAULT_REFORMA_ID)
      .single()

    if (reformaError) throw reformaError

    // Buscar imagens
    const { data: images, error: imagesError } = await supabase
      .from("reforma_images")
      .select("*")
      .eq("reforma_id", DEFAULT_REFORMA_ID)
      .order("created_at", { ascending: true })

    if (imagesError) throw imagesError

    // Buscar fases
    const { data: phases, error: phasesError } = await supabase
      .from("reforma_phases")
      .select("*")
      .eq("reforma_id", DEFAULT_REFORMA_ID)
      .order("created_at", { ascending: true })

    if (phasesError) throw phasesError

    const response = {
      id: reforma.id,
      title: reforma.title,
      description: reforma.description,
      start_date: reforma.start_date,
      end_date: reforma.end_date,
      progress_percentage: reforma.progress_percentage,
      total_invested: Number.parseFloat(reforma.total_invested) || 0,
      images:
        images?.map((img) => ({
          id: img.id,
          url: img.url,
          caption: img.caption,
        })) || [],
      phases:
        phases?.map((phase) => ({
          id: phase.id,
          name: phase.name,
          percentage: phase.percentage,
          status: phase.status,
        })) || [],
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Erro ao buscar reforma:", error)
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from("reforma")
      .update({
        title: body.title,
        description: body.description,
        start_date: body.start_date,
        end_date: body.end_date,
        progress_percentage: body.progress_percentage,
        total_invested: Number.parseFloat(body.total_invested) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", DEFAULT_REFORMA_ID)

    if (updateError) throw updateError

    await supabase.from("reforma_phases").delete().eq("reforma_id", DEFAULT_REFORMA_ID)

    if (body.phases && body.phases.length > 0) {
      const { error: phasesError } = await supabase.from("reforma_phases").insert(
        body.phases.map((phase) => ({
          reforma_id: DEFAULT_REFORMA_ID,
          name: phase.name,
          percentage: phase.percentage,
          status: phase.status,
        })),
      )

      if (phasesError) throw phasesError
    }

    await supabase.from("reforma_images").delete().eq("reforma_id", DEFAULT_REFORMA_ID)

    if (body.images && body.images.length > 0) {
      const { error: imagesError } = await supabase.from("reforma_images").insert(
        body.images.map((img) => ({
          reforma_id: DEFAULT_REFORMA_ID,
          url: img.url,
          caption: img.caption,
        })),
      )

      if (imagesError) throw imagesError
    }

    // Buscar dados atualizados
    const { data: reforma } = await supabase.from("reforma").select("*").eq("id", DEFAULT_REFORMA_ID).single()

    const { data: images } = await supabase.from("reforma_images").select("*").eq("reforma_id", DEFAULT_REFORMA_ID)

    const { data: phases } = await supabase.from("reforma_phases").select("*").eq("reforma_id", DEFAULT_REFORMA_ID)

    const response = {
      id: reforma.id,
      title: reforma.title,
      description: reforma.description,
      start_date: reforma.start_date,
      end_date: reforma.end_date,
      progress_percentage: reforma.progress_percentage,
      total_invested: Number.parseFloat(reforma.total_invested) || 0,
      images:
        images?.map((img) => ({
          id: img.id,
          url: img.url,
          caption: img.caption,
        })) || [],
      phases:
        phases?.map((phase) => ({
          id: phase.id,
          name: phase.name,
          percentage: phase.percentage,
          status: phase.status,
        })) || [],
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Erro ao salvar reforma:", error)
    return NextResponse.json({ error: "Erro ao salvar dados" }, { status: 500 })
  }
}
