'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { Case, Employee, Task, TimeEntry } from '@/types';
import { getCases, saveCase, getEmployees, getTasks, getTimeEntries } from '@/lib/storage';

export default function CaseManagement() {
  const [cases, setCases] = useState<Case[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    totalFee: 0,
    assignedEmployees: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCases(getCases());
    setEmployees(getEmployees());
    setTasks(getTasks());
    setTimeEntries(getTimeEntries());
  };

  const handleCreateCase = () => {
    setSelectedCase(null);
    setFormData({
      name: '',
      totalFee: 0,
      assignedEmployees: [],
    });
    setShowModal(true);
  };

  const handleEditCase = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setFormData({
      name: caseItem.name,
      totalFee: caseItem.totalFee,
      assignedEmployees: [...caseItem.assignedEmployees],
    });
    setShowModal(true);
  };

  const handleSaveCase = () => {
    const caseItem: Case = {
      id: selectedCase?.id || `case_${Date.now()}`,
      name: formData.name,
      totalFee: formData.totalFee,
      assignedEmployees: formData.assignedEmployees,
      tasks: selectedCase?.tasks || [],
      status: selectedCase?.status || 'active',
      createdAt: selectedCase?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    saveCase(caseItem);
    loadData();
    setShowModal(false);
  };

  const calculateCaseStats = (caseId: string) => {
    const caseTasks = tasks.filter(t => t.caseId === caseId);
    const caseTimeEntries = timeEntries.filter(e => 
      caseTasks.some(t => t.id === e.taskId)
    );

    const totalSeconds = caseTimeEntries.reduce((sum, e) => sum + e.duration, 0);
    const totalHours = totalSeconds / 3600;
    
    const assignedEmps = cases.find(c => c.id === caseId)?.assignedEmployees || [];
    const totalCost = assignedEmps.reduce((sum, empId) => {
      const emp = employees.find(e => e.id === empId);
      if (!emp) return sum;
      return sum + (totalHours * emp.hourlySalary);
    }, 0);

    const caseItem = cases.find(c => c.id === caseId);
    const totalRevenue = caseItem?.totalFee || 0;
    const profit = totalRevenue - totalCost;

    return {
      totalHours,
      cost: totalCost,
      revenue: totalRevenue,
      profit,
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">案件管理</h2>
        <button
          onClick={handleCreateCase}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          新建案件
        </button>
      </div>

      <div className="space-y-4">
        {cases.map(caseItem => {
          const stats = calculateCaseStats(caseItem.id);
          
          return (
            <div
              key={caseItem.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{caseItem.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    总收费: {formatCurrency(caseItem.totalFee)}
                  </p>
                </div>
                <button
                  onClick={() => handleEditCase(caseItem)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                >
                  编辑
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <div className="text-sm text-gray-600">总工时</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {stats.totalHours.toFixed(2)} 小时
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">成本</div>
                  <div className="text-lg font-semibold text-red-600">
                    {formatCurrency(stats.cost)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">收入</div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(stats.revenue)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">利润</div>
                  <div className={`text-lg font-semibold ${
                    stats.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(stats.profit)}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-1">分配员工:</div>
                <div className="flex flex-wrap gap-2">
                  {caseItem.assignedEmployees.map(empId => {
                    const emp = employees.find(e => e.id === empId);
                    return emp ? (
                      <span
                        key={empId}
                        className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm"
                      >
                        {emp.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {selectedCase ? '编辑案件' : '新建案件'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  案件名称
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  总收费 (¥)
                </label>
                <input
                  type="number"
                  value={formData.totalFee}
                  onChange={(e) => setFormData({ ...formData, totalFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分配员工
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {employees.map(emp => (
                    <label key={emp.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.assignedEmployees.includes(emp.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              assignedEmployees: [...formData.assignedEmployees, emp.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              assignedEmployees: formData.assignedEmployees.filter(id => id !== emp.id),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {emp.name} (时薪: {formatCurrency(emp.hourlySalary)})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveCase}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

