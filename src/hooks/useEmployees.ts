import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export const useEmployees = (params?: {
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => api.getEmployees(params),
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => api.getEmployee(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeData: any) => api.createEmployee(employeeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Employee created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create employee');
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update employee');
    },
  });
};

export const useAddPayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.addPayroll(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Payroll added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add payroll');
    },
  });
};

export const useAddLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.addLeaveRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Leave request submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit leave request');
    },
  });
};

export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leaveId, status }: { leaveId: string; status: string }) =>
      api.updateLeaveRequest(leaveId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Leave request updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update leave request');
    },
  });
};

export const useProcessPayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { payPeriodStart: string; payPeriodEnd: string; employeeIds?: string[] }) =>
      api.processPayroll(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Payroll processed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process payroll');
    },
  });
};
