'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Panel error:', error);
  }

  handleReset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center gap-3 p-6">
          <div className="size-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="size-5 text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {this.props.label || 'Panel'} crashed
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {this.state.error.message || 'Something went wrong rendering this panel.'}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={this.handleReset} className="gap-1.5">
            <RotateCcw className="size-3" />
            Reset
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
