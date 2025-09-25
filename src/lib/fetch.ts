// Define fetch types
export interface RequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

export interface Response {
  ok: boolean;
  status: number;
  statusText: string;
  text(): Promise<string>;
  json(): Promise<any>;
}

// Export a custom fetch function that uses the global fetch
export const fetch = globalThis.fetch.bind(globalThis);

// Export Event types
export interface Event {
  readonly type: string;
  readonly target: EventTarget | null;
  readonly currentTarget: EventTarget | null;
  readonly eventPhase: number;
  readonly bubbles: boolean;
  readonly cancelable: boolean;
  readonly defaultPrevented: boolean;
  readonly composed: boolean;
  readonly timeStamp: number;
  readonly isTrusted: boolean;
  preventDefault(): void;
  stopPropagation(): void;
  stopImmediatePropagation(): void;
}

export interface EventTarget {
  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void;
  dispatchEvent(event: Event): boolean;
}

export interface EventListener {
  (evt: Event): void;
}

export interface EventListenerObject {
  handleEvent(evt: Event): void;
}

export type EventListenerOrEventListenerObject = EventListener | EventListenerObject;

export interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean;
  passive?: boolean;
  signal?: AbortSignal;
}

export interface EventListenerOptions {
  capture?: boolean;
}

// Export AbortSignal type
export interface AbortSignal {
  readonly aborted: boolean;
  onabort: ((this: AbortSignal, ev: Event) => any) | null;
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
  removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
  dispatchEvent: (event: Event) => boolean;
}
