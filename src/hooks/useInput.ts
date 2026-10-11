
import { reactive, toRef } from 'vue'

export function useInput<T extends Record<string, unknown>>(initialValue: T) {
  const form = reactive({ ...initialValue }) as T

  function field<K extends keyof T>(key: K) {
    return toRef(form, key)
  }

  function setForm(values: Partial<T>) {
    Object.assign(form, values)
  }

  function reset() {
    Object.assign(form, initialValue)
  }

  return {
    form,
    field,
    setForm,
    reset,
  }
}
