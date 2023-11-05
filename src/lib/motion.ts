import { onMount } from 'svelte'
import { tweened, type TweenedOptions } from 'svelte/motion'
import { cubicInOut } from 'svelte/easing'
import { interpolate } from 'd3-interpolate'

type AnimationFn = () => Promise<void>
type Resolve = (value?: any) => void

export function animate(fn: AnimationFn) {
  onMount(fn)
}

export function signal<TweenValues>(
  values: TweenValues,
  options: TweenedOptions<TweenValues> = {
    duration: 1000,
    easing: cubicInOut,
    interpolate,
  }
) {
  const { subscribe, update, set } = tweened<TweenValues>(values, options)

  let tasks: AnimationFn[] = []

  function to(
    this: any,
    values: Partial<TweenValues>,
    options: TweenedOptions<TweenValues> | undefined = undefined
  ) {
    if (typeof values === 'object') {
      tasks.push(() => update((prev) => ({ ...prev, ...values }), options))
    } else {
      tasks.push(() => set(values, options))
    }
    return this
  }

  function sfx(this: any, sound: string, { volume = 0.5 } = {}) {
    const audio = new Audio(sound)
    audio.volume = volume

    tasks.push(async () => {
      audio.play().catch(() => console.error('To play sounds interact with the page.'))
    })

    return this
  }

  async function then(resolve: Resolve) {
    for (const task of tasks) {
      await task()
    }
    tasks = []
    resolve()
  }

  return { subscribe, to, sfx, then }
}

export function all(...animations: AnimationFn[]) {
  return Promise.all(animations)
}
