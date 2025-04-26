# Letterflow Landing Page Project Context

This document provides an overview of the Letterflow landing page project, outlining its main functionalities, key files, and implementation details.

## 1. Landing Page

The landing page (`src/app/page.tsx`) serves as the main entry point for the application. It is composed of the following sections:

- **Navbar:** Provides navigation links.
- **Hero:** Presents the main message and call to action.
- **SocialProof:** Displays social proof elements like testimonials or statistics.
- **EmailBuilder:** Showcases the email builder feature.
- **Analytics:** Highlights the analytics capabilities.
- **Integrations:** Lists available integrations.
- **Blog:** Features blog posts.
- **Cta:** Includes a call to action section.
- **Footer:** Contains copyright information and other links.

## 2. Dashboard

The dashboard (`src/app/dashboard/page.tsx`) provides an overview of key metrics and functionalities. It displays analytics data such as:

- **Total Subscribers:** The total number of active subscribers.
- **Average Open Rate:** The average open rate of newsletters.
- **Average Click Rate:** The average click rate of newsletters.
- **Top Performing Campaigns:** A list of the best-performing campaigns.
- **Subscriber Growth Data:** A chart showing subscriber growth over time.

## 3. Campaign Management

The campaign management page (`src/app/dashboard/campaigns/page.tsx`) allows users to create, manage, search, and filter campaigns. Key functionalities include:

- **Creating Campaigns:** Users can create new email campaigns with various settings and content.
- **Managing Campaigns:** Users can edit, schedule, and archive existing campaigns.
- **Searching Campaigns:** Users can search for campaigns by name or keywords.
- **Filtering Campaigns:** Users can filter campaigns by status (draft, scheduled, sent, archived).

## 4. Subscriber Management

The subscriber management page (`src/app/dashboard/subscribers/page.tsx`) enables users to add, import, export, and manage subscribers, as well as create and manage segments. Key functionalities include:

- **Adding Subscribers:** Users can manually add new subscribers with their information.
- **Importing Subscribers:** Users can import subscribers from a CSV file.
- **Exporting Subscribers:** Users can export subscriber data to a CSV file.
- **Managing Subscribers:** Users can edit subscriber information and unsubscribe them.
- **Creating Segments:** Users can create segments based on subscriber attributes and behavior.
- **Managing Segments:** Users can edit and delete existing segments.

## 5. Newsletter Creation

The newsletter creation page (`src/app/newsletter/create/page.tsx`) provides a drag-and-drop interface for creating newsletters. Key functionalities include:

- **Adding Elements:** Users can add various elements to the newsletter, such as headings, text, images, buttons, dividers, spacers, social links, and custom HTML code.
- **Editing Elements:** Users can edit the content and style of each element.
- **Reordering Elements:** Users can reorder elements using drag and drop.
- **Previewing Newsletters:** Users can preview the newsletter in different device views (desktop, tablet, mobile).
- **Saving Newsletters:** Users can save the newsletter as a draft or publish it.

## 6. Authentication

The application includes authentication functionality, allowing users to register, log in, and reset their passwords. Key files include:

- `src/app/(auth)/register/page.tsx`: Registration page.
- `src/app/(auth)/login/page.tsx`: Login page.
- `src/app/(auth)/forgot-password/page.tsx`: Forgot password page.
- `src/app/api/auth/[...nextauth]/`: NextAuth.js configuration.

## 7. API Endpoints

The application provides various API endpoints for managing data and functionalities. Some key endpoints include:

- `/api/campaigns`: For managing campaigns.
- `/api/subscribers`: For managing subscribers.
- `/api/newsletters`: For managing newsletters.
- `/api/analytics`: For retrieving analytics data.

This document provides a general overview of the Letterflow landing page project. For more detailed information, please refer to the source code and other documentation.
