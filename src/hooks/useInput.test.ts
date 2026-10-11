import { describe, expect, it } from 'vitest'
import { useInput } from './useInput'

describe('useInput', () => {
  it('mengelola form: binding field, setForm, dan reset', () => {
    const { form, field, setForm, reset } = useInput({ name: 'a', age: 1 })
    const name = field('name')
    expect(name.value).toBe('a')
    name.value = 'b'
    expect(form.name).toBe('b')
    setForm({ age: 5 })
    expect(form.age).toBe(5)
    reset()
    expect(form).toEqual({ name: 'a', age: 1 })
  })
})
