import api from "../lib/api"

type Classification = {
  fit?: string
  material?: string
  pattern?: string
  primary_color?: string
  secondary_color?: string
  type?: string
}

type UploadResponse = {
  filename: string
  url: string
  classification?: Classification
  message?: string
  raw?: any
}

export const uploadService = {
  async uploadImage(file: File, filename?: string): Promise<UploadResponse> {
    const formData = new FormData()
    const finalName = filename || file.name
    console.log('finalName:', finalName)
    console.log('file:', file)
    formData.append("image", file, finalName)
    formData.append("filename", finalName)

    const response = await api.post("/file/upload", formData)
    console.log('response:', response)

    const data = response?.data ?? {}
    const payload = data?.data ?? data ?? {}
    // Extract classification from the latest shape or legacy most_common_object
    const classification: Classification | undefined = (() => {
      if (payload?.most_common_object) {
        return payload.most_common_object
      }
      const fields: Classification = {
        fit: payload?.fit,
        material: payload?.material,
        pattern: payload?.pattern,
        primary_color: payload?.primary_color,
        secondary_color: payload?.secondary_color,
        type: payload?.type
      }
      return Object.values(fields).some(Boolean) ? fields : undefined
    })()

    const message = typeof data?.message === "string" ? data.message : undefined
    const providedFilename = payload?.filename || data?.filename || data?.name || data?.fileName
    const providedImageUrl = payload?.image_url || data?.image_url
    const serverFileName = providedFilename || data?.path?.split("/").pop() || finalName

    const base = (api.defaults.baseURL ?? '').toString().replace(/\/+$/,'')
    // Use server-provided image_url when present; otherwise construct /file/get/<encoded>
    const url = providedImageUrl
      ? (/^https?:\/\//i.test(providedImageUrl) ? providedImageUrl : `${base || ''}${providedImageUrl}`)
      : `${base || ''}/file/get/${encodeURIComponent(serverFileName)}`
    return { filename: serverFileName, url, classification, message, raw: data }
  }
}