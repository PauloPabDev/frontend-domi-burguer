export interface Product {
  id: string;
  name: string;
  price: number;
  photos?: [string];
  description?: string;
  category?: string;
  status?: string;
  colorPrimary: string;
  colorSecondary: string;
  secret: boolean;
  type?: 'product' | 'complement';

}
