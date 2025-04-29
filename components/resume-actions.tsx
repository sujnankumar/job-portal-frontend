import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

const ResumeActions = ({ base64File, filename = "resume.pdf" }) => {
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    if (!base64File) return;

    // Convert base64 to blob
    const byteCharacters = atob(base64File);
    const byteNumbers = Array.from(byteCharacters).map((char) =>
      char.charCodeAt(0)
    );
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });

    // Create object URL
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);

    return () => URL.revokeObjectURL(url); // Clean up on unmount
  }, [base64File]);

  if (!pdfUrl) return null;

  return (
    <div className="mt-4 flex gap-3">
      <a href={pdfUrl} download={filename}>
        <Button variant="outline" size="sm" className="text-gray-700">
          <Download className="h-4 w-4 mr-2" />
          Download Resume
        </Button>
      </a>

      <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm" className="text-gray-700">
          <ExternalLink className="h-4 w-4 mr-2" />
          View Resume
        </Button>
      </a>
    </div>
  );
};

export default ResumeActions;