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
  const { id, userId } = router.query;  // Extracting userId and projectId from the URL query
  const [report, setReport] = useState({
    startTime: '',
    endTime: '',
    taskDetails: '',
  });
  const [error, setError] = useState(null); // To handle errors
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReport((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Check if userId and projectId are present
      if (!userId || !id) {
        setError('Missing required parameters');
        return;
      }

      // Assuming you already have a token stored in localStorage
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setError('You are not authenticated');
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/daily/update/${userId}`,
        {
          projectId: id, // Pass the projectId from the URL
          ...report,      // Spread the form data
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Report submitted:', response.data);
      // Optionally, redirect to another page or show success
      router.push(`/profile/?userId=${userId}`); // Redirect back to the project page
    } catch (err) {
      console.error('Error submitting the report:', err);
      setError('Failed to submit the report');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[500px] p-4">
        <CardHeader>
          <CardTitle className="text-xl">Project Report for {id}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={report.startTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">End Time</label>
              <input
                type="time"
                name="endTime"
                value={report.endTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Task Details</label>
              <textarea
                name="taskDetails"
                value={report.taskDetails}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              ></textarea>
            </div>
            <Button type="submit" className="w-full bg-blue-500 text-white">
              Submit Report
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
