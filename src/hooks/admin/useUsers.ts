"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WorkerUser } from '@/types/worker';
import { AdminService } from '@/services/adminService';

const LIMIT = 20;

export const useUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<WorkerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  const doFetch = useCallback(async (s: string, r: string, p: number) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      let key: string | undefined;
      let value: string | undefined;
      if (s) { key = 'email'; value = s; }
      else if (r) { key = 'role'; value = r; }
      const { body, total: t } = await AdminService.getUsers(token, p, LIMIT, key, value);
      const list = body ?? [];
      setUsers(list);
      setTotal(t ?? 0);
      setHasNextPage(list.length >= LIMIT);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { doFetch('', '', 1); }, [doFetch]);

  const setFilters = (newSearch: string, newRole: string) => {
    setSearch(newSearch);
    setRole(newRole);
    setPage(1);
    doFetch(newSearch, newRole, 1);
  };

  const handlePage = (p: number) => {
    setPage(p);
    doFetch(search, role, p);
  };

  const totalPages = total > 0 ? Math.ceil(total / LIMIT) : undefined;

  return {
    users, loading, error,
    search, role, setFilters,
    page, setPage: handlePage,
    total, totalPages,
    hasNextPage,
    hasPrevPage: page > 1,
    refetch: () => doFetch(search, role, page),
  };
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
