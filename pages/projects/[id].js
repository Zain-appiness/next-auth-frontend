import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import axios from 'axios';

export default function ProjectReport() {
  const router = useRouter();
  const { id, userId, projectName } = router.query; // Extracting userId and projectId from the URL query
  const [report, setReport] = useState({
    startTime: '',
    endTime: '',
    taskDetails: '',
    date: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // To handle loading state
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReport((prev) => ({ ...prev, [name]: value }));
  };

  // Form validation
  const validateForm = () => {
    const { startTime, endTime, taskDetails, date } = report;
    if (!startTime || !endTime || !taskDetails || !date) {
      setError('All fields are required');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (!userId || !id) {
        setError('Missing required parameters');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setError('You are not authenticated');
        setLoading(false);
        return;
      }

      await axios.post(
        `${BACKEND_URL}/api/daily/update/${userId}`,
        {
          projectId: id, // Passing the projectId from the URL
          ...report, // Spread the form data
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.push(`/profile/?userId=${userId}`);
    } catch (err) {
      console.error('Error submitting the report:', err);
      setError('Failed to submit the report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-300">
      {/* Background Image */}
      <img
        src="https://media.licdn.com/dms/image/v2/C4D0BAQGpHXmffW4TWw/company-logo_200_200/company-logo_200_200/0/1656923939573/appiness_interactive_pvt_ltd__logo?e=2147483647&v=beta&t=TdpEPbqJKzj1DLuF75aPDmButAOmUAIla1F-lvS1R_8"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 bg-opacity-90 p-6 rounded shadow-lg">
        <Card className="w-full max-w-md p-6">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center mb-4">
              Project Report: {projectName || `Project ID: ${id}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date Field */}
              <div>
                <label htmlFor="date" className="block mb-2 text-sm font-medium">
                  Pick a Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={report.date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring focus:ring-cyan-300"
                  required
                />
              </div>

              {/* Start Time Field */}
              <div>
                <label
                  htmlFor="startTime"
                  className="block mb-2 text-sm font-medium"
                >
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={report.startTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring focus:ring-cyan-300"
                  required
                />
              </div>

              {/* End Time Field */}
              <div>
                <label
                  htmlFor="endTime"
                  className="block mb-2 text-sm font-medium"
                >
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={report.endTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring focus:ring-cyan-300"
                  required
                />
              </div>

              {/* Task Details Field */}
              <div>
                <label
                  htmlFor="taskDetails"
                  className="block mb-2 text-sm font-medium"
                >
                  Task Details
                </label>
                <textarea
                  id="taskDetails"
                  name="taskDetails"
                  value={report.taskDetails}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring focus:ring-cyan-300"
                  rows="4"
                  placeholder="Describe the tasks you worked on..."
                  required
                ></textarea>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-cyan-400 text-white hover:bg-white hover:text-black"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
