import React, { useEffect, useState } from "react";
import axios from "axios";

interface PortfolioProps {
  park: string;
}

const Portfolio: React.FC<PortfolioProps> = ({ park }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Función para obtener la lista de empleados
  const fetchEmployees = async () => {
    try {
      const response = await axios.get("https://9b0lctjk-80.use.devtunnels.ms/api/hotel/getAllEmployees");
      return response.data;
    } catch (err) {
      console.error("❌ Error obteniendo empleados:", err);
      return [];
    }
  };

  // Función para obtener el salario y detalles de un empleado
  const fetchEmployeeSalary = async (employeeId: string) => {
    try {
      const salaryResponse = await axios.get(
        `https://9b0lctjk-80.use.devtunnels.ms/api/hotel/CalculateEmployeeSalary/${employeeId}`
      );
      return salaryResponse.data ?? {}; // Aseguramos un objeto vacío si no hay datos
    } catch (error) {
      console.error(`❌ Error obteniendo salario para el empleado ID ${employeeId}:`, error);
      return {}; // Retorna un objeto vacío en caso de error
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Obtener la lista de empleados
      const employeeList = await fetchEmployees();
      let updatedEmployees: any[] = [];

      // Para cada empleado, obtener su salario y otros detalles
      for (const employee of employeeList) {
        const salaryData = await fetchEmployeeSalary(employee.id_employee);
        updatedEmployees.push({
          ...employee,
          total_hours: salaryData.total_hours ?? "0:00:00", // Aseguramos valores predeterminados
          rooms_cleaned_A: salaryData.rooms_cleaned_A ?? 0,
          rooms_cleaned_B: salaryData.rooms_cleaned_B ?? 0,
          total_salary: salaryData.total_salary ?? "0.00", // Si no se encuentra el salario
        });
      }

      // Actualizamos el estado con la lista de empleados que incluye los datos calculados
      setEmployees(updatedEmployees);
    };

    fetchData();
  }, []); // Esto se ejecutará solo una vez cuando el componente se monte

  // Filtrar empleados por nombre
  const filteredEmployees = employees.filter((employee: any) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular el valor total de todos los empleados
  const totalSalaryToPay = filteredEmployees.reduce((acc: number, employee: any) => {
    const totalSalary = parseFloat(employee.total_salary) || 0; // Aseguramos que no haya NaN
    return acc + totalSalary;
  }, 0);

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Total a pagar por todos los empleados: ${totalSalaryToPay.toFixed(2)} US
        </h3>
        <input
          type="text"
          placeholder="Buscar empleado..."
          className="border p-2 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="overflow-x-auto w-full max-w-full">
  <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
    <thead className="bg-gray-800 text-white">
          
            <tr>
              <th className="py-2 px-4 w-1/6">Nombre</th>
              <th className="py-2 px-4 w-1/6">Rol</th>
              <th className="py-2 px-4">Valor/Hora</th>
              <th className="py-2 px-4">Horas Trabajadas</th>
              <th className="py-2 px-4">Habitación/A</th>
              <th className="py-2 px-4">Habitación/B</th>
              <th className="py-2 px-4">Horas Extra</th>
              <th className="py-2 px-4">Salario Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee: any) => (
              <tr key={employee.id_employee} className="border-b hover:bg-gray-100">
                <td className="py-2 px-4 w-1/6">{employee.name}</td>
                <td className="py-2 px-4 w-1/6">{employee.role}</td>
                <td className="py-2 px-4">$ {employee.hourly_wage}US</td>
                <td className="py-2 px-4 text-center">{employee.total_hours}</td>
                <td className="py-2 px-4 text-center">{employee.rooms_cleaned_A}</td>
                <td className="py-2 px-4 text-center">{employee.rooms_cleaned_B}</td>
                <td className="py-2 px-4 text-center">0</td>
                <td className="py-2 px-4 font-bold">$ {parseFloat(employee.total_salary).toFixed(2)}US</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Portfolio;
