import { reactive, toRef } from 'vue'
import type { Ref } from 'vue'

/** Composable untuk two-way binding & pengelolaan state input form. */
export function useInput<T extends Record<string, unknown>>(initial: T) {
  const form = reactive({ ...initial }) as T

  function field<K extends keyof T>(key: K): Ref<T[K]> {
    return toRef(form, key) as Ref<T[K]>
  }

  function setForm(values: Partial<T>): void {
    Object.assign(form, values)
  }

  function reset(): void {
    Object.assign(form, initial)
  }

  return { form, field, setForm, reset }
}
