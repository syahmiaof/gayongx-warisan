/** Shared input transport: UI pointers and scene keyboards use the same actions. */
class TouchInput {
  private pointers = new Map<number, string[]>();
  private listeners = new Set<(key: string) => void>();
  press(pointer: number, keys: string[]) {
    this.release(pointer);
    for (const key of keys) if (!this.down(key)) this.listeners.forEach((fn) => fn(key));
    this.pointers.set(pointer, keys);
  }
  release(pointer: number) {
    this.pointers.delete(pointer);
  }
  down(key: string) {
    return [...this.pointers.values()].some((keys) => keys.includes(key));
  }
  reset() {
    this.pointers.clear();
    document.querySelectorAll('.touch-held').forEach((el) => el.classList.remove('touch-held'));
  }
  subscribe(listener: (key: string) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
export const touchInput = new TouchInput();
