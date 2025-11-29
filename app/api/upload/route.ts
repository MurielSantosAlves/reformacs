import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo fornecido" }, { status: 400 })
    }

    const blob = await put(file.name, file, {
      access: "public",
      overwrite: true,
    })

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Erro no upload:", error)
    return NextResponse.json({ error: "Upload falhou" }, { status: 500 })
  }
}
