"use client"

// Inspired by react-hot-toast library
import * as React from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

type ToasterToast = ToastProps & {
  id: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 3000 // 3 seconds for real UX

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  // Real toast: dispatches to state, not just alert
  const toast = React.useCallback(
    ({
      title,
      description,
      variant = "default",
    }: ToastProps) => {
      const id = genId()
      const newToast: ToasterToast = {
        id,
        title,
        description,
        variant,
        open: true,
        onOpenChange: (open) => {
          if (!open) dispatch({ type: "DISMISS_TOAST", toastId: id })
        },
      }
      dispatch({ type: "ADD_TOAST", toast: newToast })
      return id
    },
    [],
  )

  const dismiss = React.useCallback((toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId })
  }, [])

  return {
    ...state,
    toast,
    dismiss,
  }
}

// Optional: ToastViewport React component to render the toasts visually
export function ToastViewport() {
  const { toasts, dismiss } = useToast()
  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        width: 360,
        maxWidth: "100vw",
      }}
    >
      {toasts.map((toast) =>
        toast.open ? (
          <div
            key={toast.id}
            style={{
              background: toast.variant === "destructive" ? "#fee2e2" : "#fff",
              color: toast.variant === "destructive" ? "#b91c1c" : "#262626",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              padding: 16,
              marginBottom: 12,
              minWidth: 280,
              maxWidth: 360,
              fontSize: 15,
              fontFamily: "inherit",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              animation: "fade-in 0.15s",
            }}
            role={toast.variant === "destructive" ? "alert" : "status"}
            tabIndex={0}
          >
            {toast.title && (
              <strong style={{ fontWeight: 600, fontSize: 16 }}>{toast.title}</strong>
            )}
            {toast.description && <div>{toast.description}</div>}
            <button
              style={{
                marginTop: 8,
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "#4f46e5",
                cursor: "pointer",
                padding: 0,
                fontSize: 14,
              }}
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss"
            >
              Dismiss
            </button>
          </div>
        ) : null,
      )}
    </div>
  )
}

export { useToast }
