import React, { useEffect, useState } from "react";
import axios from "axios";

const Passports = ({ park }: any) => {
  const [modalOpen, setModalOpen] = useState<any>(false);
  const [passports, setPassports] = useState<any>([]);
  const [selectedPassport, setSelectedPassport] = useState<any>(null);
  const [newPrice, setNewPrice] = useState<any>("");
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/tickets/porfolio/${park == 'Parque Norte' ? 1 : 2}`);
        setPassports(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [park, modalOpen]);

  const openModal = (passport: any) => {
    setSelectedPassport(passport);
    setNewPrice(passport.price_passport);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPassport(null);
    setNewPrice("");
  };

  const savePrice = async () => {
    await axios.post(`/api/tickets/porfolio`, { 
        idpassport: selectedPassport.id_passport, 
        price_passport: Number(newPrice) 
    })
    return closeModal();
  };

  return (
    <div className="p-6">
      <div className={`grid ${passports.length == 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} grid-cols-1 gap-6`}>
        {passports.map((passport: any) => (
          <div
            key={passport.id_passport}
            className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col justify-between"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {passport.name_passport}
              </h2>
              <p className="text-gray-600 text-sm mb-4 text-justify">
                {passport.description_passport}
              </p>
            </div>
            <div className="border-t p-4 flex items-center justify-between">
              <p className="text-lg font-bold text-gray-700">
                Precio: <br/> $ {passport.price_passport.toLocaleString()}
              </p>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
                onClick={() => openModal(passport)}
              >
                <i className="fas fa-edit mr-2"></i> Editar precio
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && selectedPassport && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Editar Precio - {selectedPassport.name_passport}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Nuevo Precio
              </label>
              <input
                type="number"
                className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={savePrice}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Passports;
