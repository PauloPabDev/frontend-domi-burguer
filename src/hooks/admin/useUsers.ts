"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WorkerUser } from '@/types/worker';
import { AdminService } from '@/services/adminService';

export const useUsers = (initialSearch?: string) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<WorkerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch ?? '');
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async (searchValue?: string, pageValue = 1) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const q = searchValue ?? search;
      const { body } = await AdminService.getUsers(
        token,
        pageValue,
        20,
        q ? 'email' : undefined,
        q || undefined
      );
      setUsers(body ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [user, search]);

  useEffect(() => { fetchUsers(); }, [user]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchUsers(value, 1);
  };

  return { users, loading, error, search, setSearch: handleSearch, page, setPage, refetch: () => fetchUsers() };
};

export const useUserDetail = (userId: string) => {
  const { user } = useAuth();
  const [userDetail, setUserDetail] = useState<WorkerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!user || !userId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const { body } = await AdminService.getUserById(token, userId);
      setUserDetail(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar usuario');
    } finally {
      setLoading(false);
    }
  }, [user, userId]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const updateRoles = async (roles: string[]) => {
    if (!user || !userDetail) return;
    const token = await user.getIdToken();
    const { body } = await AdminService.updateUserRoles(token, userDetail.id, roles);
    setUserDetail(body);
  };

  const updateKitchens = async (kitchenIds: string[]) => {
    if (!user || !userDetail) return;
    const token = await user.getIdToken();
    const { body } = await AdminService.updateUserKitchens(token, userDetail.id, kitchenIds);
    setUserDetail(body);
  };

  return { userDetail, loading, error, refetch: fetchUser, updateRoles, updateKitchens };
};
