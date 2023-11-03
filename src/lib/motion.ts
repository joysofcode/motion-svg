import { onMount } from 'svelte'
import { tweened, type TweenedOptions } from 'svelte/motion'
import { cubicInOut } from 'svelte/easing'
import { interpolate } from 'd3-interpolate'

type AnimationFn = () => Promise<void>

export function animate(fn: AnimationFn) {
  onMount(fn)
}

export function signal<TweenValues>(
  values: TweenValues,
  options: TweenedOptions<TweenValues> = {
    duration: 1000,
    interpolate: interpolate,
    easing: cubicInOut,
  }
) {
  const { subscribe, update } = tweened<TweenValues>(values, options)

  let tasks: AnimationFn[] = []

  function to(
    this: any,
    values: Partial<TweenValues>,
    options: TweenedOptions<TweenValues> | undefined = undefined
  ) {
    tasks.push(() => update((prev) => ({ ...prev, ...values }), options))
    return this
  }

  function sfx(this: any, sound: string, { volume = 0.5 } = {}) {
    const audio = new Audio(sound)
    audio.volume = volume

    tasks.push(async () => {
      audio.play().catch(() => console.error('To play sounds interact with the page first.'))
    })

    return this
  }

  async function then(resolve: any) {
    for (const task of tasks) {
      await task()
    }
    resolve()
    tasks = []
  }

  return { subscribe, to, sfx, then }
}

export function all(...animations: AnimationFn[]) {
  return Promise.all(animations)
}
