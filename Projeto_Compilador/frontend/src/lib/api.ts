export interface BaseItem {
  id: string
  createdAt: string
  author: string
  type: string
  visibility: "public" | "friends" | "private"
  tags: string[]
}

export interface Photo extends BaseItem {
  format: string
  resolution?: {
    width: number
    height: number
  }
  location?: {
    lat: number
    lon: number
    description: string
  }
  caption?: string
}

export interface Text extends BaseItem {
  title: string
  content: string
  summary?: string
}

export interface AcademicResult extends BaseItem {
  institution: string
  course: string
  grade: string
  scale: string
  evaluationDate: string
}

export interface SportResult extends BaseItem {
  activity: string
  value: number | string
  unit: string
  location?: string
  activityDate: string
}

export interface FileItem extends BaseItem {
  originalName: string
  size: number
  format: string
  description?: string
}

export interface Event extends BaseItem {
  title: string
  startDate: string
  endDate?: string
  location?: string
  participants?: string[]
  description?: string
  eventType?: string
}

export type TimelineItem = Photo | Text | AcademicResult | SportResult | FileItem | Event

export function getItemType(item: TimelineItem): string {
  if ("caption" in item) return "photo"
  if ("content" in item) return "text"
  if ("grade" in item) return "academic"
  if ("activity" in item) return "sport"
  if ("originalName" in item) return "file"
  if ("startDate" in item) return "event"
  return "unknown"
}

const API_BASE = "http://localhost:3000/api"

function getAuthHeaders(token: string = ""): HeadersInit {
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    }
  }
  return {}
}

export async function fetchTimelineItems(author?: string, visibility?: string, tag?: string, token: string = ""): Promise<TimelineItem[]> {
  const [photos, texts, academicResults, sportResults, files, events] = await Promise.all([
    fetchPhotos(author, tag, token),
    fetchTexts(author, tag, token),
    fetchAcademicResults(author, token),
    fetchSportResults(author, token),
    fetchFiles(author, token),
    fetchEvents(author, token),
  ])

  const allItems: TimelineItem[] = [...photos, ...texts, ...academicResults, ...sportResults, ...files, ...events]
  const filteredItems = visibility != "private" ? allItems.filter((item) => item.visibility === visibility) : allItems

  return filteredItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function fetchPhotos(author?: string, tag?: string, token: string = ""): Promise<Photo[]> {
  let url = `${API_BASE}/photos?`
  if (author) url += `author=${encodeURIComponent(author)}&`
  if (tag) url += `tag=${encodeURIComponent(tag)}&`

  try {
    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(token),
      },
    })
    if (!response.ok) throw new Error("Failed to fetch photos")
    return await response.json()
  } catch (error) {
    console.error("Error fetching photos:", error)
    return []
  }
}

export async function fetchTexts(author?: string, tag?: string, token: string = ""): Promise<Text[]> {
  let url = `${API_BASE}/texts?`
  if (author) url += `author=${encodeURIComponent(author)}&`
  if (tag) url += `tag=${encodeURIComponent(tag)}&`

  try {
    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(token),
      }
    })
    if (!response.ok) throw new Error("Failed to fetch texts")
    return await response.json()
  } catch (error) {
    console.error("Error fetching texts:", error)
    return []
  }
}

export async function fetchAcademicResults(author?: string, token: string = ""): Promise<AcademicResult[]> {
  let url = `${API_BASE}/academicResults?`
  if (author) url += `author=${encodeURIComponent(author)}&`

  try {
    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(token),
      }
    })
    if (!response.ok) throw new Error("Failed to fetch academic results")
    return await response.json()
  } catch (error) {
    console.error("Error fetching academic results:", error)
    return []
  }
}

export async function fetchSportResults(author?: string, token: string = ""): Promise<SportResult[]> {
  let url = `${API_BASE}/sportResults?`
  if (author) url += `author=${encodeURIComponent(author)}&`

  try {
    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(token),
      }
    })
    if (!response.ok) throw new Error("Failed to fetch sport results")
    return await response.json()
  } catch (error) {
    console.error("Error fetching sport results:", error)
    return []
  }
}

export async function fetchFiles(author?: string, token: string = ""): Promise<FileItem[]> {
  let url = `${API_BASE}/files?`
  if (author) url += `author=${encodeURIComponent(author)}&`

  try {
    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(token),
      }
    })
    if (!response.ok) throw new Error("Failed to fetch files")
    return await response.json()
  } catch (error) {
    console.error("Error fetching files:", error)
    return []
  }
}

export async function fetchEvents(author?: string, token: string = ""): Promise<Event[]> {
  let url = `${API_BASE}/events?`
  if (author) url += `author=${encodeURIComponent(author)}&`

  try {
    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders(token),
      }
    })
    if (!response.ok) throw new Error("Failed to fetch events")
    return await response.json()
  } catch (error) {
    console.error("Error fetching events:", error)
    return []
  }
}

export async function fetchAuthors(token: string = ""): Promise<string[]> {
  try {
    const [photos, texts] = await Promise.all([
      fetchPhotos(undefined, undefined, token),
      fetchTexts(undefined, undefined, token),
    ])

    const authors = new Set<string>()
    ;[...photos, ...texts].forEach((item) => {
      if (item.author) authors.add(item.author)
    })

    return Array.from(authors)
  } catch (error) {
    console.error("Error fetching authors:", error)
    return []
  }
}

export async function createItem(
  itemType: string,
  data: FormData | Record<string, any>,
  token: string = ""
): Promise<TimelineItem | null> {
  const endpoint = getEndpointForType(itemType)
  if (!endpoint) return null

  const isPhoto = itemType === "photo"

  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: isPhoto
        ? {
            ...getAuthHeaders(token),
          }
        : {
            "Content-Type": "application/json",
            ...getAuthHeaders(token),
          },
      body: isPhoto ? (data as FormData) : JSON.stringify(data),
    })

    if (!response.ok) throw new Error(`Failed to create ${itemType}`)
    return await response.json()
  } catch (error) {
    console.error(`Error creating ${itemType}:`, error)
    return null
  }
}



// Função auxiliar para obter o endpoint correto com base no tipo
export function getEndpointForType(itemType: string): string | null {
  switch (itemType) {
    case "photo":
      return "photos"
    case "text":
      return "texts"
    case "academic":
      return "academicResults"
    case "sport":
      return "sportResults"
    case "file":
      return "files"
    case "event":
      return "events"
    default:
      return null
  }
}
