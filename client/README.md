# Jugan client

See the [repository README](../README.md) for installation, local ports, and development commands.

## Structure

- `src/features/home/` contains the public landing page.
- `src/features/requests/` contains document selection and the request form.
- `src/features/tracking/` contains public status tracking.
- `src/features/admin/` contains staff sign-in, dashboard, and request review.
- `src/shared/` contains the API client, live update subscription, status displays, and reusable loading components.
- `src/styles/` contains base and feature styles. `loading.css` defines the shared skeleton and button spinner styles.

## Loading and feedback

Pages that fetch data show skeletons matching their final layout on the initial load: document cards, form fields, tracking details, dashboard metrics and rows, and staff request details. Each loading region announces its purpose to assistive technology. Errors replace the initial skeleton with a message; an empty document list has its own empty state.

Buttons for sign-in, request submission, and staff saves show a spinner and progress text while the action runs. The dashboard and tracker keep already loaded content visible during live updates. Skeleton and spinner animations honor the browser's reduced-motion setting.

Use `Skeleton` and `ButtonSpinner` from `src/shared/Loading.tsx` for new loading states. Keep loading, empty, and error states distinct so a failed request cannot look like a page that is still loading.
