# Migration Context: Local-First Architecture

This document outlines the core architectural principle of this Sales Recording System, which must be preserved during the migration to Next.js.

## The "Local-First" Principle

The application is designed to be **offline-capable** and highly responsive. This is achieved by treating the client-side database (IndexedDB) as the primary source of truth for the user interface.

### How it Works:

1.  **UI Reads/Writes from IndexedDB:** All user actions (adding a sale, creating a product, updating settings) are immediately written to the browser's IndexedDB. The UI is then updated based on the data in IndexedDB. This makes the application feel instantaneous, as there is no network latency.

2.  **No Direct API Calls from UI:** The user interface components **do not** directly call the server API to create, read, update, or delete data for normal operations. They only interact with the `useIndexedDB` hook.

3.  **Asynchronous Background Sync:** A separate process, managed by the `useSync` hook, handles data synchronization with the remote server. 
    - It periodically checks IndexedDB for records that have not yet been synced to the cloud.
    - It batches these records and sends them to the `/api/sync` endpoint.
    - Upon successful synchronization, it updates the local records in IndexedDB to mark them as `synced`.

### Migration Implications for Next.js:

*   **Client Components are Mandatory:** Because IndexedDB is a browser-only API, any component or hook that interacts with it **must** be a Client Component, marked with the `'use client'` directive.

*   **Handling Hydration:** Data from IndexedDB can only be accessed after the component has mounted on the client. To avoid Next.js hydration errors, components should initially render a loading state and then fetch data from IndexedDB within a `useEffect` hook. Do not attempt to fetch from IndexedDB during server-rendering.

*   **API Routes for Syncing:** The server's role is primarily to receive data batches from clients and persist them to the main database (MongoDB). The Next.js Route Handler at `app/api/sync/route.ts` will fulfill this role.