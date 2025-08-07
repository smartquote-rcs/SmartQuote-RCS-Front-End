import React, { useState, useEffect } from 'react';
import { employeeService } from '../api/services.ts';

export const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });

  // Carregar funcionários quando o componente carregar
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const result = await employeeService.getAll();
      
      if (result.success) {
        setEmployees(result.data.data || []);
      } else {
        console.error('Erro ao carregar funcionários:', result.error);
        alert(result.error);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    
    try {
      const result = await employeeService.create(formData);
      
      if (result.success) {
        alert('Funcionário criado com sucesso!');
        setFormData({ name: '', email: '', role: '' });
        setShowForm(false);
        loadEmployees(); // Recarregar lista
      } else {
        console.error('Erro ao criar funcionário:', result.error);
        alert(result.error);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      alert('Erro inesperado ao criar funcionário');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Carregando funcionários...</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Funcionários</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'Cancelar' : 'Novo Funcionário'}
        </button>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h3 className="text-lg font-semibold mb-3">Criar Novo Funcionário</h3>
          <form onSubmit={handleCreateEmployee} className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Nome:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Cargo:</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Criar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de funcionários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Nenhum funcionário encontrado</p>
          </div>
        ) : (
          employees.map((employee) => (
            <div key={employee.id} className="bg-white p-4 rounded-lg shadow border">
              <h3 className="font-semibold text-lg mb-2">{employee.name}</h3>
              <p className="text-gray-600 mb-1">
                <strong>Email:</strong> {employee.email}
              </p>
              <p className="text-gray-600">
                <strong>Cargo:</strong> {employee.role}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
