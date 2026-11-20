"use client";

import { useSocket } from '@/contexts/SocketContext';
import { WorkerNavbar } from '@/components/navbar/WorkerNavbar';

export const CourierNavbar: React.FC = () => {
  const { orders } = useSocket();
  return <WorkerNavbar role="domiciliario" badges={{ ordenes: orders.length }} />;
};
