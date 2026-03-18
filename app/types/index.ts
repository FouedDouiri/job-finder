export interface Job {
  slug: string
  company_name: string
  title: string
  description: string
  remote: boolean
  url: string
  tags: string[]
  job_types: string[]
  location: string
  created_at: number
}

export interface JobsLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

export interface JobsMeta {
  current_page: number
  current_page_url: string
  from: number
  path: string
  per_page: number
  to: number
}

export interface JobsResponse {
  data: Job[]
  links: JobsLinks
  meta: JobsMeta
}

export interface JobFilters {
  search: string
  remote: boolean | null
  tag: string | null
}

export interface LocationState {
  lat: number | null
  lng: number | null
  city: string | null
  loading: boolean
  error: string | null
}