import { createContext, useContext, useReducer, ReactNode, useCallback } from "react";

// Define types with proper interfaces
export interface Newsletter {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  sentAt?: Date;
  stats?: {
    delivered: number;
    opened: number;
    clicked: number;
  };
}

export interface NewsletterCreateInput {
  title: string;
  content: string;
  published?: boolean;
}

export interface NewsletterUpdateInput {
  title?: string;
  content?: string;
  published?: boolean;
}

// Use discriminated unions for state pattern
type NewsletterState = {
  newsletters: Newsletter[];
  currentNewsletter: Newsletter | null;
  status: "idle" | "loading" | "error" | "success";
  error: string | null;
};

// Use discriminated unions for actions
type NewsletterAction =
  | { type: "FETCH_NEWSLETTERS_START" }
  | { type: "FETCH_NEWSLETTERS_SUCCESS"; payload: Newsletter[] }
  | { type: "FETCH_NEWSLETTERS_ERROR"; payload: string }
  | { type: "SET_CURRENT_NEWSLETTER"; payload: Newsletter }
  | { type: "CREATE_NEWSLETTER_START" }
  | { type: "CREATE_NEWSLETTER_SUCCESS"; payload: Newsletter }
  | { type: "CREATE_NEWSLETTER_ERROR"; payload: string }
  | { type: "UPDATE_NEWSLETTER_START" }
  | { type: "UPDATE_NEWSLETTER_SUCCESS"; payload: Newsletter }
  | { type: "UPDATE_NEWSLETTER_ERROR"; payload: string }
  | { type: "DELETE_NEWSLETTER_START" }
  | { type: "DELETE_NEWSLETTER_SUCCESS"; payload: string }
  | { type: "DELETE_NEWSLETTER_ERROR"; payload: string };

// Create properly typed context
interface NewsletterContextType {
  state: NewsletterState;
  dispatch: React.Dispatch<NewsletterAction>;
  fetchNewsletters: () => Promise<void>;
  getNewsletter: (id: string) => Promise<void>;
  createNewsletter: (data: NewsletterCreateInput) => Promise<void>;
  updateNewsletter: (id: string, data: NewsletterUpdateInput) => Promise<void>;
  deleteNewsletter: (id: string) => Promise<void>;
}

const NewsletterContext = createContext<NewsletterContextType | undefined>(undefined);

// Initial state
const initialState: NewsletterState = {
  newsletters: [],
  currentNewsletter: null,
  status: "idle",
  error: null,
};

// Reducer function
function newsletterReducer(state: NewsletterState, action: NewsletterAction): NewsletterState {
  switch (action.type) {
    case "FETCH_NEWSLETTERS_START":
      return {
        ...state,
        status: "loading",
        error: null,
      };
    case "FETCH_NEWSLETTERS_SUCCESS":
      return {
        ...state,
        newsletters: action.payload,
        status: "success",
        error: null,
      };
    case "FETCH_NEWSLETTERS_ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload,
      };
    case "SET_CURRENT_NEWSLETTER":
      return {
        ...state,
        currentNewsletter: action.payload,
      };
    case "CREATE_NEWSLETTER_START":
      return {
        ...state,
        status: "loading",
        error: null,
      };
    case "CREATE_NEWSLETTER_SUCCESS":
      return {
        ...state,
        newsletters: [...state.newsletters, action.payload],
        currentNewsletter: action.payload,
        status: "success",
        error: null,
      };
    case "CREATE_NEWSLETTER_ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload,
      };
    case "UPDATE_NEWSLETTER_START":
      return {
        ...state,
        status: "loading",
        error: null,
      };
    case "UPDATE_NEWSLETTER_SUCCESS":
      return {
        ...state,
        newsletters: state.newsletters.map((newsletter: any) =>
          newsletter.id === action.payload.id ? action.payload : newsletter
        ),
        currentNewsletter: action.payload,
        status: "success",
        error: null,
      };
    case "UPDATE_NEWSLETTER_ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload,
      };
    case "DELETE_NEWSLETTER_START":
      return {
        ...state,
        status: "loading",
        error: null,
      };
    case "DELETE_NEWSLETTER_SUCCESS":
      return {
        ...state,
        newsletters: state.newsletters.filter(
          (newsletter: any) => newsletter.id !== action.payload
        ),
        currentNewsletter:
          state.currentNewsletter?.id === action.payload ? null : state.currentNewsletter,
        status: "success",
        error: null,
      };
    case "DELETE_NEWSLETTER_ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload,
      };
    default:
      return state;
  }
}

// Provider component with proper TypeScript types
export function NewsletterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(newsletterReducer, initialState);

  // Extract API calls into reusable functions with useCallback
  const fetchNewsletters = useCallback(async () => {
    dispatch({ type: "FETCH_NEWSLETTERS_START" });
    try {
      const response = await fetch("/api/newsletters");
      if (!response.ok) throw new Error("Failed to fetch newsletters");
      const data = await response.json();
      dispatch({ type: "FETCH_NEWSLETTERS_SUCCESS", payload: data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      dispatch({ type: "FETCH_NEWSLETTERS_ERROR", payload: errorMessage });
    }
  }, []);

  const getNewsletter = useCallback(async (id: string) => {
    dispatch({ type: "FETCH_NEWSLETTERS_START" });
    try {
      const response = await fetch(`/api/newsletters/${id}`);
      if (!response.ok) throw new Error("Failed to fetch newsletter");
      const data = await response.json();
      dispatch({ type: "SET_CURRENT_NEWSLETTER", payload: data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      dispatch({ type: "FETCH_NEWSLETTERS_ERROR", payload: errorMessage });
    }
  }, []);

  const createNewsletter = useCallback(async (data: NewsletterCreateInput) => {
    dispatch({ type: "CREATE_NEWSLETTER_START" });
    try {
      const response = await fetch("/api/newsletters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create newsletter");
      const newNewsletter = await response.json();
      dispatch({ type: "CREATE_NEWSLETTER_SUCCESS", payload: newNewsletter });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      dispatch({ type: "CREATE_NEWSLETTER_ERROR", payload: errorMessage });
    }
  }, []);

  const updateNewsletter = useCallback(async (id: string, data: NewsletterUpdateInput) => {
    dispatch({ type: "UPDATE_NEWSLETTER_START" });
    try {
      const response = await fetch(`/api/newsletters/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update newsletter");
      const updatedNewsletter = await response.json();
      dispatch({
        type: "UPDATE_NEWSLETTER_SUCCESS",
        payload: updatedNewsletter,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      dispatch({ type: "UPDATE_NEWSLETTER_ERROR", payload: errorMessage });
    }
  }, []);

  const deleteNewsletter = useCallback(async (id: string) => {
    dispatch({ type: "DELETE_NEWSLETTER_START" });
    try {
      const response = await fetch(`/api/newsletters/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete newsletter");
      dispatch({ type: "DELETE_NEWSLETTER_SUCCESS", payload: id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      dispatch({ type: "DELETE_NEWSLETTER_ERROR", payload: errorMessage });
    }
  }, []);

  const value = {
    state,
    dispatch,
    fetchNewsletters,
    getNewsletter,
    createNewsletter,
    updateNewsletter,
    deleteNewsletter,
  };

  return <NewsletterContext.Provider value={value}>{children}</NewsletterContext.Provider>;
}

// Custom hook with proper error checking
export function useNewsletter() {
  const context = useContext(NewsletterContext);
  if (context === undefined) {
    throw new Error("useNewsletter must be used within a NewsletterProvider");
  }
  return context;
}
