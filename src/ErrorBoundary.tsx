import React from "react";
type Props = { children: React.ReactNode };
type State = { hasError: boolean };
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(){ return { hasError: true }; }
  componentDidCatch(error:any, info:any){ console.error("UI error", { error, info }); }
  render(){
    if (this.state.hasError){
      return (<div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md"><h1 className="text-2xl font-semibold mb-3">Something broke.</h1>
        <p className="text-sm opacity-80">Try again or refresh.</p></div></div>);
    }
    return this.props.children;
  }
}
