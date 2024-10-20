import { useCallback } from "react"
import { NavigateOptions, To, useNavigate } from "react-router-dom"

export const useNavigateWithWarning = () => {
  const navigate = useNavigate()

  const navigator = useCallback((to: To, options?: NavigateOptions) => {
    
  }, [navigate]);

  return navigator;
}