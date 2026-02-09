import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sceneService } from "@/lib/services/api/scene-service";
import { Scene } from "@/lib/agents/types";

export const useScenes = (projectId: string) => {
  return useQuery({
    queryKey: ["scenes", projectId],
    queryFn: () => sceneService.getByProjectId(projectId),
    enabled: !!projectId,
    refetchInterval: 2000, // Poll for live scene status updates
  });
};

export const useUpdateScene = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Scene> }) =>
      sceneService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenes", projectId] });
    },
  });
};

export const useUpdateSceneVisualData = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sceneId, payload }: { sceneId: string; payload: any }) =>
      sceneService.updateVisualData(sceneId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenes", projectId] });
    },
  });
};
