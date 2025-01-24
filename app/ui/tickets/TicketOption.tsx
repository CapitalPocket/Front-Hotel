import { formatCurrency } from '@/app/lib/utils';
import { useState, useEffect } from 'react';

interface TicketOptionProps {
  title: string;
  description?: string;
  price: number;
  onQuantityChange: (title: string, quantity: number, totalPrice:number) => void; 
  reset:boolean;
}

const TicketOption = ({
  title,
  description,
  price,
  onQuantityChange,
  reset
}: TicketOptionProps) => {
  const [quantity, setQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Actualiza el totalPrice cada vez que cambian quantity o price
  useEffect(() => {
    setTotalPrice(price * quantity);
    onQuantityChange(title, quantity, price * quantity);
  }, [quantity, price, totalPrice, title]); 
  // Dependencias correctas
  useEffect(() => {
    if (reset) {
      setQuantity(0);
      setTotalPrice(0);
     
    }
  }, [reset, title ]);

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    setTotalPrice(price * newQuantity);
    onQuantityChange(title, quantity, price * newQuantity);
  };

  const handleDecrease = () => {
    const newQuantity = quantity > 0 ? quantity - 1 : 0;
    setQuantity(newQuantity);
    setTotalPrice(price * newQuantity);
    onQuantityChange(title, quantity, price * newQuantity);
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm space-x-4">
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
        <p className="mt-2 text-base font-medium text-gray-900">{formatCurrency(price)}</p>
      </div>
      <div className="text-lg font-semibold text-gray-900">
        Total: {formatCurrency(totalPrice)}
      </div>
      <div className="flex items-center space-x-2">
        <a
          onClick={handleDecrease}
          className="flex cursor-pointer h-8 w-8 items-center justify-center rounded-full border bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          -
        </a>
        <span className="text-lg font-medium">{quantity}</span>
        <a
          onClick={handleIncrease}
          className="flex cursor-pointer h-8 w-8 items-center justify-center rounded-full border bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          +
        </a>
      </div>
    </div>
  );
};

export default TicketOption;
