import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Onboarding } from "./components/Onboarding";
import { Dashboard } from "./components/Dashboard";
import { QuickCapture } from "./components/QuickCapture";
import { FocusMode } from "./components/FocusMode";
import { AIChat } from "./components/AIChat";
import { Progress } from "./components/Progress";
import { Routines } from "./components/Routines";
import { Goals } from "./components/Goals";
import { CalendarView } from "./components/CalendarView";
import { MindDump } from "./components/MindDump";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true,           Component: Onboarding   },
      { path: "dashboard",     Component: Dashboard    },
      { path: "capture",       Component: QuickCapture },
      { path: "routines",      Component: Routines     },
      { path: "goals",         Component: Goals        },
      { path: "calendar",      Component: CalendarView },
      { path: "minddump",      Component: MindDump     },
      { path: "focus/:taskId", Component: FocusMode    },
      { path: "chat",          Component: AIChat       },
      { path: "progress",      Component: Progress     },
      { path: "*",             Component: NotFound     },
    ],
  },
]);
