
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Award } from 'lucide-react';
import { Course } from '@/context/CourseContext';
import Certificate from './Certificate';

interface CertificateGeneratorProps {
  course: Course;
  studentName: string;
  completionDate: string;
}

const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  course,
  studentName,
  completionDate
}) => {
  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificate - ${course.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .certificate { max-width: 800px; margin: 0 auto; border: 8px double #4F46E5; padding: 40px; text-align: center; }
            .title { font-size: 32px; font-weight: bold; margin: 20px 0; }
            .subtitle { color: #666; margin: 10px 0; }
            .student-name { font-size: 24px; font-weight: bold; color: #4F46E5; margin: 20px 0; }
            .course-name { font-size: 20px; font-weight: bold; margin: 20px 0; }
            .signatures { display: flex; justify-content: space-around; margin-top: 40px; }
            .signature { border-top: 1px solid #666; padding-top: 10px; width: 200px; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <h1 class="title">Certificate of Completion</h1>
            <p class="subtitle">This certifies that</p>
            <h2 class="student-name">${studentName}</h2>
            <p class="subtitle">has successfully completed the course</p>
            <h3 class="course-name">${course.title}</h3>
            <div class="signatures">
              <div class="signature">
                <p>Date: ${completionDate}</p>
              </div>
              <div class="signature">
                <p>Instructor: ${course.instructorName}</p>
              </div>
            </div>
            <p style="margin-top: 40px; font-size: 12px; color: #666;">
              Certificate ID: CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}
            </p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-center mb-4">
        <Award className="h-8 w-8 text-lms-indigo mr-2" />
        <h3 className="text-xl font-bold">Congratulations!</h3>
      </div>
      
      <p className="text-center text-gray-600 mb-6">
        You have successfully completed <strong>{course.title}</strong>. 
        Your certificate is ready for download.
      </p>
      
      <div className="mb-6">
        <Certificate
          studentName={studentName}
          courseName={course.title}
          instructorName={course.instructorName}
          completionDate={completionDate}
        />
      </div>
      
      <div className="text-center">
        <Button onClick={handleDownload} size="lg">
          <Download size={20} className="mr-2" />
          Download Certificate
        </Button>
      </div>
    </div>
  );
};

export default CertificateGenerator;
