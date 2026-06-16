import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Address } from '@/types/address';
import { track } from '@/utils/analytics';

export const useAddressManagement = () => {
  const { address: addressStore, removeAddress } = useCartStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(
    addressStore
  );

  const handleEditAddress = () => {
    track('address_modal_opened', { trigger: 'cart_edit_address' });
    setAddressToEdit(addressStore);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAddressToEdit(null);
  };

  const handleOpenModal = () => {
    track('address_modal_opened', { trigger: 'cart_address_section' });
    setIsModalOpen(true);
  };

  return {
    addressStore,
    isModalOpen,
    addressToEdit,
    handleEditAddress,
    handleCloseModal,
    handleOpenModal,
    removeAddress,
  };
};