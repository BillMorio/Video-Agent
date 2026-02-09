import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { memoryService } from "@/lib/services/api/memory-service";
import { AgentMemory } from "@/lib/agents/types";

export const useAgentState = (projectId: string) => {
  return useQuery({
    queryKey: ["agent-state", projectId],
    queryFn: () => memoryService.getByProjectId(projectId),
    enabled: !!projectId,
    refetchInterval: 2000, // Poll every 2 seconds for real-time orchestration logs
  });
};

export const useUpdateAgentState = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<AgentMemory>) =>
      memoryService.update(projectId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-state", projectId] });
    },
  });
};

export const useResetAgentState = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => memoryService.reset(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-state", projectId] });
    },
  });
};
