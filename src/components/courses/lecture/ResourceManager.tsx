
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';

export interface Resource {
  id: string;
  name: string;
  fileUrl: string;
  type: 'pdf' | 'assignment' | 'other';
}

interface ResourceManagerProps {
  resources: Resource[];
  onChange: (resources: Resource[]) => void;
}

const ResourceManager: React.FC<ResourceManagerProps> = ({ resources, onChange }) => {
  const { toast } = useToast();
  const [resourceName, setResourceName] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceType, setResourceType] = useState<'pdf' | 'assignment' | 'other'>('pdf');
  
  const addResource = () => {
    if (!resourceName || !resourceUrl) {
      toast({
        title: "Missing information",
        description: "Please provide both name and URL for the resource",
        variant: "destructive",
      });
      return;
    }

    const newResource: Resource = {
      id: Math.random().toString(36).substring(2, 9),
      name: resourceName,
      fileUrl: resourceUrl,
      type: resourceType,
    };

    const updatedResources = [...resources, newResource];
    onChange(updatedResources);
    setResourceName('');
    setResourceUrl('');
  };

  const removeResource = (id: string) => {
    const updatedResources = resources.filter(resource => resource.id !== id);
    onChange(updatedResources);
  };

  return (
    <div className="border rounded-md p-4 space-y-4">
      <h3 className="font-medium">Lecture Resources</h3>
      
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Resource name"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
            />
          </div>
          <div>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as 'pdf' | 'assignment' | 'other')}
            >
              <option value="pdf">PDF</option>
              <option value="assignment">Assignment</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Input
              placeholder="Resource URL"
              value={resourceUrl}
              onChange={(e) => setResourceUrl(e.target.value)}
            />
          </div>
        </div>
        <Button type="button" variant="outline" onClick={addResource}>
          Add Resource
        </Button>
      </div>
      
      {resources.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-2">Added Resources:</h4>
          <ul className="space-y-2">
            {resources.map((resource) => (
              <li 
                key={resource.id} 
                className="flex items-center justify-between bg-muted p-2 rounded-md"
              >
                <div>
                  <span className="font-medium">{resource.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({resource.type})
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeResource(resource.id)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResourceManager;
