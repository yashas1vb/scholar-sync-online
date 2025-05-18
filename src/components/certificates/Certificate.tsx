
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface CertificateProps {
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: string;
}

const Certificate: React.FC<CertificateProps> = ({
  studentName,
  courseName,
  instructorName,
  completionDate
}) => {
  const handleDownload = () => {
    // In a real implementation, this would generate a PDF certificate
    console.log('Downloading certificate');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-end mb-4">
        <Button onClick={handleDownload}>
          <Download size={16} className="mr-2" />
          Download Certificate
        </Button>
      </div>

      <div className="border-8 border-double border-lms-indigo/30 p-8 bg-white shadow-lg">
        <div className="text-center border-2 border-gray-200 p-8">
          <div className="mb-6">
            <img 
              src="https://api.dicebear.com/7.x/shapes/svg?seed=ScholarSync" 
              alt="Certificate Logo" 
              className="h-16 mx-auto"
            />
          </div>
          
          <h1 className="text-3xl font-serif mb-2">Certificate of Completion</h1>
          <p className="text-gray-600 mb-8">This certifies that</p>
          
          <h2 className="text-2xl font-bold text-lms-indigo mb-2 font-serif">
            {studentName}
          </h2>
          
          <p className="text-gray-600 mb-6">has successfully completed the course</p>
          
          <h3 className="text-xl font-bold mb-8 font-serif">
            {courseName}
          </h3>
          
          <div className="flex justify-around mb-12">
            <div className="text-center">
              <div className="h-px w-40 bg-gray-400 mb-2"></div>
              <p className="text-sm">Date: {completionDate}</p>
            </div>
            
            <div className="text-center">
              <div className="h-px w-40 bg-gray-400 mb-2"></div>
              <p className="text-sm">Instructor: {instructorName}</p>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Certificate ID: CERT-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            <p>Verify at scholarsync.com/verify</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
