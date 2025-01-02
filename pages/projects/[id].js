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
import { format } from 'date-fns'; 
import { Calendar } from '../../components/ui/calendar'; 
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';

export default function ProjectReport() {
  const router = useRouter();
  const { id, userId, projectName } = router.query; 
  const [report, setReport] = useState({
    date: null,
    startTime: '',
    endTime: '',
    taskDetails: '',
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
          date: report.date ? format(report.date, 'yyyy-MM-dd') : null, 
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[500px] p-4">
        <CardHeader>
          <CardTitle className="text-xl">Project Report for {projectName || id}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {report.date
                      ? format(report.date, 'yyyy-MM-dd')
                      : 'Select a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={report.date}
                    onSelect={(selectedDate) =>
                      setReport((prev) => ({ ...prev, date: selectedDate }))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
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
