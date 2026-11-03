"use client";

import { useTerminal } from "../hooks/use-terminal";
import { Output } from "./output";
import { PromptPrefix } from "./prompt-prefix";
import { Welcome } from "./welcome";

export function Terminal() {
  const terminal = useTerminal();
  const { input, entry, cursor } = terminal;

  return (
    <main className="workspace" data-theme={terminal.theme} onClick={terminal.focusPrompt}>
      <section className="terminal-window" aria-label="Interactive portfolio terminal">
        <div className="terminal-body">
          <div
            className="terminal-screen"
            ref={terminal.screenRef}
            role="region"
            aria-label="Command output"
            tabIndex={0}
          >
            {terminal.showWelcome && <Welcome onCommand={terminal.run} />}
            {entry && (
              <div className="transcript-entry">
                <p className="executed-command">
                  <PromptPrefix /> <span>{entry.input}</span>
                </p>
                {entry.result && (
                  <div className="command-output">
                    <Output result={entry.result} onCommand={terminal.run} />
                  </div>
                )}
              </div>
            )}
          </div>
          <form className="prompt" onSubmit={terminal.submit}>
            <label htmlFor="command" className="prompt-prefix">
              <PromptPrefix />
              <span className="sr-only"> Enter a portfolio command</span>
            </label>
            <div className="command-input">
              <input
                id="command"
                ref={terminal.inputRef}
                value={input}
                onChange={terminal.changeInput}
                onKeyDown={terminal.keyDown}
                onSelect={terminal.syncCursor}
                onScroll={terminal.syncCursor}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="send"
                maxLength={500}
              />
              <span
                className="cursor-track"
                aria-hidden="true"
                data-selected={cursor.selected}
                style={{ transform: `translate(${-cursor.scrollLeft}px, -50%)` }}
              >
                <span className="cursor-offset">{input.slice(0, cursor.offset)}</span>
                <span className="block-cursor" />
              </span>
            </div>
            <button className="enter-button" type="submit" aria-label="Run command">↵</button>
          </form>
          {terminal.suggestions.length > 0 && (
            <p className="completions" aria-label="Command completions">
              {terminal.suggestions.join("   ")}
            </p>
          )}
          <p className="sr-only" role="status" aria-live="polite">{terminal.status}</p>
        </div>
      </section>
    </main>
  );
}
