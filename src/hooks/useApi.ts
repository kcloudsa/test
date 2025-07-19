import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query'
import type { AxiosRequestConfig, AxiosInstance } from 'axios'
import api from '@/api'

// Define HTTP methods
type HttpMethod = 'get' | 'post' | 'put' | 'delete'

// Define API response type (for backend API)
interface ApiResponse<T> {
  data: T
}

// Query hook props
interface UseApiQueryProps<TData, TError = Error> {
  queryKey: QueryKey
  endpoint: string
  params?: Record<string, string | number | boolean>
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
  isExternalApi?: boolean
  useLocalJson?: boolean
  axiosInstance?: AxiosInstance
  axiosConfig?: AxiosRequestConfig
}

// Mutation hook props
interface UseApiMutationProps<TData, TVariables, TError = Error> {
  method: HttpMethod
  endpoint: string
  options?: UseMutationOptions<TData, TError, TVariables>
  axiosInstance?: AxiosInstance
  axiosConfig?: AxiosRequestConfig
}

export function useApiQuery<TData, TError = Error>({
  queryKey,
  endpoint,
  params,
  options,
  isExternalApi = false,
  useLocalJson = false,
  axiosInstance = api,
  axiosConfig,
}: UseApiQueryProps<TData, TError>) {
  return useQuery<TData, TError>({
    queryKey: [...queryKey, params],
    queryFn: async (): Promise<TData> => {
      if (useLocalJson) {
        const response = await fetch(endpoint)
        if (!response.ok) {
          throw new Error(`Local JSON fetch failed: ${response.status}`)
        }
        return await response.json()
      }

      if (isExternalApi) {
        const response = await fetch(endpoint)
        if (!response.ok) {
          throw new Error(`External API error: ${response.status}`)
        }
        return await response.json()
      }

      const res: ApiResponse<TData> = await axiosInstance.get(endpoint, {
        params,
        ...axiosConfig,
      })
      return res.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes caching
    ...options,
  })
}

export function useApiMutation<TData, TVariables, TError = Error>({
  method,
  endpoint,
  options,
  axiosInstance = api,
  axiosConfig,
}: UseApiMutationProps<TData, TVariables, TError>) {
  const queryClient = useQueryClient()

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (data: TVariables): Promise<TData> => {
      const config = { ...axiosConfig }

      let response
      switch (method) {
        case 'post':
          response = await axiosInstance.post(endpoint, data, config)
          break
        case 'put':
          response = await axiosInstance.put(endpoint, data, config)
          break
        case 'delete':
          response = await axiosInstance.delete(endpoint, { data, ...config })
          break
        case 'get':
          response = await axiosInstance.get(endpoint, { params: data, ...config })
          break
        default:
          throw new Error(`Unsupported HTTP method: ${method}`)
      }

      return response.data
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries()
      options?.onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context)
    },
    ...options,
  })
}