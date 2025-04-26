"use client";

import { useEffect, useState } from "react";
import { EmbeddableForm } from "@/components/subscribers/EmbeddableForm";
import { useParams } from "next/navigation";

export default function EmbedFormPage() {
  const params = useParams();
  const formKey = params.formKey as string;
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    // Set the API URL based on the current origin
    setApiUrl(window.location.origin);

    // Increment the form view count
    fetch(`${window.location.origin}/api/public/forms/${formKey}/view`, {
      method: "POST",
    }).catch((error) => {
      console.error("Error recording form view:", error);
    });
  }, [formKey]);

  return (
    <div className="p-6 flex justify-center items-center min-h-screen">
      {apiUrl && (
        <EmbeddableForm
          apiUrl={apiUrl}
          formKey={formKey}
          onSuccess={(data) => {
            console.log("Form submitted successfully:", data);
            if (data.redirectUrl) {
              window.location.href = data.redirectUrl;
            }
          }}
          onError={(error) => {
            console.error("Form submission error:", error);
          }}
        />
      )}
    </div>
  );
}
