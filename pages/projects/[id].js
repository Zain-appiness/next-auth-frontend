import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import axios from 'axios';

export default function ProjectReport() {
  const router = useRouter();
  const { id, userId, projectName } = router.query;
  const [report, setReport] = useState({
    startTime: '',
    endTime: '',
    taskDetails: '',
    date: '',
  });
  const [error, setError] = useState(null);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReport((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!userId || !id) {
        setError('Missing required parameters');
        return;
      }

      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setError('You are not authenticated');
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/daily/update/${userId}`,
        {
          projectId: id,
          ...report,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Report submitted:', response.data);
      router.push(`/profile/?userId=${userId}`);
    } catch (err) {
      console.error('Error submitting the report:', err);
      setError('Failed to submit the report');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-300 p-4">
      <Card className="w-full max-w-md p-4 bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-xl mb-4 text-center">
            Project Report for {projectName || id}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-1">
                Pick a Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={report.date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium mb-1">
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={report.startTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium mb-1">
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={report.endTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label htmlFor="taskDetails" className="block text-sm font-medium mb-1">
                Task Details
              </label>
              <textarea
                id="taskDetails"
                name="taskDetails"
                value={report.taskDetails}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows="4"
              ></textarea>
            </div>
            <Button
              type="submit"
              className="w-full bg-cyan-400 text-white hover:bg-cyan-500 hover:shadow-md"
            >
              Submit Report
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
