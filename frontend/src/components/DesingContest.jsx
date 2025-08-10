import { useState } from 'react';
import axiosClient2 from '../utils/axiosClient2';

const DesignContest = () => {
  const [formData, setFormData] = useState({
    start: '',
    end: '',
    contestDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient2.post('/problem/DesignContest', formData);
      alert('Contest saved successfully!');
      setFormData({
        start: '',
        end: '',
        contestDate: ''
      });
    } catch (error) {
      console.error('Error saving contest:', error);
      alert('Failed to save contest');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 mt-40">
      <h2 className="text-xl font-bold mb-4 text-center">CREATE DESIGN CONTEST</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Start Time:</label>
          <input
            type="text"
            name="start"
            value={formData.start}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="e.g. 10:00 AM"
            required
          />
        </div>

        <div>
          <label className="block mb-1">End Time:</label>
          <input
            type="text"
            name="end"
            value={formData.end}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="e.g. 12:00 PM"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Contest Date:</label>
          <input
            type="text"
            name="contestDate"
            value={formData.contestDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="e.g. July 20, 2023"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Submit Contest
        </button>
      </form>
    </div>
  );
};

export default DesignContest;