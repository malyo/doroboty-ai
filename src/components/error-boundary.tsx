import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { STORAGE_KEY } from "@/features/prototype/storage";
import { downloadText } from "@/features/prototype/settings";

/** Last-resort screen: a render failure must not leave a blank page or hide the saved data. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  private saved() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
  render() {
    if (!this.state.failed) return this.props.children;
    const saved = this.saved();
    return (
      <main className="prototype-section" role="alert">
        <h1>Coś poszło nie tak</h1>
        <p className="my-5">
          Ta strona przestała działać. Twoje dane są nadal w pamięci przeglądarki
          {saved ? " – możesz pobrać ich kopię przed ponownym wczytaniem." : "."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="action" onClick={() => window.location.reload()}>
            Wczytaj ponownie
          </Button>
          {saved && (
            <Button onClick={() => downloadText("doroboty-kopia-danych.json", saved)}>
              Pobierz kopię danych
            </Button>
          )}
        </div>
      </main>
    );
  }
}
