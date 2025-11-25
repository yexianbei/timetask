'use client';

import { useState, useEffect } from 'react';
import { getCurrentWeek, formatCurrency } from '@/lib/utils';
import type { Task, TimeEntry, Case, Employee } from '@/types';
import { getTasks, getTimeEntries, getCases, getEmployees } from '@/lib/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Statistics() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<'week' | 'cases' | 'employees'>('week');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTasks(getTasks());
    setTimeEntries(getTimeEntries());
    setCases(getCases());
    setEmployees(getEmployees());
  };

  // 本周统计
  const getWeekStats = () => {
    const week = getCurrentWeek();
    const weekStart = week.monday;
    const weekEnd = new Date(week.sunday);
    weekEnd.setHours(23, 59, 59, 999);

    const weekTasks = tasks.filter(t => {
      const taskDate = new Date(t.startTime);
      return taskDate >= weekStart && taskDate <= weekEnd;
    });

    const weekTimeEntries = timeEntries.filter(e => {
      const entryDate = new Date(e.startTime);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });

    const uniqueClients = new Set(weekTasks.map(t => t.caseId).filter(Boolean));
    const totalSeconds = weekTimeEntries.reduce((sum, e) => sum + e.duration, 0);
    const totalHours = totalSeconds / 3600;
    const totalRevenue = weekTimeEntries.reduce((sum, e) => sum + e.cost, 0);

    // 计算成本
    const totalCost = weekTimeEntries.reduce((sum, entry) => {
      const task = tasks.find(t => t.id === entry.taskId);
      if (!task || !task.employeeId) return sum;
      const emp = employees.find(e => e.id === task.employeeId);
      if (!emp) return sum;
      return sum + (entry.duration / 3600) * emp.hourlySalary;
    }, 0);

    const profit = totalRevenue - totalCost;

    return {
      clientCount: uniqueClients.size,
      totalHours,
      totalRevenue,
      totalCost,
      profit,
    };
  };

  // 案件进度
  const getCaseProgress = () => {
    return cases.map(caseItem => {
      const caseTasks = tasks.filter(t => t.caseId === caseItem.id);
      const caseTimeEntries = timeEntries.filter(e => 
        caseTasks.some(t => t.id === e.taskId)
      );

      const totalSeconds = caseTimeEntries.reduce((sum, e) => sum + e.duration, 0);
      const totalHours = totalSeconds / 3600;

      const assignedEmps = caseItem.assignedEmployees;
      const totalCost = assignedEmps.reduce((sum, empId) => {
        const emp = employees.find(e => e.id === empId);
        if (!emp) return sum;
        return sum + (totalHours * emp.hourlySalary);
      }, 0);

      const profit = caseItem.totalFee - totalCost;

      return {
        caseId: caseItem.id,
        caseName: caseItem.name,
        totalHours,
        cost: totalCost,
        profit,
      };
    });
  };

  // 员工统计
  const getEmployeeStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return employees.map(emp => {
      const empTasks = tasks.filter(t => t.employeeId === emp.id);
      const empTimeEntries = timeEntries.filter(e => {
        const entryDate = new Date(e.startTime);
        return (
          entryDate.getMonth() === currentMonth &&
          entryDate.getFullYear() === currentYear &&
          empTasks.some(t => t.id === e.taskId)
        );
      });

      const totalSeconds = empTimeEntries.reduce((sum, e) => sum + e.duration, 0);
      const monthlyHours = totalSeconds / 3600;
      const monthlyRevenue = empTimeEntries.reduce((sum, e) => sum + e.cost, 0);
      const monthlySalary = monthlyHours * emp.hourlySalary;

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        monthlyHours,
        monthlyRevenue,
        monthlySalary,
      };
    });
  };

  const weekStats = getWeekStats();
  const caseProgress = getCaseProgress();
  const employeeStats = getEmployeeStats();

  // 准备图表数据
  const caseChartData = caseProgress.map(c => ({
    name: c.caseName.length > 10 ? c.caseName.substring(0, 10) + '...' : c.caseName,
    成本: c.cost,
    收入: c.profit + c.cost,
    利润: c.profit,
  }));

  const employeeChartData = employeeStats.map(e => ({
    name: e.employeeName,
    工作时间: parseFloat(e.monthlyHours.toFixed(2)),
    收入: e.monthlyRevenue,
    薪资: e.monthlySalary,
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">统计面板</h2>

      {/* 标签页 */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('week')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'week'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          本周统计
        </button>
        <button
          onClick={() => setActiveTab('cases')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'cases'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          案件进度
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'employees'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          员工统计
        </button>
      </div>

      {/* 本周统计 */}
      {activeTab === 'week' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">客户数量</div>
              <div className="text-2xl font-bold text-blue-600">{weekStats.clientCount}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">总工时</div>
              <div className="text-2xl font-bold text-green-600">
                {weekStats.totalHours.toFixed(2)} 小时
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">总收入</div>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(weekStats.totalRevenue)}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">总成本</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(weekStats.totalCost)}
              </div>
            </div>
            <div className={`p-4 rounded-lg ${
              weekStats.profit >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="text-sm text-gray-600 mb-1">利润</div>
              <div className={`text-2xl font-bold ${
                weekStats.profit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(weekStats.profit)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 案件进度 */}
      {activeTab === 'cases' && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">案件进度图表</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={caseChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="成本" fill="#ef4444" />
                <Bar dataKey="收入" fill="#10b981" />
                <Bar dataKey="利润" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {caseProgress.map(c => (
              <div key={c.caseId} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">{c.caseName}</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">总工时: </span>
                    <span className="font-medium">{c.totalHours.toFixed(2)} 小时</span>
                  </div>
                  <div>
                    <span className="text-gray-600">成本: </span>
                    <span className="font-medium text-red-600">{formatCurrency(c.cost)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">利润: </span>
                    <span className={`font-medium ${
                      c.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(c.profit)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 员工统计 */}
      {activeTab === 'employees' && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">员工工作时间</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="工作时间" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">员工收入与薪资</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="收入" fill="#10b981" />
                <Bar dataKey="薪资" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {employeeStats.map(e => (
              <div key={e.employeeId} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">{e.employeeName}</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">工作时间: </span>
                    <span className="font-medium">{e.monthlyHours.toFixed(2)} 小时</span>
                  </div>
                  <div>
                    <span className="text-gray-600">收入: </span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(e.monthlyRevenue)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">薪资: </span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(e.monthlySalary)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

