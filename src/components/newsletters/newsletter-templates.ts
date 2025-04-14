import { NewsletterTemplate } from "@/lib/types";

// Define templates
export const newsletterTemplates: Record<string, NewsletterTemplate> = {
  blank: {
    name: "Blank Template",
    elements: [],
  },
  basic: {
    name: "Basic Newsletter",
    elements: [
      {
        id: "header-1",
        type: "heading",
        content: "Your Newsletter Title",
        style: { fontSize: "24px", textAlign: "center", padding: "20px 0" },
      },
      {
        id: "text-1",
        type: "text",
        content:
          "Welcome to our newsletter! We're excited to share the latest updates with you.",
        style: { padding: "10px 20px", lineHeight: "1.6" },
      },
      {
        id: "image-1",
        type: "image",
        src: "https://placehold.co/600x300/e6e6e6/999999?text=Newsletter+Image",
        style: { width: "100%", maxWidth: "600px", margin: "20px auto" },
      },
      {
        id: "text-2",
        type: "text",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas varius tortor nibh, sit amet tempor nibh finibus et.",
        style: { padding: "10px 20px", lineHeight: "1.6" },
      },
      {
        id: "button-1",
        type: "button",
        content: "Read More",
        url: "#",
        style: {
          backgroundColor: "#3b82f6",
          color: "white",
          padding: "10px 20px",
          borderRadius: "4px",
          textAlign: "center",
          margin: "20px auto",
          display: "block",
          width: "fit-content",
        },
      },
    ],
  },
  announcement: {
    name: "Announcement Template",
    elements: [
      {
        id: "header-1",
        type: "heading",
        content: "Exciting Announcement!",
        style: {
          fontSize: "28px",
          textAlign: "center",
          padding: "20px 0",
          color: "#1e40af",
        },
      },
      {
        id: "image-1",
        type: "image",
        src: "https://placehold.co/600x400/e6e6e6/999999?text=Announcement+Image",
        style: { width: "100%", maxWidth: "600px", margin: "20px auto" },
      },
      {
        id: "text-1",
        type: "text",
        content:
          "We're thrilled to announce our newest feature that will transform how you work.",
        style: {
          padding: "15px 20px",
          lineHeight: "1.6",
          fontSize: "18px",
          textAlign: "center",
          fontWeight: "bold",
        },
      },
      {
        id: "text-2",
        type: "text",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas varius tortor nibh, sit amet tempor nibh finibus et. Aenean eu enim justo. Vestibulum aliquam hendrerit molestie.",
        style: { padding: "10px 20px", lineHeight: "1.6" },
      },
      {
        id: "button-1",
        type: "button",
        content: "Learn More",
        url: "#",
        style: {
          backgroundColor: "#1e40af",
          color: "white",
          padding: "12px 30px",
          borderRadius: "4px",
          textAlign: "center",
          margin: "30px auto",
          display: "block",
          width: "fit-content",
          fontWeight: "bold",
        },
      },
    ],
  },
  digest: {
    name: "Weekly Digest",
    elements: [
      {
        id: "header-1",
        type: "heading",
        content: "Your Weekly Digest",
        style: { fontSize: "24px", textAlign: "center", padding: "20px 0" },
      },
      {
        id: "text-1",
        type: "text",
        content: "Here's what happened this week that you should know about.",
        style: { padding: "10px 20px", lineHeight: "1.6", textAlign: "center" },
      },
      {
        id: "columns-1",
        type: "columns",
        columns: [
          [
            {
              id: "heading-col1",
              type: "heading",
              content: "First Update",
              style: { fontSize: "18px", padding: "10px 0" },
            },
            {
              id: "text-col1",
              type: "text",
              content: "Brief description of the first update or news item.",
              style: { lineHeight: "1.5" },
            },
          ],
          [
            {
              id: "heading-col2",
              type: "heading",
              content: "Second Update",
              style: { fontSize: "18px", padding: "10px 0" },
            },
            {
              id: "text-col2",
              type: "text",
              content: "Brief description of the second update or news item.",
              style: { lineHeight: "1.5" },
            },
          ],
        ],
        style: { display: "flex", gap: "20px", padding: "20px" },
      },
      {
        id: "image-1",
        type: "image",
        src: "https://placehold.co/600x200/e6e6e6/999999?text=Feature+Image",
        style: { width: "100%", maxWidth: "600px", margin: "20px auto" },
      },
      {
        id: "text-2",
        type: "text",
        content:
          "More details about what's been happening and what's coming up next.",
        style: { padding: "10px 20px", lineHeight: "1.6" },
      },
      {
        id: "button-1",
        type: "button",
        content: "Read Full Digest",
        url: "#",
        style: {
          backgroundColor: "#059669",
          color: "white",
          padding: "10px 20px",
          borderRadius: "4px",
          textAlign: "center",
          margin: "20px auto",
          display: "block",
          width: "fit-content",
        },
      },
    ],
  },
};

// Define personalization field options
export const personalizationOptions = [
  { id: "firstName", label: "First Name", defaultValue: "[First Name]" },
  { id: "lastName", label: "Last Name", defaultValue: "[Last Name]" },
  { id: "email", label: "Email Address", defaultValue: "[Email]" },
  { id: "company", label: "Company", defaultValue: "[Company]" },
  { id: "signupDate", label: "Signup Date", defaultValue: "[Signup Date]" },
];
