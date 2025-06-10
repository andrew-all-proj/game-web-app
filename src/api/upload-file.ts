interface UploadOptions {
  url: string
  formData: FormData
  token?: string
}

export async function uploadFile({ url, formData, token }: UploadOptions): Promise<any> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}
