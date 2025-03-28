declare module 'react' {
  export * from 'react';
  export default React;
}

// This ensures TypeScript doesn't complain about JSX elements
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
} 