import type { ApiResponse } from "@/server/schemas/main.schema";
import type { Pos, PosDto } from "@/server/schemas/pos.schema";
import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const NOTE_QUERY_KEY = {
  GET_LIST: "pos",
};

export function useGetListPos(
  options?: UseQueryOptions<
    ApiResponse<{ transaction_id: string; items: Pos[] }[]>,
    Error,
    ApiResponse<{ transaction_id: string; items: Pos[] }[]>
  >
) {
  return useQuery({
    queryKey: [NOTE_QUERY_KEY.GET_LIST],
    queryFn: async () => {
      const result = await window.posAPI.getList();

      if (!result.success) {
        throw new Error(result.error || "Failed to get list pos");
      }

      return result;
    },
    ...options,
  });
}

export function useCreatePos(
  options?: UseMutationOptions<ApiResponse<string>, Error, PosDto[]>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: PosDto[]) => {
      const result = await window.posAPI.create(value);

      if (!result.success) {
        if (result.issues && result.issues.length > 0) {
          const errorMessages = result.issues
            .map((err) => `${err.field}: ${err.message}`)
            .join(", ");
          throw new Error(errorMessages);
        }

        throw new Error(result.error || "Failed to create pos");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTE_QUERY_KEY.GET_LIST] });
      toast.success("Pos created successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    ...options,
  });
}
