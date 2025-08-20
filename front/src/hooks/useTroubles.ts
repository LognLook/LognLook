import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { troubleService, CreateTroubleRequest, UpdateTroubleRequest } from '../services/troubleService';

export const useTroubles = (projectId: number) => {
  const queryClient = useQueryClient();

  // 트러블 목록 조회
  const useTroubleList = () => {
    return useQuery({
      queryKey: ['troubles', 'list', projectId],
      queryFn: () => troubleService.getTroubles(projectId),
      enabled: !!projectId,
      staleTime: 2 * 60 * 1000, // 2분
      refetchInterval: 60 * 1000, // 1분마다 자동 새로고침
    });
  };

  // 특정 트러블 상세 조회
  const useTroubleDetail = (troubleId: number) => {
    return useQuery({
      queryKey: ['troubles', 'detail', projectId, troubleId],
      queryFn: () => troubleService.getTrouble(projectId, troubleId),
      enabled: !!projectId && !!troubleId,
      staleTime: 5 * 60 * 1000, // 5분
    });
  };

  // 트러블 생성
  const createTroubleMutation = useMutation({
    mutationFn: (troubleData: CreateTroubleRequest) => 
      troubleService.createTrouble(projectId, troubleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['troubles', 'list', projectId] });
    },
  });

  // 트러블 수정
  const updateTroubleMutation = useMutation({
    mutationFn: ({ troubleId, troubleData }: { troubleId: number; troubleData: UpdateTroubleRequest }) => 
      troubleService.updateTrouble(projectId, troubleId, troubleData),
    onSuccess: (_, { troubleId }) => {
      queryClient.invalidateQueries({ queryKey: ['troubles', 'list', projectId] });
      queryClient.invalidateQueries({ queryKey: ['troubles', 'detail', projectId, troubleId] });
    },
  });

  // 트러블 삭제
  const deleteTroubleMutation = useMutation({
    mutationFn: (troubleId: number) => 
      troubleService.deleteTrouble(projectId, troubleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['troubles', 'list', projectId] });
    },
  });

  return {
    useTroubleList,
    useTroubleDetail,
    createTrouble: createTroubleMutation.mutate,
    updateTrouble: updateTroubleMutation.mutate,
    deleteTrouble: deleteTroubleMutation.mutate,
    isCreatingTrouble: createTroubleMutation.isPending,
    isUpdatingTrouble: updateTroubleMutation.isPending,
    isDeletingTrouble: deleteTroubleMutation.isPending,
    createTroubleError: createTroubleMutation.error,
    updateTroubleError: updateTroubleMutation.error,
    deleteTroubleError: deleteTroubleMutation.error,
  };
};
