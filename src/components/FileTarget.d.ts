declare namespace svelte.JSX {
  interface HTMLAttributes<T> {
    onfileready?: (event: CustomEvent<{ name: string; result: string }>) => any;
    onfileerror?: (event: CustomEvent<ProgressEvent<FileReader>>) => void;
  }
}
