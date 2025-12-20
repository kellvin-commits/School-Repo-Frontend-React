import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Users, FileText, TrendingUp, Edit, X, Search, Menu } from 'lucide-react';
import {toast} from 'react-toastify'

// API Configuration
const API_BASE_URL = `https://marks-ioul.onrender.com/${api}/${students}`;

// API Service Functions
const api = {
  getStudents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get`);
      if (!response.ok) throw new Error('Failed to fetch students');
      return await response.json();
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  addStudent: async (studentData) => {
    try {
      console.log('API: Adding student with data:', studentData);
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      console.log('API: Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API: Error response:', errorText);
        throw new Error(`Failed to add student: ${errorText}`);
      }
      const result = await response.json();
      console.log('API: Success result:', result);
      return result;
    } catch (error) {
      console.error('API: Error adding student:', error);
      throw error;
    }
  },

  updateStudent: async (id, studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      if (!response.ok) throw new Error('Failed to update student');
      return await response.json();
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  deleteStudent: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete student');
      return await response.json();
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },
};

export default function SchoolReportSaaS() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    class: '',
    subjects: {}
  });
  const [subjects] = useState(['Mathematics', 'English', 'Science', 'Social Studies', 'Kiswahili']);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showClassReport, setShowClassReport] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    const data = await api.getStudents();
    setStudents(data);
    setLoading(false);
  };

  const calculateResults = (studentData) => {
    const marks = Object.values(studentData.subjects).map(m => parseFloat(m) || 0);
    const total = marks.reduce((sum, mark) => sum + mark, 0);
    const average = marks.length > 0 ? total / marks.length : 0;
    
    let grade = 'F';
    if (average >= 80) grade = 'A';
    else if (average >= 70) grade = 'B';
    else if (average >= 60) grade = 'C';
    else if (average >= 50) grade = 'D';
    else if (average >= 40) grade = 'E';

    return { total, average: average.toFixed(2), grade };
  };

  const calculatePositions = (studentsList) => {
    const studentsWithResults = studentsList.map(student => ({
      ...student,
      ...calculateResults(student)
    }));
    studentsWithResults.sort((a, b) => b.total - a.total);
    return studentsWithResults.map((student, index) => ({
      ...student,
      position: index + 1
    }));
  };

  const handleAddOrUpdate = async () => {
    console.log('Form data:', formData);
    
    if (!formData.name || !formData.studentId || !formData.class) {
      toast.error('Please fill in all student details');
      return;
    }

    const subjectsComplete = subjects.every(subject => 
      formData.subjects[subject] !== undefined && formData.subjects[subject] !== ''
    );

    if (!subjectsComplete) {
      alert('Please enter marks for all subjects');
      return;
    }

    try {
      console.log('Sending data to API:', formData);
      if (editingStudent) {
        const result = await api.updateStudent(editingStudent._id || editingStudent.id, formData);
        console.log('Update result:', result);
        toast.success('Student updated successfully!');
      } else {
        const result = await api.addStudent(formData);
        console.log('Add result:', result);
        toast.success('Student added successfully!');
      }
      
      await loadStudents();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to ${editingStudent ? 'update' : 'add'} student. Error: ${error.message}`);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      studentId: student.studentId,
      class: student.class,
      subjects: { ...student.subjects }
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await api.deleteStudent(id);
      await loadStudents();
      toast.success('Student deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete student. Please try again.');
    }
  };

  const handleSubjectChange = (subject, value) => {
    const numValue = parseFloat(value);
    if (value === '' || (numValue >= 0 && numValue <= 100)) {
      setFormData({
        ...formData,
        subjects: { ...formData.subjects, [subject]: value }
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', studentId: '', class: '', subjects: {} });
    setEditingStudent(null);
    setShowForm(false);
  };

  const generateReport = (student) => {
    setSelectedStudent(student);
    setShowClassReport(false);
  };

  const generateClassReport = () => {
    if (selectedClass === 'All Classes') {
      toast.error('Please select a specific class to generate class report');
      return;
    }
    setShowClassReport(true);
    setSelectedStudent(null);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.class.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = selectedClass === 'All Classes' || student.class === selectedClass;
    
    return matchesSearch && matchesClass;
  });

  const uniqueClasses = ['All Classes', ...new Set(students.map(s => s.class))].filter(Boolean);

  const studentsWithPositions = calculatePositions(filteredStudents);

  const stats = {
    totalStudents: selectedClass === 'All Classes' ? students.length : filteredStudents.length,
    averageScore: selectedClass === 'All Classes'
      ? students.length > 0
        ? (calculatePositions(students).reduce((sum, s) => sum + parseFloat(s.average), 0) / students.length).toFixed(2)
        : 0
      : filteredStudents.length > 0
        ? (calculatePositions(filteredStudents).reduce((sum, s) => sum + parseFloat(s.average), 0) / filteredStudents.length).toFixed(2)
        : 0,
    topStudent: selectedClass === 'All Classes'
      ? calculatePositions(students).length > 0 ? calculatePositions(students)[0] : null
      : calculatePositions(filteredStudents).length > 0 ? calculatePositions(filteredStudents)[0] : null
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-sm sm:text-base">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="w-full px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
        {/* Header - Fully Responsive */}
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="text-indigo-600 shrink-0" size={20} />
                <span className="truncate">School Report Card Generator</span>
              </h1>
              <p className="text-gray-600 mt-1 text-xs sm:text-sm">Manage marks and generate reports</p>
            </div>
            <button
              onClick={() => { 
                setShowForm(true);
              }}
              className="w-full sm:w-auto bg-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-semibold text-sm sm:text-base whitespace-nowrap"
            >
              <Plus size={18} />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Stats Dashboard - Fully Responsive */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-3 sm:mb-4 md:mb-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg shrink-0">
                <Users className="text-blue-600" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-xs sm:text-sm truncate">Total Students</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg shrink-0">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-xs sm:text-sm truncate">Class Average</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.averageScore}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 xs:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg shrink-0">
                <FileText className="text-yellow-600" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-xs sm:text-sm truncate">Top Student</p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-gray-800 truncate">{stats.topStudent?.name || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Student Form - Fully Responsive */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 p-1">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
              <input
                type="text"
                placeholder="Student Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              />
              <input
                type="text"
                placeholder="Student ID"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              />
              <input
                type="text"
                placeholder="Class"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
              {subjects.map(subject => (
                <div key={subject} className="w-full">
                  <label className="text-xs sm:text-sm text-gray-600 mb-1 block truncate">{subject}</label>
                  <input
                    type="number"
                    placeholder="0-100"
                    min="0"
                    max="100"
                    value={formData.subjects[subject] || ''}
                    onChange={(e) => handleSubjectChange(subject, e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={handleAddOrUpdate}
                className="w-full sm:flex-1 bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold text-sm sm:text-base"
              >
                {editingStudent ? 'Update Student' : 'Save Student'}
              </button>
              <button
                onClick={resetForm}
                className="w-full sm:flex-1 bg-gray-400 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-500 transition font-semibold text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search Bar and Class Filter - Fully Responsive */}
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, ID, or class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="w-full sm:w-40 md:w-48">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>
          {selectedClass !== 'All Classes' && (
            <div className="mt-3 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
              <p className="text-xs sm:text-sm text-gray-600">
                Showing <span className="font-bold text-indigo-600">{selectedClass}</span> ({filteredStudents.length} students)
              </p>
              <div className="flex flex-wrap gap-2 w-full xs:w-auto">
                <button
                  onClick={generateClassReport}
                  className="flex-1 xs:flex-none text-xs sm:text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-1"
                >
                  <FileText size={14} />
                  <span>Class Report</span>
                </button>
                <button
                  onClick={() => setSelectedClass('All Classes')}
                  className="flex-1 xs:flex-none text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-semibold px-3 py-1.5 border border-indigo-600 rounded-lg hover:bg-indigo-50"
                >
                  Clear Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Students Table - Desktop Only */}
        <div className="hidden lg:block bg-white rounded-lg shadow-lg overflow-hidden mb-3 sm:mb-4 md:mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-3 py-2 md:px-4 md:py-3 text-left text-sm">Position</th>
                  <th className="px-3 py-2 md:px-4 md:py-3 text-left text-sm">Student Name</th>
                  <th className="px-3 py-2 md:px-4 md:py-3 text-left text-sm">ID</th>
                  <th className="px-3 py-2 md:px-4 md:py-3 text-left text-sm">Class</th>
                  <th className="px-3 py-2 md:px-4 md:py-3 text-center text-sm">Total</th>
                  <th className="px-3 py-2 md:px-4 md:py-3 text-center text-sm">Avg</th>
                  <th className="px-3 py-2 md:px-4 md:py-3 text-center text-sm">Grade</th>
                  <th className="px-3 py-2 md:px-4 md:py-3 text-center text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentsWithPositions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500 text-sm">
                      {searchQuery || selectedClass !== 'All Classes' 
                        ? 'No students found matching your filters.' 
                        : 'No students added yet.'}
                    </td>
                  </tr>
                ) : (
                  studentsWithPositions.map((student, idx) => (
                    <tr key={student._id || student.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-3 py-2 md:px-4 md:py-3">
                        <span className="font-bold text-indigo-600 text-sm">#{student.position}</span>
                      </td>
                      <td className="px-3 py-2 md:px-4 md:py-3 font-semibold text-gray-800 text-sm">{student.name}</td>
                      <td className="px-3 py-2 md:px-4 md:py-3 text-gray-600 text-sm">{student.studentId}</td>
                      <td className="px-3 py-2 md:px-4 md:py-3 text-gray-600 text-sm">{student.class}</td>
                      <td className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold text-sm">{student.total}</td>
                      <td className="px-3 py-2 md:px-4 md:py-3 text-center font-semibold text-sm">{student.average}%</td>
                      <td className="px-3 py-2 md:px-4 md:py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-white font-bold text-xs ${
                          student.grade === 'A' ? 'bg-green-500' :
                          student.grade === 'B' ? 'bg-blue-500' :
                          student.grade === 'C' ? 'bg-yellow-500' :
                          student.grade === 'D' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}>
                          {student.grade}
                        </span>
                      </td>
                      <td className="px-3 py-2 md:px-4 md:py-3">
                        <div className="flex gap-1 md:gap-2 justify-center flex-wrap">
                          <button
                            onClick={() => handleEdit(student)}
                            className="bg-yellow-600 text-white p-1.5 rounded hover:bg-yellow-700 transition"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => generateReport(student)}
                            className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition"
                            title="Report"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student._id || student.id)}
                            className="bg-red-600 text-white p-1.5 rounded hover:bg-red-700 transition"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Students Cards - Mobile/Tablet */}
        <div className="lg:hidden space-y-2 sm:space-y-3">
          {studentsWithPositions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 text-sm">
              {searchQuery || selectedClass !== 'All Classes'
                ? 'No students found matching your filters.'
                : 'No students added yet.'}
            </div>
          ) : (
            studentsWithPositions.map((student) => (
              <div key={student._id || student.id} className="bg-white rounded-lg shadow-lg p-3 sm:p-4">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-indigo-600 text-xs sm:text-sm shrink-0">#{student.position}</span>
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{student.name}</h3>
                    </div>
                    <p className="text-xs text-gray-600 truncate">ID: {student.studentId} | Class: {student.class}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-white font-bold text-xs shrink-0 ${
                    student.grade === 'A' ? 'bg-green-500' :
                    student.grade === 'B' ? 'bg-blue-500' :
                    student.grade === 'C' ? 'bg-yellow-500' :
                    student.grade === 'D' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}>
                    {student.grade}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2 sm:mb-3">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">{student.total}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-xs text-gray-600">Average</p>
                    <p className="font-bold text-gray-800 text-sm sm:text-base">{student.average}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <button
                    onClick={() => handleEdit(student)}
                    className="bg-yellow-600 text-white px-2 py-1.5 sm:py-2 rounded hover:bg-yellow-700 transition flex items-center justify-center gap-1 text-xs sm:text-sm"
                  >
                    <Edit size={12} />
                    <span className="hidden xs:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => generateReport(student)}
                    className="bg-blue-600 text-white px-2 py-1.5 sm:py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-1 text-xs sm:text-sm"
                  >
                    <Download size={12} />
                    <span className="hidden xs:inline">Report</span>
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student._id || student.id)}
                    className="bg-red-600 text-white px-2 py-1.5 sm:py-2 rounded hover:bg-red-700 transition flex items-center justify-center gap-1 text-xs sm:text-sm"
                  >
                    <Trash2 size={12} />
                    <span className="hidden xs:inline">Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Individual Student Report Modal - Fully Responsive */}
        {selectedStudent && !showClassReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto my-4">
              <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="text-center mb-3 sm:mb-4 md:mb-6 border-b-2 border-indigo-600 pb-2 sm:pb-3 md:pb-4">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-600">REPORT CARD</h2>
                  <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">Academic Performance Report</p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Student Name</p>
                    <p className="font-bold text-sm sm:text-base md:text-lg truncate">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Student ID</p>
                    <p className="font-bold text-sm sm:text-base md:text-lg truncate">{selectedStudent.studentId}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Class</p>
                    <p className="font-bold text-sm sm:text-base md:text-lg">{selectedStudent.class}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Position</p>
                    <p className="font-bold text-sm sm:text-base md:text-lg text-indigo-600">#{selectedStudent.position}</p>
                  </div>
                </div>

                <div className="overflow-x-auto mb-3 sm:mb-4 md:mb-6 -mx-3 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-3 sm:px-0">
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="bg-indigo-600 text-white">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 text-left">Subject</th>
                          <th className="px-2 sm:px-4 py-2 text-center">Marks</th>
                          <th className="px-2 sm:px-4 py-2 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects.map((subject, idx) => {
                          const mark = selectedStudent.subjects[subject] || 0;
                          let grade = 'F';
                          if (mark >= 80) grade = 'A';
                          else if (mark >= 70) grade = 'B';
                          else if (mark >= 60) grade = 'C';
                          else if (mark >= 50) grade = 'D';
                          else if (mark >= 40) grade = 'E';

                          return (
                            <tr key={subject} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="px-2 sm:px-4 py-2 font-semibold">{subject}</td>
                              <td className="px-2 sm:px-4 py-2 text-center">{mark}</td>
                              <td className="px-2 sm:px-4 py-2 text-center font-bold">{grade}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-indigo-100 font-bold">
                        <tr>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">TOTAL</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">{selectedStudent.total}</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">{selectedStudent.grade}</td>
                        </tr>
                        <tr>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">AVERAGE</td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center" colSpan="2">{selectedStudent.average}%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="text-center text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 md:mb-6">
                  <p>Generated on {new Date().toLocaleDateString()}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                  <button
                    onClick={() => window.print()}
                    className="w-full sm:flex-1 bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Download size={16} />
                    <span>Print/Download</span>
                  </button>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="w-full sm:flex-1 bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-500 transition font-semibold text-sm sm:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Class Report Modal - Fully Responsive */}
        {showClassReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-3 md:p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto my-4">
              <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="text-center mb-3 sm:mb-4 md:mb-6 border-b-2 border-indigo-600 pb-2 sm:pb-3 md:pb-4">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-600">CLASS REPORT</h2>
                  <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">{selectedClass} - Academic Performance</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">Total Students: {studentsWithPositions.length}</p>
                </div>

                {/* Class Statistics - Fully Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                    <p className="text-xs sm:text-sm text-gray-600">Class Average</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.averageScore}%</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
                    <p className="text-xs sm:text-sm text-gray-600">Top Student</p>
                    <p className="text-sm sm:text-base md:text-lg font-bold text-green-600 truncate">{stats.topStudent?.name || 'N/A'}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
                    <p className="text-xs sm:text-sm text-gray-600">Total Students</p>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-600">{studentsWithPositions.length}</p>
                  </div>
                </div>

                {/* Class Performance Table - Fully Responsive */}
                <div className="overflow-x-auto mb-3 sm:mb-4 md:mb-6 -mx-3 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-3 sm:px-0">
                    <table className="w-full text-xs border-collapse">
                      <thead className="bg-indigo-600 text-white">
                        <tr>
                          <th className="px-1 sm:px-2 md:px-3 py-2 text-left sticky left-0 bg-indigo-600">Pos</th>
                          <th className="px-1 sm:px-2 md:px-3 py-2 text-left sticky left-8 sm:left-12 bg-indigo-600">Name</th>
                          <th className="px-1 sm:px-2 md:px-3 py-2 text-left">ID</th>
                          <th className="px-1 sm:px-2 md:px-3 py-2 text-center">Math</th>
                          <th className="px-1 sm:px-2 md:px-3 py-2 text-center">Eng</th>
                          <th className="px-1 sm:px-2 md:px-3 py-2 text-center">Sci</th>
                          <th className="px-1 sm:px-2 md:px-3 py-2 text-center">SS</th>
                          <th className="px-1 sm:px-2 md:px-3 py-2 text-center">Kis</th>
                          <th className="px-1 sm:px-2 md:px-3 py-2 text-center">Total</th>
                          <th className="px-1 sm:px-2 md:px-3 py-2 text-center">Avg</th>
                          <th className="px-1 sm:px-2 md:px-3 py-2 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsWithPositions.map((student, idx) => (
                          <tr key={student._id || student.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-1 sm:px-2 md:px-3 py-2 font-bold text-indigo-600 sticky left-0 bg-inherit">#{student.position}</td>
                            <td className="px-1 sm:px-2 md:px-3 py-2 font-semibold sticky left-8 sm:left-12 bg-inherit max-w-25 sm:max-w-none truncate">{student.name}</td>
                            <td className="px-1 sm:px-2 md:px-3 py-2 text-gray-600">{student.studentId}</td>
                            <td className="px-1 sm:px-2 md:px-3 py-2 text-center">{student.subjects['Mathematics'] || 0}</td>
                            <td className="px-1 sm:px-2 md:px-3 py-2 text-center">{student.subjects['English'] || 0}</td>
                            <td className="px-1 sm:px-2 md:px-3 py-2 text-center">{student.subjects['Science'] || 0}</td>
                            <td className="px-1 sm:px-2 md:px-3 py-2 text-center">{student.subjects['Social Studies'] || 0}</td>
                            <td className="px-1 sm:px-2 md:px-3 py-2 text-center">{student.subjects['Kiswahili'] || 0}</td>
                            <td className="px-1 sm:px-2 md:px-3 py-2 text-center font-bold">{student.total}</td>
                            <td className="px-1 sm:px-2 md:px-3 py-2 text-center font-bold">{student.average}%</td>
                            <td className="px-1 sm:px-2 md:px-3 py-2 text-center">
                              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-white font-bold ${
                                student.grade === 'A' ? 'bg-green-500' :
                                student.grade === 'B' ? 'bg-blue-500' :
                                student.grade === 'C' ? 'bg-yellow-500' :
                                student.grade === 'D' ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}>
                                {student.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-indigo-100 font-bold">
                        <tr>
                          <td colSpan="9" className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-right text-xs sm:text-sm">Class Average:</td>
                          <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm">{stats.averageScore}%</td>
                          <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 text-center">-</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Subject Analysis - Fully Responsive */}
                <div className="mb-3 sm:mb-4 md:mb-6">
                  <h3 className="font-bold text-sm sm:text-base md:text-lg mb-2 sm:mb-3 text-gray-800">Subject Performance</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {subjects.map(subject => {
                      const subjectAvg = studentsWithPositions.length > 0
                        ? (studentsWithPositions.reduce((sum, s) => sum + (parseFloat(s.subjects[subject]) || 0), 0) / studentsWithPositions.length).toFixed(2)
                        : 0;
                      return (
                        <div key={subject} className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1 truncate" title={subject}>{subject}</p>
                          <p className="text-base sm:text-lg font-bold text-gray-800">{subjectAvg}%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Grade Distribution - Fully Responsive */}
                <div className="mb-3 sm:mb-4 md:mb-6">
                  <h3 className="font-bold text-sm sm:text-base md:text-lg mb-2 sm:mb-3 text-gray-800">Grade Distribution</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {['A', 'B', 'C', 'D', 'E', 'F'].map(grade => {
                      const count = studentsWithPositions.filter(s => s.grade === grade).length;
                      const percentage = studentsWithPositions.length > 0
                        ? ((count / studentsWithPositions.length) * 100).toFixed(0)
                        : 0;
                      return (
                        <div key={grade} className={`rounded-lg p-2 sm:p-3 border ${
                          grade === 'A' ? 'bg-green-50 border-green-300' :
                          grade === 'B' ? 'bg-blue-50 border-blue-300' :
                          grade === 'C' ? 'bg-yellow-50 border-yellow-300' :
                          grade === 'D' ? 'bg-orange-50 border-orange-300' :
                          'bg-red-50 border-red-300'
                        }`}>
                          <p className="text-xs text-gray-600">Grade {grade}</p>
                          <p className="text-sm sm:text-base md:text-lg font-bold">{count}</p>
                          <p className="text-xs text-gray-500">({percentage}%)</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-center text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 md:mb-6">
                  <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                  <button
                    onClick={() => window.print()}
                    className="w-full sm:flex-1 bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Download size={16} />
                    <span>Print/Download</span>
                  </button>
                  <button
                    onClick={() => setShowClassReport(false)}
                    className="w-full sm:flex-1 bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-500 transition font-semibold text-sm sm:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}